#!/bin/bash
set -e

echo "==== Python Version ===="
python --version

echo -e "\n==== Poetry Environment ===="
poetry env info

echo -e "\n==== Try to import OpenTelemetry modules ===="
poetry run python -c "
try:
    import opentelemetry
    print('Successfully imported opentelemetry')
    
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        print('Successfully imported FastAPIInstrumentor')
    except ImportError as e:
        print(f'Failed to import FastAPIInstrumentor: {e}')
    
    try:
        from opentelemetry.sdk.resources import SERVICE_NAME, Resource
        print('Successfully imported SERVICE_NAME and Resource')
    except ImportError as e:
        print(f'Failed to import SERVICE_NAME and Resource: {e}')
    
    try:
        from opentelemetry.sdk.trace import TracerProvider
        print('Successfully imported TracerProvider')
    except ImportError as e:
        print(f'Failed to import TracerProvider: {e}')
    
    try:
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        print('Successfully imported BatchSpanProcessor')
    except ImportError as e:
        print(f'Failed to import BatchSpanProcessor: {e}')
    
    try:
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        print('Successfully imported OTLPSpanExporter')
    except ImportError as e:
        print(f'Failed to import OTLPSpanExporter: {e}')
except ImportError as e:
    print(f'Failed to import opentelemetry: {e}')
"

echo -e "\n==== Poetry Dependencies ===="
poetry show | grep opentelemetry

echo -e "\n==== Try to install OpenTelemetry ===="
poetry add --group main opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi opentelemetry-exporter-otlp