# Certificate Management System - macOS Application

This is the macOS native application for the Certificate Management System, built with React Native for macOS.

## Features

- View and manage X509 certificates
- Create new certificates with customizable parameters
- Edit certificate details
- View certificate data and private keys
- Native macOS experience

## Requirements

- Node.js 14+
- npm 6+
- Xcode 12+
- CocoaPods
- React Native macOS development environment

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/certificate-management-system.git
cd certificate-management-system/macos-app
```

2. Install dependencies:

```bash
npm install
```

3. Install CocoaPods dependencies:

```bash
cd macos
pod install
cd ..
```

## Configuration

The application is configured to connect to the backend server running at http://localhost:8000/api. You can modify this in the `src/services/api.js` file:

```javascript
const API_URL = 'http://localhost:8000/api';
```

## Running the Application

To run the application in development mode:

```bash
npm run macos
```

This will build and launch the application in the macOS simulator.

## Building for Production

To build the application for production:

```bash
cd macos
xcodebuild -workspace CertificateManagementSystem.xcworkspace -scheme CertificateManagementSystem -configuration Release
```

This will create a production build of the application.

## Project Structure

```
macos-app/
├── macos/              # macOS native code
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── App.js          # Main application component
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Main Screens

- **CertificateListScreen**: View all certificates with pagination
- **CertificateDetailScreen**: View detailed information about a certificate
- **CertificateCreateScreen**: Create a new certificate
- **CertificateEditScreen**: Edit an existing certificate

## License

[MIT License](LICENSE)