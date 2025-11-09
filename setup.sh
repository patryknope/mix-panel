#!/bin/bash

echo "========================================="
echo "Get5 Panel Setup Script"
echo "========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your configuration:"
    echo "   1. Add your MySQL password"
    echo "   2. Generate NEXTAUTH_SECRET with: openssl rand -base64 32"
    echo "   3. Add your Steam API key from https://steamcommunity.com/dev/apikey"
    echo "   4. Update URLs when deploying to production"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate
echo "✅ Prisma client generated"
echo ""

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run 'npm run db:push' to create database tables"
echo "3. Run 'npm run dev' to start development server"
echo "4. Visit http://localhost:3000"
echo ""
echo "For deployment to Vercel:"
echo "1. Push to GitHub"
echo "2. Import to Vercel"
echo "3. Add environment variables in Vercel dashboard"
echo ""
echo "Need help? Check README.md for detailed instructions"
