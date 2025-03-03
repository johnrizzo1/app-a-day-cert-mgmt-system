#!/usr/bin/env python
import sys
import os
import subprocess

def print_section(title):
    print("\n" + "=" * 50)
    print(title)
    print("=" * 50)

print_section("Python Information")
print(f"Python Version: {sys.version}")
print(f"Python Executable: {sys.executable}")
print(f"Python Path: {sys.path}")

print_section("Environment Variables")
for key, value in os.environ.items():
    if "PYTHON" in key or "PATH" in key:
        print(f"{key}: {value}")

print_section("Try Import OpenTelemetry")
try:
    import opentelemetry
    print(f"Successfully imported opentelemetry (version: {opentelemetry.__version__})")
    
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        print("Successfully imported FastAPIInstrumentor")
    except ImportError as e:
        print(f"Failed to import FastAPIInstrumentor: {e}")
        
except ImportError as e:
    print(f"Failed to import opentelemetry: {e}")

print_section("Try Pip List")
try:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "list"],
        capture_output=True,
        text=True,
        check=False
    )
    print(f"Return code: {result.returncode}")
    print("Installed packages:")
    for line in result.stdout.splitlines():
        if "opentelemetry" in line.lower():
            print(line)
    if result.stderr:
        print(f"Error: {result.stderr}")
except Exception as e:
    print(f"Error running pip list: {e}")

print_section("Try Pip Install")
try:
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "opentelemetry-instrumentation-fastapi"],
        capture_output=True,
        text=True,
        check=False
    )
    print(f"Return code: {result.returncode}")
    print(f"Output: {result.stdout}")
    print(f"Error: {result.stderr}")
except Exception as e:
    print(f"Error running pip: {e}")