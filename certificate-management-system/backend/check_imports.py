#!/usr/bin/env python
print("Checking OpenTelemetry imports...")

try:
    import opentelemetry
    print(f"✅ opentelemetry: {opentelemetry.__version__}")
except ImportError as e:
    print(f"❌ opentelemetry: {e}")

try:
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    print("✅ opentelemetry.instrumentation.fastapi.FastAPIInstrumentor")
except ImportError as e:
    print(f"❌ opentelemetry.instrumentation.fastapi.FastAPIInstrumentor: {e}")

try:
    from opentelemetry.sdk.resources import SERVICE_NAME, Resource
    print("✅ opentelemetry.sdk.resources.SERVICE_NAME, Resource")
except ImportError as e:
    print(f"❌ opentelemetry.sdk.resources.SERVICE_NAME, Resource: {e}")

try:
    from opentelemetry.sdk.trace import TracerProvider
    print("✅ opentelemetry.sdk.trace.TracerProvider")
except ImportError as e:
    print(f"❌ opentelemetry.sdk.trace.TracerProvider: {e}")

try:
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    print("✅ opentelemetry.sdk.trace.export.BatchSpanProcessor")
except ImportError as e:
    print(f"❌ opentelemetry.sdk.trace.export.BatchSpanProcessor: {e}")

try:
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    print("✅ opentelemetry.exporter.otlp.proto.grpc.trace_exporter.OTLPSpanExporter")
except ImportError as e:
    print(f"❌ opentelemetry.exporter.otlp.proto.grpc.trace_exporter.OTLPSpanExporter: {e}")

print("\nPython path:")
import sys
for path in sys.path:
    print(f"  - {path}")