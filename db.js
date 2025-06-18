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