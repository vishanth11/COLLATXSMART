const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const { logAction } = require('../services/auditService');

// Validate file MIME type by reading magic bytes from file header into a Buffer
function validateMagicBytes(filePath) {
    let fileDescriptor;
    try {
        fileDescriptor = fs.openSync(filePath, 'r');
        const headerBuffer = Buffer.alloc(4);
        fs.readSync(fileDescriptor, headerBuffer, 0, 4, 0);
        
        const hexSignature = headerBuffer.toString('hex').toLowerCase();
        console.log(`[BUFFER DIAGNOSTIC] Reading file ${path.basename(filePath)} header hex signature:`, hexSignature);

        // Check against common magic signatures
        const isPDF = hexSignature === '25504446'; // %PDF
        const isPNG = hexSignature === '89504e47'; // .PNG
        const isJPEG = hexSignature.startsWith('ffd8ff'); // JPEG
        
        return isPDF || isPNG || isJPEG;
    } catch (err) {
        console.error('Failed to read file magic bytes:', err.message);
        return false;
    } finally {
        if (fileDescriptor !== undefined) {
            fs.closeSync(fileDescriptor);
        }
    }
}

// 1. Upload new document (Customer or Guest)
async function uploadDocument(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { document_type, customer_id, loan_id } = req.body;
    const filePath = req.file.path;

    try {
        // CLF DEMO: Validate file using Node.js Buffers
        const isValidFile = validateMagicBytes(filePath);
        if (!isValidFile) {
            // Delete invalid file
            fs.unlinkSync(filePath);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid file format. Only PDF, PNG, and JPEG uploads are permitted.',
                errorCode: 'INVALID_FILE_SIGNATURE'
            });
        }

        // Insert document metadata
        const docResult = await db.runAsync(
            `INSERT INTO documents (customer_id, loan_id, document_type, file_name, storage_path, mime_type, file_size, verification_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [
                customer_id, 
                loan_id || null, 
                document_type, 
                req.file.originalname, 
                filePath, 
                req.file.mimetype, 
                req.file.size
            ]
        );

        res.json({
            success: true,
            message: 'Document uploaded and verified by header scan.',
            documentId: docResult.lastID
        });

    } catch (err) {
        console.error('Upload document controller error:', err);
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ success: false, message: 'Internal server error processing file.' });
    }
}

// 2. Download document securely (demonstrating Node.js Streams)
async function downloadDocument(req, res) {
    const { id } = req.params;

    try {
        const doc = await db.getAsync('SELECT * FROM documents WHERE id = ?', [id]);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document record not found.' });
        }

        // Access Control: Customer can only view their own files, Admin can view all
        if (req.user.role === 'CUSTOMER' && doc.customer_id !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied. You are unauthorized to download this file.' });
        }

        if (!fs.existsSync(doc.storage_path)) {
            return res.status(404).json({ success: false, message: 'Binary file not found on disk storage.' });
        }

        // Set response headers
        res.setHeader('Content-Type', doc.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);

        // CLF DEMO: Stream file download chunk-by-chunk using Node.js Readable Stream piped to Writable response
        const readStream = fs.createReadStream(doc.storage_path);
        
        readStream.on('open', () => {
            console.log(`[STREAM DIAGNOSTIC] Opened readable stream for document: ${doc.file_name}`);
        });

        readStream.on('data', (chunk) => {
            console.log(`[STREAM DIAGNOSTIC] Piping chunk of size: ${chunk.length} bytes`);
        });

        readStream.on('error', (err) => {
            console.error('Stream read failure:', err.message);
            res.status(500).end('Streaming transaction failed.');
        });

        readStream.on('end', () => {
            console.log(`[STREAM DIAGNOSTIC] Completed stream pipe for document download.`);
        });

        readStream.pipe(res);

    } catch (err) {
        console.error('Download document error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during download.' });
    }
}

// 3. Admin verifies or rejects document
async function verifyDocument(req, res) {
    const { id } = req.params;
    const { verification_status } = req.body; // 'Verified' or 'Rejected'

    if (!['Verified', 'Rejected'].includes(verification_status)) {
        return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    try {
        const doc = await db.getAsync('SELECT * FROM documents WHERE id = ?', [id]);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        await db.runAsync(
            `UPDATE documents SET verification_status = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [verification_status, id]
        );

        await logAction(
            req.user.userId,
            `Document DOC-${id} (${doc.document_type}) status set to ${verification_status}`,
            'documents',
            id
        );

        res.json({ success: true, message: `Document status marked as ${verification_status}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update document status.' });
    }
}

// 4. Get all documents (Admin audit view)
async function getAllDocuments(req, res) {
    try {
        const documents = await db.allAsync(
            `SELECT d.*, c.full_name 
             FROM documents d
             JOIN customers c ON d.customer_id = c.id
             ORDER BY d.uploaded_at DESC`
        );
        res.json({ success: true, documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch documents checklist.' });
    }
}

// 5. Get customer uploaded documents
async function getCustomerDocuments(req, res) {
    const { customerId } = req.params;

    try {
        if (req.user.role === 'CUSTOMER' && parseInt(customerId) !== req.user.customerId) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const documents = await db.allAsync(
            `SELECT * FROM documents WHERE customer_id = ? ORDER BY uploaded_at DESC`,
            [customerId]
        );
        res.json({ success: true, documents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
    }
}

module.exports = {
    uploadDocument,
    downloadDocument,
    verifyDocument,
    getAllDocuments,
    getCustomerDocuments
};
