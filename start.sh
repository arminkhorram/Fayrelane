#!/bin/bash
set -e

echo "🔧 Running database migrations..."
cd server
npm run migrate

echo "🚀 Starting server..."
npm start

