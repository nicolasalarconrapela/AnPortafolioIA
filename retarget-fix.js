// Función retargetAnimation corregida
function retargetAnimation(target, clip) {
    const newClip = clip.clone();
    newClip.name = clip.name + "_retarget";

    // 1. Detectar prefijo en el modelo destino (si lo tiene)
    const boneNames = [];
    target.traverse((o) => { if (o.isBone) boneNames.push(o.name); });

    const targetHasPrefix = boneNames.some(n => n.startsWith("mixamorig"));

    newClip.tracks.forEach((track) => {
        // track.name puede ser:
        // - "mixamorig:Hips.position" (con dos puntos)
        // - "mixamorigHips.position" (sin dos puntos, TODO JUNTO)
        // - "Hips.position" (sin prefijo)

        let trackName = track.name;
        let boneName = trackName;
        let property = "";

        // Separar el nombre del hueso de la propiedad (.position, .quaternion, etc.)
        const lastDot = trackName.lastIndexOf(".");
        if (lastDot !== -1) {
            boneName = trackName.substring(0, lastDot);
            property = trackName.substring(lastDot); // incluye el punto
        }

        // Quitar prefijo mixamorig: o mixamorig
        if (boneName.startsWith("mixamorig:")) {
            boneName = boneName.substring(10); // "mixamorig:".length = 10
        } else if (boneName.startsWith("mixamorig")) {
            boneName = boneName.substring(9); // "mixamorig".length = 9
        }

        // Si el avatar QUIERE "mixamorig:" y la anim no lo tiene -> agregamos
        if (targetHasPrefix && !trackName.startsWith("mixamorig")) {
            track.name = `mixamorig:${boneName}${property}`;
        }
        // Si el avatar NO quiere "mixamorig:" y la anim SÍ lo tiene -> quitamos
        else if (!targetHasPrefix && (trackName.startsWith("mixamorig:") || trackName.startsWith("mixamorig"))) {
            track.name = `${boneName}${property}`;
        }

        // FILTRO DE POSICIÓN PARA CADERAS
        if (track.name.endsWith(".position") && !track.name.toLowerCase().includes("hips")) {
            // Bloquear traslación de huesos que no sean hips (evita estiramientos raros)
            // track.values = track.values.map(v => 0); // o eliminar track
        }
    });

    return newClip;
}
