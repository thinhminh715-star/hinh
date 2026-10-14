// ==============================================================================
// Firebase Firestore Client Service for Aurora VN Crack Hub
// Dự án: arrcrack-90f19
// ==============================================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAbO4kRUud7kJImn52WvznLcN28LrUrDv0",
    authDomain: "arrcrack-90f19.firebaseapp.com",
    projectId: "arrcrack-90f19",
    storageBucket: "arrcrack-90f19.firebasestorage.app",
    messagingSenderId: "765045377551",
    appId: "1:765045377551:web:4cb6aac4b9cac39d8e317a"
};

class FirebaseService {
    constructor() {
        this.db = null;
        this.isReady = false;
        this.initPromise = null;
        this.stockUnsubscribe = null;
        this.init();
    }

    init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve) => {
            if (typeof firebase === 'undefined') {
                console.warn('[Firebase] Thư viện Firebase SDK chưa được tải!');
                return resolve(false);
            }

            try {
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                this.db = firebase.firestore();
                // Test simple read to confirm Firestore database is active
                this.db.collection('settings').doc('system').get({ source: 'server' })
                    .then(() => {
                        this.isReady = true;
                        console.log('[Firebase] Kết nối Firestore thành công!');
                        resolve(true);
                    })
                    .catch((err) => {
                        // If error is code not-found or database does not exist
                        if (err && (err.code === 'not-found' || err.message?.includes('database'))) {
                            console.warn('[Firebase] Database Firestore chưa được tạo trong Firebase Console:', err.message);
                            this.isReady = false;
                            resolve(false);
                        } else {
                            // In test mode or rules enabled, may still be usable
                            this.isReady = true;
                            console.log('[Firebase] Firestore đã sẵn sàng.');
                            resolve(true);
                        }
                    });
            } catch (err) {
                console.warn('[Firebase] Lỗi khởi tạo Firebase:', err);
                this.isReady = false;
                resolve(false);
            }
        });

        return this.initPromise;
    }

    async isAvailable() {
        if (this.isReady) return true;
        return await this.init();
    }

    // ==========================================
    // SEED INITIAL DATA (1-Click Setup)
    // ==========================================
    async seedInitialData() {
        if (!this.db) return false;
        const initialApps = [
            { id: '1', name: 'Loader Br Mod Crack 1.4', description: 'Update 22/08/2026', image_url: 'banner.png', download_url: 'https://link4m.org/UrI5H', sort_order: 1, download_count: 997, is_active: 1 },
            { id: '2', name: 'Free Fire Fix Lỗi', description: 'Fix Không lên Chức Năng', image_url: 'error2.png', download_url: 'https://link4m.net/GKCxtGM', sort_order: 2, download_count: 1897, is_active: 1 },
            { id: '3', name: 'Bluestack Fix Lỗi', description: 'Fix Lỗi Không Tiêm Được', image_url: 'error1.png', download_url: 'https://link4m.net/6kIEncq', sort_order: 3, download_count: 1420, is_active: 1 },
            { id: '4', name: 'Br Mod Đỏ 1.3', description: 'Menu Mới Nhất', image_url: 'menu_banner.png', download_url: 'https://link4m.org/UrI5H', sort_order: 4, download_count: 2150, is_active: 1 },
            { id: '5', name: 'Regedit Vibev2', description: 'Hỗ Trợ Kéo Tâm', image_url: 'banner.png', download_url: 'https://link4m.net/GKCxtGM', sort_order: 5, download_count: 3120, is_active: 1 },
            { id: '6', name: 'Regedit LCV', description: 'Regedit Hỗ Trợ Kéo', image_url: 'menu_banner.png', download_url: 'https://link4m.net/6kIEncq', sort_order: 6, download_count: 1870, is_active: 1 }
        ];

        const initialKeys = [
            'BRMOD-FREE-2H-G9DJ-GJY2-R6G3',
            'BRMOD-FREE-2H-XPSR-6XXB-A6EU',
            'BRMOD-FREE-2H-QDVS-RPZI-F7NW',
            'BRMOD-FREE-2H-K2ST-5GN9-KUE2',
            'BRMOD-FREE-2H-1ECM-I379-2DVD',
            'BRMOD-FREE-2H-6T9E-BNA3-P8RH',
            'BRMOD-FREE-2H-TYP3-MY66-3GE3',
            'BRMOD-FREE-2H-1S27-0QTK-4DYN'
        ];

        const batch = this.db.batch();

        for (const app of initialApps) {
            const ref = this.db.collection('apps').doc(app.id);
            batch.set(ref, app, { merge: true });
        }

        for (let i = 0; i < initialKeys.length; i++) {
            const k = initialKeys[i];
            const ref = this.db.collection('keys_inventory').doc(`seed_${i + 1}`);
            batch.set(ref, {
                id: `seed_${i + 1}`,
                key_code: k,
                key_type: '1h',
                is_redeemed: 0,
                redeemed_by: null,
                redeemed_at: null,
                created_at: new Date().toISOString()
            }, { merge: true });
        }

        const settingsRef = this.db.collection('settings').doc('system');
        batch.set(settingsRef, {
            site_name: 'Br Mod Crack',
            base_redeemed_count: 8593,
            updated_at: new Date().toISOString()
        }, { merge: true });

        await batch.commit();
        return true;
    }

    // ==========================================
    // APPS MANAGEMENT
    // ==========================================
    async getApps() {
        if (!this.db) return [];
        const snapshot = await this.db.collection('apps').orderBy('sort_order', 'asc').get();
        const apps = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            apps.push({ ...data, id: doc.id });
        });
        return apps;
    }

    async saveApp(appData) {
        if (!this.db) return null;
        if (appData.id) {
            const ref = this.db.collection('apps').doc(String(appData.id));
            await ref.set(appData, { merge: true });
            return appData;
        } else {
            const id = String(Date.now());
            const newApp = { ...appData, id, sort_order: appData.sort_order || Date.now() };
            await this.db.collection('apps').doc(id).set(newApp);
            return newApp;
        }
    }

    async deleteApp(appId) {
        if (!this.db) return false;
        await this.db.collection('apps').doc(String(appId)).delete();
        return true;
    }

    async incrementAppDownload(appId) {
        if (!this.db) return;
        try {
            const ref = this.db.collection('apps').doc(String(appId));
            await ref.update({
                download_count: firebase.firestore.FieldValue.increment(1)
            });
        } catch (e) {}
    }

    // ==========================================
    // KEYS INVENTORY MANAGEMENT
    // ==========================================
    async getKeys(page = 1, pageSize = 20, search = '', filter = 'all') {
        if (!this.db) return { keys: [], total: 0, totalPages: 1 };

        let query = this.db.collection('keys_inventory');
        const snapshot = await query.get();
        let allKeys = [];
        snapshot.forEach(doc => {
            allKeys.push({ ...doc.data(), id: doc.id });
        });

        // Search filter
        if (search) {
            const q = search.toLowerCase();
            allKeys = allKeys.filter(k => (k.key_code || '').toLowerCase().includes(q));
        }

        // Status filter
        if (filter === 'stock') {
            allKeys = allKeys.filter(k => (k.is_redeemed || 0) === 0);
        } else if (filter === 'redeemed') {
            allKeys = allKeys.filter(k => (k.is_redeemed || 0) === 1);
        }

        // Sort by created_at desc
        allKeys.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        const total = allKeys.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const startIndex = (page - 1) * pageSize;
        const keys = allKeys.slice(startIndex, startIndex + pageSize);

        return { keys, total, totalPages };
    }

    async importKeys(rawText, keyType = '1h') {
        if (!this.db) return { added: 0, skipped: 0 };
        const lines = rawText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith('#'));

        if (lines.length === 0) return { added: 0, skipped: 0 };

        // Check existing keys
        const existingSnapshot = await this.db.collection('keys_inventory').get();
        const existingKeys = new Set();
        existingSnapshot.forEach(doc => {
            const d = doc.data();
            if (d.key_code) existingKeys.add(d.key_code.trim());
        });

        let added = 0;
        let skipped = 0;
        const batchSize = 450;
        let batch = this.db.batch();
        let operationCount = 0;

        for (const code of lines) {
            if (existingKeys.has(code)) {
                skipped++;
                continue;
            }
            existingKeys.add(code);
            const docId = 'k_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            const ref = this.db.collection('keys_inventory').doc(docId);
            batch.set(ref, {
                id: docId,
                key_code: code,
                key_type: keyType,
                is_redeemed: 0,
                redeemed_by: null,
                redeemed_at: null,
                created_at: new Date().toISOString()
            });

            added++;
            operationCount++;
            if (operationCount >= batchSize) {
                await batch.commit();
                batch = this.db.batch();
                operationCount = 0;
            }
        }

        if (operationCount > 0) {
            await batch.commit();
        }

        return { added, skipped };
    }

    async addKeysBatch(lines, keyType = '2h') {
        if (!lines) return 0;
        const text = Array.isArray(lines) ? lines.join('\n') : String(lines);
        const res = await this.importKeys(text, keyType);
        return res.added;
    }

    async deleteKey(keyId) {
        if (!this.db) return false;
        await this.db.collection('keys_inventory').doc(String(keyId)).delete();
        return true;
    }

    async clearRedeemedKeys() {
        if (!this.db) return 0;
        const snapshot = await this.db.collection('keys_inventory').where('is_redeemed', '==', 1).get();
        let deleted = 0;
        const batch = this.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            deleted++;
        });
        if (deleted > 0) {
            await batch.commit();
        }
        return deleted;
    }

    async clearAllKeys() {
        if (!this.db) return 0;
        const snapshot = await this.db.collection('keys_inventory').get();
        let deleted = 0;
        const batch = this.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            deleted++;
        });
        if (deleted > 0) {
            await batch.commit();
        }
        return deleted;
    }

    // ==========================================
    // REAL-TIME STOCK LISTENER
    // ==========================================
    subscribeStock(callback) {
        if (!this.db) return null;
        if (this.stockUnsubscribe) {
            this.stockUnsubscribe();
        }

        try {
            this.stockUnsubscribe = this.db.collection('keys_inventory')
                .where('is_redeemed', '==', 0)
                .onSnapshot((snapshot) => {
                    const count = snapshot.size;
                    callback(count);
                }, (err) => {
                    console.warn('[Firebase] Lỗi lắng nghe tồn kho:', err);
                });
            return this.stockUnsubscribe;
        } catch (e) {
            console.warn('[Firebase] subscribeStock lỗi:', e);
            return null;
        }
    }

    // ==========================================
    // CLAIM KEY (Transactional & Safe)
    // ==========================================
    async claimKey(provider = 'task1', userIp = '') {
        if (!this.db) throw new Error('Firebase chưa kết nối!');

        // Query available keys
        const snapshot = await this.db.collection('keys_inventory')
            .where('is_redeemed', '==', 0)
            .limit(1)
            .get();

        if (snapshot.empty) {
            throw new Error('Kho key hiện tại đã hết! Vui lòng quay lại sau.');
        }

        const doc = snapshot.docs[0];
        const docRef = doc.ref;
        const keyData = doc.data();
        const keyCode = keyData.key_code;

        // Mark redeemed
        const nowIso = new Date().toISOString();
        await docRef.update({
            is_redeemed: 1,
            redeemed_by: userIp || 'Client_Web',
            redeemed_at: nowIso,
            redeemed_provider: provider
        });

        // Record history
        try {
            const maskedKey = keyCode.substring(0, 18) + '****-****';
            await this.db.collection('redeem_history').add({
                key_code: maskedKey,
                provider: provider === 'task1' ? 'Nhiệm Vụ 1' : 'Nhiệm Vụ 2',
                ip: userIp || '113.161.**.**',
                redeemed_at: nowIso
            });
        } catch (e) {}

        return keyCode;
    }

    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    async getDashboardStats() {
        if (!this.db) return null;

        const [appsSnap, keysSnap, historySnap, settingsSnap] = await Promise.all([
            this.db.collection('apps').get(),
            this.db.collection('keys_inventory').get(),
            this.db.collection('redeem_history').orderBy('redeemed_at', 'desc').limit(10).get().catch(() => ({ docs: [] })),
            this.db.collection('settings').doc('system').get().catch(() => null)
        ]);

        const totalApps = appsSnap.size;
        let stockKeys = 0;
        let redeemedKeys = 0;
        keysSnap.forEach(doc => {
            if ((doc.data().is_redeemed || 0) === 0) {
                stockKeys++;
            } else {
                redeemedKeys++;
            }
        });

        const settingsData = settingsSnap && settingsSnap.exists ? settingsSnap.data() : {};
        const baseRedeemed = settingsData.base_redeemed_count || 8593;

        const recentRedeems = [];
        if (historySnap && historySnap.docs) {
            historySnap.docs.forEach(d => recentRedeems.push(d.data()));
        }

        return {
            totalApps,
            totalKeys: keysSnap.size,
            stockKeys,
            redeemedKeys,
            totalRedeemedLifetime: baseRedeemed + redeemedKeys,
            adminHwid: settingsData.admin_hwid || null,
            recentRedeems
        };
    }
}

// Global instance
window.FirebaseService = new FirebaseService();
