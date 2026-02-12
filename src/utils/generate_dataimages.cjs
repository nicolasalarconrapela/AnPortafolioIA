const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets/ai');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const files = [
    { name: 'donna_avatar', path: '../../public/donna_avatar.png', mime: 'image/png' },
    { name: 'rotenmeir_avatar', path: '../../public/rotenmeir.png', mime: 'image/png' },
    { name: 'gretchen_avatar', path: '../../public/gretchen.jpg', mime: 'image/jpeg' },
    { name: 'googlito_avatar', path: '../../public/googlito.jpg', mime: 'image/jpeg' },
];

files.forEach(file => {
    try {
        const absolutePath = path.join(__dirname, file.path);
        if (fs.existsSync(absolutePath)) {
            const buffer = fs.readFileSync(absolutePath);
            const base64 = buffer.toString('base64');
            const content = `data:${file.mime};base64,${base64}`;
            const outputPath = path.join(assetsDir, `${file.name}.dataimage`);
            fs.writeFileSync(outputPath, content);
            console.log(`Generated ${file.name}.dataimage`);
        } else {
            console.error(`File not found: ${absolutePath}`);
        }
    } catch (err) {
        console.error(`Error converting ${file.name}:`, err.message);
    }
});
