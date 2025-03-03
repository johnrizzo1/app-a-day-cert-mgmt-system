#!/bin/bash
set -e

echo "Starting Certificate Management System backend with Poetry..."
poetry run hypercorn app.main:app --reload --bind 0.0.0.0:8000