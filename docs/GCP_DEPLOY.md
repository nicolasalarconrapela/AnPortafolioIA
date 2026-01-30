# Guía de Despliegue en Google Cloud Platform (GCP)

Esta guía describe los pasos necesarios para configurar y desplegar la aplicación **AnPortafolioIA** en Google Cloud Platform.

La arquitectura propuesta consiste en:
*   **Frontend**: Aplicación React alojada en **Google Cloud Run** (contenedorizada con Nginx).
*   **Backend / BaaS**: **Firebase** para autenticación, base de datos y lógica de servidor (si es necesaria).

---

## 1. Prerrequisitos

1.  Una cuenta de Google Cloud Platform activa.
2.  [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) instalado y autenticado.
3.  Node.js y npm instalados localmente.

---

## 2. Configuración de Firebase

Como el backend de la aplicación se basará en Firebase, es necesario configurarlo primero.

### 2.1 Crear el Proyecto
1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en **"Agregar proyecto"** y sigue los pasos (puedes usar un proyecto de GCP existente o crear uno nuevo).

### 2.2 Configurar Autenticación
1.  En el menú lateral, selecciona **Compilación > Authentication**.
2.  Haz clic en **Comenzar**.
3.  En la pestaña **Sign-in method**, habilita los siguientes proveedores:
    *   **Correo electrónico/contraseña**: Habilitar.
    *   **Google**: Habilitar. (Necesitarás configurar el nombre de la app y correo de soporte).
    *   **Anónimo**: Habilitar.

### 2.3 Obtener Credenciales
1.  Ve a la **Configuración del proyecto** (icono de engranaje > Configuración del proyecto).
2.  En la sección **"Tus apps"**, haz clic en el icono de web (`</>`).
3.  Registra la aplicación (ej: `anportafolio-web`).
4.  Copia el objeto `firebaseConfig`. Se verá similar a esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 3. Integración en el Código (Frontend)

Antes de desplegar, asegúrate de que tu aplicación React esté configurada para usar Firebase.

### 3.1 Instalar Firebase SDK
En el directorio raíz del proyecto:
```bash
npm install firebase
```

### 3.2 Configurar Variables de Entorno
Crea o edita el archivo `.env` (y `.env.production` para producción) para no hardcodear las credenciales.

> **Nota**: Vite requiere que las variables comiencen con `VITE_` para ser expuestas al cliente.

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
GEMINI_API_KEY=tu_clave_gemini
```

### 3.3 Inicializar Firebase
Crea un archivo `src/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

---

## 4. Despliegue en Google Cloud Run

Cloud Run ejecutará el contenedor Docker que sirve tu aplicación React.

### 4.1 Preparar Dockerfile
El proyecto ya cuenta con un `Dockerfile` optimizado. Este archivo espera que `GEMINI_API_KEY` se pase como argumento de construcción (`ARG`).

*Si decides usar las variables de entorno de Firebase en tiempo de construcción (para que Vite las incluya en el bundle), deberás agregarlas también al Dockerfile como `ARG`.*

**Ejemplo de modificación del Dockerfile para incluir Firebase:**
```dockerfile
# ... (en la etapa de build)
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
# Repetir para el resto de variables...
```

### 4.2 Desplegar usando gcloud

La forma más sencilla es usar `gcloud run deploy` desde la raíz del proyecto. Este comando sube el código, construye la imagen en Cloud Build y la despliega.

Asegúrate de tener un archivo `.env` o pasar los flags `--set-env-vars` para las variables de entorno *runtime* (aunque para una SPA estática, las variables importantes son las de *build time*).

Si estás usando las variables durante el build, la mejor estrategia es construir la imagen primero:

#### Opción A: Build y Deploy Manual (Recomendado para control total)

1.  **Construir la imagen**:
    Sustituye los valores por tus credenciales reales.

    ```bash
    export PROJECT_ID=$(gcloud config get-value project)

    docker build \
      --build-arg GEMINI_API_KEY="tu_api_key" \
      --build-arg VITE_FIREBASE_API_KEY="tu_firebase_key" \
      --build-arg VITE_FIREBASE_AUTH_DOMAIN="tu_auth_domain" \
      # ... añadir resto de args ...
      -t gcr.io/$PROJECT_ID/anportafolio-web .
    ```

2.  **Subir la imagen al registro**:
    ```bash
    docker push gcr.io/$PROJECT_ID/anportafolio-web
    ```

3.  **Desplegar en Cloud Run**:
    ```bash
    gcloud run deploy anportafolio-web \
      --image gcr.io/$PROJECT_ID/anportafolio-web \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

#### Opción B: Despliegue directo (Si tienes .env configurado localmente)

Si tu archivo `.dockerignore` **no** excluye los archivos `.env` (actualmente está configurado para permitirlos), puedes simplemente ejecutar:

```bash
gcloud run deploy anportafolio-web --source .
```

Google Cloud Build usará tus archivos locales para construir la imagen, por lo que las variables en `.env` serán leídas por Vite durante el build.

---

## 5. Verificación

1.  Al finalizar el despliegue, la terminal mostrará la **URL del servicio** (ej: `https://anportafolio-web-xyz-uc.a.run.app`).
2.  Abre la URL y verifica que la aplicación carga.
3.  Prueba el flujo de inicio de sesión (asegúrate de agregar este dominio a la lista de **Dominios autorizados** en la consola de Firebase Authentication).
