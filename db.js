// IndexedDB handling for Codepacker Guest Book

// Initialize the database
const dbName = 'CodepackerGuestBook';
const dbVersion = 1;
let db;

// DB Schema
// - guestEntries: id (auto), date, name, organization, type, message, photo

// Open database connection
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = (event) => {
            reject(`Database error: ${event.target.error}`);
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        // Create object stores when DB is first created or version is upgraded
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create guest entries store
            if (!db.objectStoreNames.contains('guestEntries')) {
                const store = db.createObjectStore('guestEntries', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

// Add a new guest entry
function addGuestEntry(entry) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['guestEntries'], 'readwrite');
        const store = transaction.objectStore('guestEntries');
        
        // Add date if not provided
        if (!entry.date) {
            entry.date = new Date().toISOString();
        }
        
        const request = store.add(entry);
        
        request.onsuccess = () => {
            resolve(request.result); // Returns the generated id
        };
        
        request.onerror = (event) => {
            reject(`Add error: ${event.target.error}`);
        };
    });
}

// Get all guest entries
function getAllGuestEntries() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['guestEntries'], 'readonly');
        const store = transaction.objectStore('guestEntries');
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(`GetAll error: ${event.target.error}`);
        };
    });
}

// Get entries by date range
function getEntriesByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['guestEntries'], 'readonly');
        const store = transaction.objectStore('guestEntries');
        const index = store.index('date');
        
        // Convert dates to ISO strings for comparison
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const range = IDBKeyRange.bound(
            start.toISOString(), 
            end.toISOString()
        );
        
        const request = index.getAll(range);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(`Date range query error: ${event.target.error}`);
        };
    });
}

// Delete a guest entry
function deleteGuestEntry(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['guestEntries'], 'readwrite');
        const store = transaction.objectStore('guestEntries');
        const request = store.delete(id);
        
        request.onsuccess = () => {
            resolve(true);
        };
        
        request.onerror = (event) => {
            reject(`Delete error: ${event.target.error}`);
        };
    });
}

// Clear all entries
function clearAllEntries() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['guestEntries'], 'readwrite');
        const store = transaction.objectStore('guestEntries');
        const request = store.clear();
        
        request.onsuccess = () => {
            resolve(true);
        };
        
        request.onerror = (event) => {
            reject(`Clear error: ${event.target.error}`);
        };
    });
}

// Export guest entries as JSON
function exportGuestEntries() {
    return new Promise((resolve, reject) => {
        getAllGuestEntries()
            .then(entries => {
                const dataStr = JSON.stringify(entries, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportName = `codepacker_guestbook_${new Date().toISOString().slice(0,10)}.json`;
                
                // Create download link
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportName);
                linkElement.click();
                
                resolve(entries.length);
            })
            .catch(error => reject(error));
    });
}

// Export guest entries to Excel (CSV format for better compatibility)
function exportToExcel(entries) {
    return new Promise((resolve, reject) => {
        try {
            // Use CSV format instead of HTML-based Excel for better compatibility
            let csvContent = "ID,Date,Name,Type,Organization,Message\n";
            
            // Generate CSV data
            entries.forEach(entry => {
                // Format date nicely
                const entryDate = new Date(entry.date);
                const formattedDate = entryDate.toLocaleDateString('id-ID', { 
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }) + ' ' + entryDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Escape fields for CSV format
                const escapeCSV = (field) => {
                    if (field === null || field === undefined) return '';
                    // Convert to string and escape quotes
                    const str = String(field).replace(/"/g, '""');
                    // Add quotes if field contains commas, quotes or newlines
                    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                        return `"${str}"`;
                    }
                    return str;
                };
                
                // Add row to CSV
                csvContent += [
                    escapeCSV(entry.id || ''),
                    escapeCSV(formattedDate),
                    escapeCSV(entry.name || ''),
                    escapeCSV(entry.type || ''),
                    escapeCSV(entry.organization || ''),
                    escapeCSV(entry.message || '')
                ].join(',') + '\n';
            });
            
            // Generate file name with timestamp to prevent duplication
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const exportName = `bukutamu_gkp_${timestamp}.csv`;
            
            // Create blob object with CSV data
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // Create download link using Blob URL (more reliable than data URI)
            const url = window.URL.createObjectURL(blob);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', url);
            linkElement.setAttribute('download', exportName);
            linkElement.style.display = 'none';
            document.body.appendChild(linkElement);
            
            // Trigger download and clean up
            linkElement.click();
            setTimeout(() => {
                document.body.removeChild(linkElement);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            resolve(entries.length);
        } catch (error) {
            reject(`Excel export error: ${error}`);
        }
    });
}

// Export guest entries to PDF
function exportToPDF(entries) {
    return new Promise((resolve, reject) => {
        // Check if jsPDF is loaded
        if (typeof jsPDF === 'undefined') {
            if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') {
                window.jsPDF = window.jspdf.jsPDF;
            } else {
                reject('jsPDF library is not loaded. Please refresh the page and try again.');
                return;
            }
        }
        
        try {
            const doc = new jsPDF({
                orientation: 'landscape'
            });
            
            // Add title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Buku Tamu GKP7 - Laporan Data Tamu", 14, 20);
            
            // Add date
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("Dicetak pada: " + new Date().toLocaleDateString('id-ID', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }), 14, 26);
            
            // Define the columns for autoTable
            const columns = [
                { header: 'No', dataKey: 'id' },
                { header: 'Tanggal', dataKey: 'date' },
                { header: 'Nama', dataKey: 'name' },
                { header: 'Tipe', dataKey: 'type' },
                { header: 'Organisasi', dataKey: 'organization' },
                { header: 'Pesan', dataKey: 'message' }
            ];
            
            // Prepare data
            const tableData = entries.map((entry, index) => {
                const entryDate = new Date(entry.date);
                const formattedDate = entryDate.toLocaleDateString('id-ID', { 
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return {
                    id: index + 1,
                    date: formattedDate,
                    name: entry.name || '',
                    type: entry.type || '',
                    organization: entry.organization || '-',
                    message: (entry.message || '').substring(0, 30) + (entry.message && entry.message.length > 30 ? '...' : '')
                };
            });
            
            // Create the table
            doc.autoTable({
                startY: 30,
                head: [columns.map(col => col.header)],
                body: tableData.map(row => columns.map(col => row[col.dataKey])),
                styles: {
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [37, 99, 235],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 245, 255]
                }
            });
            
            // Footer
            let pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text('Halaman ' + i + ' dari ' + pageCount, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }
            
            // Save the PDF
            const exportName = `codepacker_guestbook_${new Date().toISOString().slice(0,10)}.pdf`;
            doc.save(exportName);
            
            resolve(entries.length);
        } catch (error) {
            reject(`PDF export error: ${error}`);
        }
    });
}

// Import guest entries from JSON
function importGuestEntries(jsonData) {
    return new Promise((resolve, reject) => {
        try {
            const entries = JSON.parse(jsonData);
            
            if (!Array.isArray(entries)) {
                reject('Invalid JSON format. Expected an array of entries.');
                return;
            }
            
            const transaction = db.transaction(['guestEntries'], 'readwrite');
            const store = transaction.objectStore('guestEntries');
            let successCount = 0;
            
            // Process each entry
            entries.forEach(entry => {
                // Remove id to let autoIncrement handle it
                if (entry.id !== undefined) {
                    delete entry.id;
                }
                
                const request = store.add(entry);
                request.onsuccess = () => {
                    successCount++;
                };
            });
            
            transaction.oncomplete = () => {
                resolve(successCount);
            };
            
            transaction.onerror = (event) => {
                reject(`Import error: ${event.target.error}`);
            };
        } catch (error) {
            reject(`JSON parsing error: ${error}`);
        }
    });
}

// Initialize DB when script loads
openDB().catch(error => console.error('Failed to open database:', error)); 