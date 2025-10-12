#!/bin/bash
set -ex

echo "📦 Working directory: $(pwd)"
echo "📦 Listing files: $(ls -la)"

echo "📦 Installing server dependencies..."
cd server
npm install --omit=dev
echo "✅ Server dependencies installed"
echo "📦 Server node_modules: $(ls -la node_modules | head -n 5)"
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install
echo "✅ Client dependencies installed"

echo "🏗️  Building client..."
npm run build
echo "✅ Client built"
cd ..

echo "✅ Build complete!"
echo "📦 Final directory structure:"
ls -la
ls -la server | head -n 10
ls -la client | head -n 10

