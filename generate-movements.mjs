#!/usr/bin/env node
/**
 * Script para generar movements.json automáticamente
 * Escanea public/movements/ y crea un JSON con todas las animaciones FBX
 */

import { readdir } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MOVEMENTS_DIR = join(__dirname, 'public', 'movements');
const OUTPUT_FILE = join(__dirname, 'public', 'movements.json');

async function generateMovementsJson() {
    try {
        console.log('📂 Escaneando:', MOVEMENTS_DIR);

        const files = await readdir(MOVEMENTS_DIR);

        // Filtrar solo archivos .fbx
        const fbxFiles = files.filter(file => extname(file).toLowerCase() === '.fbx');

        // Crear array de animaciones
        const animations = fbxFiles.map(file => {
            const nameWithoutExt = basename(file, '.fbx');
            return {
                name: nameWithoutExt,
                path: `public/movements/${file}`
            };
        });

        // Ordenar alfabéticamente
        animations.sort((a, b) => a.name.localeCompare(b.name));

        // Guardar JSON
        await writeFile(OUTPUT_FILE, JSON.stringify(animations, null, 2), 'utf-8');

        console.log(`✅ Generado ${OUTPUT_FILE}`);
        console.log(`📊 Total de animaciones: ${animations.length}`);
        animations.forEach(anim => console.log(`   - ${anim.name}`));

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

generateMovementsJson();
