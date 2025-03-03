# Certificate Management System - Web Frontend

This is the web frontend for the Certificate Management System, built with React and Bootstrap.

## Features

- View and manage X509 certificates
- Create new certificates with customizable parameters
- Edit certificate details
- View certificate data and private keys
- Responsive design with Bootstrap

## Requirements

- Node.js 14+
- npm 6+

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system/web-frontend
```

2. Install dependencies:

```bash
npm install
```

## Configuration

The application is configured to proxy API requests to the backend server running at http://localhost:8000. You can modify this in the `package.json` file:

```json
"proxy": "http://localhost:8000"
```

## Running the Application

To run the application in development mode:

```bash
npm start
```

The application will be available at http://localhost:3001.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `build` directory with optimized production files.

## Project Structure

```
web-frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── App.js           # Main application component
│   └── index.js         # Application entry point
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Main Pages

- **Certificate List**: View all certificates with pagination
- **Certificate Detail**: View detailed information about a certificate
- **Certificate Create**: Create a new certificate
- **Certificate Edit**: Edit an existing certificate

## License

[MIT License](LICENSE)