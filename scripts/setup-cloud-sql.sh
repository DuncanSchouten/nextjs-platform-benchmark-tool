#!/bin/bash

# Cloud SQL Setup Script for Next.js Platform Benchmarking
# This script creates a Cloud SQL PostgreSQL instance and runs migrations

set -e

# Configuration
PROJECT_ID="nextjs-platform-benchmarking"
INSTANCE_NAME="benchmark-db"
DATABASE_NAME="benchmarks"
REGION="us-central1"
TIER="db-f1-micro"  # As per PLAN.md cost estimate
DB_VERSION="POSTGRES_15"

echo "🔧 Setting up Cloud SQL for project: $PROJECT_ID"
echo ""

# Step 1: Set the project
echo "1️⃣ Setting GCP project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable Cloud SQL Admin API (if not already enabled)
echo "2️⃣ Enabling Cloud SQL Admin API..."
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID

# Step 3: Create Cloud SQL instance
echo "3️⃣ Creating Cloud SQL instance: $INSTANCE_NAME"
echo "   Region: $REGION"
echo "   Tier: $TIER"
echo "   Database version: $DB_VERSION"
echo ""

gcloud sql instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --database-version=$DB_VERSION \
  --tier=$TIER \
  --region=$REGION \
  --storage-type=HDD \
  --storage-size=10GB \
  --backup-start-time=03:00 \
  --no-assign-ip \
  --network=default \
  --enable-bin-log=false

echo "✅ Cloud SQL instance created successfully"
echo ""

# Step 4: Create database
echo "4️⃣ Creating database: $DATABASE_NAME"
gcloud sql databases create $DATABASE_NAME \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID

echo "✅ Database created successfully"
echo ""

# Step 5: Set root password
echo "5️⃣ Setting postgres user password..."
echo "   (You'll need to enter a strong password)"
gcloud sql users set-password postgres \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID \
  --prompt-for-password

echo "✅ Password set successfully"
echo ""

# Step 6: Get connection details
echo "6️⃣ Getting connection details..."
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(connectionName)")

echo ""
echo "📋 Cloud SQL Instance Details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Instance Name: $INSTANCE_NAME"
echo "Database Name: $DATABASE_NAME"
echo "Connection Name: $CONNECTION_NAME"
echo "Region: $REGION"
echo ""
echo "📝 Connection String Format (for GitHub Secrets):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "For Cloud SQL Proxy (recommended for GitHub Actions):"
echo "postgresql://postgres:<PASSWORD>@localhost/benchmarks?host=/cloudsql/$CONNECTION_NAME"
echo ""
echo "For direct connection (if using public IP):"
echo "postgresql://postgres:<PASSWORD>@<INSTANCE_IP>/benchmarks"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Save these details securely!"
echo "⚠️  You'll need the connection string for DATABASE_URL secret"
echo ""
echo "Next steps:"
echo "1. Run migrations: ./scripts/run-migrations.sh"
echo "2. Configure GitHub Secrets with DATABASE_URL"
echo "3. Set up service account for GitHub Actions to access Cloud SQL"
