import express from 'express';
import multer from 'multer';
import { getStorage } from '../firebaseAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { logger } from '../logger.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Proteger todas las rutas de subida
router.use(requireAuth);

router.post('/avatar', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uid = req.user.uid;

        // Basic validation
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }

        const storage = getStorage();
        if (!storage) {
             throw new Error("Firebase Storage is not initialized.");
        }

        const bucket = storage.bucket();
        if (!bucket.name) {
             throw new Error("Storage Bucket name is missing. Check FIREBASE_STORAGE_BUCKET env var.");
        }

        const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
        const fileName = `users/${uid}/avatar_${Date.now()}.${fileExtension}`;
        const file = bucket.file(fileName);

        logger.info(`Starting upload to bucket: ${bucket.name}, file: ${fileName}`);

        // Upload
        await file.save(req.file.buffer, {
            contentType: req.file.mimetype,
            resumable: false
        });

        logger.info('File saved. Making public...');

        try {
             await file.makePublic();
        } catch (publicError) {
             logger.warn(`Failed to make file public: ${publicError.message}. Trying signed URL as fallback.`);
             // Fallback: Generate a long-lived signed URL
             const [url] = await file.getSignedUrl({
                 action: 'read',
                 expires: '03-01-2500'
             });
             res.json({ url });
             return;
        }

        logger.info(`Avatar uploaded for user ${uid}: ${publicUrl}`);

        res.json({ url: publicUrl });

    } catch (error) {
        logger.error('Upload Error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

export default router;
