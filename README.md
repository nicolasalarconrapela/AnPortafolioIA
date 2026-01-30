# Avatar Three.js + React - Integración Profesional

## 🎯 Descripción

Proyecto de demostración que muestra la **integración correcta** de una escena Three.js dentro de una aplicación React con TypeScript, garantizando:

- ✅ **Gestión adecuada del ciclo de vida** del componente
- ✅ **Liberación correcta de recursos GPU/CPU**
- ✅ **Sin fugas de memoria** al navegar entre páginas
- ✅ **Parada completa del render loop** al desmontar
- ✅ **Resize responsivo** con ResizeObserver
- ✅ **Código limpio y tipado**

---

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build de Producción

```bash
npm run build
npm run preview
```

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── main.tsx                    # Punto de entrada React
├── App.tsx                     # Componente principal con Router
├── App.css                     # Estilos de navegación
├── index.css                   # Estilos globales
├── routes/
│   ├── Home.tsx                # Página de inicio
│   ├── Home.css
│   ├── AvatarPage.tsx          # Página del avatar 3D ⭐
│   ├── AvatarPage.css
│   ├── About.tsx               # Página informativa
│   └── About.css
└── three/
    ├── AvatarEngine.ts         # Motor Three.js encapsulado ⭐
    └── dispose.ts              # Utilidades de limpieza GPU ⭐
```

### Componentes Clave

#### 1. **AvatarEngine** (`src/three/AvatarEngine.ts`)

Motor Three.js **completamente encapsulado** e independiente de React.

**Responsabilidades:**
- Crear y gestionar el canvas, renderer, escena y cámara
- Controlar el loop de animación (`requestAnimationFrame`)
- Manejar resize con `ResizeObserver`
- Limitar DPR para optimizar rendimiento
- Comunicar estado a React mediante callbacks

**Métodos principales:**
```typescript
init(hostElement: HTMLElement): void       // Inicializa en un contenedor
start(): void                              // Inicia el render loop
stop(): void                               // Detiene el loop (cancelAnimationFrame)
dispose(): void                            // Libera TODOS los recursos
resetIdle(): void                          // Demo: resetea animación
nudgeCamera(): void                        // Demo: mueve la cámara
```

**Estados del motor:**
- `initializing` - Creando recursos
- `ready` - Motor listo
- `rendering` - Loop activo
- `stopped` - Loop detenido
- `disposed` - Recursos liberados

#### 2. **AvatarPage** (`src/routes/AvatarPage.tsx`)

Componente React que gestiona el ciclo de vida del motor.

**Ciclo de vida:**

```typescript
useEffect(() => {
  // MOUNT: Crear e iniciar engine
  const engine = new AvatarEngine({...});
  engine.init(hostRef.current);
  engine.start();

  // UNMOUNT: Detener y liberar
  return () => {
    engine.stop();
    engine.dispose();
  };
}, []); // Solo se ejecuta una vez
```

**Garantías:**
- Al montar: crea el engine y comienza el render
- Al desmontar: **detiene completamente** el loop y **libera todos los recursos**
- `useRef` para mantener referencia estable al DOM y al engine

#### 3. **dispose.ts** (`src/three/dispose.ts`)

Utilidades para liberar correctamente recursos Three.js.

**Funciones:**
- `disposeObject3D(object)`: Recorre el árbol de escena y libera geometrías, materiales y texturas
- `disposeRenderer(renderer)`: Limpia el renderer y fuerza pérdida de contexto WebGL

**Por qué es necesario:**
Three.js **no libera automáticamente** recursos de GPU. Sin limpieza manual:
- Las geometrías permanecen en VRAM
- Los materiales y texturas ocupan memoria
- El contexto WebGL sigue activo
- **Resultado:** Fugas de memoria y degradación del rendimiento

---

## ✅ Criterios de Aceptación (CUMPLIDOS)

### 1. ✓ Detención Completa del Render Loop

Al navegar de `/avatar` a cualquier otra ruta:

```javascript
// En el cleanup de useEffect:
engine.stop(); // ← Cancela requestAnimationFrame
```

**Verificación:**
1. Abrir DevTools → Performance
2. Iniciar grabación
3. Navegar a `/avatar`
4. Navegar a `/` o `/about`
5. **Resultado:** No hay frames activos después de salir

### 2. ✓ Canvas Desaparece del DOM

```javascript
dispose() {
  // ...
  if (this.canvas && this.canvas.parentElement) {
    this.canvas.parentElement.removeChild(this.canvas);
  }
}
```

**Verificación:**
1. Inspeccionar elemento en `/avatar` → canvas presente
2. Navegar a otra página
3. **Resultado:** Canvas eliminado del DOM

### 3. ✓ Sin Fugas de Memoria

```javascript
dispose() {
  disposeObject3D(this.scene);    // Libera geometrías/materiales
  disposeRenderer(this.renderer); // Libera contexto WebGL
  // ... nullificar todas las referencias
}
```

**Verificación:**
1. DevTools → Memory
2. Tomar snapshot inicial
3. Navegar 10 veces entre páginas
4. Forzar GC (garbage collector)
5. Tomar snapshot final
6. **Resultado:** Memoria estable, sin crecimiento

### 4. ✓ Resize Responsivo

```javascript
this.resizeObserver = new ResizeObserver(() => {
  this.resize();
});
this.resizeObserver.observe(this.host);
```

**Verificación:**
1. Entrar a `/avatar`
2. Redimensionar ventana
3. **Resultado:** Canvas se adapta sin distorsión

### 5. ✓ DPR Limitado

```javascript
const dpr = Math.min(window.devicePixelRatio, 1.5);
this.renderer.setPixelRatio(dpr);
```

**Beneficio:** Evita renderizar a 3x o 4x en pantallas Retina, mejorando performance sin pérdida perceptible de calidad.

### 6. ✓ Código Limpio y Tipado

- TypeScript con `strict: true`
- Sin `any` innecesarios
- Interfaces para opciones
- Comentarios explicativos

---

## 🎮 Uso

### Navegación

- **`/`** - Home: Introducción y características
- **`/avatar`** - Avatar 3D: Escena Three.js interactiva
- **`/about`** - About: Documentación técnica

### Controles en `/avatar`

- **🔄 Reset Idle**: Resetea la rotación del cubo demo
- **🎥 Nudge Camera**: Mueve aleatoriamente la cámara

### Estado del Motor

En tiempo real se muestra:
- Estado actual (`INITIALIZING`, `READY`, `RENDERING`, etc.)
- Mensajes informativos
- Color del indicador según estado

---

## 🛠️ Stack Tecnológico

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento SPA
- **Three.js** - Motor 3D/WebGL

---

## 📋 Comandos Disponibles

```bash
npm run dev       # Servidor de desarrollo (puerto 3000)
npm run build     # Build de producción
npm run preview   # Preview del build
```

---

## 🧪 Testing de Fugas de Memoria

### Prueba Manual

1. Abrir Chrome DevTools
2. Ir a **Memory** tab
3. Tomar snapshot "Heap Snapshot"
4. Guardar como "Inicial"
5. Navegar 10 veces: `/avatar` → `/` → `/avatar` → `/` ...
6. En la consola ejecutar: `window.gc()` (requiere `--js-flags="--expose-gc"`)
7. Tomar otro snapshot "Final"
8. Comparar tamaños
9. **Esperado:** Tamaño similar, sin crecimiento significativo

### Performance Profiling

1. DevTools → **Performance** tab
2. Iniciar grabación
3. Navegar a `/avatar`
4. Esperar 5 segundos
5. Navegar a `/`
6. Detener grabación
7. **Verificar:** 
   - Frames activos solo mientras está en `/avatar`
   - Sin `requestAnimationFrame` fuera de `/avatar`

---

## 🔍 Detalles de Implementación

### ¿Por qué ResizeObserver y no window.onresize?

```javascript
// ❌ Problemas con window.resize:
// - No detecta cambios en el contenedor
// - Solo funciona para resize de ventana
// - Puede no disparar si el contenedor cambia de tamaño por CSS

// ✅ ResizeObserver:
this.resizeObserver = new ResizeObserver(() => {
  this.resize(); // Se dispara cuando EL HOST cambia de tamaño
});
this.resizeObserver.observe(this.host);
```

### ¿Por qué separar el motor de React?

**Separación de responsabilidades:**
- **React**: UI, ciclo de vida de componentes, estado
- **AvatarEngine**: Lógica 3D pura, independiente del framework

**Beneficios:**
- Reutilizable en otros frameworks (Vue, Svelte, vanilla JS)
- Más fácil de testear
- Mejor encapsulación
- Evita re-renders innecesarios
- Lógica 3D no se mezcla con lógica de componentes

### ¿Cómo funciona la comunicación React ↔ Three?

```typescript
// Three.js → React: Callbacks
const engine = new AvatarEngine({
  onStatus: (status, message) => {
    setStatus(status);        // ← Actualiza estado de React
    setStatusMessage(message);
  }
});

// React → Three.js: Métodos del engine
const handleNudge = () => {
  engineRef.current.nudgeCamera(); // ← Llama método del engine
};
```

---

## 🎨 Estética

El proyecto incluye:
- **Tema oscuro moderno**
- **Gradientes vibrantes** (púrpura/azul)
- **Animaciones suaves** (hover effects, pulsos)
- **Diseño responsive**
- **Glassmorphism** en indicadores de estado
- **Sombras y bordes con glow**

---

## 📚 Recursos

- [Three.js Documentation](https://threejs.org/docs/)
- [React Router](https://reactrouter.com/)
- [ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Memory Leaks in Three.js](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)

---

## 👨‍💻 Autor

Proyecto creado como demostración de **buenas prácticas** en la integración de Three.js con React.

---

## 📄 Licencia

MIT

---

**¡Disfruta explorando la integración correcta de Three.js con React! 🚀**
