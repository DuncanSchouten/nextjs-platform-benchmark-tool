#!/bin/bash

# Database Migration Script
# Runs SQL migrations on Cloud SQL instance

set -e

PROJECT_ID="nextjs-platform-benchmarking"
INSTANCE_NAME="benchmark-db"
DATABASE_NAME="benchmarks"

echo "🔄 Running database migrations..."
echo ""

# Check if Cloud SQL Proxy is needed
if ! command -v cloud_sql_proxy &> /dev/null; then
    echo "⚠️  Cloud SQL Proxy not found. Installing..."
    curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
    chmod +x cloud-sql-proxy
    mv cloud-sql-proxy /usr/local/bin/
fi

# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(connectionName)")

echo "📡 Connection Name: $CONNECTION_NAME"
echo ""

# Start Cloud SQL Proxy in the background
echo "🚀 Starting Cloud SQL Proxy..."
cloud-sql-proxy $CONNECTION_NAME &
PROXY_PID=$!
sleep 3

# Function to cleanup proxy on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Cloud SQL Proxy..."
    kill $PROXY_PID 2>/dev/null || true
}
trap cleanup EXIT

# Run migrations
echo "📝 Running migration: 001_initial_schema.sql"
PGPASSWORD=$(gcloud secrets versions access latest --secret="benchmark-db-password" --project=$PROJECT_ID) \
psql "postgresql://postgres@localhost:5432/$DATABASE_NAME" \
  -f db/migrations/001_initial_schema.sql

echo ""
echo "✅ Migrations completed successfully!"
echo ""
echo "Verifying tables..."
PGPASSWORD=$(gcloud secrets versions access latest --secret="benchmark-db-password" --project=$PROJECT_ID) \
psql "postgresql://postgres@localhost:5432/$DATABASE_NAME" \
  -c "\dt"

echo ""
echo "✨ Database setup complete!"
