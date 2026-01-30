import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';

// Helper to handle ESM default exports safely
const getModule = (mod: any) => mod && mod.default ? mod.default : mod;

// --- PDF.js Configuration ---
const pdfjs = getModule(pdfjsLib);

// Specific version to ensure compatibility between worker and library
const PDFJS_VERSION = '3.11.174';
const CDN_BASE = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}`;

// Configure worker
if (pdfjs && typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.mjs`;
}

// Helper to get Mammoth & Tesseract
const getMammoth = () => getModule(mammoth);
const getTesseract = () => getModule(Tesseract);

/**
 * Main service function to parse file content based on type
 */
export const parseFileContent = async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
        switch (fileType) {
            case 'pdf':
                return await parsePDF(file);
            case 'docx':
                return await parseDOCX(file);
            case 'csv':
                return await parseCSV(file);
            case 'doc':
                throw new Error("Legacy .doc files are not supported. Please convert to .docx or PDF.");
            case 'png':
            case 'jpg':
            case 'jpeg':
                return await parseImage(file);
            case 'txt':
                return await file.text();
            default:
                throw new Error(`Unsupported file type: .${fileType}`);
        }
    } catch (error: any) {
        console.error(`Error parsing ${file.name}:`, error);
        // Return clear error message to UI
        throw new Error(error.message || `Failed to parse ${file.name}`);
    }
};

/**
 * Extract files from a ZIP archive
 */
export const extractFilesFromZip = async (zipFile: File): Promise<File[]> => {
    try {
        const JSZipConstructor = getModule(JSZip);
        const zip = new JSZipConstructor();
        
        const loadedZip = await zip.loadAsync(zipFile);
        const extractedFiles: File[] = [];

        for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
            const entry: any = zipEntry;
            if (entry.dir) continue;
            if (entry.name.startsWith('__MACOSX') || entry.name.startsWith('.')) continue;

            const ext = entry.name.split('.').pop()?.toLowerCase();
            
            if (['pdf', 'docx', 'csv', 'txt', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
                const blob = await entry.async('blob');
                const file = new File([blob], entry.name.split('/').pop() || entry.name, { 
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
        
        // Ensure worker is set (redundant check but safe)
        if (pdfjs && !pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `${CDN_BASE}/build/pdf.worker.mjs`;
        }

        const loadingTask = pdfjs.getDocument({ 
            data: arrayBuffer,
            cMapUrl: `${CDN_BASE}/cmaps/`,
            cMapPacked: true,
            standardFontDataUrl: `${CDN_BASE}/standard_fonts/`,
        });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
                
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
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    resolve(JSON.stringify(results.data, null, 2));
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

        // We use Tesseract.js Blocks to mimic PP-Structure's layout analysis
        const result = await tesseract.recognize(
            file,
            'eng', 
            { 
                logger: (m: any) => {
                    // console.debug(m); 
                }
            }
        );

        const blocks = result.data.blocks || [];
        
        // Structured output mimicking what a Layout Analysis model would return
        const layoutData = blocks.map((block: any, index: number) => {
            const text = block.text.trim();
            const confidence = block.confidence;
            
            // Heuristic Classification Logic (Simulating PP-Structure classes)
            let regionType = 'Text';
            
            // 1. Title/Header Detection (High confidence, short length, no periods)
            if (confidence > 85 && text.length < 60 && !text.includes('.') && text.toUpperCase() === text) {
                regionType = 'Header';
            }
            // 2. List Item Detection
            else if (text.match(/^[•\-\*1-9]\.?\s/)) {
                regionType = 'List';
            }
            // 3. Table Detection (Simulated by tab separation or multiple spaces)
            else if (text.includes('|') || (text.match(/\s{3,}/g) || []).length > 1) {
                regionType = 'Table';
            }
            // 4. Figure/Caption (Low text density usually, but here checking key words)
            else if (text.toLowerCase().startsWith('fig') || text.toLowerCase().startsWith('image')) {
                regionType = 'Figure';
            }

            return {
                id: `block_${index}`,
                region: regionType,
                confidence: Math.round(confidence),
                content: text,
                bbox: block.bbox // {x0, y0, x1, y1}
            };
        }).filter((b: any) => b.content.length > 0);

        // Return structured JSON instead of raw text
        return JSON.stringify(layoutData, null, 2);

    } catch (e: any) {
        console.error("OCR Error:", e);
        return `[IMAGE UPLOADED: ${file.name}]\n(Structure extraction failed. Raw image attached.)`;
    }
}
