# AnPortafolioIA - Firebase Integration

AI-powered portfolio platform with secure Firebase/Firestore integration for candidates and recruiters.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Firebase project created

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` with your Firebase credentials:
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed configuration instructions.

### 2. Start Backend

```bash
cd backend
npm start
```

### 3. Test Connection

```bash
# Quick test
curl -X POST http://localhost:3001/api/test/hello-world

# Comprehensive test
curl http://localhost:3001/api/test/comprehensive
```

If you see `✅ Firebase connection successful!`, you're ready to go!

### 4. Frontend Development

```bash
# Return to root directory
cd ..
npm install
npm run dev
```

## 📁 Project Structure

```
AnPortafolioIA/
├── backend/                 # Express backend for Firebase
│   ├── routes/
│   │   ├── firestoreRoutes.js  # CRUD operations
│   │   └── testRoutes.js       # Connection tests
│   ├── firebaseAdmin.js    # Firebase initialization
│   ├── config.js           # Environment config
│   ├── server.js           # Entry point
│   └── .env.example        # Environment template
├── components/             # React components
│   └── settings/
│       └── StorageSettings.tsx  # Firebase diagnostics UI
├── services/              # Business logic
│   └── firestoreWorkspaces.ts   # Firestore service with encryption
├── utils/                 # Utilities
│   ├── loggingService.ts  # Logging system
│   └── env.ts             # Environment config
├── FIREBASE_SETUP.md      # 📚 Complete setup guide
└── README.md              # This file
```

## 🔑 Key Features

- **Secure Firebase Integration**: Backend proxy with service account authentication
- **AES-GCM Encryption**: Client-side encryption for sensitive data
- **Smart Polling**: Adaptive sync with HTTP 304 caching
- **Diagnostic Tools**: UI component for testing and monitoring
- **Type-Safe**: Full TypeScript support
- **Test Endpoints**: Quick validation with Hello World tests

## 📖 Documentation

- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Complete Firebase configuration guide
  - Firestore security rules
  - Required indexes
  - Environment variables
  - Troubleshooting
  - Best practices

## 🧪 Testing Firebase Connection

### Option 1: Backend API Tests

```bash
# Create test document
curl -X POST http://localhost:3001/api/test/hello-world \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from AnPortafolioIA!"}'

# List test documents
curl http://localhost:3001/api/test/hello-world

# Clean up
curl -X DELETE http://localhost:3001/api/test/hello-world

# Comprehensive CRUD test
curl http://localhost:3001/api/test/comprehensive
```

### Option 2: UI Component

Add the `StorageSettingsView` component to your app:

```tsx
import { StorageSettingsView } from './components/settings/StorageSettings';

function MyComponent() {
  return (
    <StorageSettingsView 
      userKey="test-user"
      currentContent={{ some: 'data' }}
    />
  );
}
```

This provides a visual dashboard to:
- Check connection status
- Download workspace backups
- Run read/write tests
- View diagnostic logs

## 🔐 Security

### Development Mode
- Uses test mode Firestore rules (allow all)
- Data stored in plain text for debugging
- Collection: `workspace-dev` or `workspace-test`

### Production Mode
- Implements proper security rules
- AES-GCM encryption enabled automatically
- User-specific access control
- Collection: `workspace-prod`

**⚠️ Important**: Update Firestore rules before going to production. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#reglas-de-seguridad-de-firestore).

## 🛠️ Available API Endpoints

### Test Endpoints
- `POST /api/test/hello-world` - Create test document
- `GET /api/test/hello-world` - List test documents  
- `DELETE /api/test/hello-world` - Clean up test documents
- `GET /api/test/comprehensive` - Run all CRUD tests

### Firestore Endpoints
- `GET /api/firestore/workspaces/:userKey` - Get workspace
- `POST /api/firestore/workspaces/:userKey` - Create/update workspace
- `DELETE /api/firestore/workspaces/:userKey` - Delete workspace
- `GET/POST/DELETE /api/firestore/workspaces/:userKey/child/:collection/:docId` - Child documents
- `POST /api/firestore/logs` - Write logs

## 🚨 Troubleshooting

### "Missing required Firebase environment variables"
- Check `backend/.env` exists and has correct values
- Restart the backend server

### "PERMISSION_DENIED"
- Update Firestore rules in Firebase Console
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#reglas-de-seguridad-de-firestore)

### "The query requires an index"
- Click the link in console error
- Create the suggested index in Firebase Console

### Backend won't start
- Verify `FIREBASE_PRIVATE_KEY` format (must include `\n` literals)
- Check Firebase project is enabled and has Firestore
- Review backend console logs

Full troubleshooting guide: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md#solución-de-problemas)

## 📦 Tech Stack

**Backend:**
- Express.js
- Firebase Admin SDK
- dotenv

**Frontend:**
- React + TypeScript
- Vite
- Web Crypto API (for encryption)

**Database:**
- Cloud Firestore

## 🤝 Contributing

1. Keep credentials secure (never commit `.env` files)
2. Use feature branches
3. Test with `/api/test/comprehensive` before committing
4. Update documentation when adding new features

## 📄 License

MIT

## 👤 Author

AnAppWiLos
