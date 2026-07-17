#!/bin/bash
# FANVERSE AI — Automated Google Cloud Run Deployment Script

set -e

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Configuration
PROJECT_ID="fanverse-502623"
SERVICE_NAME="fanverse-ai"
REGION="us-east1"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting FANVERSE AI Deployment Pipeline..."

# 1. Verify gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: 'gcloud' CLI is not installed or not in your PATH."
    echo "Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ Google Cloud CLI detected."

# 2. Target the project
echo "⚙️ Setting active project to: ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# 3. Submit build to Google Cloud Artifact Registry
echo "📦 Packaging container and uploading to Google Cloud Build..."
gcloud builds submit --tag ${IMAGE_TAG}

# 4. Deploy service to Google Cloud Run
echo "☁️ Deploying service to Google Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_TAG} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="${GEMINI_API_KEY}"

echo "🎉 Deployment completed successfully!"
echo "--------------------------------------------------"
gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)"
echo "--------------------------------------------------"
