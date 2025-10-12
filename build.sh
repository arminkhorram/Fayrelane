#!/bin/bash
set -e

echo "🚀 Installing root dependencies..."
npm ci || npm install

echo "📦 Installing client dependencies..."
cd client
npm install

echo "🏗️ Building Next.js client..."
npx next build

echo "✅ Build complete!"
