import * as THREE from "three";

/**
 * Utilidad para liberar correctamente recursos de Three.js
 * Recorre el árbol de escena y hace dispose de geometrías y materiales
 */

export function disposeObject3D(object: THREE.Object3D): void {
  if (!object) return;

  // Recorrer el árbol de objetos
  object.traverse((child) => {
    // Liberar geometría
    if (
      child instanceof THREE.Mesh ||
      child instanceof THREE.Line ||
      child instanceof THREE.Points
    ) {
      if (child.geometry) {
        child.geometry.dispose();
      }

      // Liberar material(es)
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => disposeMaterial(material));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

/**
 * Libera un material y sus texturas asociadas
 */
function disposeMaterial(material: THREE.Material): void {
  if (!material) return;

  // Liberar texturas del material
  Object.keys(material).forEach((key) => {
    const value = (material as any)[key];
    if (value && value instanceof THREE.Texture) {
      value.dispose();
    }
  });

  // Liberar el material
  material.dispose();
}

/**
 * Limpieza completa del renderer
 */
export function disposeRenderer(renderer: THREE.WebGLRenderer): void {
  if (!renderer) return;

  renderer.dispose();
  renderer.forceContextLoss();

  // Limpiar info de renderizado
  if (renderer.info) {
    renderer.info.reset();
  }
}
