// ==============================================================================
// Duc Duy 247 / Br Mod Crack - Client Interactive Script
// Phối kết hợp Br Mod logic + Key Shop Web backend
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Current state
    let activeProvider = 'ontopslink'; // 'link4m' (Task 1) | 'ontopslink' (Task 2)
    let stateData = null;
    let isCountingDown = false;

    // DOM Elements
    const pillTask1 = document.getElementById('pillTask1');
    const pillTask2 = document.getElementById('pillTask2');
    const taskTurnRemainText = document.getElementById('taskTurnRemainText');
    const pillOpenAppStore = document.getElementById('pillOpenAppStore');

    const stockCountBadge = document.getElementById('stockCountBadge');
    const redeemedCountBadge = document.getElementById('redeemedCountBadge');
    const taskStatusText = document.getElementById('taskStatusText');
    const stockBadge = document.getElementById('stockBadge');

    const btnGetKey = document.getElementById('btnGetKey');
    const btnGetKeyText = document.getElementById('btnGetKeyText');
    const agreeTerms = document.getElementById('agreeTerms');

    // Modals (Aurora style)
    const appStoreModal = document.getElementById('appStoreModal');
    const btnCloseAppStore = document.getElementById('btnCloseAppStore');
    const appStoreGrid = document.getElementById('appStoreGrid');

    const targetModal = document.getElementById('targetModal');
    const btnLaunchShortlink = document.getElementById('btnLaunchShortlink');
    const btnCloseTarget = document.getElementById('btnCloseTarget');

    const claimSuccessModal = document.getElementById('claimSuccessModal');
    const claimedKeyCode = document.getElementById('claimedKeyCode');
    const btnCopyKey = document.getElementById('btnCopyKey');
    const btnCopyKeyText = document.getElementById('btnCopyKeyText');
    const btnCloseClaimSuccess = document.getElementById('btnCloseClaimSuccess');
    const btnCloseClaimSuccess2 = document.getElementById('btnCloseClaimSuccess2');

    // Active Key Elements (Persistent on F5 & 3-Hour Lock)
    const activeKeyCard = document.getElementById('activeKeyCard');
    const activeKeyCountdown = document.getElementById('activeKeyCountdown');
    const activeKeyDisplayInput = document.getElementById('activeKeyDisplayInput');
    let activeKeyInterval = null;

    function formatTimeRemaining(seconds) {
        if (seconds <= 0) return '00:00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function setupActiveKeyDisplay(key, expiresAt) {
        if (!key || !expiresAt) return;
        const now = Date.now();
        if (expiresAt <= now) {
            clearActiveKeyDisplay();
            return;
        }

        try {
            localStorage.setItem('aurora_active_key', key);
            localStorage.setItem('aurora_active_key_expires', expiresAt.toString());
        } catch (e) {}

        if (activeKeyCard) activeKeyCard.style.display = 'block';
        if (activeKeyDisplayInput) activeKeyDisplayInput.value = key;

        if (activeKeyInterval) clearInterval(activeKeyInterval);

        function updateCountdown() {
            const remSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            const formatted = formatTimeRemaining(remSec);

            if (activeKeyCountdown) activeKeyCountdown.textContent = formatted;

            if (remSec <= 0) {
                clearActiveKeyDisplay();
                showToast('Key 2 giờ của bạn đã hết hạn.', 'default');
            }
        }

        updateCountdown();
        activeKeyInterval = setInterval(updateCountdown, 1000);
    }

    function clearActiveKeyDisplay() {
        if (activeKeyInterval) {
            clearInterval(activeKeyInterval);
            activeKeyInterval = null;
        }
        try {
            localStorage.removeItem('aurora_active_key');
            localStorage.removeItem('aurora_active_key_expires');
        } catch (e) {}

        if (activeKeyCard) activeKeyCard.style.display = 'none';
        updateTaskStatusText();
    }

    // ==========================================
    // TOAST NOTIFICATION SYSTEM (AuroraVN Style)
    // ==========================================
    function showToast(message, type = 'default') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `<span>${iconSvg}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }

    // ==========================================
    // COPY TO CLIPBOARD (Global Function)
    // ==========================================
    window.copyToClipboard = function(text, btnElement) {
        if (!text) {
            showToast('Không có nội dung để sao chép!', 'error');
            return;
        }
        const originalHtml = btnElement ? btnElement.innerHTML : '';

        function onSuccess() {
            showToast('Đã sao chép: ' + text, 'success');
            if (btnElement) {
                btnElement.innerHTML = '✓ Đã chép';
                btnElement.style.color = '#34d399';
                setTimeout(() => {
                    btnElement.innerHTML = originalHtml;
                    btnElement.style.color = '';
                }, 2000);
            }
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
        } else {
            fallbackCopy(text, onSuccess);
        }
    };

    function fallbackCopy(text, onSuccess) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;opacity:0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.focus(); ta.select(); ta.setSelectionRange(0, 99999);
        try { document.execCommand('copy'); onSuccess(); } catch(e) {
            showToast('Vui lòng copy thủ công!', 'error');
        }
        document.body.removeChild(ta);
    }

    // ==========================================
    // ADAPTIVE AUTO-DETECTING API FETCH (Node.js <-> PHP Fallback) + EXACT IPv4
    // ==========================================
    let workingClientApiBase = null;
    let detectedVisitorIpv4 = '';

    async function ensureVisitorIpv4() {
        if (detectedVisitorIpv4) return detectedVisitorIpv4;
        try {
            const r1 = await fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => null);
            if (r1 && r1.ip && /^\d{1,3}(\.\d{1,3}){3}$/.test(r1.ip.trim())) {
                detectedVisitorIpv4 = r1.ip.trim();
                return detectedVisitorIpv4;
            }
            const r2 = await fetch('https://ipv4.icanhazip.com').then(r => r.text()).catch(() => null);
            if (r2 && /^\d{1,3}(\.\d{1,3}){3}$/.test(r2.trim())) {
                detectedVisitorIpv4 = r2.trim();
                return detectedVisitorIpv4;
            }
        } catch (e) {}
        return '';
    }
    ensureVisitorIpv4();

    async function apiFetch(endpoint, options = {}) {
        const actionMap = {
            '/api/getkey-state': 'getkey_state',
            '/api/getkey-start': 'getkey_start',
            '/api/getkey-claim': 'getkey_claim',
            '/api/sync-my-keys': 'sync_my_keys',
            '/api/app-download-count': 'app_download_count',
            '/api/apps': 'apps',
            '/api/top-users': 'top_users',
            '/api/gate-status': 'gate_status',
            '/api/gate-complete': 'gate_complete'
        };

        if (!detectedVisitorIpv4) {
            await Promise.race([
                ensureVisitorIpv4(),
                new Promise(res => setTimeout(res, 1200))
            ]);
        }

        const mergedHeaders = {
            ...(options.headers || {})
        };
        if (detectedVisitorIpv4) {
            mergedHeaders['X-Visitor-Ipv4'] = detectedVisitorIpv4;
        }
        const fetchOpts = { ...options, headers: mergedHeaders };

        const baseEndpoint = endpoint.split('?')[0];
        let queryParams = endpoint.includes('?') ? endpoint.substring(endpoint.indexOf('?') + 1) : '';
        if (detectedVisitorIpv4 && !queryParams.includes('ipv4=')) {
            queryParams = queryParams ? `${queryParams}&ipv4=${encodeURIComponent(detectedVisitorIpv4)}` : `ipv4=${encodeURIComponent(detectedVisitorIpv4)}`;
        }
        const action = actionMap[baseEndpoint];

        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

        const candidates = [];
        const fullNodeEndpoint = queryParams ? `${baseEndpoint}?${queryParams}` : endpoint;

        // Nếu đã từng kết nối thành công tới 1 base, ưu tiên thử base đó trước
        if (workingClientApiBase) {
            if (workingClientApiBase.includes('.php')) {
                const sep = workingClientApiBase.includes('?') ? '&' : '?';
                candidates.push(`${workingClientApiBase}${sep}action=${action}${queryParams ? '&' + queryParams : ''}`);
            } else {
                candidates.push(`${workingClientApiBase}${fullNodeEndpoint}`);
            }
        }

        // 1. Thử Node.js endpoint gốc
        candidates.push(fullNodeEndpoint);
        if (currentDir && currentDir !== '/') {
            candidates.push(`${currentDir}${fullNodeEndpoint.replace(/^\//, '')}`);
        }

        // 2. Thử các đường dẫn PHP api.php
        if (action) {
            const phpQuery = `action=${action}${queryParams ? '&' + queryParams : ''}`;
            candidates.push(`api.php?${phpQuery}`);
            candidates.push(`./api.php?${phpQuery}`);
            candidates.push(`${currentDir}api.php?${phpQuery}`);
            candidates.push(`../api.php?${phpQuery}`);
            candidates.push(`/api.php?${phpQuery}`);
            candidates.push(`/public/api.php?${phpQuery}`);
            candidates.push(`public/api.php?${phpQuery}`);
        }

        const uniqueCandidates = [...new Set(candidates)];
        let lastError = null;

        for (const url of uniqueCandidates) {
            try {
                const res = await fetch(url, fetchOpts);
                if (res.ok) {
                    const text = await res.text();
                    try {
                        const data = JSON.parse(text);
                        if (url.includes('api.php')) {
                            workingClientApiBase = url.substring(0, url.indexOf('?'));
                        } else if (url === endpoint) {
                            workingClientApiBase = '';
                        }
                        return data;
                    } catch(e) {}
                }
            } catch (err) {
                lastError = err;
            }
        }

        throw new Error(lastError ? lastError.message : 'Không thể kết nối đến máy chủ!');
    }

    // ==========================================
    // RENDER STATE DATA
    // ==========================================
    function renderState(data) {
        stateData = data;
        if (!data) return;

        const stockKeys = data.stockKeys !== undefined ? Number(data.stockKeys) : 0;
        if (stockCountBadge) stockCountBadge.textContent = stockKeys.toLocaleString();
        if (redeemedCountBadge && data.redeemedTotal !== undefined) {
            redeemedCountBadge.textContent = Number(data.redeemedTotal).toLocaleString();
        }

        // Update stock badge color
        if (stockBadge) {
            if (stockKeys <= 0) {
                stockBadge.classList.remove('green');
                stockBadge.classList.add('red');
            } else {
                stockBadge.classList.remove('red');
                stockBadge.classList.add('green');
            }
        }

        updateTaskStatusText();

        if (data.user && data.user.activeKey && data.user.activeKey.expiresAt > Date.now()) {
            setupActiveKeyDisplay(data.user.activeKey.key, Number(data.user.activeKey.expiresAt));
        } else {
            try {
                const savedKey = localStorage.getItem('aurora_active_key');
                const savedExp = parseInt(localStorage.getItem('aurora_active_key_expires') || '0', 10);
                if (savedKey && savedExp > Date.now()) {
                    setupActiveKeyDisplay(savedKey, savedExp);
                } else {
                    clearActiveKeyDisplay();
                }
            } catch (e) {}
        }

        let gateFromAppRecord = null;
        if (data.apps && Array.isArray(data.apps)) {
            const gateAppItem = data.apps.find(a => a && a.name === '__MANDATORY_GATE_CONFIG__');
            if (gateAppItem) {
                try {
                    const parsedCfg = JSON.parse(gateAppItem.description || '{}');
                    gateFromAppRecord = {
                        enabled: Boolean(parsedCfg.enabled && (parsedCfg.url || gateAppItem.download_url)),
                        url: (parsedCfg.url || gateAppItem.download_url || '').trim(),
                        title: parsedCfg.title || 'Bắt Buộc Tải Về Trước Khi Tiếp Tục',
                        description: parsedCfg.description || 'Hệ thống yêu cầu bạn ấn vào liên kết bên dưới để tải file bắt buộc về máy trước khi xem và nhận key miễn phí. Mỗi máy (1 IP) chỉ cần thực hiện 1 lần duy nhất!',
                        btnText: parsedCfg.btnText || 'ẤN VÀO ĐÂY ĐỂ TẢI VỀ & VÀO WEB',
                        resetId: parsedCfg.resetId || 1,
                        updatedAt: parsedCfg.updatedAt || 0,
                        appId: gateAppItem.id,
                        completedCount: Number(gateAppItem.download_count || 0)
                    };
                } catch (e) {}
            }
            const visibleApps = data.apps.filter(a => a && a.name !== '__MANDATORY_GATE_CONFIG__' && a.name !== '__KEY_STATS_LEDGER__');
            renderAppCards(visibleApps);
        }

        const rawMyKeys = Array.isArray(data.myKeys) ? data.myKeys : [];
        const visibleMyKeys = rawMyKeys.filter(k => {
            const code = String(k?.key_code || k || '');
            return !code.startsWith('GATE_DONE_') && k?.provider !== '__GATE_COMPLETED__';
        });

        let effectiveGate = data.mandatoryGate || gateFromAppRecord || null;
        if (data.mandatoryGate && gateFromAppRecord) {
            if (!data.mandatoryGate.url && gateFromAppRecord.url) {
                effectiveGate = gateFromAppRecord;
            } else if ((gateFromAppRecord.updatedAt || 0) > 0 && !data.mandatoryGate.enabled && gateFromAppRecord.enabled) {
                effectiveGate = gateFromAppRecord;
            }
        }

        if (effectiveGate) {
            const rId = effectiveGate.resetId || 1;
            const doneOnServerHistory = rawMyKeys.some(k => {
                const code = String(k?.key_code || '');
                return code.startsWith(`GATE_DONE_${rId}_`);
            });
            if (doneOnServerHistory) {
                effectiveGate.isCompleted = true;
            }
            if (gateFromAppRecord && gateFromAppRecord.appId && !effectiveGate.appId) {
                effectiveGate.appId = gateFromAppRecord.appId;
            }
        }

        renderHubAndTicker(data);
        renderMyKeys(visibleMyKeys, data.clientIp || (data.user?.ipUser || ''));
        checkAndRenderMandatoryGate(effectiveGate, data.clientIp);
    }

    // ==========================================
    // MANDATORY DOWNLOAD GATE (1 IP = 1 TIME, RESETTABLE)
    // ==========================================
    let mandatoryGateBound = false;
    let currentGateObj = null;

    function checkAndRenderMandatoryGate(gate, fallbackIp) {
        const overlay = document.getElementById('mandatoryGateOverlay');
        if (!overlay) return;

        if (!gate || !gate.enabled || !gate.url) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            return;
        }

        currentGateObj = gate;
        const exactIp = detectedVisitorIpv4 || gate.clientIp || fallbackIp || 'Unknown';
        const rId = gate.resetId || 1;
        const resetKey = `aurora_gate_done_${rId}_${exactIp}`;
        let localDone = false;
        try {
            localDone = localStorage.getItem(resetKey) === '1';
        } catch (e) {}

        if (gate.isCompleted || localDone) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            // Đồng bộ ngược lên server nếu local đã lưu cùng resetId nhưng server chưa kịp ghi IPv4
            if (localDone && !gate.isCompleted) {
                apiFetch('/api/gate-complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ipv4: exactIp })
                }).catch(() => {});
            }
            return;
        }

        const titleEl = document.getElementById('mandatoryGateTitle');
        const descEl = document.getElementById('mandatoryGateDesc');
        const btnTextEl = document.getElementById('mandatoryGateBtnText');
        const ipTextEl = document.getElementById('mandatoryGateIpText');
        const actionBtn = document.getElementById('btnMandatoryGateAction');

        if (titleEl && gate.title) titleEl.textContent = gate.title;
        if (descEl && gate.description) descEl.textContent = gate.description;
        if (btnTextEl && gate.btnText) btnTextEl.textContent = gate.btnText;
        if (ipTextEl) ipTextEl.textContent = exactIp;
        if (actionBtn) actionBtn.href = gate.url;

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (actionBtn && !mandatoryGateBound) {
            mandatoryGateBound = true;
            actionBtn.addEventListener('click', async () => {
                const g = currentGateObj || gate;
                const curResetId = g.resetId || 1;
                const ipNow = detectedVisitorIpv4 || g.clientIp || fallbackIp || '';
                const rKey = `aurora_gate_done_${curResetId}_${ipNow}`;
                try {
                    localStorage.setItem(rKey, '1');
                } catch (e) {}

                if (btnTextEl) {
                    btnTextEl.textContent = 'ĐANG MỞ KHÓA WEB...';
                }

                // Ghi nhận hoàn thành cho IP máy này trên Server
                try {
                    apiFetch('/api/gate-complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ipv4: ipNow })
                    }).catch(() => {});

                    if (g.appId) {
                        apiFetch('/api/app-download-count', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: g.appId })
                        }).catch(() => {});
                    }
                } catch (err) {}

                setTimeout(() => {
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                    showToast('✅ Đã xác nhận tải về! Chào mừng bạn vào hệ thống.', 'success');
                }, 400);
            });
        }
    }

    // ==========================================
    // TASK STATUS TEXT & REMAINING TURNS CALCULATION
    // ==========================================
    function updateTaskStatusText() {
        if (!stateData || !stateData.user) return;
        const user = stateData.user;
        const link4mCount = Number(user.link4mCompletedToday !== undefined ? user.link4mCompletedToday : (user.task1CompletedToday || 0));
        const ontopslinkCount = Number(user.ontopslinkCompletedToday !== undefined ? user.ontopslinkCompletedToday : (user.trafficvnCompletedToday !== undefined ? user.trafficvnCompletedToday : (user.task2CompletedToday || 0)));
        const limitLink4m = (user.limits && user.limits.link4m) || 3;
        const limitOntopslink = (user.limits && (user.limits.ontopslink || user.limits.trafficvn)) || 3;

        const totalCompleted = link4mCount + ontopslinkCount;
        const totalRemain = Math.max(0, 6 - totalCompleted);

        if (taskTurnRemainText) {
            taskTurnRemainText.textContent = `Còn ${totalRemain}/6 lượt hôm nay`;
            taskTurnRemainText.style.color = totalRemain > 0 ? '#34d399' : '#f87171';
        }

        if (taskStatusText) {
            if (totalRemain <= 0) {
                taskStatusText.innerHTML = `<i class="fa-solid fa-ban" style="color: #f87171; margin-right: 4px;"></i>Bạn đã hoàn thành tối đa <strong>6/6 lượt</strong> hôm nay (Cả 2 nhiệm vụ)! Hệ thống sẽ tự động reset lượt mới vào <strong>00:00</strong>.`;
            } else if (activeProvider === 'ontopslink' || activeProvider === 'trafficvn') {
                if (ontopslinkCount >= limitOntopslink) {
                    taskStatusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; margin-right: 4px;"></i>Cổng <strong>Ontopslink</strong> đã hết lượt (<strong>${ontopslinkCount}/${limitOntopslink}</strong>). Vui lòng chuyển sang <strong>Nhiệm Vụ 1 (Link4M)</strong> để tiếp tục lấy key!`;
                } else {
                    taskStatusText.innerHTML = `<i class="fa-solid fa-fire" style="color: #f59e0b; margin-right: 4px;"></i>Nhiệm Vụ 2 (<strong>Ontopslink</strong>): Đã vượt <strong>${ontopslinkCount}/${limitOntopslink}</strong> lượt. Vượt link để nhận License Key thời hạn <strong>2 Giờ</strong>.`;
                }
            } else {
                if (link4mCount >= limitLink4m) {
                    taskStatusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; margin-right: 4px;"></i>Cổng <strong>Link4M</strong> đã hết lượt (<strong>${link4mCount}/${limitLink4m}</strong>). Vui lòng chuyển sang <strong>Nhiệm Vụ 2 (Ontopslink)</strong> để tiếp tục lấy key!`;
                } else {
                    taskStatusText.innerHTML = `<i class="fa-solid fa-bolt" style="color: #38bdf8; margin-right: 4px;"></i>Nhiệm Vụ 1 (<strong>Link4M</strong>): Đã vượt <strong>${link4mCount}/${limitLink4m}</strong> lượt. Vượt link để nhận License Key thời hạn <strong>2 Giờ</strong>.`;
                }
            }
        }

        if (btnGetKey && !isCountingDown) {
            if (totalRemain <= 0) {
                btnGetKey.disabled = true;
                if (btnGetKeyText) btnGetKeyText.textContent = 'Hết Lượt Hôm Nay (6/6)';
            } else if (activeProvider === 'link4m' && link4mCount >= limitLink4m) {
                btnGetKey.disabled = false;
                if (btnGetKeyText) btnGetKeyText.textContent = 'Chuyển Sang Nhiệm Vụ 2';
            } else if ((activeProvider === 'ontopslink' || activeProvider === 'trafficvn') && ontopslinkCount >= limitOntopslink) {
                btnGetKey.disabled = false;
                if (btnGetKeyText) btnGetKeyText.textContent = 'Chuyển Sang Nhiệm Vụ 1';
            } else {
                btnGetKey.disabled = false;
                if (btnGetKeyText) btnGetKeyText.textContent = 'Bắt Đầu Get Key (5s)';
            }
        }
    }

    // ==========================================
    // RENDER APP CARDS
    // ==========================================
    function renderAppCards(apps) {
        if (!appStoreGrid) return;
        const cleanApps = Array.isArray(apps) ? apps.filter(a => a && a.name !== '__MANDATORY_GATE_CONFIG__' && a.name !== '__KEY_STATS_LEDGER__') : [];
        if (cleanApps.length === 0) {
            appStoreGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px;">Hiện chưa có ứng dụng nào.</p>`;
            return;
        }

        appStoreGrid.innerHTML = cleanApps.map(app => `
            <div class="app-card" data-id="${app.id}">
                <div class="app-card-thumb-wrap">
                    <span class="app-free-badge">App Free</span>
                    <img src="${app.image_url || 'banner.png'}" alt="${app.name}" class="app-card-thumb" onerror="this.src='banner.png'">
                </div>
                <div class="app-card-body">
                    <div>
                        <h4 class="app-name">${app.name}</h4>
                        <div class="app-desc">${app.description || 'Bản mới nhất'}</div>
                    </div>
                    <div class="app-meta-stats">
                        <span><i class="fa-solid fa-box" style="color: #34d399; font-size: 10px;"></i> Sẵn sàng</span>
                        <span><i class="fa-solid fa-download" style="color: #60a5fa; font-size: 10px;"></i> <strong class="app-download-num">${(app.download_count || 0).toLocaleString()}</strong></span>
                    </div>
                    <a href="${app.download_url}" target="_blank" rel="noopener noreferrer" class="btn-app-download" data-id="${app.id}">
                        <i class="fa-solid fa-download" style="font-size: 12px;"></i> Tải Ngay
                    </a>
                </div>
            </div>
        `).join('');

        appStoreGrid.querySelectorAll('.btn-app-download').forEach(btn => {
            btn.addEventListener('click', async function() {
                const appId = this.getAttribute('data-id');
                try {
                    apiFetch('/api/app-download-count', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: appId })
                    });
                    const countEl = this.closest('.app-card').querySelector('.app-download-num');
                    if (countEl) {
                        const cur = parseInt(countEl.textContent.replace(/,/g, '')) || 0;
                        countEl.textContent = (cur + 1).toLocaleString();
                    }
                } catch (err) {}
            });
        });
    }

    // ==========================================
    // TASK PILL SWITCHING (Task 1: Link4M | Task 2: Ontopslink)
    // ==========================================
    if (pillTask1) {
        pillTask1.addEventListener('click', () => {
            activeProvider = 'link4m';
            pillTask1.classList.add('active');
            if (pillTask2) pillTask2.classList.remove('active');
            updateTaskStatusText();
        });
    }

    if (pillTask2) {
        pillTask2.addEventListener('click', () => {
            activeProvider = 'ontopslink';
            pillTask2.classList.add('active');
            if (pillTask1) pillTask1.classList.remove('active');
            updateTaskStatusText();
        });
    }

    // ==========================================
    // MODAL: APP STORE
    // ==========================================
    if (pillOpenAppStore) {
        pillOpenAppStore.addEventListener('click', () => {
            appStoreModal?.classList.add('active');
        });
    }
    if (btnCloseAppStore) {
        btnCloseAppStore.addEventListener('click', () => {
            appStoreModal?.classList.remove('active');
        });
    }

    // ==========================================
    // MODAL: TARGET LAUNCHER
    // ==========================================
    if (btnCloseTarget) {
        btnCloseTarget.addEventListener('click', () => {
            targetModal?.classList.remove('active');
        });
    }

    // ==========================================
    // MODAL: CLAIM SUCCESS
    // ==========================================
    if (btnCloseClaimSuccess) {
        btnCloseClaimSuccess.addEventListener('click', () => {
            claimSuccessModal?.classList.remove('active');
        });
    }
    if (btnCloseClaimSuccess2) {
        btnCloseClaimSuccess2.addEventListener('click', () => {
            claimSuccessModal?.classList.remove('active');
        });
    }

    // ==========================================
    // COPY KEY BUTTON
    // ==========================================
    if (btnCopyKey) {
        btnCopyKey.addEventListener('click', () => {
            const keyText = claimedKeyCode?.value || claimedKeyCode?.textContent;
            if (!keyText) return;
            copyToClipboard(keyText.trim(), btnCopyKey);
        });
    }

    // ==========================================
    // GET KEY BUTTON (Countdown → Direct Task Shortlink Redirect)
    // ==========================================
    if (btnGetKey) {
        btnGetKey.addEventListener('click', async () => {
            if (isCountingDown) return;

            if (window.location.search) {
                const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            }

            // Kiểm tra lượt vượt còn lại
            if (stateData && stateData.user) {
                const link4mCount = Number(stateData.user.link4mCompletedToday !== undefined ? stateData.user.link4mCompletedToday : (stateData.user.task1CompletedToday || 0));
                const ontopslinkCount = Number(stateData.user.ontopslinkCompletedToday !== undefined ? stateData.user.ontopslinkCompletedToday : (stateData.user.trafficvnCompletedToday || stateData.user.task2CompletedToday || 0));
                if (link4mCount + ontopslinkCount >= 6) {
                    showToast('Bạn đã hết toàn bộ 6 lượt get key hôm nay! Vui lòng quay lại sau 00:00.', 'error');
                    return;
                }
                // Tự động chuyển đổi nếu nhiệm vụ được chọn đã hết lượt nhưng nhiệm vụ kia còn
                if (activeProvider === 'link4m' && link4mCount >= 3) {
                    if (ontopslinkCount < 3) {
                        activeProvider = 'ontopslink';
                        if (pillTask2) pillTask2.classList.add('active');
                        if (pillTask1) pillTask1.classList.remove('active');
                        updateTaskStatusText();
                        showToast('Cổng Link4M đã hết (3/3), đã tự động chuyển sang Nhiệm Vụ 2 (Ontopslink)!', 'default');
                    } else {
                        showToast('Bạn đã hết lượt hôm nay!', 'error');
                        return;
                    }
                } else if ((activeProvider === 'ontopslink' || activeProvider === 'trafficvn') && ontopslinkCount >= 3) {
                    if (link4mCount < 3) {
                        activeProvider = 'link4m';
                        if (pillTask1) pillTask1.classList.add('active');
                        if (pillTask2) pillTask2.classList.remove('active');
                        updateTaskStatusText();
                        showToast('Cổng Ontopslink đã hết (3/3), đã tự động chuyển sang Nhiệm Vụ 1 (Link4M)!', 'default');
                    } else {
                        showToast('Bạn đã hết lượt hôm nay!', 'error');
                        return;
                    }
                }
            }

            if (agreeTerms && !agreeTerms.checked) {
                showToast('Vui lòng đồng ý điều khoản trước khi lấy key!', 'error');
                agreeTerms.focus();
                return;
            }

            if (stateData && stateData.stockKeys <= 0) {
                showToast('Kho key hiện tại đã hết! Vui lòng đợi Admin nạp thêm.', 'error');
                return;
            }

            isCountingDown = true;
            btnGetKey.disabled = true;
            let secondsLeft = 5;
            btnGetKeyText.textContent = `Đang chuẩn bị... (${secondsLeft}s)`;

            const countdownTimer = setInterval(async () => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    btnGetKeyText.textContent = `Đang chuẩn bị... (${secondsLeft}s)`;
                } else {
                    clearInterval(countdownTimer);
                    btnGetKeyText.textContent = 'Đang tạo liên kết...';

                    let targetShortlink = '';
                    const currentProvider = activeProvider;
                    const providerName = (currentProvider === 'ontopslink' || currentProvider === 'trafficvn') ? 'Ontopslink' : 'Link4M';

                    try {
                        const res = await apiFetch(`/api/getkey-start?provider=${currentProvider}`);
                        if (res.status === 'success' && res.shortlinkUrl) {
                            targetShortlink = res.shortlinkUrl;
                            if (res.sessionSecret) {
                                try { 
                                    localStorage.setItem('aurora_session_token', res.sessionSecret);
                                    localStorage.setItem('aurora_task_provider', currentProvider);
                                    localStorage.setItem('aurora_session_started_at', Date.now().toString());
                                } catch(e) {}
                            }
                        } else if (res.message) {
                            showToast(res.message, 'error');
                        }
                    } catch (err) {
                        console.warn(`apiFetch getkey-start (${currentProvider}) thất bại, kích hoạt Fallback Direct API...`, err);
                        const returnUrl = window.location.origin + window.location.pathname + `?claim_session=${currentProvider}_success`;
                        try {
                            if (currentProvider === 'ontopslink' || currentProvider === 'trafficvn') {
                                const tvn = await fetch(`https://api-management.ontops.link/api/public/create-short-link?apikey=65d4f6c0bb16481fbe5f6b69f9922bcb&url=${encodeURIComponent(returnUrl)}`).then(r => r.json());
                                if (tvn && (tvn.url || tvn.shortenedUrl || tvn.shortUrl)) targetShortlink = tvn.url || tvn.shortenedUrl || tvn.shortUrl;
                            } else {
                                const l4m = await fetch(`https://link4m.co/api-shorten/v2?api=68fcb1cfd51cdd02835428f7&url=${encodeURIComponent(returnUrl)}`).then(r => r.json());
                                if (l4m && (l4m.shortenedUrl || l4m.url)) targetShortlink = l4m.shortenedUrl || l4m.url;
                            }
                        } catch(e) {}
                    } finally {
                        isCountingDown = false;
                        btnGetKey.disabled = false;
                        updateTaskStatusText();
                    }

                    if (targetShortlink) {
                        showToast(`Đang chuyển hướng sang ${providerName}...`, 'success');
                        const newTab = window.open(targetShortlink, '_blank');
                        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
                            window.location.href = targetShortlink;
                        }
                    } else {
                        showToast(`Không thể tạo liên kết rút gọn ${providerName}! Vui lòng thử lại sau giây lát.`, 'error');
                    }
                }
            }, 1000);
        });
    }

    // ==========================================
    // CHECK REWARD TOKEN / CLAIM SESSION CALLBACK (After Legitimate Link Completion)
    // ==========================================
    async function checkRewardTokenCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token') || urlParams.get('session_token') || urlParams.get('verify') || urlParams.get('reward_token');
        const claimParam = urlParams.get('claim_session') || urlParams.get('action');

        // Bắt buộc phải có token hoặc claim_session trả về từ URL link rút gọn chuyển hướng
        if (!claimParam && !tokenFromUrl) {
            return;
        }

        const sessionToken = tokenFromUrl || localStorage.getItem('aurora_session_token') || '';
        const savedProvider = localStorage.getItem('aurora_task_provider') || activeProvider || 'ontopslink';

        if (window.location.search) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }

        showToast('Đang xác thực vượt link thành công...', 'default');

        let keyGranted = null;
        let expiresAt = null;

        try {
            const claimVal = claimParam || `${savedProvider}_success`;
            const res = await apiFetch(`/api/getkey-claim?session_token=${encodeURIComponent(sessionToken)}&token=${encodeURIComponent(tokenFromUrl || sessionToken)}&claim_session=${encodeURIComponent(claimVal)}`);
            if (res.status === 'success' && res.key) {
                keyGranted = res.key;
                expiresAt = res.expiresAt ? Number(res.expiresAt) : (Date.now() + 2 * 3600 * 1000);
                if (res.myKeys) {
                    renderMyKeys(res.myKeys, res.user?.ipUser || '');
                }
            } else if (res.message) {
                showToast(res.message, 'error');
            }
        } catch (err) {
            console.warn('apiFetch getkey-claim thất bại, thử rút key từ Firebase...', err);
        }

        if (!keyGranted && window.FirebaseService && await window.FirebaseService.isAvailable()) {
            try {
                keyGranted = await window.FirebaseService.claimKey(savedProvider);
                expiresAt = Date.now() + 2 * 3600 * 1000;
            } catch (fbErr) {
                console.warn('Firebase claimKey thất bại:', fbErr);
            }
        }

        if (keyGranted) {
            try { 
                localStorage.removeItem('aurora_session_token');
                localStorage.removeItem('aurora_session_started_at');
                localStorage.removeItem('aurora_task_provider');
            } catch(e) {}

            const finalExp = expiresAt || (Date.now() + 2 * 3600 * 1000);
            setupActiveKeyDisplay(keyGranted, finalExp);

            if (claimedKeyCode) {
                if (claimedKeyCode.tagName === 'INPUT') {
                    claimedKeyCode.value = keyGranted;
                } else {
                    claimedKeyCode.textContent = keyGranted;
                }
            }
            claimSuccessModal?.classList.add('active');
            showToast('Chúc mừng! Đã hoàn thành vượt link và nhận key thành công.', 'success');

            try {
                localStorage.setItem('last_claimed_key', keyGranted);
                localStorage.setItem('last_claimed_time', new Date().toISOString());

                // Ghi nhớ mảng key đã vượt trên máy này để không bao giờ bị mất
                let localHistory = [];
                try {
                    localHistory = JSON.parse(localStorage.getItem('aurora_my_claimed_keys') || '[]');
                } catch(e) {}

                const newKeyObj = {
                    key_code: keyGranted,
                    provider: savedProvider === 'ontopslink' ? 'Ontopslink' : 'Link4M',
                    redeemed_at: new Date().toISOString(),
                    redeemed_time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
                    redeemed_date: new Date().toLocaleDateString('vi-VN'),
                    expires_at: new Date(finalExp).toISOString(),
                    expires_time: new Date(finalExp).toLocaleTimeString('vi-VN', { hour12: false }),
                    expires_date: new Date(finalExp).toLocaleDateString('vi-VN'),
                    expires_ms: finalExp,
                    validity_hours: 2
                };

                localHistory = localHistory.filter(k => (k.key_code || k) !== keyGranted);
                localHistory.unshift(newKeyObj);
                localStorage.setItem('aurora_my_claimed_keys', JSON.stringify(localHistory));

                renderMyKeys(localHistory);
            } catch (e) {}

            loadInitialState();
        }
    }

    // ==========================================
    // INITIAL LOAD
    // ==========================================
    async function loadInitialState() {
        // Immediate check from local cache
        try {
            const cachedKey = localStorage.getItem('aurora_active_key');
            const cachedExp = parseInt(localStorage.getItem('aurora_active_key_expires') || '0', 10);
            if (cachedKey && cachedExp > Date.now()) {
                setupActiveKeyDisplay(cachedKey, cachedExp);
            }
        } catch (e) {}
        // 1. Khởi tạo Firebase nếu có
        if (window.FirebaseService) {
            window.FirebaseService.isAvailable().then(isReady => {
                if (isReady) {
                    // Lắng nghe tồn kho thời gian thực
                    window.FirebaseService.subscribeStock((stockCount) => {
                        if (stockCountBadge) stockCountBadge.textContent = Number(stockCount).toLocaleString();
                        if (stockBadge) {
                            if (stockCount <= 0) {
                                stockBadge.classList.remove('green');
                                stockBadge.classList.add('red');
                            } else {
                                stockBadge.classList.remove('red');
                                stockBadge.classList.add('green');
                            }
                        }
                        if (stateData) stateData.stockKeys = stockCount;
                    });

                    // Lấy danh sách app trực tiếp từ Firebase
                    window.FirebaseService.getApps().then(apps => {
                        if (apps && apps.length > 0) {
                            renderAppCards(apps);
                        }
                    });
                }
            });
        }

        // 2. Thử tải trạng thái từ API server nếu khả dụng
        try {
            const res = await apiFetch('/api/getkey-state');
            if (res.status === 'success') {
                renderState(res);
            }
        } catch (err) {
            console.warn('Lỗi tải trạng thái từ API:', err);
        }
    }

    // ==========================================
    // CARD ACTIVITY HUB & LIVE TICKER SYSTEM
    // ==========================================
    function setupHubTabs() {
        const tabLiveFeed = document.getElementById('tabLiveFeed');
        const tabTopUsers = document.getElementById('tabTopUsers');
        const tabMyKeys = document.getElementById('tabMyKeys');
        const panelLiveFeed = document.getElementById('panelLiveFeed');
        const panelTopUsers = document.getElementById('panelTopUsers');
        const panelMyKeys = document.getElementById('panelMyKeys');

        const tabs = [
            { btn: tabLiveFeed, panel: panelLiveFeed },
            { btn: tabTopUsers, panel: panelTopUsers },
            { btn: tabMyKeys, panel: panelMyKeys }
        ];

        tabs.forEach(t => {
            if (t.btn && t.panel) {
                t.btn.addEventListener('click', () => {
                    tabs.forEach(o => {
                        o.btn?.classList.remove('active');
                        o.panel?.classList.remove('active');
                    });
                    t.btn.classList.add('active');
                    t.panel.classList.add('active');
                });
            }
        });
    }

    function formatTimeRemaining(sec) {
        if (sec <= 0) return '00:00:00';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const pad = n => String(n).padStart(2, '0');
        if (h > 0) {
            return `${pad(h)}h ${pad(m)}p ${pad(s)}s`;
        }
        return `${pad(m)}p ${pad(s)}s`;
    }

    function setupActiveKeyDisplay(key, expiresAt) {
        const activeKeyCard = document.getElementById('activeKeyCard');
        const activeKeyDisplayInput = document.getElementById('activeKeyDisplayInput');
        const activeKeyCountdown = document.getElementById('activeKeyCountdown');
        if (!activeKeyCard) return;
        if (key && expiresAt && expiresAt > Date.now()) {
            if (activeKeyDisplayInput) activeKeyDisplayInput.value = key;
            activeKeyCard.style.display = 'block';
            try {
                localStorage.setItem('aurora_active_key', key);
                localStorage.setItem('aurora_active_key_expires', String(expiresAt));
            } catch (e) {}
            const remSec = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            if (activeKeyCountdown) activeKeyCountdown.textContent = formatTimeRemaining(remSec);
        } else {
            activeKeyCard.style.display = 'none';
        }
    }

    let myKeysCountdownInterval = null;

    function renderMyKeys(keys, clientIp) {
        const myKeysList = document.getElementById('myKeysList');
        const myMachineIpText = document.getElementById('myMachineIpText');
        const myKeysBadgeCount = document.getElementById('myKeysBadgeCount');
        const bigKeysContainer = document.getElementById('bigKeysContainer');
        const bigBoardIpText = document.getElementById('bigBoardIpText');
        const bigBoardKeyCount = document.getElementById('bigBoardKeyCount');
        const shortcutKeyCountText = document.getElementById('shortcutKeyCountText');

        const displayIp = clientIp || (stateData?.clientIp || (stateData?.user ? (stateData.user.ipUser || stateData.user.username.replace('guest_', '').replace(/_/g, '.')) : 'Thiết bị này'));
        
        if (myMachineIpText) myMachineIpText.textContent = displayIp;
        if (bigBoardIpText) bigBoardIpText.textContent = displayIp;

        // LẤY VÀ HỢP NHẤT TOÀN BỘ KEY ĐÃ VƯỢT TỪ LOCALSTORAGE (LỊCH SỬ MÁY NÀY)
        let localKeys = [];
        try {
            const rawStored = localStorage.getItem('aurora_my_claimed_keys');
            if (rawStored) localKeys = JSON.parse(rawStored);
            if (!Array.isArray(localKeys)) localKeys = [];
        } catch(e) { localKeys = []; }

        // Bổ sung các key đơn lẻ nếu chưa có trong mảng
        try {
            const lastClaimed = localStorage.getItem('last_claimed_key');
            const lastClaimedTime = localStorage.getItem('last_claimed_time') || new Date().toISOString();
            if (lastClaimed) {
                const found = localKeys.some(k => (k.key_code || k) === lastClaimed);
                if (!found) {
                    const timeMs = new Date(lastClaimedTime).getTime() || Date.now();
                    const expMs = timeMs + 2 * 3600 * 1000;
                    localKeys.unshift({
                        key_code: lastClaimed,
                        provider: 'Vượt Link',
                        redeemed_at: lastClaimedTime,
                        redeemed_time: new Date(timeMs).toLocaleTimeString('vi-VN', { hour12: false }),
                        redeemed_date: new Date(timeMs).toLocaleDateString('vi-VN'),
                        expires_at: new Date(expMs).toISOString(),
                        expires_time: new Date(expMs).toLocaleTimeString('vi-VN', { hour12: false }),
                        expires_date: new Date(expMs).toLocaleDateString('vi-VN'),
                        expires_ms: expMs,
                        validity_hours: 2
                    });
                }
            }
            const activeKey = localStorage.getItem('aurora_active_key');
            const activeExp = parseInt(localStorage.getItem('aurora_active_key_expires') || '0', 10);
            if (activeKey && activeExp > Date.now()) {
                const found = localKeys.some(k => (k.key_code || k) === activeKey);
                if (!found) {
                    localKeys.unshift({
                        key_code: activeKey,
                        provider: 'Vượt Link',
                        redeemed_at: new Date().toISOString(),
                        redeemed_time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
                        redeemed_date: new Date().toLocaleDateString('vi-VN'),
                        expires_at: new Date(activeExp).toISOString(),
                        expires_time: new Date(activeExp).toLocaleTimeString('vi-VN', { hour12: false }),
                        expires_date: new Date(activeExp).toLocaleDateString('vi-VN'),
                        expires_ms: activeExp,
                        validity_hours: 2
                    });
                }
            }
        } catch(e) {}

        // Hợp nhất serverKeys và localKeys (khử trùng lặp theo key_code)
        const keyMap = new Map();
        if (Array.isArray(keys)) {
            keys.forEach(k => {
                if (k && k.key_code) {
                    const rMs = k.redeemed_ms || (k.redeemed_at ? new Date(k.redeemed_at).getTime() : Date.now());
                    const eMs = k.expires_ms || (rMs + 2 * 3600 * 1000);
                    keyMap.set(k.key_code, {
                        ...k,
                        validity_hours: 2,
                        expires_ms: eMs
                    });
                }
            });
        }
        localKeys.forEach(k => {
            const code = typeof k === 'string' ? k : k.key_code;
            if (code) {
                const existing = keyMap.get(code);
                const rMs = k.redeemed_ms || (k.redeemed_at ? new Date(k.redeemed_at).getTime() : Date.now());
                const eMs = (existing && existing.expires_ms) ? existing.expires_ms : (k.expires_ms || (rMs + 2 * 3600 * 1000));
                keyMap.set(code, {
                    ...(existing || {}),
                    ...(typeof k === 'string' ? {} : k),
                    key_code: code,
                    provider: k.provider || existing?.provider || 'Vượt Link',
                    redeemed_at: k.redeemed_at || existing?.redeemed_at || new Date(rMs).toISOString(),
                    expires_ms: eMs,
                    validity_hours: 2
                });
            }
        });

        keys = Array.from(keyMap.values()).filter(k => {
            const c = String(k?.key_code || '');
            return c && !c.startsWith('GATE_DONE_') && k?.provider !== '__GATE_COMPLETED__';
        });

        // Cập nhật lại cache localStorage
        try {
            localStorage.setItem('aurora_my_claimed_keys', JSON.stringify(keys));
        } catch(e) {}

        // Gửi ngầm lên server để đồng bộ gắn IP máy này vào các key lịch sử nếu chưa có
        if (keys.length > 0 && !window.__keysSyncedToServer) {
            window.__keysSyncedToServer = true;
            apiFetch('/api/sync-my-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keys: keys.map(k => ({ key_code: k.key_code, provider: k.provider, redeemed_at: k.redeemed_at, expires_ms: k.expires_ms })) })
            }).catch(() => {});
        }

        if (myKeysBadgeCount) {
            myKeysBadgeCount.textContent = keys.length;
            myKeysBadgeCount.style.display = keys.length > 0 ? 'inline-block' : 'none';
        }
        if (bigBoardKeyCount) bigBoardKeyCount.textContent = keys.length;
        if (shortcutKeyCountText) shortcutKeyCountText.textContent = keys.length;

        const now = Date.now();

        // 1. RENDER BẢNG TO (DÀNH CHO MÁY NÀY)
        if (bigKeysContainer) {
            if (keys.length === 0) {
                bigKeysContainer.innerHTML = `
                    <div class="big-board-empty">
                        <div class="empty-icon-circle">
                            <i class="fa-solid fa-key" style="font-size: 30px; color: #64748b;"></i>
                        </div>
                        <h3 class="empty-title">Thiết Bị Này Chưa Có Key Nào Hôm Nay</h3>
                        <p class="empty-subtitle">
                            Địa chỉ IP máy bạn (<strong>${displayIp}</strong>) hiện chưa có lịch sử vượt link nhận key.<br>
                            Hãy nhấn nút <strong>"Bắt Đầu Get Key"</strong> ở phía trên để vượt link và nhận License Key 2 Giờ nhé!
                        </p>
                        <button type="button" class="btn-empty-action" onclick="document.getElementById('btnGetKey')?.scrollIntoView({ behavior: 'smooth' })">
                            <i class="fa-solid fa-bolt"></i> Bắt Đầu Vượt Link Ngay
                        </button>
                    </div>
                `;
            } else {
                const rowsHtml = keys.map((k, idx) => {
                    const expMs = Number(k.expires_ms) || (new Date(k.expires_at || 0).getTime()) || 0;
                    const remSec = Math.max(0, Math.floor((expMs - now) / 1000));
                    const isValid = remSec > 0;
                    const rowValidCls = isValid ? 'row-valid' : '';
                    const redeemedTime = k.redeemed_time || (k.redeemed_at ? new Date(k.redeemed_at).toLocaleTimeString('vi-VN', { hour12: false }) : '');
                    const redeemedDate = k.redeemed_date || (k.redeemed_at ? new Date(k.redeemed_at).toLocaleDateString('vi-VN') : '');
                    const expiresTime = k.expires_time || (expMs ? new Date(expMs).toLocaleTimeString('vi-VN', { hour12: false }) : '');
                    const expiresDate = k.expires_date || (expMs ? new Date(expMs).toLocaleDateString('vi-VN') : '');
                    const provName = k.provider || 'Vượt Link';
                    const provCls = provName.toLowerCase().includes('ontops') ? 'ontops' : 'link4m';

                    return `
                        <tr class="${rowValidCls}">
                            <td data-label="STT" style="text-align: center;">
                                <span class="stt-badge">${idx + 1}</span>
                            </td>
                            <td data-label="Mã License Key">
                                <div class="big-key-code-cell">
                                    <span class="big-key-code" title="${k.key_code}">${k.key_code}</span>
                                    <button type="button" class="btn-copy-code-inline" onclick="copyToClipboard('${k.key_code}', this)" title="Sao chép key">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </td>
                            <td data-label="Cổng Nhiệm Vụ">
                                <span class="provider-badge ${provCls}">
                                    <i class="fa-solid fa-link"></i> ${provName}
                                </span>
                            </td>
                            <td data-label="Thời Gian Vượt">
                                <div class="time-cell">
                                    <div class="time-main"><i class="fa-solid fa-play" style="color: #38bdf8; font-size: 11px;"></i> ${redeemedTime}</div>
                                    <div class="date-sub">${redeemedDate}</div>
                                </div>
                            </td>
                            <td data-label="Hạn Sử Dụng & Hết Hạn Lúc">
                                <div class="time-cell">
                                    <div class="time-main"><i class="fa-solid fa-hourglass-end" style="color: #f59e0b; font-size: 11px;"></i> ${expiresTime}</div>
                                    <div class="date-sub">${expiresDate} (2 Giờ)</div>
                                </div>
                            </td>
                            <td data-label="Tình Trạng Hiệu Lực">
                                <div class="status-cell ${isValid ? 'valid' : 'expired'}">
                                    <div class="status-label">
                                        ${isValid ? '<span class="pulse-green-dot"></span> Còn Hạn Sử Dụng' : '<i class="fa-solid fa-circle-xmark"></i> Đã Hết Hạn'}
                                    </div>
                                    ${isValid ? `
                                        <div class="countdown-badge">
                                            <i class="fa-solid fa-clock"></i> Còn <strong class="big-card-timer" data-exp="${expMs}">${formatTimeRemaining(remSec)}</strong>
                                        </div>
                                    ` : `
                                        <div class="expired-sub">Đã quá hạn sử dụng</div>
                                    `}
                                </div>
                            </td>
                            <td data-label="Thao Tác" style="text-align: center;">
                                <div class="actions-cell">
                                    <button type="button" class="btn-action-copy" onclick="copyToClipboard('${k.key_code}', this)">
                                        <i class="fa-regular fa-copy"></i> Sao chép
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');

                bigKeysContainer.innerHTML = `
                    <div class="big-keys-table-responsive">
                        <table class="big-keys-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px; text-align: center;">STT</th>
                                    <th>MÃ LICENSE KEY</th>
                                    <th>CỔNG NHIỆM VỤ</th>
                                    <th>THỜI GIAN VƯỢT</th>
                                    <th>HẠN DÙNG & HẾT HẠN LÚC</th>
                                    <th>TÌNH TRẠNG HIỆU LỰC</th>
                                    <th style="text-align: center; width: 130px;">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

        // 2. RENDER COMPACT TAB LIST (Trong Card 2)
        if (myKeysList) {
            if (keys.length === 0) {
                myKeysList.innerHTML = `
                    <div class="my-keys-empty">
                        <i class="fa-solid fa-key"></i>
                        <p>Thiết bị này chưa có lịch sử vượt key nào hôm nay.<br>Hãy hoàn thành nhiệm vụ vượt link để nhận key!</p>
                    </div>
                `;
            } else {
                myKeysList.innerHTML = keys.map(k => {
                    const expMs = Number(k.expires_ms) || (new Date(k.expires_at || 0).getTime()) || 0;
                    const remSec = Math.max(0, Math.floor((expMs - now) / 1000));
                    const isValid = remSec > 0;
                    const badgeCls = isValid ? 'valid' : 'expired';
                    const statusIcon = isValid ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
                    const statusText = isValid ? `Còn Hạn (<span class="key-card-timer" data-exp="${expMs}">${formatTimeRemaining(remSec)}</span>)` : 'Đã Hết Hạn';
                    const activeCardCls = isValid ? 'active-valid' : '';

                    const redeemedTime = k.redeemed_time || (k.redeemed_at ? new Date(k.redeemed_at).toLocaleTimeString('vi-VN', { hour12: false }) : '');
                    const redeemedDate = k.redeemed_date || (k.redeemed_at ? new Date(k.redeemed_at).toLocaleDateString('vi-VN') : '');
                    const expiresTime = k.expires_time || (expMs ? new Date(expMs).toLocaleTimeString('vi-VN', { hour12: false }) : '');
                    const expiresDate = k.expires_date || (expMs ? new Date(expMs).toLocaleDateString('vi-VN') : '');

                    return `
                        <div class="my-key-card ${activeCardCls}">
                            <div class="my-key-header">
                                <div class="my-key-code-wrap">
                                    <span class="my-key-code-text" title="${k.key_code}">${k.key_code}</span>
                                </div>
                                <button type="button" class="my-key-copy-btn" onclick="copyToClipboard('${k.key_code}', this)">
                                    <i class="fa-regular fa-copy"></i> Sao chép
                                </button>
                                <span class="my-key-status-badge ${badgeCls}">
                                    ${statusIcon} ${statusText}
                                </span>
                            </div>
                            <div class="my-key-details">
                                <div class="my-key-detail-item" title="Thời điểm vượt link">
                                    <i class="fa-solid fa-play"></i>
                                    <span>Vượt lúc: <strong>${redeemedTime} ${redeemedDate}</strong></span>
                                </div>
                                <div class="my-key-detail-item" title="Thời điểm hết hạn">
                                    <i class="fa-solid fa-hourglass-end"></i>
                                    <span>Hết hạn: <strong>${expiresTime} ${expiresDate}</strong></span>
                                </div>
                                <div class="my-key-detail-item" style="grid-column: 1/-1;" title="Cổng nhiệm vụ">
                                    <i class="fa-solid fa-network-wired"></i>
                                    <span>Nhiệm vụ: <strong>${k.provider || 'Vượt Link'}</strong></span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // 3. ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN THỰC (Chạy cho cả Bảng To & Tab Nhỏ)
        if (myKeysCountdownInterval) clearInterval(myKeysCountdownInterval);
        myKeysCountdownInterval = setInterval(() => {
            const allTimers = document.querySelectorAll('.key-card-timer, .big-card-timer');
            allTimers.forEach(t => {
                const targetExp = Number(t.getAttribute('data-exp') || 0);
                const s = Math.max(0, Math.floor((targetExp - Date.now()) / 1000));
                t.textContent = formatTimeRemaining(s);
                if (s <= 0) {
                    const statusCell = t.closest('.status-cell');
                    if (statusCell) {
                        statusCell.className = 'status-cell expired';
                        statusCell.innerHTML = `
                            <div class="status-label"><i class="fa-solid fa-circle-xmark"></i> Đã Hết Hạn</div>
                            <div class="expired-sub">Đã quá hạn sử dụng</div>
                        `;
                    }
                    const badge = t.closest('.my-key-status-badge');
                    if (badge) {
                        badge.className = 'my-key-status-badge expired';
                        badge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Đã Hết Hạn';
                    }
                }
            });
        }, 1000);
    }

    window.loadInitialState = loadInitialState;

    function renderHubAndTicker(data) {
        if (!data) return;

        // 1. Cập nhật IP User định danh
        const currentIpUserText = document.getElementById('currentIpUserText');
        const currentUsername = (data.user && data.user.ipUser) ? data.user.ipUser : 'User1';
        if (currentIpUserText) {
            currentIpUserText.textContent = `Bạn: ${currentUsername}`;
        }

        const topUsersData = data.topUsers || {};
        const events = topUsersData.ticker_events || [
            { text: 'User12 có 18 lần vượt link trong tuần', type: 'hot', tag: 'Top Tuần', time: '1p trước' },
            { text: 'User1 có 45 lần vượt link trong tháng', type: 'top', tag: 'Top 1 Tháng', time: '3p trước' },
            { text: 'User5 vừa nhận key BRMOD-FREE-2H thành công (42 lần/tháng)', type: 'success', tag: 'Nhận Key', time: '5p trước' },
            { text: 'User2 hoàn thành vượt link Link4M (15 lần/tuần)', type: 'info', tag: 'Vượt Link', time: '8p trước' },
            { text: 'User3 vừa nhận key phiên 2 Giờ (35 lần/tháng)', type: 'success', tag: 'Nhận Key', time: '11p trước' },
            { text: 'User4 có 11 lần vượt link trong tuần', type: 'info', tag: 'Vượt Link', time: '15p trước' },
            { text: 'User6 hoàn thành vượt link Link4M (9 lần/tuần)', type: 'info', tag: 'Vượt Link', time: '19p trước' },
            { text: 'User15 có 5 lần vượt link trong tuần', type: 'info', tag: 'Vượt Link', time: '24p trước' },
            { text: 'User7 vừa nhận key bản quyền BRMOD-FREE-2H', type: 'success', tag: 'Nhận Key', time: '28p trước' },
            { text: 'User9 hoàn thành vượt link Link4M', type: 'info', tag: 'Vượt Link', time: '32p trước' }
        ];

        // 2. Render Vertical Hub Ticker Track (Trong card Get Key)
        const hubTickerTrack = document.getElementById('hubTickerTrack');
        if (hubTickerTrack) {
            const trackItemsHtml = events.map(ev => {
                const match = ev.text.match(/^(User\d+)\s*(.*)$/);
                const uName = match ? match[1] : 'User';
                const uDesc = match ? match[2] : ev.text;
                const shortAvatar = uName.replace('User', 'U');
                const isCur = (uName === currentUsername);

                return `
                    <div class="hub-feed-item">
                        <div class="feed-item-left">
                            <span class="user-avatar-tag">${shortAvatar}</span>
                            <div class="feed-item-text">
                                <span class="feed-user ${isCur ? 'current' : ''}">${uName}</span>
                                <span class="feed-desc"> ${uDesc}</span>
                            </div>
                        </div>
                        <span class="feed-tag ${ev.type || 'info'}">${ev.tag || 'Vượt Link'}</span>
                    </div>
                `;
            }).join('');

            // Nhân đôi để scroll loop mượt mà không khựng
            hubTickerTrack.innerHTML = trackItemsHtml + trackItemsHtml;
        }

        // 3. Render Top Users trong card Get Key (Panel 2)
        const hubRankingList = document.getElementById('hubRankingList');
        const topMonth = topUsersData.top_month || [
            { rank: 1, username: 'User1', month_count: 45, week_count: 19 },
            { rank: 2, username: 'User5', month_count: 42, week_count: 16 },
            { rank: 3, username: 'User2', month_count: 38, week_count: 15 },
            { rank: 4, username: 'User3', month_count: 35, week_count: 14 },
            { rank: 5, username: 'User12', month_count: 32, week_count: 18 },
            { rank: 6, username: 'User4', month_count: 29, week_count: 11 },
            { rank: 7, username: 'User6', month_count: 26, week_count: 9 },
            { rank: 8, username: 'User7', month_count: 23, week_count: 8 },
            { rank: 9, username: 'User8', month_count: 21, week_count: 7 },
            { rank: 10, username: 'User9', month_count: 19, week_count: 6 }
        ];

        if (hubRankingList) {
            hubRankingList.innerHTML = topMonth.slice(0, 8).map(u => {
                let badgeClass = 'rank-normal';
                let badgeContent = `#${u.rank}`;
                if (u.rank === 1) { badgeClass = 'rank-1'; badgeContent = '🥇'; }
                else if (u.rank === 2) { badgeClass = 'rank-2'; badgeContent = '🥈'; }
                else if (u.rank === 3) { badgeClass = 'rank-3'; badgeContent = '🥉'; }

                const isCur = u.username === currentUsername;
                const weekNote = u.week_count ? ` • ${u.week_count} lần/tuần` : '';

                return `
                    <div class="hub-rank-row ${isCur ? 'highlight' : ''}">
                        <div style="display: flex; align-items: center; min-width: 0;">
                            <span class="rank-badge ${badgeClass}">${badgeContent}</span>
                            <span class="rank-username">${u.username}${isCur ? ' (Bạn)' : ''}</span>
                        </div>
                        <div class="rank-count">${u.month_count} lần${weekNote ? `<span style="font-size: 0.68rem; color: #94a3b8; margin-left: 4px; font-weight: normal;">(${u.week_count}/tuần)</span>` : ''}</div>
                    </div>
                `;
            }).join('');
        }

        // 4. Đồng bộ Section Ticker ngang bên dưới
        const ticker = document.getElementById('activityTicker');
        if (ticker) {
            const horizontalItems = events.map(ev => {
                let iconClass = 'fa-link';
                let iconColor = 'link';
                if (ev.type === 'top') { iconClass = 'fa-trophy'; iconColor = 'top'; }
                else if (ev.type === 'hot') { iconClass = 'fa-fire'; iconColor = 'hot'; }
                else if (ev.type === 'success') { iconClass = 'fa-circle-check'; iconColor = 'success'; }

                return `
                    <div class="ticker-item">
                        <i class="fa-solid ${iconClass} ticker-icon ${iconColor}"></i>
                        <span class="ticker-user">${ev.text}</span>
                        <span class="ticker-time">• ${ev.time || 'vừa xong'}</span>
                    </div>
                `;
            }).join('');
            ticker.innerHTML = horizontalItems + horizontalItems;
        }

        // 5. Đồng bộ Section Top Users Grid lớn bên dưới
        const grid = document.getElementById('topUsersGrid');
        if (grid) {
            grid.innerHTML = topMonth.map((user, idx) => {
                const rank = idx + 1;
                const rankClass = rank <= 3 ? `rank-${rank}` : '';
                const badgeContent = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                const isCur = user.username === currentUsername;

                return `
                    <div class="user-rank-card ${rankClass} ${isCur ? 'highlight-card' : ''}">
                        <div class="rank-badge">${badgeContent}</div>
                        <div class="rank-info">
                            <div class="rank-username">${user.username}${isCur ? ' (Bạn)' : ''}</div>
                            <div class="rank-stats">
                                <i class="fa-solid fa-calendar-check" style="font-size: 9px; color: #818cf8;"></i>
                                ${user.week_count || 0} lần/tuần • tháng này
                            </div>
                        </div>
                        <div class="rank-count">${user.month_count} lần</div>
                    </div>
                `;
            }).join('');
        }
    }

    // ==========================================
    // BOOT
    // ==========================================
    setupHubTabs();
    renderHubAndTicker({});
    loadInitialState();
    checkRewardTokenCallback();
});
