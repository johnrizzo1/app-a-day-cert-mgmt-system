# Certificate Management System Monitoring Setup

This directory contains a Docker Compose configuration for setting up a monitoring infrastructure for the Certificate Management System. The setup includes:

- PostgreSQL database
- OpenTelemetry Collector
- Prometheus for metrics collection
- Grafana for visualization

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic understanding of containerization and monitoring concepts

## Getting Started

1. Start the monitoring stack:

```bash
docker-compose up -d
```

2. Access the services:

- Grafana: http://localhost:3000 (username: admin, password: admin)
- Prometheus: http://localhost:9090
- PostgreSQL: localhost:5432 (username: postgres, password: postgres)

## Components

### PostgreSQL

The PostgreSQL database stores the certificate management system data. It's configured with:

- Database name: certificate_management
- Username: postgres
- Password: postgres
- Port: 5432

### OpenTelemetry Collector

The OpenTelemetry Collector receives, processes, and exports telemetry data. It's configured to:

- Collect metrics from PostgreSQL
- Receive traces and metrics via OTLP (gRPC and HTTP)
- Export metrics to Prometheus
- Export logs for debugging

Endpoints:
- OTLP gRPC: localhost:4317
- OTLP HTTP: localhost:4318
- Prometheus metrics: localhost:8889

### Prometheus

Prometheus scrapes and stores metrics from the OpenTelemetry Collector. It's accessible at http://localhost:9090.

### Grafana

Grafana provides visualization for the metrics collected by Prometheus. It comes pre-configured with:

- Prometheus data source
- PostgreSQL dashboard

Access Grafana at http://localhost:3000 with username `admin` and password `admin`.

## Connecting Your Application

To send telemetry data from your application to this monitoring stack:

1. Configure your application to send traces and metrics to the OpenTelemetry Collector:
   - OTLP gRPC endpoint: http://localhost:4317
   - OTLP HTTP endpoint: http://localhost:4318

2. For PostgreSQL metrics, the collector is already configured to scrape them directly.

## Customization

- Modify `otel-collector-config.yaml` to adjust OpenTelemetry Collector settings
- Modify `prometheus/prometheus.yml` to change Prometheus scraping configuration
- Add or modify dashboards in the `grafana/dashboards` directory

## Troubleshooting

- Check container logs: `docker-compose logs [service_name]`
- Verify network connectivity between containers
- Ensure all ports are correctly exposed and not blocked by firewalls