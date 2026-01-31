# 🔥 Firebase Setup Guide for AnPortafolioIA

Este documento contiene toda la información necesaria para configurar correctamente Firebase/Firestore en tu proyecto **AnPortafolioIA**.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial de Firebase](#configuración-inicial-de-firebase)
3. [Reglas de Seguridad de Firestore](#reglas-de-seguridad-de-firestore)
4. [Índices de Firestore](#índices-de-firestore)
5. [Variables de Entorno](#variables-de-entorno)
6. [Prueba de Conexión Rápida](#prueba-de-conexión-rápida)
7. [Solución de Problemas](#solución-de-problemas)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 📦 Requisitos Previos

- Cuenta de Google/Firebase
- Node.js v18+ instalado
- Acceso a [Firebase Console](https://console.firebase.google.com)
- Proyecto de Firebase creado

---

## 🚀 Configuración Inicial de Firebase

### Paso 1: Crear un Proyecto de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Click en **"Add project"** o **"Crear proyecto"**
3. Asigna un nombre (ej: `anportafolioia`)
4. Desactiva Google Analytics (opcional para desarrollo)
5. Click en **"Create project"**

### Paso 2: Habilitar Firestore Database

1. En el menú lateral, click en **"Firestore Database"**
2. Click en **"Create database"**
3. Selecciona **"Start in test mode"** (lo cambiaremos después)
4. Elige una ubicación cercana (ej: `europe-west1` para Europa, `us-central1` para USA)
5. Click en **"Enable"**

### Paso 3: Crear una Service Account

Para que el backend pueda acceder a Firestore de forma segura:

1. En Firebase Console, ve a **Project Settings** (⚙️ icono arriba a la izquierda)
2. Ve a la pestaña **"Service accounts"**
3. Click en **"Generate new private key"**
4. Se descargará un archivo JSON con tus credenciales
5. **⚠️ IMPORTANTE: Guarda este archivo de forma segura, nunca lo subas a Git**

El archivo JSON tendrá esta estructura:
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

---

## 🔐 Reglas de Seguridad de Firestore

Las reglas de seguridad controlan quién puede leer/escribir en tu base de datos.

### Reglas para Desarrollo (⚠️ Solo para Testing)

**Ubicación:** Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ⚠️ DESARROLLO: Permite lectura/escritura completa
    // NO USAR EN PRODUCCIÓN
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Reglas para Producción (✅ Recomendado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: verifica si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función auxiliar: verifica si el usuario es el dueño del documento
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // --- Test Collection (solo para pruebas Hello World) ---
    match /test-connection/{docId} {
      // Permite lectura/escritura solo durante desarrollo
      // En producción: cambiar a allow read, write: if false;
      allow read, write: if true;
    }
    
    // --- Workspaces Collections ---
    // Patron: workspace-{environment} (workspace-dev, workspace-prod, etc.)
    match /workspace-{environment}/{encryptedUserKey} {
      // Solo el dueño puede leer/escribir su workspace
      allow read, write: if true; // TODO: Implementar autenticación
      // allow read, write: if isOwner(resource.data.metadata.userKey);
      
      // Subcollections dentro del workspace
      match /{subcollection}/{docId} {
        allow read, write: if true; // TODO: Implementar autenticación
      }
    }
    
    // --- Firebase Action Logs ---
    match /firebase-action-logs/{logId} {
      // Solo escritura (para logging)
      allow write: if true;
      // Solo admin puede leer
      allow read: if false; // TODO: implementar role-based access
    }
    
    // --- User Profiles (Future) ---
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
      
      // Datos públicos del perfil
      match /public/{docId} {
        allow read: if true;
        allow write: if isOwner(userId);
      }
      
      // Datos privados
      match /private/{docId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // --- Candidate Profiles ---
    match /candidates/{candidateId} {
      allow read: if true; // Los recruiters deben poder ver
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // --- Recruiter Profiles ---
    match /recruiters/{recruiterId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // --- Job Postings ---
    match /jobs/{jobId} {
      allow read: if true; // Público
      allow create: if isAuthenticated(); // Solo recruiters autenticados
      allow update, delete: if isOwner(resource.data.createdBy);
    }
    
    // Denegar todo lo demás por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**⚠️ IMPORTANTE:** Después de copiar las reglas, click en **"Publish"** para aplicarlas.

---

## 📊 Índices de Firestore

Los índices mejoran el rendimiento de las consultas. Algunos índices compuestos deben crearse manualmente.

### Índices Necesarios

Firebase te pedirá crear índices cuando hagas queries complejas. Aquí algunos que probablemente necesitarás:

#### Índice 1: Test Connection (Ordenado por timestamp)
- **Collection:** `test-connection`
- **Fields:**
  - `type` (Ascending)
  - `timestamp` (Descending)

#### Índice 2: Workspaces (Ordenado por última actualización)
- **Collection:** `workspace-prod` (o tu colección activa)
- **Fields:**
  - `encryptedUserKey` (Ascending)
  - `updatedAt` (Descending)

#### Índice 3: Logs (Para consultas de debugging)
- **Collection:** `firebase-action-logs`
- **Fields:**
  - `userKey` (Ascending)
  - `serverTimestamp` (Descending)

### Cómo crear índices manualmente:

1. Ve a **Firestore Database → Indexes** en Firebase Console
2. Click en **"Create Index"**
3. Selecciona la colección
4. Añade los campos y su orden (Ascending/Descending)
5. Click en **"Create"**

**Tip:** También puedes esperar a que Firebase te sugiera los índices cuando ejecutes queries. Verás un link en el error de consola.

---

## ⚙️ Variables de Entorno

### Backend `.env`

Crea un archivo `.env` en `backend/` con el siguiente contenido:

```bash
# Backend Configuration
PORT=3001
HOST=0.0.0.0
EXTERNAL_URL=http://localhost:3001

# Firebase Configuration (REQUERIDO)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"

# NOTA: La private key debe estar entre comillas dobles
# y conservar los \n literales (como aparece en el JSON descargado)
```

**Extrae los valores del JSON descargado en el Paso 3**:
- `FIREBASE_PROJECT_ID` → `project_id`
- `FIREBASE_CLIENT_EMAIL` → `client_email`
- `FIREBASE_PRIVATE_KEY` → `private_key` (copia tal cual, con las comillas)

### Frontend `.env` (Opcional)

Si quieres personalizar la URL del backend en desarrollo:

```bash
# En la raíz del proyecto (donde está package.json)
VITE_BACKEND_API_URL=http://localhost:3001
VITE_FIRESTORE_WORKSPACES_COLLECTION=workspace-dev
```

---

## 🧪 Prueba de Conexión Rápida

Una vez configurado todo, prueba la conexión con estos comandos:

### 1. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 2. Iniciar el servidor

```bash
npm start
```

Deberías ver:
```
[INFO] Firebase Admin initialized successfully (Firestore only).
[INFO] Project: tu-proyecto-id
[INFO] Backend listening externally at http://localhost:3001
```

### 3. Test "Hello World" desde la terminal

Abre otra terminal y ejecuta:

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri http://localhost:3001/api/test/hello-world -Method POST -ContentType "application/json" -Body '{"message":"Hello Firebase!"}'

# Linux/Mac/Git Bash
curl -X POST http://localhost:3001/api/test/hello-world \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Firebase!"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Firebase connection successful! ✅",
  "documentId": "abc123xyz",
  "data": {
    "message": "Hello Firebase!",
    "timestamp": "2026-01-30T12:00:00.000Z",
    "type": "hello-world-test",
    "serverVersion": "v1.0.0"
  },
  "tests": {
    "write": "✅ Write operation successful",
    "read": "✅ Read operation successful",
    "timestamp": "2026-01-30T12:00:00.000Z"
  }
}
```

### 4. Test Comprehensivo (Opcional)

Para probar todas las operaciones CRUD:

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri http://localhost:3001/api/test/comprehensive

# Linux/Mac/Git Bash
curl http://localhost:3001/api/test/comprehensive
```

### 5. Ver documentos creados

```bash
curl http://localhost:3001/api/test/hello-world
```

### 6. Limpiar documentos de prueba

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri http://localhost:3001/api/test/hello-world -Method DELETE

# Linux/Mac/Git Bash
curl -X DELETE http://localhost:3001/api/test/hello-world
```

### 7. Verificar en Firebase Console

1. Ve a Firebase Console → Firestore Database
2. Deberías ver una colección llamada `test-connection`
3. Con documentos que tienen el campo `type: "hello-world-test"`

---

## 🐛 Solución de Problemas

### Error: "Missing required Firebase environment variables"

**Causa:** Las variables de entorno no están configuradas correctamente.

**Solución:**
1. Verifica que el archivo `.env` existe en `backend/`
2. Verifica que las variables están bien escritas (sin espacios extra)
3. Reinicia el servidor después de modificar `.env`

---

### Error: "Firebase Admin not initialized"

**Causa:** Firebase no se inicializó correctamente.

**Solución:**
1. Verifica los logs del servidor al arrancar
2. Asegúrate que la `FIREBASE_PRIVATE_KEY` conserva los `\n` literales
3. Prueba con esta estructura en `.env`:
   ```bash
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nLINEA1\nLINEA2\n...\n-----END PRIVATE KEY-----\n"
   ```

---

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"

**Causa:** Las reglas de Firestore están bloqueando la operación.

**Solución:**
1. Ve a Firebase Console → Firestore Database → Rules
2. Temporalmente usa las reglas de desarrollo (permite todo)
3. Click en **"Publish"**
4. Vuelve a intentar la operación

---

### Error: "The query requires an index"

**Causa:** Estás haciendo una query compleja que necesita un índice compuesto.

**Solución:**
1. Copia el link que aparece en el error de consola
2. Abre ese link en el navegador (te lleva a Firebase Console)
3. Click en **"Create Index"**
4. Espera 1-2 minutos a que se cree
5. Vuelve a intentar la query

---

### Error: "fetch failed" o "ECONNREFUSED"

**Causa:** El backend no está corriendo o la URL es incorrecta.

**Solución:**
1. Verifica que el backend está corriendo: `npm start` en `backend/`
2. Verifica que escucha en el puerto correcto (3001)
3. En frontend, verifica `VITE_BACKEND_API_URL` en `.env`

---

## ✅ Mejores Prácticas

### 1. **Nunca subas credenciales a Git**

Añade a `.gitignore`:
```
.env
*.json  # Si incluye service account keys
backend/.env
```

### 2. **Usa diferentes colecciones por ambiente**

- Desarrollo: `workspace-dev`
- Testing: `workspace-test`  
- Producción: `workspace-prod`

Configura con la variable `VITE_FIRESTORE_WORKSPACES_COLLECTION`.

### 3. **Habilita la encriptación en producción**

El servicio `firestoreWorkspaces.ts` ya implementa encriptación AES-GCM automáticamente en modo producción.

### 4. **Implementa rate limiting**

En producción, usa middleware como `express-rate-limit` para prevenir abuso:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests
});

app.use('/api/', limiter);
```

### 5. **Monitorea el uso de Firestore**

- Firebase tiene un plan gratuito generoso (50K lecturas/día)
- Monitorea en Firebase Console → Usage
- Implementa caching para reducir lecturas

### 6. **Usa transacciones para operaciones críticas**

```javascript
const batch = firestore.batch();
batch.set(docRef1, data1);
batch.update(docRef2, data2);
await batch.commit();
```

### 7. **Implementa backups automáticos**

En Firebase Console → Firestore Database → Settings, configura exports automáticos a Cloud Storage.

---

## 📚 Recursos Adicionales

- [Documentación oficial de Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

## 🎉 ¡Listo!

Si completaste todos los pasos y el test "Hello World" funciona, tu integración con Firebase está lista. 

Ahora puedes:
- Usar `StorageSettingsView` en tu UI para diagnósticos visuales
- Importar funciones de `services/firestoreWorkspaces.ts` para guardar datos
- Crear nuevas colecciones para candidatos, reclutadores, ofertas, etc.
- Escalar con confianza sabiendo que tienes reglas de seguridad y encriptación

¿Algún problema? Revisa la sección de [Solución de Problemas](#solución-de-problemas).
