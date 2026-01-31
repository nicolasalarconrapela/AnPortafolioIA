# 🔥 Firebase Authentication Setup for AnLoginFirebase

Este documento describe la configuración necesaria en Firebase para que el sistema de login funcione correctamente en **AnPortafolioIA**.

---

## 🚀 1. Configuración del Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com).
2. Selecciona el proyecto **AnLoginFirebase** (o el proyecto que asignaste).

---

## 🔐 2. Habilitar Authentication

1. En el menú lateral izquierdo, click en **Build > Authentication**.
2. Click en **Get Started** si es la primera vez.

### 2.1 Habilitar Proveedores

Debes activar los siguientes "Sign-in providers":

#### ✉️ Email/Password
1. Click en la pestaña **Sign-in method**.
2. Click en **Email/Password**.
3. Activa el switch **Enable**.
4. **Desactiva** "Email link (passwordless sign-in)".
5. Click **Save**.

#### 🤖 Anonymous
1. Click en **Add new provider**.
2. Selecciona **Anonymous**.
3. Activa el switch **Enable**.
4. Click **Save**.

#### 🌐 Google
1. Click en **Add new provider**.
2. Selecciona **Google**.
3. Activa el switch **Enable**.
4. Configura el nombre del proyecto (visible para el usuario).
5. Selecciona tu email de soporte.
6. Click **Save**.

---

## 🌍 3. Configuración del Cliente (Frontend)

Para que el frontend pueda conectarse a este proyecto, necesitas las credenciales públicas.

1. Ve a **Project Settings** (⚙️).
2. Pestaña **General**.
3. Baja hasta **Your apps**.
4. Si no hay apps web, click en el icono **Web (</>)**.
5. Registra la app (ej: `AnPortafolioIA-Web`).
6. Copia la configuración del SDK (`firebaseConfig`).

### Configuración en `.env` (Frontend)

Crea o edita el archivo `.env` en la raíz de `AnPortafolioIA` y agrega las claves correspondientes:

```env
# Firebase Client Configuration (Extraída de Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> ⚠️ **Nota:** Estas son claves públicas, es seguro incluirlas en el frontend, pero NO las subas a un repositorio público si es posible.

---

## 🛡️ 4. Seguridad (Opcional pero Recomendado)

Para mayor seguridad, configura "Authorized Domains" en Firebase Console > Authentication > Settings > Authorized domains. Asegúrate de añadir:

- `localhost`
- `tu-dominio-en-render.com` (cuando despliegues)

---

## ✅ Verificación

1. Reinicia el frontend (`npm run dev`).
2. Intenta hacer **Sign Up** con un correo y contraseña.
3. Intenta hacer **Login** con Google (popup).
4. Intenta entrar como **Guest**.
5. Verifica en Firebase Console > Authentication > Users que los usuarios se están creando.

---

## ⚙️ Backend (Validación)

Aunque el frontend maneja el login, el backend ya está configurado con `firebase-admin` para realizar operaciones privilegiadas (como gestionar workspaces) basándose en el UID del usuario autenticado.

Asegúrate de que el backend tenga las credenciales (`FIREBASE_PRIVATE_KEY`, etc.) del **mismo proyecto** que configuraste arriba.
