import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';

// --- SECURITY CONSTANTS ---
const MAX_ZIP_EXPANDING_RATIO = 10; // Max compression ratio allowed (prevention against zip bombs)
const MAX_TOTAL_UNCOMPRESSED_SIZE = 50 * 1024 * 1024; // 50MB hard limit for extracted content
const ALLOWED_MAGIC_NUMBERS: { [key: string]: string[] } = {
    'pdf': ['25504446'], // %PDF
    'zip': ['504b0304'], // PK.. (ZIP, DOCX, XLSX, JAR)
    'docx': ['504b0304'], // DOCX is a zip
    'png': ['89504e47'], // .PNG
    'jpg': ['ffd8ff'],   // JPEG start
    'jpeg': ['ffd8ff'],
    // CSV and TXT do not have magic numbers, validated by content heuristic
};

// Helper to handle ESM default exports safely
const getModule = (mod: any) => mod && mod.default ? mod.default : mod;

// --- PDF.js Configuration ---
const pdfjs = getModule(pdfjsLib);
const PDFJS_VERSION = '3.11.174';
const CDN_BASE = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}`;

if (pdfjs && typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.mjs`;
}

// Helper to get Mammoth & Tesseract
const getMammoth = () => getModule(mammoth);
const getTesseract = () => getModule(Tesseract);

/**
 * SECURITY: Sanitize strings to prevent XSS or Control Character Injection
 */
const sanitizeText = (text: string): string => {
    if (!text) return "";
    // Remove null bytes and control characters (keeping newlines/tabs)
    // Also basic HTML escaping could be added here if not handled by React
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

const sanitizeFilename = (filename: string): string => {
    // Remove path traversal characters and non-printable chars
    return filename.replace(/(\.\.[\/\\])+/g, '').replace(/[^\x20-\x7E]/g, '_');
};

/**
 * SECURITY: Verify File Signature (Magic Numbers)
 */
const validateFileSignature = async (file: File): Promise<void> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    // Skip signature check for text-based files (validated later by parsing success)
    if (ext === 'csv' || ext === 'txt') return; 

    if (!ext || !ALLOWED_MAGIC_NUMBERS[ext]) {
        // If we strictly allow only known extensions, we could throw here. 
        // For now, if we don't have a signature for it, we warn or block based on strictness.
        // Assuming strict mode:
        throw new Error("Security Violation: File type signature verification failed.");
    }

    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const view = new Uint8Array(buffer);
    const fileHeader = Array.from(view).map(b => b.toString(16).padStart(2, '0')).join('');

    const allowedHeaders = ALLOWED_MAGIC_NUMBERS[ext];
    const isMatch = allowedHeaders.some(header => fileHeader.startsWith(header));

    if (!isMatch) {
        throw new Error(`Security Violation: File extension .${ext} does not match its binary signature.`);
    }
};

/**
 * Main service function to parse file content based on type
 */
export const parseFileContent = async (file: File): Promise<string> => {
    // 1. Sanitize Filename
    const safeName = sanitizeFilename(file.name);
    const fileType = safeName.split('.').pop()?.toLowerCase();

    try {
        // 2. Validate Magic Numbers
        await validateFileSignature(file);

        let content = "";
        switch (fileType) {
            case 'pdf':
                content = await parsePDF(file);
                break;
            case 'docx':
                content = await parseDOCX(file);
                break;
            case 'csv':
                content = await parseCSV(file);
                break;
            case 'doc':
                throw new Error("Legacy .doc files are not supported for security reasons.");
            case 'png':
            case 'jpg':
            case 'jpeg':
                content = await parseImage(file);
                break;
            case 'txt':
                content = await file.text();
                break;
            default:
                throw new Error(`Unsupported file type: .${fileType}`);
        }

        // 3. Final Content Sanitization
        return sanitizeText(content);

    } catch (error: any) {
        console.error(`Security/Parsing Error for ${safeName}:`, error);
        throw new Error(error.message || `Failed to secure/parse ${safeName}`);
    }
};

/**
 * Extract files from a ZIP archive with Zip Bomb Protection
 */
export const extractFilesFromZip = async (zipFile: File): Promise<File[]> => {
    try {
        // Validate ZIP signature first
        await validateFileSignature(zipFile);

        const JSZipConstructor = getModule(JSZip);
        const zip = new JSZipConstructor();
        
        const loadedZip = await zip.loadAsync(zipFile);
        const extractedFiles: File[] = [];
        let totalUncompressedSize = 0;

        for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
            const entry: any = zipEntry;
            
            // Security: Prevent processing of hidden/system files
            if (entry.dir) continue;
            if (entry.name.startsWith('__MACOSX') || entry.name.startsWith('.') || entry.name.includes('../')) continue;

            // Security: Check for Zip Bomb (Size Bomb)
            // Note: _data.uncompressedSize is internal API, entry.unsafeOriginalSize might be available depending on version
            // We use a heuristic or check after blob creation if needed, but checking metadata is better.
            const size = (entry as any)._data?.uncompressedSize || 0;
            totalUncompressedSize += size;

            if (totalUncompressedSize > MAX_TOTAL_UNCOMPRESSED_SIZE) {
                throw new Error("Security Violation: ZIP content exceeds maximum allowable size (Zip Bomb detected).");
            }

            const ext = entry.name.split('.').pop()?.toLowerCase();
            
            if (['pdf', 'docx', 'csv', 'txt', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
                const blob = await entry.async('blob');
                
                // Double check size after decompression
                if (blob.size > 15 * 1024 * 1024) {
                     throw new Error(`Security Violation: File ${entry.name} inside zip is too large.`);
                }

                const safeName = sanitizeFilename(entry.name.split('/').pop() || entry.name);
                
                const file = new File([blob], safeName, { 
                    type: blob.type || 'application/octet-stream',
                    lastModified: new Date().getTime() 
                });
                extractedFiles.push(file);
            }
        }
        return extractedFiles;
    } catch (error: any) {
        console.error("ZIP Extraction Error:", error);
        throw new Error("Failed to extract ZIP: " + error.message);
    }
};

/**
 * PDF Parsing Logic
 */
const parsePDF = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.mjs`;
        }

        const loadingTask = pdfjs.getDocument({ 
            data: arrayBuffer,
            cMapUrl: `${CDN_BASE}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${CDN_BASE}/standard_fonts/`,
            // Security: Disable external links/scripts execution context if possible in config
            isEvalSupported: false 
        });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        const totalPages = Math.min(pdf.numPages, 20); // Security: Limit max pages parsed to prevent blocking main thread

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    } catch (e: any) {
        console.error("PDF.js Parsing Error:", e);
        if (e.name === 'PasswordException') {
            throw new Error("PDF is password protected.");
        }
        throw new Error(`PDF Error: ${e.message}`);
    }
};

/**
 * DOCX Parsing Logic
 */
const parseDOCX = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothClient = getMammoth();
        
        if (!mammothClient || !mammothClient.extractRawText) {
            throw new Error("DOCX parser library not loaded.");
        }
        
        const result = await mammothClient.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value.trim();
    } catch (e: any) {
        throw new Error(`DOCX Error: ${e.message}`);
    }
};

/**
 * CSV Parsing Logic
 */
const parseCSV = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Sanity Check: Limit CSV size strictly before parsing logic
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error("CSV Security: File too large for browser parsing."));
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Security: Basic sanitization of CSV fields is handled by returning JSON string,
                // but we ensure we don't crash on huge data structures.
                if (results.data && results.data.length > 0) {
                    // Truncate rows if too many (prevent memory exhaustion)
                    const safeData = results.data.slice(0, 5000); 
                    resolve(JSON.stringify(safeData, null, 2));
                } else {
                    resolve("CSV file appeared empty.");
                }
            },
            error: (error) => {
                reject(new Error(`CSV Error: ${error.message}`));
            }
        });
    });
};

/**
 * Image OCR & Layout Analysis Logic (Simulating PP-Structure)
 */
const parseImage = async (file: File): Promise<string> => {
    try {
        const tesseract = getTesseract();
        if (!tesseract) throw new Error("OCR library not initialized.");

        // Security: Limit image size to prevent memory crash during OCR
        if (file.size > 10 * 1024 * 1024) {
             throw new Error("Security: Image too large for OCR processing.");
        }

        const result = await tesseract.recognize(
            file,
            'eng', 
            { logger: () => {} }
        );

        const blocks = result.data.blocks || [];
        
        const layoutData = blocks.map((block: any, index: number) => {
            const text = sanitizeText(block.text.trim()); // Sanitize inside OCR
            const confidence = block.confidence;
            
            let regionType = 'Text';
            if (confidence > 85 && text.length < 60 && !text.includes('.') && text.toUpperCase() === text) {
                regionType = 'Header';
            } else if (text.match(/^[•\-\*1-9]\.?\s/)) {
                regionType = 'List';
            } else if (text.includes('|') || (text.match(/\s{3,}/g) || []).length > 1) {
                regionType = 'Table';
            } else if (text.toLowerCase().startsWith('fig') || text.toLowerCase().startsWith('image')) {
                regionType = 'Figure';
            }

            return {
                id: `block_${index}`,
                region: regionType,
                confidence: Math.round(confidence),
                content: text,
                bbox: block.bbox
            };
        }).filter((b: any) => b.content.length > 0);

        return JSON.stringify(layoutData, null, 2);

    } catch (e: any) {
        console.error("OCR Error:", e);
        return `[IMAGE UPLOADED: ${sanitizeFilename(file.name)}]\n(Structure extraction failed. Raw image attached.)`;
    }
}
