#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Waiting for database..."
node wait-for-db.js

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx prisma db seed || echo "Seed skipped (data may already exist)"

echo "Starting application..."
node dist/main
