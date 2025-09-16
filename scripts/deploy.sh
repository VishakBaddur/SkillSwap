#!/bin/bash

# SkillSwap Deployment Script for Render
# This script helps prepare your project for deployment

echo "🚀 SkillSwap Deployment Preparation"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found."
    echo "Please create a .env file with your Supabase credentials:"
    echo "VITE_SUPABASE_URL=your_supabase_url"
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "🎉 Your project is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Create a new Web Service on Render"
    echo "3. Connect your GitHub repository"
    echo "4. Set environment variables in Render"
    echo "5. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
