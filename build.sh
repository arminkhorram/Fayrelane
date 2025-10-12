#!/bin/bash
set -e

echo "🚀 Installing root dependencies..."
npm ci

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🏗️ Building Next.js client..."
npm run build

echo "✅ Build complete!"
