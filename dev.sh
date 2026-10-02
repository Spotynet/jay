#!/bin/bash
# ==========================================
# JAY DEV - Start backend and frontend via PM2
# ==========================================

echo "🚀 Starting JAY DEV..."

# -------------------------
# Set base directories
# -------------------------
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/mobile"

# -------------------------
# Process names and ports
# -------------------------
BACKEND_NAME="jay-api-dev"
BACKEND_PORT=3012   # Django backend port

FRONTEND_NAME="jay-dev"
FRONTEND_PORT=3011  # Expo frontend web port

# -------------------------
# Delete old PM2 processes
# -------------------------
echo "🧹 Cleaning old PM2 processes..."
pm2 delete $BACKEND_NAME 2>/dev/null
pm2 delete $FRONTEND_NAME 2>/dev/null

# -------------------------
# Start backend (Django)
# -------------------------
echo "🐍 Starting Django backend ($BACKEND_NAME) on port $BACKEND_PORT..."
pm2 start "$BACKEND_DIR/venv/bin/python" \
  --name "$BACKEND_NAME" \
  --cwd "$BACKEND_DIR" \
  -- manage.py runserver 127.0.0.1:$BACKEND_PORT

# -------------------------
# Start frontend (Expo Web)
# -------------------------
echo "🎨 Starting Expo frontend ($FRONTEND_NAME) on port $FRONTEND_PORT..."
pm2 start bash \
  --name "$FRONTEND_NAME" \
  --cwd "$FRONTEND_DIR" \
  -- -c "npx expo start --web --port $FRONTEND_PORT --host localhost"

# -------------------------
# Save PM2 state
# -------------------------
pm2 save

# -------------------------
# Show status
# -------------------------
echo "✅ JAY DEV running:"
pm2 list
