#!/bin/bash

# Smart Attendance System Deployment Script

echo "🚀 Starting Smart Attendance System Deployment..."

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Frontend Setup
echo "📦 Setting up Frontend (Next.js)..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
fi

echo "🔧 Building frontend..."
npm run build

echo "✅ Frontend setup complete!"

# Backend Setup
echo "🐍 Setting up Backend (Python)..."
cd ../backend

# Create virtual environment if it doesn't exist
if [ ! -d "face_api_env" ]; then
    echo "🔨 Creating Python virtual environment..."
    python3 -m venv face_api_env
fi

# Activate virtual environment and install dependencies
echo "📥 Installing Python dependencies..."
source face_api_env/bin/activate
pip install -r requirements.txt

echo "✅ Backend setup complete!"

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start MongoDB service"
echo "2. Update environment variables in .env files"
echo "3. Start the backend API: cd backend && source face_api_env/bin/activate && python app.py"
echo "4. Start the frontend: cd frontend && npm run dev"
echo "5. Access the application at http://localhost:3000"
echo ""
echo "🔗 Key URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Health: http://localhost:5000/api/health"