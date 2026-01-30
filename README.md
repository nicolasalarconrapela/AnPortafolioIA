# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js 16.x o superior

### Instalación

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega tu API key de Gemini:
  
   ```txt
   GEMINI_API_KEY=tu_api_key_aquí
   ```

### Comandos Principales

#### Desarrollo

```bash
npm run dev
```

Inicia el servidor de desarrollo en modo watch. La aplicación estará disponible en `http://localhost:5173`

#### Compilación

```bash
npm run build
```

Compila la aplicación para producción. Los archivos optimizados se generarán en la carpeta `dist/`

#### Preview

```bash
npm run preview
```

Previsualiza la aplicación compilada localmente antes de desplegarla a producción
