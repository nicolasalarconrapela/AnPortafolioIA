import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import JSZip from 'jszip';

// Fix for PDF.js import: handle case where exports are wrapped in default
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set up the PDF.js worker
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.mjs';
}

/**
 * Main service function to parse file content based on type
 */
export const parseFileContent = async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    switch (fileType) {
        case 'pdf':
            return await parsePDF(file);
        case 'docx':
            return await parseDOCX(file);
        case 'csv':
            return await parseCSV(file);
        case 'doc':
            throw new Error("Legacy .doc files are not supported in the browser. Please save as .docx or PDF.");
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
};

/**
 * Extract files from a ZIP archive
 * Only extracts safe allowed types (pdf, docx, csv)
 */
export const extractFilesFromZip = async (zipFile: File): Promise<File[]> => {
    try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(zipFile);
        const extractedFiles: File[] = [];

        // Iterate through each file in the zip
        for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
            const entry: any = zipEntry;
            // Skip directories
            if (entry.dir) continue;
            
            // Skip hidden files (e.g. __MACOSX, .DS_Store)
            if (entry.name.startsWith('__MACOSX') || entry.name.startsWith('.')) continue;

            const ext = entry.name.split('.').pop()?.toLowerCase();
            
            // Allowlist check
            if (['pdf', 'docx', 'csv'].includes(ext || '')) {
                const blob = await entry.async('blob');
                // Create a File object from the blob
                const file = new File([blob], entry.name, { 
                    type: blob.type || 'application/octet-stream',
                    lastModified: new Date().getTime() 
                });
                extractedFiles.push(file);
            }
        }
        return extractedFiles;
    } catch (error) {
        console.error("ZIP Extraction Error:", error);
        throw new Error("Failed to extract ZIP content. The file might be corrupted or password protected.");
    }
};

/**
 * PDF Parsing Logic
 */
const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
};

/**
 * DOCX Parsing Logic (using Mammoth)
 */
const parseDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value.trim(); // The raw text
};

/**
 * CSV Parsing Logic (using PapaParse)
 */
const parseCSV = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Convert array of objects to a readable string representation
                if (results.data && results.data.length > 0) {
                    const jsonString = JSON.stringify(results.data, null, 2);
                    resolve(jsonString);
                } else {
                    resolve("CSV file appeared empty or invalid.");
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};