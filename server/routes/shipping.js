const express = require('express');
const axios = require('axios');
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Calculate shipping cost using multiple carriers
router.post('/calculate', optionalAuth, async (req, res) => {
    try {
        const {
            fromZip,
            toZip,
            weight,
            dimensions = { length: 12, width: 12, height: 6 }, // Default dimensions in inches
            serviceType = 'ground'
        } = req.body;

        if (!fromZip || !toZip || !weight) {
            return res.status(400).json({ message: 'From ZIP, to ZIP, and weight are required' });
        }

        const shippingOptions = [];

        // UPS API
        try {
            const upsRate = await calculateUPSRate(fromZip, toZip, weight, dimensions, serviceType);
            if (upsRate) {
                shippingOptions.push({
                    carrier: 'UPS',
                    service: upsRate.service,
                    cost: upsRate.cost,
                    estimatedDays: upsRate.estimatedDays
                });
            }
        } catch (error) {
            console.error('UPS rate calculation error:', error);
        }

        // USPS API
        try {
            const uspsRate = await calculateUSPSRate(fromZip, toZip, weight, dimensions, serviceType);
            if (uspsRate) {
                shippingOptions.push({
                    carrier: 'USPS',
                    service: uspsRate.service,
                    cost: uspsRate.cost,
                    estimatedDays: uspsRate.estimatedDays
                });
            }
        } catch (error) {
            console.error('USPS rate calculation error:', error);
        }

        // FedEx API
        try {
            const fedexRate = await calculateFedExRate(fromZip, toZip, weight, dimensions, serviceType);
            if (fedexRate) {
                shippingOptions.push({
                    carrier: 'FedEx',
                    service: fedexRate.service,
                    cost: fedexRate.cost,
                    estimatedDays: fedexRate.estimatedDays
                });
            }
        } catch (error) {
            console.error('FedEx rate calculation error:', error);
        }

        // Sort by cost
        shippingOptions.sort((a, b) => a.cost - b.cost);

        res.json({
            fromZip,
            toZip,
            weight,
            dimensions,
            options: shippingOptions
        });
    } catch (error) {
        console.error('Shipping calculation error:', error);
        res.status(500).json({ message: 'Failed to calculate shipping costs' });
    }
});

// UPS rate calculation
async function calculateUPSRate(fromZip, toZip, weight, dimensions, serviceType) {
    try {
        const upsConfig = {
            accessKey: process.env.UPS_ACCESS_KEY,
            username: process.env.UPS_USERNAME,
            password: process.env.UPS_PASSWORD
        };

        if (!upsConfig.accessKey || !upsConfig.username || !upsConfig.password) {
            return null;
        }

        // UPS API request
        const requestData = {
            RateRequest: {
                Request: {
                    RequestOption: 'Rate',
                    TransactionReference: {
                        CustomerContext: 'Fayrelane Shipping'
                    }
                },
                Shipment: {
                    Shipper: {
                        Address: {
                            PostalCode: fromZip,
                            CountryCode: 'US'
                        }
                    },
                    ShipTo: {
                        Address: {
                            PostalCode: toZip,
                            CountryCode: 'US'
                        }
                    },
                    ShipFrom: {
                        Address: {
                            PostalCode: fromZip,
                            CountryCode: 'US'
                        }
                    },
                    Service: {
                        Code: serviceType === 'ground' ? '03' : '01' // Ground or Next Day Air
                    },
                    Package: {
                        PackagingType: {
                            Code: '02' // Customer Supplied Package
                        },
                        Dimensions: {
                            Length: dimensions.length.toString(),
                            Width: dimensions.width.toString(),
                            Height: dimensions.height.toString(),
                            UnitOfMeasurement: {
                                Code: 'IN'
                            }
                        },
                        PackageWeight: {
                            Weight: weight.toString(),
                            UnitOfMeasurement: {
                                Code: 'LBS'
                            }
                        }
                    }
                }
            }
        };

        // This is a simplified example - actual UPS API integration would require proper authentication
        // For MVP, we'll return estimated rates
        const estimatedCost = calculateEstimatedCost(weight, dimensions, 'UPS', serviceType);

        return {
            service: serviceType === 'ground' ? 'UPS Ground' : 'UPS Next Day Air',
            cost: estimatedCost,
            estimatedDays: serviceType === 'ground' ? 3 : 1
        };
    } catch (error) {
        console.error('UPS calculation error:', error);
        return null;
    }
}

// USPS rate calculation
async function calculateUSPSRate(fromZip, toZip, weight, dimensions, serviceType) {
    try {
        const uspsUserId = process.env.USPS_USER_ID;

        if (!uspsUserId) {
            return null;
        }

        // USPS API request
        const serviceCode = serviceType === 'ground' ? 'PRIORITY' : 'EXPRESS';
        const url = `https://secure.shippingapis.com/ShippingAPI.dll?API=RateV4&XML=<RateV4Request USERID="${uspsUserId}"><Package ID="1"><Service>${serviceCode}</Service><ZipOrigination>${fromZip}</ZipOrigination><ZipDestination>${toZip}</ZipDestination><Pounds>${Math.floor(weight)}</Pounds><Ounces>${Math.round((weight % 1) * 16)}</Ounces><Container>RECTANGULAR</Container><Size>REGULAR</Size><Width>${dimensions.width}</Width><Length>${dimensions.length}</Length><Height>${dimensions.height}</Height></Package></RateV4Request>`;

        // For MVP, return estimated rates
        const estimatedCost = calculateEstimatedCost(weight, dimensions, 'USPS', serviceType);

        return {
            service: serviceType === 'ground' ? 'USPS Priority Mail' : 'USPS Express Mail',
            cost: estimatedCost,
            estimatedDays: serviceType === 'ground' ? 2 : 1
        };
    } catch (error) {
        console.error('USPS calculation error:', error);
        return null;
    }
}

// FedEx rate calculation
async function calculateFedExRate(fromZip, toZip, weight, dimensions, serviceType) {
    try {
        const fedexKey = process.env.FEDEX_KEY;
        const fedexSecret = process.env.FEDEX_SECRET;

        if (!fedexKey || !fedexSecret) {
            return null;
        }

        // FedEx API request would go here
        // For MVP, return estimated rates
        const estimatedCost = calculateEstimatedCost(weight, dimensions, 'FedEx', serviceType);

        return {
            service: serviceType === 'ground' ? 'FedEx Ground' : 'FedEx Express',
            cost: estimatedCost,
            estimatedDays: serviceType === 'ground' ? 2 : 1
        };
    } catch (error) {
        console.error('FedEx calculation error:', error);
        return null;
    }
}

// Calculate estimated shipping cost (fallback for MVP)
function calculateEstimatedCost(weight, dimensions, carrier, serviceType) {
    const baseRate = {
        'UPS': { ground: 0.15, express: 0.25 },
        'USPS': { ground: 0.12, express: 0.20 },
        'FedEx': { ground: 0.14, express: 0.22 }
    };

    const rate = baseRate[carrier][serviceType] || 0.15;
    const volume = (dimensions.length * dimensions.width * dimensions.height) / 1728; // Convert to cubic feet
    const dimensionalWeight = volume * 10; // DIM factor of 10
    const billableWeight = Math.max(weight, dimensionalWeight);

    return Math.round((billableWeight * rate + 5) * 100) / 100; // Base rate + $5 handling
}

// Get shipping history for a user
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        s.id,
        s.from_zip,
        s.to_zip,
        s.weight,
        s.dimensions,
        s.carrier,
        s.service,
        s.cost,
        s.estimated_days,
        s.tracking_number,
        s.status,
        s.created_at,
        l.title as listing_title
      FROM shipping_requests s
      JOIN orders o ON s.order_id = o.id
      JOIN listings l ON o.listing_id = l.id
      WHERE o.buyer_id = $1 OR o.seller_id = $1
      ORDER BY s.created_at DESC
    `, [req.user.id]);

        const shippingHistory = result.rows.map(row => ({
            id: row.id,
            fromZip: row.from_zip,
            toZip: row.to_zip,
            weight: parseFloat(row.weight),
            dimensions: JSON.parse(row.dimensions || '{}'),
            carrier: row.carrier,
            service: row.service,
            cost: parseFloat(row.cost),
            estimatedDays: row.estimated_days,
            trackingNumber: row.tracking_number,
            status: row.status,
            createdAt: row.created_at,
            listingTitle: row.listing_title
        }));

        res.json({ shippingHistory });
    } catch (error) {
        console.error('Get shipping history error:', error);
        res.status(500).json({ message: 'Failed to fetch shipping history' });
    }
});

// Create shipping label
router.post('/create-label', authenticateToken, async (req, res) => {
    try {
        const {
            orderId,
            fromZip,
            toZip,
            weight,
            dimensions,
            carrier,
            service
        } = req.body;

        // Verify order exists and user has access
        const orderResult = await query(`
      SELECT o.id, l.title
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = $1 AND (o.buyer_id = $2 OR o.seller_id = $2)
    `, [orderId, req.user.id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Calculate shipping cost
        const shippingCost = calculateEstimatedCost(weight, dimensions, carrier, service);

        // Create shipping request record
        const shippingResult = await query(`
      INSERT INTO shipping_requests (
        order_id, from_zip, to_zip, weight, dimensions, carrier, service, cost, estimated_days, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, cost, estimated_days
    `, [
            orderId, fromZip, toZip, weight, JSON.stringify(dimensions),
            carrier, service, shippingCost, service === 'ground' ? 3 : 1,
            'pending', new Date()
        ]);

        const shipping = shippingResult.rows[0];

        res.status(201).json({
            message: 'Shipping label created successfully',
            shipping: {
                id: shipping.id,
                cost: parseFloat(shipping.cost),
                estimatedDays: shipping.estimated_days
            }
        });
    } catch (error) {
        console.error('Create shipping label error:', error);
        res.status(500).json({ message: 'Failed to create shipping label' });
    }
});

module.exports = router;





