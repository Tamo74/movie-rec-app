#!/bin/bash

# Store project root
PROJECT_ROOT="$(pwd)"

# Create data directory for MongoDB
mkdir -p /tmp/mongodb-data

# Start MongoDB in background
mongod --dbpath /tmp/mongodb-data --logpath /tmp/mongodb.log --fork --quiet

echo "MongoDB started"

# Start Node.js backend in background on port 3000
cd "$PROJECT_ROOT/backend" && node server.js &
NODE_PID=$!
echo "Node.js backend started (PID: $NODE_PID)"

# Return to project root
cd "$PROJECT_ROOT"

# Wait a moment for backend to start
sleep 2

# Start Flask on port 5000 (foreground)
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5000
