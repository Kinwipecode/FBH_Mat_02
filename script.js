document.addEventListener('DOMContentLoaded', () => {
    // --- Modern Toast & Custom Dialog System ---
    function getOrCreateToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showToast(message, type = 'info', title = null, duration = 5000) {
        if (!message) return;
        
        let msgStr = String(message).trim();
        
        if (type === 'info' || !type) {
            if (/^(erfolg|erfolgreich|gespeichert|geladen|importiert)/i.test(msgStr)) {
                type = 'success';
            } else if (/^(fehler|error|ungültig|gescheitert)/i.test(msgStr)) {
                type = 'error';
            } else if (/^(bitte|keine|warnung|achtung)/i.test(msgStr)) {
                type = 'warning';
            }
        }
        
        let icon = 'ℹ️';
        let defaultTitle = 'Information';
        if (type === 'success') {
            icon = '✅';
            defaultTitle = 'Erfolg';
        } else if (type === 'error') {
            icon = '❌';
            defaultTitle = 'Fehler';
        } else if (type === 'warning') {
            icon = '⚠️';
            defaultTitle = 'Hinweis';
        }

        if (msgStr.startsWith('Erfolg!')) {
            msgStr = msgStr.replace(/^Erfolg!\s*/i, '');
            if (!title) title = 'Erfolg';
        } else if (msgStr.startsWith('Fehler!')) {
            msgStr = msgStr.replace(/^Fehler!\s*/i, '');
            if (!title) title = 'Fehler';
        }

        const toastTitleText = title || defaultTitle;
        const container = getOrCreateToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-body">
                <div class="toast-title">${escapeHtml(toastTitleText)}</div>
                <div class="toast-message">${escapeHtml(msgStr)}</div>
            </div>
            <button class="toast-close" title="Schließen">&times;</button>
            <div class="toast-progress"></div>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        const progressBar = toast.querySelector('.toast-progress');

        let isDismissed = false;
        function dismissToast() {
            if (isDismissed) return;
            isDismissed = true;
            toast.classList.remove('toast-visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 350);
        }

        closeBtn.addEventListener('click', dismissToast);

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
            if (progressBar && duration > 0) {
                progressBar.style.transitionDuration = `${duration}ms`;
                progressBar.style.transform = 'scaleX(0)';
            }
        });

        if (duration > 0) {
            setTimeout(dismissToast, duration);
        }

        return toast;
    }

    function showCustomConfirm(message, title = 'Bestätigung erforderlich', confirmText = 'Bestätigen', cancelText = 'Abbrechen', isDanger = false) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';

            const btnClass = isDanger ? 'custom-dialog-btn-danger' : 'custom-dialog-btn-primary';
            const icon = isDanger ? '🗑️' : '❓';

            overlay.innerHTML = `
                <div class="custom-dialog-box">
                    <div class="custom-dialog-header">
                        <div class="custom-dialog-icon">${icon}</div>
                        <h3 class="custom-dialog-title">${escapeHtml(title)}</h3>
                    </div>
                    <p class="custom-dialog-message">${escapeHtml(message)}</p>
                    <div class="custom-dialog-actions">
                        <button class="custom-dialog-btn custom-dialog-btn-secondary btn-cancel">${escapeHtml(cancelText)}</button>
                        <button class="custom-dialog-btn ${btnClass} btn-confirm">${escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const btnConfirm = overlay.querySelector('.btn-confirm');
            const btnCancel = overlay.querySelector('.btn-cancel');

            function cleanup(result) {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 250);
                window.removeEventListener('keydown', handleKeyDown);
                resolve(result);
            }

            function handleKeyDown(e) {
                if (e.key === 'Escape') {
                    cleanup(false);
                } else if (e.key === 'Enter') {
                    cleanup(true);
                }
            }

            btnConfirm.addEventListener('click', () => cleanup(true));
            btnCancel.addEventListener('click', () => cleanup(false));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(false);
            });

            window.addEventListener('keydown', handleKeyDown);

            requestAnimationFrame(() => {
                overlay.classList.add('visible');
                btnConfirm.focus();
            });
        });
    }

    function showCustomPrompt(message, defaultValue = '', title = 'Eingabe erforderlich', confirmText = 'OK', cancelText = 'Abbrechen') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';

            overlay.innerHTML = `
                <div class="custom-dialog-box">
                    <div class="custom-dialog-header">
                        <div class="custom-dialog-icon">✏️</div>
                        <h3 class="custom-dialog-title">${escapeHtml(title)}</h3>
                    </div>
                    <p class="custom-dialog-message">${escapeHtml(message)}</p>
                    <input type="text" class="custom-dialog-input" value="${escapeHtml(defaultValue)}">
                    <div class="custom-dialog-actions">
                        <button class="custom-dialog-btn custom-dialog-btn-secondary btn-cancel">${escapeHtml(cancelText)}</button>
                        <button class="custom-dialog-btn custom-dialog-btn-primary btn-confirm">${escapeHtml(confirmText)}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const input = overlay.querySelector('.custom-dialog-input');
            const btnConfirm = overlay.querySelector('.btn-confirm');
            const btnCancel = overlay.querySelector('.btn-cancel');

            function cleanup(result) {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 250);
                window.removeEventListener('keydown', handleKeyDown);
                resolve(result);
            }

            function handleKeyDown(e) {
                if (e.key === 'Escape') {
                    cleanup(null);
                } else if (e.key === 'Enter') {
                    cleanup(input.value);
                }
            }

            btnConfirm.addEventListener('click', () => cleanup(input.value));
            btnCancel.addEventListener('click', () => cleanup(null));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(null);
            });

            window.addEventListener('keydown', handleKeyDown);

            requestAnimationFrame(() => {
                overlay.classList.add('visible');
                input.focus();
                input.select();
            });
        });
    }

    // Override browser native alert with modern Toast notifications
    window.alert = function(msg) {
        showToast(msg);
    };

    // --- Dynamic Sticky Header Height ---
    const stickyHeader = document.querySelector('.sticky-header');
    if (stickyHeader) {
        const observer = new ResizeObserver(entries => {
            const height = entries[0].target.getBoundingClientRect().height;
            document.documentElement.style.setProperty('--header-height', height + 'px');
        });
        observer.observe(stickyHeader);
    }

    // --- DOM Elements ---
    const btnAddFloor = document.getElementById('btn-add-floor-main') || document.getElementById('btn-add-floor');
    const mainTable = document.getElementById('main-table');
    const tplFloorHeader = document.getElementById('tpl-floor-header');
    const tplRoomRow = document.getElementById('tpl-room-row');

    // Modal Elements
    const modalOverlay = document.getElementById('modal-overlay');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');

    // Storage Elements
    const btnExport = document.getElementById('btn-export-file');
    const btnImport = document.getElementById('btn-import-file');
    const fileInput = document.getElementById('file-input');
    const btnClearCache = document.getElementById('btn-clear-cache');

    // Settings & Summary Elements
    const btnSettings = document.getElementById('btn-settings');
    const settingsModal = document.getElementById('settings-modal');
    const btnSettingsClose = document.getElementById('btn-settings-close');
    const inputSettingSchiene = document.getElementById('setting-schiene');
    const inputSettingKlips = document.getElementById('setting-klips');
    const inputSettingTarget = document.getElementById('setting-target');
    const inputSettingMaxOver = document.getElementById('setting-max-over');
    const inputSettingDist = document.getElementById('setting-dist');
    const settingVerteilerType = document.getElementById('setting-verteiler-type');
    const settingConnectionType = document.getElementById('setting-connection-type');

    // --- Floor-Header Drag State (must be declared early – used by hoisted function declarations) ---
    let _fhDragItem = null;        // The .fh-draggable-item currently being dragged
    let savedFloorHeaderOrder = {}; // { 'row2-left': ['toggle-floor', ...], 'row2-right': [...] }

    function getSelectedDistributorTypesFromUI() {

        const checkboxes = document.querySelectorAll('.cb-vconfig-dtype:checked');
        const selected = [];
        checkboxes.forEach(cb => selected.push(cb.value));
        return selected.length > 0 ? selected : ['metalplast', 'stramax'];
    }

    function getSelectedCabinetTypesFromUI() {
        const checkboxes = document.querySelectorAll('.cb-vconfig-cabinet:checked, .cb-cabinet-type:checked');
        const selected = [];
        checkboxes.forEach(cb => {
            if (!selected.includes(cb.value)) selected.push(cb.value);
        });
        return selected.length > 0 ? selected : ['beton_150', 'beton_125', 'blech_teleskop', 'stahlblech', 'eps_wand', 'eps_boden'];
    }

    function getSelectedConnectionTypesFromUI() {
        const checkboxes = document.querySelectorAll('.cb-vconfig-conn:checked');
        const selected = [];
        checkboxes.forEach(cb => selected.push(cb.value));
        return selected;
    }

    function getVerteilerRecommendationForFloor(rings) {
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
        if (!db || !rings || rings <= 0) return null;
        
        const distTypes = getSelectedDistributorTypesFromUI();
        const vType = (distTypes.length > 0) ? distTypes[0] : (document.getElementById('setting-verteiler-type')?.value || 'metalplast');
        
        const noWmzActive = document.getElementById('cb-vconfig-wmz')?.checked || false;
        let primaryConn = document.getElementById('vconfig-primary-connection')?.value || 
                            document.getElementById('setting-connection-type')?.value || 
                            'anschluss_horiz';
                            
        const cabinets = getSelectedCabinetTypesFromUI();
        let allowedConns = getSelectedConnectionTypesFromUI();
        
        if (noWmzActive) {
            allowedConns = allowedConns.filter(cId => {
                const sObj = FBHV_DATABASE.connectionSets.find(s => s.id === cId);
                return sObj ? !sObj.isWmz : true;
            });
            const primaryObj = FBHV_DATABASE.connectionSets.find(s => s.id === primaryConn);
            if (!primaryObj || primaryObj.isWmz) {
                primaryConn = 'anschluss_horiz';
            }
        }
        
        let connToUse = primaryConn;
        if (allowedConns.length > 0 && !allowedConns.includes(primaryConn)) {
            connToUse = allowedConns[0];
        }
        
        return FBHV_DATABASE.getRecommendation(vType, connToUse, rings, cabinets);
    }
    
    const sumAreaSpan = document.getElementById('sum-area');
    const sumPipeSpan = document.getElementById('sum-pipe');
    const sumSchieneSpan = document.getElementById('sum-schiene');
    const sumKlipsSpan = document.getElementById('sum-klips');
    const sumAntriebeSpan = document.getElementById('sum-antriebe');
    const sumThermostateSpan = document.getElementById('sum-thermostate');
    const rapportVerteilerUl = document.getElementById('rapport-verteiler');

    // --- Table Zoom Logic (Ctrl + Mouse Wheel & HUD) ---
    if (mainTable) {
        let zoomLevel = 1.0;
        let hudTimeout;

        // Create the Zoom HUD dynamically
        const zoomHud = document.createElement('div');
        zoomHud.className = 'zoom-hud';
        zoomHud.innerHTML = `
            <span>Zoom:</span>
            <input type="number" class="zoom-hud-input" min="10" max="300" step="5" value="100">
            <span>%</span>
        `;
        document.body.appendChild(zoomHud);
        
        const zoomInput = zoomHud.querySelector('.zoom-hud-input');

        function startHudHideTimer(delay = 3000) {
            clearTimeout(hudTimeout);
            if (!zoomInput.matches(':focus') && !zoomHud.matches(':hover')) {
                hudTimeout = setTimeout(() => {
                    zoomHud.classList.remove('visible');
                }, delay);
            }
        }

        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.addEventListener('wheel', (e) => {
                if (e.ctrlKey) {
                    e.preventDefault(); // Stop default browser zoom
                    if (e.deltaY < 0) {
                        zoomLevel = Math.min(zoomLevel + 0.05, 2.0);
                    } else {
                        zoomLevel = Math.max(zoomLevel - 0.05, 0.5);
                    }
                    mainTable.style.zoom = zoomLevel;
                    
                    // Show HUD and update value
                    zoomInput.value = Math.round(zoomLevel * 100);
                    zoomHud.classList.add('visible');
                    startHudHideTimer(3000);
                }
            }, { passive: false });
        }

        // HUD Interactive Event Listeners
        zoomHud.addEventListener('mouseenter', () => {
            clearTimeout(hudTimeout);
        });

        zoomHud.addEventListener('mouseleave', () => {
            startHudHideTimer(1500);
        });

        zoomInput.addEventListener('focus', () => {
            clearTimeout(hudTimeout);
            zoomInput.select(); // Auto-select text for easy typing
        });

        zoomInput.addEventListener('blur', () => {
            applyTypedZoom();
            startHudHideTimer(1500);
        });

        zoomInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyTypedZoom();
                zoomInput.blur();
            } else if (e.key === 'Escape') {
                zoomInput.value = Math.round(zoomLevel * 100);
                zoomInput.blur();
            }
        });

        function applyTypedZoom() {
            let val = parseInt(zoomInput.value);
            if (isNaN(val) || val < 10) val = 10;
            if (val > 300) val = 300;
            
            zoomLevel = val / 100;
            mainTable.style.zoom = zoomLevel;
            zoomInput.value = val;
        }
    }

    let floorCounter = 0;
    let floorToDelete = null;
    let isLoading = false; // Flag to prevent saving while loading
    let restoreToolbarLayout = null; // Reference to restore layout from loadData

    // Constants
    const PIPE_FACTOR = 1.0; // Multiplier if needed

    // --- Autosave Logic ---
    function debounce(func, timeout = 500){
        let timer;
        const debounced = (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
        debounced.flush = () => {
            clearTimeout(timer);
            func.apply(this);
        };
        return debounced;
    }

    function updateAllPosNumbers() {
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach((fb, idx) => {
            const posInput = fb.querySelector('.input-pos-nr');
            if (!posInput) return;
            const autoVal = String(idx + 1);
            posInput.dataset.autoPos = autoVal;

            const currentVal = posInput.value ? posInput.value.trim() : '';

            // Wenn leer oder identisch mit autoVal -> benutzerdefinierten Status zurücksetzen
            if (currentVal === '' || currentVal === autoVal) {
                delete posInput.dataset.isCustom;
            }

            if (posInput.dataset.isCustom === 'true') {
                posInput.classList.remove('is-auto');
                posInput.classList.add('is-custom');
                posInput.style.color = '#000000';
            } else {
                delete posInput.dataset.isCustom;
                posInput.value = autoVal;
                posInput.classList.remove('is-custom');
                posInput.classList.add('is-auto');
                posInput.style.color = '#64748b';
            }
        });
    }

    const debouncedSave = debounce(() => {
        if (isLoading) return;
        const data = {
            objektBez: document.getElementById('objekt-bez').value,
            settings: {
                schieneFactor: inputSettingSchiene ? parseFloat(inputSettingSchiene.value) : 1.0,
                klipsDist: inputSettingKlips ? parseFloat(inputSettingKlips.value) : 50,
                targetLen: inputSettingTarget ? parseFloat(inputSettingTarget.value) : 100,
                maxOver: inputSettingMaxOver ? parseFloat(inputSettingMaxOver.value) : 0,
                defaultDist: inputSettingDist ? parseFloat(inputSettingDist.value) : 10,
                verteilerType: settingVerteilerType ? settingVerteilerType.value : 'metalplast',
                connectionType: document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz',
                allowedDistributorTypes: getSelectedDistributorTypesFromUI(),
                allowedCabinets: getSelectedCabinetTypesFromUI(),
                allowedConnections: getSelectedConnectionTypesFromUI(),
                primaryConnection: document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz',
                primaryConnectionHor: document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz',
                primaryConnectionVer: document.getElementById('vconfig-primary-connection-ver')?.value || 'anschluss_vert',
                withWmz: document.getElementById('cb-vconfig-wmz')?.checked || false
            },
            floors: [],
            cadPool: cadRoomPool,
            columnWidths: (typeof window.getStoredColumnWidths === 'function') ? window.getStoredColumnWidths() : null
        };
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach(fb => {
            const btnRz = fb.querySelector('.btn-toggle-rz');
            const cbHor = fb.querySelector('.cb-floor-hor');
            const selConn = fb.querySelector('.select-floor-conn');
            const selKasten = fb.querySelector('.select-floor-kasten');
            const posInput = fb.querySelector('.input-pos-nr');
            const isCustomPos = posInput && (posInput.dataset.isCustom === 'true');
            const floor = {
                bezFbhv: fb.querySelector('.input-fbhv-name').value,
                ebene: fb.querySelector('.input-floor-name').value,
                posNr: posInput ? posInput.value : '',
                isCustomPosNr: isCustomPos,
                rzActive: btnRz ? btnRz.classList.contains('active') : true,
                connOrientation: (cbHor && cbHor.checked) ? 'hor' : 'ver',
                selectedConnKey: selConn ? selConn.value : 'auto',
                selectedKastenKey: selKasten ? selKasten.value : 'auto',
                rooms: []
            };
            const roomRows = fb.querySelectorAll('tr.room-row');
            roomRows.forEach(tr => {
                floor.rooms.push({
                    name: tr.querySelector('.input-room-name').value,
                    vaRz: tr.querySelector('.input-va-rz').value,
                    areaRz: tr.querySelector('.input-area').value,
                    vaIz: tr.querySelector('.input-va-iz').value,
                    areaIz: tr.querySelector('.input-area-iz').value,
                    thermostat: tr.querySelector('.input-check-thermostat').checked,
                    antrieb: tr.querySelector('.input-check-antrieb').checked,
                    isCombined: tr.querySelector('.input-check-iz').checked,
                    targetLen: tr.querySelector('.input-target').value,
                    fugen: tr.querySelector('.input-fugen').value,
                    dist: tr.querySelector('.input-dist').value,
                    cadId: tr.dataset.cadId || ""
                });
            });
            data.floors.push(floor);
        });
        localStorage.setItem('fbhData', JSON.stringify(data));
    }, 500);

    // Settings Live-Update
    if (inputSettingSchiene) {
        inputSettingSchiene.addEventListener('input', calculateGlobalSum);
    }
    if (inputSettingKlips) {
        inputSettingKlips.addEventListener('input', calculateGlobalSum);
    }
    if (inputSettingTarget) {
        inputSettingTarget.addEventListener('input', () => {
            const globalTarget = parseFloat(inputSettingTarget.value) || 100;
            const roomRows = document.querySelectorAll('tr.room-row');
            roomRows.forEach(row => {
                const inputTarget = row.querySelector('.input-target');
                if (inputTarget) {
                    inputTarget.value = globalTarget;
                    calculateRow(row);
                }
            });
            calculateGlobalSum();
        });
    }
    if (inputSettingMaxOver) {
        inputSettingMaxOver.addEventListener('input', () => {
            const roomRows = document.querySelectorAll('tr.room-row');
            roomRows.forEach(row => {
                calculateRow(row);
            });
            calculateGlobalSum();
        });
    }
    if (inputSettingDist) {
        inputSettingDist.addEventListener('input', () => {
            const globalDist = parseFloat(inputSettingDist.value) || 0;
            const roomRows = document.querySelectorAll('tr.room-row');
            roomRows.forEach(row => {
                const inputDist = row.querySelector('.input-dist');
                if (inputDist) {
                    inputDist.value = globalDist;
                    calculateRow(row);
                }
            });
            calculateGlobalSum();
        });
    }

    if (settingVerteilerType) {
        settingVerteilerType.addEventListener('change', () => {
            calculateGlobalSum();
            debouncedSave();
        });
    }
    if (settingConnectionType) {
        settingConnectionType.addEventListener('change', () => {
            calculateGlobalSum();
            debouncedSave();
        });
    }
    document.querySelectorAll('.cb-cabinet-type').forEach(cb => {
        cb.addEventListener('change', () => {
            calculateGlobalSum();
            debouncedSave();
        });
    });

    // Trigger save and filter updates on any input change in the document
    document.addEventListener('input', (e) => { 
        if (!isLoading) debouncedSave(); 

        const target = e.target;
        if (target) {
            // Re-apply table filters or update distributor overview if floor/FBHV changes
            if (target.classList.contains('input-floor-name') || target.classList.contains('input-fbhv-name')) {
                if (typeof renderVerteilerOverviewList === 'function') {
                    renderVerteilerOverviewList();
                }
                if (typeof applyMainTableFilters === 'function') {
                    applyMainTableFilters();
                }
            }
        }
    });
    document.addEventListener('change', () => { if (!isLoading) debouncedSave(); });


    // --- Active Verteiler Multi-Selection Logic (Ctrl / Shift / Escape) ---
    let activeFloorGroup = null;
    let lastSelectedFloorGroup = null;
    let floorsToCopy = [];

    function getSelectedFloorGroups() {
        const selected = Array.from(document.querySelectorAll('tbody.floor-group.active-verteiler'));
        if (selected.length > 0) return selected;
        const first = document.querySelector('tbody.floor-group');
        if (first) {
            setActiveFloorGroup(first, false, false);
            return [first];
        }
        return [];
    }

    function getActiveFloorGroup() {
        const selected = getSelectedFloorGroups();
        return selected.length > 0 ? selected[selected.length - 1] : null;
    }

    function setActiveFloorGroup(floorBody, isMultiSelect = false, isRangeSelect = false) {
        const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
        if (allFloors.length === 0) return;

        if (!floorBody || !document.body.contains(floorBody)) {
            floorBody = allFloors[0];
        }

        if (isRangeSelect && lastSelectedFloorGroup && document.body.contains(lastSelectedFloorGroup)) {
            const startIdx = allFloors.indexOf(lastSelectedFloorGroup);
            const endIdx = allFloors.indexOf(floorBody);
            if (startIdx !== -1 && endIdx !== -1) {
                const min = Math.min(startIdx, endIdx);
                const max = Math.max(startIdx, endIdx);
                allFloors.forEach((fb, idx) => {
                    if (idx >= min && idx <= max) {
                        fb.classList.add('active-verteiler');
                    } else {
                        fb.classList.remove('active-verteiler');
                    }
                });
            }
        } else if (isMultiSelect) {
            // Ctrl/Meta Click: Toggle current floor
            floorBody.classList.toggle('active-verteiler');
        } else {
            // Normal Click: Single selection
            allFloors.forEach(fb => fb.classList.remove('active-verteiler'));
            floorBody.classList.add('active-verteiler');
        }

        activeFloorGroup = floorBody;
        if (!isRangeSelect) {
            lastSelectedFloorGroup = floorBody;
        }
    }

    function clearAllVerteilerSelections() {
        document.querySelectorAll('tbody.floor-group').forEach(fb => {
            fb.classList.remove('active-verteiler');
        });
        activeFloorGroup = null;
    }

    function toggleVerteilerSelectionState() {
        const selected = document.querySelectorAll('tbody.floor-group.active-verteiler');
        if (selected.length > 0) {
            clearAllVerteilerSelections();
        } else {
            const first = document.querySelector('tbody.floor-group');
            if (first) setActiveFloorGroup(first, false, false);
        }
    }

    // Windows File Explorer-style click selection (Normal, Ctrl+Click, Shift+Click)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.sticky-header') || e.target.closest('.modal-overlay') || e.target.closest('.btn-tool')) {
            return;
        }

        const badgeBtn = e.target.closest('.active-verteiler-badge');
        if (badgeBtn) {
            e.stopPropagation();
            const floorBody = badgeBtn.closest('tbody.floor-group');
            if (floorBody) {
                const isCtrl = e.ctrlKey || e.metaKey;
                const isShift = e.shiftKey;
                setActiveFloorGroup(floorBody, isCtrl, isShift);
            }
            return;
        }

        const floorBody = e.target.closest('tbody.floor-group');
        if (floorBody) {
            // Do not alter multi-selection when clicking directly on interactive controls inside floor headers
            if (e.target.closest('.btn-toggle-rz') || e.target.closest('input') || e.target.closest('select') || e.target.closest('button')) {
                return;
            }
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;
            setActiveFloorGroup(floorBody, isCtrl, isShift);
        }
    });

    document.addEventListener('focusin', (e) => {
        const floorBody = e.target.closest('tbody.floor-group');
        if (!floorBody) return;

        // Do NOT reset multi-selection when focusing interactive controls inside a floor
        if (e.target.closest('.btn-sync-mark') || e.target.closest('.btn-toggle-rz') || e.target.closest('input') || e.target.closest('select') || e.target.closest('button')) {
            return;
        }

        const selected = Array.from(document.querySelectorAll('tbody.floor-group.active-verteiler'));
        if (selected.length > 1) return; // keep all marked floors intact

        if (!selected.includes(floorBody)) {
            setActiveFloorGroup(floorBody, false, false);
        }
    });

    // Keyboard Shortcuts (Escape: clear selection, Ctrl+A: select/sync all distributors)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay:not(.hidden)');
            if (openModal) {
                return; // Let modal overlay close handlers deal with modals
            }

            const activeElem = document.activeElement;
            if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.tagName === 'SELECT')) {
                activeElem.blur();
            }

            toggleVerteilerSelectionState();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
            const activeElem = document.activeElement;
            const isTyping = activeElem && (
                activeElem.tagName === 'INPUT' ||
                activeElem.tagName === 'TEXTAREA' ||
                activeElem.isContentEditable
            );
            if (!isTyping) {
                const openModal = document.querySelector('.modal-overlay:not(.hidden)');
                if (openModal) return;

                e.preventDefault();
                const allFloors = document.querySelectorAll('tbody.floor-group');
                const markedFloors = document.querySelectorAll('tbody.floor-group.active-verteiler');
                const isAllMarked = allFloors.length > 0 && markedFloors.length === allFloors.length;

                if (isAllMarked) {
                    clearAllVerteilerSelections();
                } else {
                    allFloors.forEach(fb => fb.classList.add('active-verteiler'));
                    if (allFloors.length > 0) {
                        activeFloorGroup = allFloors[0];
                    }
                }
                updateAllSyncButtons();
            }
        }
    });

    // --- Top Toolbar Verteiler Actions (Vert+, Copy V., Raum+) ---
    const btnAddFloorMain = document.getElementById('btn-add-floor-main');
    if (btnAddFloorMain) {
        btnAddFloorMain.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            floorCounter++;
            const selectedFloors = getSelectedFloorGroups();
            const lastSelected = selectedFloors.length > 0 ? selectedFloors[selectedFloors.length - 1] : null;
            const newFb = addNewFloor(floorCounter);
            addRoomToFloor(newFb);
            if (lastSelected && lastSelected.parentNode) {
                lastSelected.parentNode.insertBefore(newFb, lastSelected.nextSibling);
            }
            updateAllPosNumbers();
            setActiveFloorGroup(newFb, false, false);
            calculateGlobalSum();
            if (!isLoading) debouncedSave();
            newFb.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    const btnCopyFloorMain = document.getElementById('btn-copy-floor-main');
    if (btnCopyFloorMain) {
        btnCopyFloorMain.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            const selectedFloors = getSelectedFloorGroups();
            if (selectedFloors.length > 0) {
                openCopyFloorModal(selectedFloors);
            }
        });
    }

    const btnAddRoomMain = document.getElementById('btn-add-room-main');
    if (btnAddRoomMain) {
        btnAddRoomMain.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            const selectedFloors = getSelectedFloorGroups();
            if (selectedFloors.length === 0) {
                floorCounter++;
                const newFb = addNewFloor(floorCounter);
                addRoomToFloor(newFb);
                setActiveFloorGroup(newFb, false, false);
            } else {
                selectedFloors.forEach(fb => {
                    addRoomToFloor(fb);
                });
            }
            calculateGlobalSum();
            if (!isLoading) debouncedSave();

            const lastFb = selectedFloors.length > 0 ? selectedFloors[selectedFloors.length - 1] : null;
            if (lastFb) {
                const roomRows = lastFb.querySelectorAll('tr.room-row');
                if (roomRows.length > 0) {
                    const lastRow = roomRows[roomRows.length - 1];
                    const nameInput = lastRow.querySelector('.input-room-name');
                    if (nameInput) nameInput.focus();
                }
            }
        });
    }

    btnModalCancel.addEventListener('click', hideDeleteModal);
    btnModalConfirm.addEventListener('click', () => {
        if (floorToDelete) {
            const roomRows = floorToDelete.querySelectorAll('tr.room-row');
            roomRows.forEach(tr => unassignCadRoomForTr(tr));

            floorToDelete.remove();
            updateAllPosNumbers();
            calculateGlobalSum();
            if (!isLoading) debouncedSave();
        }
        hideDeleteModal();
    });
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideDeleteModal();
    });

    // --- Copy Floor Modal Logic ---
    function openCopyFloorModal(targetFloors) {
        if (!targetFloors) {
            targetFloors = getSelectedFloorGroups();
        }
        if (!Array.isArray(targetFloors)) {
            targetFloors = [targetFloors];
        }
        targetFloors = targetFloors.filter(fb => fb && document.body.contains(fb));
        if (targetFloors.length === 0) return;

        floorsToCopy = targetFloors;

        const copyFloorModal = document.getElementById('copy-floor-modal');
        if (!copyFloorModal) {
            console.error("copy-floor-modal non-existent!");
            return;
        }

        const copyFloorSourceName = document.getElementById('copy-floor-source-name');
        if (copyFloorSourceName) {
            if (targetFloors.length === 1) {
                const floorBody = targetFloors[0];
                const fbhvNameInput = floorBody.querySelector('.input-fbhv-name');
                const floorNameInput = floorBody.querySelector('.input-floor-name');
                const fbhvName = fbhvNameInput ? fbhvNameInput.value.trim() : '';
                const floorName = floorNameInput ? floorNameInput.value.trim() : '';

                let labelText = fbhvName || 'Verteiler';
                if (floorName) labelText += ` (${floorName})`;
                copyFloorSourceName.textContent = labelText;
            } else {
                copyFloorSourceName.textContent = `${targetFloors.length} Verteiler ausgewählt`;
            }
        }

        const inputCopyFloorCount = document.getElementById('copy-floor-count');
        if (inputCopyFloorCount) inputCopyFloorCount.value = '1';

        const radAfter = document.querySelector('input[name="copy-floor-position"][value="after"]');
        if (radAfter) radAfter.checked = true;

        const cbCopyFloorClearNames = document.getElementById('copy-floor-clear-names');
        if (cbCopyFloorClearNames) cbCopyFloorClearNames.checked = true;

        copyFloorModal.classList.remove('hidden');
        copyFloorModal.style.display = 'flex';

        if (inputCopyFloorCount) {
            setTimeout(() => {
                inputCopyFloorCount.focus();
                inputCopyFloorCount.select();
            }, 50);
        }
    }

    function hideCopyFloorModal() {
        const copyFloorModal = document.getElementById('copy-floor-modal');
        if (copyFloorModal) {
            copyFloorModal.classList.add('hidden');
            copyFloorModal.style.display = 'none';
        }
        floorsToCopy = [];
    }

    // Global Event Delegation for Copy Buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-copy-floor-inline');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const floorBody = btn.closest('tbody.floor-group');
            if (floorBody) {
                openCopyFloorModal([floorBody]);
            }
        }
    });

    const btnCloseCopyFloorX = document.getElementById('btn-close-copy-floor-x');
    const btnCancelCopyFloor = document.getElementById('btn-cancel-copy-floor');
    const btnConfirmCopyFloor = document.getElementById('btn-confirm-copy-floor');
    const inputCopyFloorCount = document.getElementById('copy-floor-count');

    if (btnCloseCopyFloorX) btnCloseCopyFloorX.addEventListener('click', hideCopyFloorModal);
    if (btnCancelCopyFloor) btnCancelCopyFloor.addEventListener('click', hideCopyFloorModal);

    const modalElem = document.getElementById('copy-floor-modal');
    if (modalElem) {
        modalElem.addEventListener('click', (e) => {
            if (e.target === modalElem) hideCopyFloorModal();
        });
    }

    if (btnConfirmCopyFloor) {
        btnConfirmCopyFloor.addEventListener('click', () => {
            if (!floorsToCopy || floorsToCopy.length === 0) {
                hideCopyFloorModal();
                return;
            }

            const inputCount = document.getElementById('copy-floor-count');
            const countVal = parseInt(inputCount ? inputCount.value : '1', 10);
            const count = isNaN(countVal) || countVal < 1 ? 1 : countVal;

            const selectedPosElem = document.querySelector('input[name="copy-floor-position"]:checked');
            const position = selectedPosElem ? selectedPosElem.value : 'after';
            const cbClear = document.getElementById('copy-floor-clear-names');
            const clearNames = cbClear ? cbClear.checked : true;

            const targets = [...floorsToCopy];
            hideCopyFloorModal();

            targets.forEach(targetFloor => {
                duplicateFloorWithOptions(targetFloor, count, position, clearNames);
            });
        });
    }

    if (inputCopyFloorCount) {
        inputCopyFloorCount.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (btnConfirmCopyFloor) btnConfirmCopyFloor.click();
            }
        });
    }

    // --- Auto Pos. Nr. Generator Modal Logic ---
    const btnAutoPosNr = document.getElementById('btn-auto-pos-nr');
    const modalAutoPosNr = document.getElementById('modal-auto-pos-nr');
    const btnAutoPosCancel = document.getElementById('btn-auto-pos-cancel');
    const btnAutoPosConfirm = document.getElementById('btn-auto-pos-confirm');
    const inputAutoPosStart = document.getElementById('input-auto-pos-start');
    const inputAutoPosEnd = document.getElementById('input-auto-pos-end');
    const lblAutoPosCount = document.getElementById('lbl-auto-pos-count');

    function openAutoPosModal() {
        let activeFloors = getSelectedFloorGroups();
        if (activeFloors.length <= 1) {
            // Falls kein oder nur 1 Verteiler ausgewählt ist, alle Verteiler aktivieren
            const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
            if (allFloors.length > 0) {
                allFloors.forEach(fb => fb.classList.add('active-verteiler'));
                activeFloors = allFloors;
                updateAllSyncButtons();
            }
        }
        if (lblAutoPosCount) {
            lblAutoPosCount.textContent = `${activeFloors.length} ${activeFloors.length === 1 ? 'aktiver Verteiler' : 'aktive Verteiler'}`;
        }
        if (inputAutoPosStart) inputAutoPosStart.value = '1';
        if (inputAutoPosEnd) inputAutoPosEnd.value = '';

        if (modalAutoPosNr) {
            modalAutoPosNr.classList.remove('hidden');
            modalAutoPosNr.style.display = 'flex';
        }
        if (inputAutoPosStart) {
            setTimeout(() => {
                inputAutoPosStart.focus();
                inputAutoPosStart.select();
            }, 50);
        }
    }

    function hideAutoPosModal() {
        if (modalAutoPosNr) {
            modalAutoPosNr.classList.add('hidden');
            modalAutoPosNr.style.display = 'none';
        }
    }

    if (btnAutoPosNr) {
        btnAutoPosNr.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            openAutoPosModal();
        });
    }

    if (btnAutoPosCancel) btnAutoPosCancel.addEventListener('click', hideAutoPosModal);

    if (modalAutoPosNr) {
        modalAutoPosNr.addEventListener('click', (e) => {
            if (e.target === modalAutoPosNr) hideAutoPosModal();
        });
    }

    function applyAutoPosNumbers() {
        let activeFloors = getSelectedFloorGroups();
        if (activeFloors.length <= 1) {
            const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
            if (allFloors.length > 0) {
                allFloors.forEach(fb => fb.classList.add('active-verteiler'));
                activeFloors = allFloors;
            }
        }
        if (activeFloors.length === 0) {
            hideAutoPosModal();
            return;
        }

        const startVal = parseInt(inputAutoPosStart ? inputAutoPosStart.value : '1', 10);
        let currentNum = isNaN(startVal) || startVal < 1 ? 1 : startVal;

        const endStr = inputAutoPosEnd ? inputAutoPosEnd.value.trim() : '';
        const hasEndVal = endStr !== '';
        const endVal = hasEndVal ? parseInt(endStr, 10) : null;

        // Sortiere aktive Verteiler strikt nach der Reihenfolge von oben nach unten im Dokument
        const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
        activeFloors.sort((a, b) => allFloors.indexOf(a) - allFloors.indexOf(b));

        if (startVal === 1 && !hasEndVal) {
            // Standard Auto-Pos (ab 1 fortlaufend): Setze benutzerdefinierten Status zurück für alle aktiven Verteiler
            activeFloors.forEach(fb => {
                const posInput = fb.querySelector('.input-pos-nr');
                if (posInput) {
                    delete posInput.dataset.isCustom;
                }
            });
            updateAllPosNumbers();
        } else {
            for (let i = 0; i < activeFloors.length; i++) {
                if (hasEndVal && endVal !== null && !isNaN(endVal) && currentNum > endVal) {
                    // Stoppt bei Erreichen der angegebenen Maximalzahl!
                    break;
                }

                const fb = activeFloors[i];
                const posInput = fb.querySelector('.input-pos-nr');
                if (posInput) {
                    posInput.value = String(currentNum);
                    posInput.dataset.isCustom = 'true';
                    posInput.classList.remove('is-auto');
                    posInput.classList.add('is-custom');
                    posInput.style.color = '#000000';
                }
                currentNum++;
            }
        }

        hideAutoPosModal();
        if (!isLoading) debouncedSave();
    }

    if (btnAutoPosConfirm) {
        btnAutoPosConfirm.addEventListener('click', applyAutoPosNumbers);
    }

    if (inputAutoPosStart) {
        inputAutoPosStart.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyAutoPosNumbers();
            }
        });
    }
    if (inputAutoPosEnd) {
        inputAutoPosEnd.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyAutoPosNumbers();
            }
        });
    }

    function clearAutoPosNumbers() {
        let activeFloors = getSelectedFloorGroups();
        if (activeFloors.length <= 1) {
            const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
            if (allFloors.length > 0) {
                allFloors.forEach(fb => fb.classList.add('active-verteiler'));
                activeFloors = allFloors;
                updateAllSyncButtons();
            }
        }

        activeFloors.forEach(fb => {
            const posInput = fb.querySelector('.input-pos-nr');
            if (posInput) {
                delete posInput.dataset.isCustom;
            }
        });

        updateAllPosNumbers();
        hideAutoPosModal();
        if (!isLoading) debouncedSave();
    }

    const btnClearPosNr = document.getElementById('btn-clear-pos-nr');
    if (btnClearPosNr) {
        btnClearPosNr.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            clearAutoPosNumbers();
        });
    }

    const btnAutoPosClear = document.getElementById('btn-auto-pos-clear');
    if (btnAutoPosClear) {
        btnAutoPosClear.addEventListener('click', clearAutoPosNumbers);
    }

    /* ==========================================================================
       VERTEILER MOVE MODE (Vert. move) SYSTEM
       ========================================================================== */
    let isVerteilerMoveMode = false;

    function toggleVerteilerMoveMode(forceState) {
        const btn = document.getElementById('btn-verteiler-move');
        if (forceState !== undefined) {
            isVerteilerMoveMode = Boolean(forceState);
        } else {
            isVerteilerMoveMode = !isVerteilerMoveMode;
        }

        if (btn) {
            btn.classList.toggle('active', isVerteilerMoveMode);
            if (isVerteilerMoveMode) {
                btn.innerHTML = '<span class="drag-handle">⋮⋮</span> ↑↓ Vert. (Aktiv)';
                btn.style.backgroundColor = '#10b981';
                btn.style.color = '#ffffff';
                btn.style.borderColor = '#059669';
                showMenuBoundaryToast('↑↓ Verteiler-Verschiebemodus AKTIV! Verwenden Sie ↑ / ↓, um den aktiven Verteiler nach oben oder unten zu verschieben.');
            } else {
                btn.innerHTML = '<span class="drag-handle">⋮⋮</span> ↑↓ Vert.';
                btn.style.backgroundColor = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }
        }
    }

    function moveActiveVerteiler(direction) {
        let activeFloors = getSelectedFloorGroups();
        if (activeFloors.length === 0) {
            const firstFloor = document.querySelector('tbody.floor-group');
            if (firstFloor) {
                firstFloor.classList.add('active-verteiler');
                activeFloors = [firstFloor];
            } else {
                return;
            }
        }

        const allFloors = Array.from(document.querySelectorAll('tbody.floor-group'));
        activeFloors.sort((a, b) => allFloors.indexOf(a) - allFloors.indexOf(b));

        if (direction < 0) { // Move UP
            for (let i = 0; i < activeFloors.length; i++) {
                const fb = activeFloors[i];
                let prev = fb.previousElementSibling;
                while (prev && !prev.classList.contains('floor-group')) {
                    prev = prev.previousElementSibling;
                }
                if (prev && prev.classList.contains('floor-group')) {
                    prev.parentNode.insertBefore(fb, prev);
                }
            }
        } else if (direction > 0) { // Move DOWN
            for (let i = activeFloors.length - 1; i >= 0; i--) {
                const fb = activeFloors[i];
                let next = fb.nextElementSibling;
                while (next && !next.classList.contains('floor-group')) {
                    next = next.nextElementSibling;
                }
                if (next && next.classList.contains('floor-group')) {
                    next.parentNode.insertBefore(fb, next.nextSibling);
                }
            }
        }

        updateAllPosNumbers();
        if (typeof calculateGlobalSum === 'function') calculateGlobalSum();

        const mainActive = activeFloors[0];
        if (mainActive) {
            mainActive.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (!isLoading && typeof debouncedSave === 'function') debouncedSave();
    }

    const btnVerteilerMove = document.getElementById('btn-verteiler-move');
    if (btnVerteilerMove) {
        btnVerteilerMove.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            toggleVerteilerMoveMode();
        });
    }

    if (btnSettings) {
        btnSettings.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            settingsModal.classList.remove('hidden');
        });
    }

    if (btnSettingsClose) {
        btnSettingsClose.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            const globalTarget = inputSettingTarget ? parseFloat(inputSettingTarget.value) || 100 : 100;
            const roomRows = document.querySelectorAll('tr.room-row');
            roomRows.forEach(row => {
                const inputTarget = row.querySelector('.input-target');
                if (inputTarget) {
                    inputTarget.value = globalTarget;
                    calculateRow(row);
                }
            });
            calculateGlobalSum();
            if (!isLoading) debouncedSave();
        });
    }

    // --- Design / Color Palette Switching Logic ---
    const btnDesign = document.getElementById('btn-design');
    const designModal = document.getElementById('design-modal');
    const btnDesignClose = document.getElementById('btn-design-close');
    const designCards = document.querySelectorAll('.design-card');

    const themes = {
        classic: {
            '--bg-body': '#f4f6f8',
            '--bg-container': '#ffffff',
            '--primary-color': '#0078d7',
            '--primary-hover': '#005a9e',
            '--secondary-bg': '#e2e8f0',
            '--secondary-bg-hover': '#cbd5e1',
            '--secondary-text': '#334155',
            '--accent-green': '#28a745',
            '--accent-green-hover': '#218838',
            '--border-color': '#cbd5e1',
            '--border-light': '#e2e8f0',
            '--text-main': '#0f172a',
            '--text-secondary': '#475569',
            '--header-bg': '#f1f5f9',
            '--floor-header-bg': '#e6f7ff',
            '--floor-header-border': '#0078d7',
            '--zebra-even': '#f8fafc',
            '--input-focus-border': '#0078d7',
            '--input-hover-bg': 'rgba(0, 0, 0, 0.03)',
            '--shadow-color': 'rgba(0, 0, 0, 0.08)'
        },
        emerald: {
            '--bg-body': '#f0f4f1',
            '--bg-container': '#ffffff',
            '--primary-color': '#1b5e20',
            '--primary-hover': '#0c3a10',
            '--secondary-bg': '#e8f5e9',
            '--secondary-bg-hover': '#c8e6c9',
            '--secondary-text': '#1b5e20',
            '--accent-green': '#2e7d32',
            '--accent-green-hover': '#1b5e20',
            '--border-color': '#cbd6cb',
            '--border-light': '#e8ece9',
            '--text-main': '#1b2e1e',
            '--text-secondary': '#3e5c43',
            '--header-bg': '#eaf0eb',
            '--floor-header-bg': '#e8f5e9',
            '--floor-header-border': '#1b5e20',
            '--zebra-even': '#f5f8f5',
            '--input-focus-border': '#1b5e20',
            '--input-hover-bg': 'rgba(0, 0, 0, 0.03)',
            '--shadow-color': 'rgba(27, 94, 32, 0.06)'
        },
        nordic: {
            '--bg-body': '#eef1f6',
            '--bg-container': '#ffffff',
            '--primary-color': '#2d3748',
            '--primary-hover': '#1a202c',
            '--secondary-bg': '#edf2f7',
            '--secondary-bg-hover': '#e2e8f0',
            '--secondary-text': '#2d3748',
            '--accent-green': '#38a169',
            '--accent-green-hover': '#2f855a',
            '--border-color': '#d2d6dc',
            '--border-light': '#edf2f7',
            '--text-main': '#1a202c',
            '--text-secondary': '#4a5568',
            '--header-bg': '#edf2f7',
            '--floor-header-bg': '#f7fafc',
            '--floor-header-border': '#4a5568',
            '--zebra-even': '#f7fafc',
            '--input-focus-border': '#2d3748',
            '--input-hover-bg': 'rgba(0, 0, 0, 0.03)',
            '--shadow-color': 'rgba(45, 55, 72, 0.08)'
        },
        sunset: {
            '--bg-body': '#faf6f0',
            '--bg-container': '#ffffff',
            '--primary-color': '#c2410c',
            '--primary-hover': '#9a3412',
            '--secondary-bg': '#ffedd5',
            '--secondary-bg-hover': '#fed7aa',
            '--secondary-text': '#c2410c',
            '--accent-green': '#ea580c',
            '--accent-green-hover': '#c2410c',
            '--border-color': '#e5d5c5',
            '--border-light': '#f5ebe0',
            '--text-main': '#272522',
            '--text-secondary': '#5c5752',
            '--header-bg': '#f7efe5',
            '--floor-header-bg': '#ffedd5',
            '--floor-header-border': '#c2410c',
            '--zebra-even': '#fffaf5',
            '--input-focus-border': '#c2410c',
            '--input-hover-bg': 'rgba(0, 0, 0, 0.03)',
            '--shadow-color': 'rgba(194, 65, 12, 0.05)'
        },
        obsidian: {
            '--bg-body': '#0f172a',
            '--bg-container': '#1e293b',
            '--primary-color': '#38bdf8',
            '--primary-hover': '#0284c7',
            '--secondary-bg': '#334155',
            '--secondary-bg-hover': '#475569',
            '--secondary-text': '#f8fafc',
            '--accent-green': '#10b981',
            '--accent-green-hover': '#059669',
            '--border-color': '#334155',
            '--border-light': '#1e293b',
            '--text-main': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--header-bg': '#0f172a',
            '--floor-header-bg': '#334155',
            '--floor-header-border': '#38bdf8',
            '--zebra-even': '#1e293b',
            '--input-focus-border': '#38bdf8',
            '--input-hover-bg': 'rgba(255, 255, 255, 0.05)',
            '--shadow-color': 'rgba(0, 0, 0, 0.3)'
        }
    };

    function applyTheme(themeName) {
        const selectedTheme = themes[themeName] || themes.classic;
        Object.keys(selectedTheme).forEach(key => {
            document.documentElement.style.setProperty(key, selectedTheme[key]);
        });
        
        designCards.forEach(card => {
            const activeIndicator = card.querySelector('.active-indicator');
            if (card.dataset.theme === themeName) {
                card.style.borderColor = 'var(--primary-color)';
                card.style.boxShadow = '0 0 6px var(--shadow-color)';
                if (activeIndicator) activeIndicator.style.display = 'block';
            } else {
                card.style.borderColor = 'var(--border-color)';
                card.style.boxShadow = 'none';
                if (activeIndicator) activeIndicator.style.display = 'none';
            }
        });
        
        localStorage.setItem('fbhTheme', themeName);
    }

    if (btnDesign) {
        btnDesign.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            const currentTheme = localStorage.getItem('fbhTheme') || 'classic';
            applyTheme(currentTheme);
            designModal.classList.remove('hidden');
        });
    }

    if (btnDesignClose) {
        btnDesignClose.addEventListener('click', () => {
            designModal.classList.add('hidden');
        });
    }

    if (designModal) {
        designModal.addEventListener('click', (e) => {
            if (e.target === designModal) {
                designModal.classList.add('hidden');
            }
        });
    }

    designCards.forEach(card => {
        card.addEventListener('click', () => {
            const selectedTheme = card.dataset.theme;
            applyTheme(selectedTheme);
        });
    });

    // Apply saved theme immediately on load
    const savedThemeName = localStorage.getItem('fbhTheme') || 'classic';
    applyTheme(savedThemeName);

    // --- PDF Report Logic ---
    const btnPrintReport = document.getElementById('btn-print-report');
    const btnDirectPdf = document.getElementById('btn-direct-pdf');
    const reportModal = document.getElementById('report-modal');
    const btnReportCancel = document.getElementById('btn-report-cancel');
    const btnReportGenerate = document.getElementById('btn-report-generate');
    const radioScopeAll = document.getElementById('scope-all');
    const radioScopeSelected = document.getElementById('scope-selected');
    const reportFloorSelectContainer = document.getElementById('report-floor-select');
    const reportFloorList = document.getElementById('report-floor-list');
    const optShowDetails = document.getElementById('opt-show-details');
    const optCompactMode = document.getElementById('opt-compact-mode');

    let pdfMode = 'print'; // 'print' or 'download'

    // Function to gather current data dynamically from the table inputs
    function getCurrentProjectData() {
        const data = {
            objektBez: document.getElementById('objekt-bez').value,
            settings: {
                schieneFactor: inputSettingSchiene ? parseFloat(inputSettingSchiene.value) : 1.0,
                klipsDist: inputSettingKlips ? parseFloat(inputSettingKlips.value) : 0.5,
                targetLen: inputSettingTarget ? parseFloat(inputSettingTarget.value) : 100,
                maxOver: inputSettingMaxOver ? parseFloat(inputSettingMaxOver.value) : 0,
                allowedDistributorTypes: getSelectedDistributorTypesFromUI(),
                allowedCabinets: getSelectedCabinetTypesFromUI(),
                allowedConnections: getSelectedConnectionTypesFromUI(),
                primaryConnection: document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz',
                primaryConnectionHor: document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz',
                primaryConnectionVer: document.getElementById('vconfig-primary-connection-ver')?.value || 'anschluss_vert',
                withWmz: document.getElementById('cb-vconfig-wmz')?.checked || false
            },
            floors: []
        };
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach(fb => {
            const btnRz = fb.querySelector('.btn-toggle-rz');
            const cbHor = fb.querySelector('.cb-floor-hor');
            const selConn = fb.querySelector('.select-floor-conn');
            const selKasten = fb.querySelector('.select-floor-kasten');
            const floor = {
                bezFbhv: fb.querySelector('.input-fbhv-name').value,
                ebene: fb.querySelector('.input-floor-name').value,
                rzActive: btnRz ? btnRz.classList.contains('active') : true,
                connOrientation: (cbHor && cbHor.checked) ? 'hor' : 'ver',
                selectedConnKey: selConn ? selConn.value : 'auto',
                selectedKastenKey: selKasten ? selKasten.value : 'auto',
                rooms: []
            };
            const roomRows = fb.querySelectorAll('tr.room-row');
            roomRows.forEach(tr => {
                const totalPipe = parseFloat(tr.querySelector('.input-sum').value) || 0;
                const rings = parseInt(tr.querySelector('.input-rings').value) || 0;
                floor.rooms.push({
                    name: tr.querySelector('.input-room-name').value,
                    vaRz: tr.querySelector('.input-va-rz').value,
                    areaRz: tr.querySelector('.input-area').value,
                    vaIz: tr.querySelector('.input-va-iz').value,
                    areaIz: tr.querySelector('.input-area-iz').value,
                    thermostat: tr.querySelector('.input-check-thermostat').checked,
                    antrieb: tr.querySelector('.input-check-antrieb').checked,
                    isCombined: tr.querySelector('.input-check-iz').checked,
                    targetLen: tr.querySelector('.input-target').value,
                    fugen: tr.querySelector('.input-fugen').value,
                    dist: tr.querySelector('.input-dist').value,
                    totalPipe: totalPipe,
                    rings: rings,
                    cadId: tr.dataset.cadId || ""
                });
            });
            data.floors.push(floor);
        });
        return data;
    }

    function openReportModal(mode) {
        pdfMode = mode;
        const projectData = getCurrentProjectData();
        reportFloorList.innerHTML = '';
        
        if (projectData.floors.length === 0) {
            reportFloorList.innerHTML = '<p style="color: #999; font-style: italic; font-size: 0.9em; margin: 0;">Keine Geschosse vorhanden.</p>';
        } else {
            projectData.floors.forEach((floor, idx) => {
                const div = document.createElement('div');
                div.style.marginBottom = '6px';
                
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '8px';
                label.style.cursor = 'pointer';
                label.style.fontWeight = 'normal';
                
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.name = 'report-floor-item';
                cb.value = idx;
                cb.checked = true;
                
                const textSpan = document.createElement('span');
                const ebeneName = floor.ebene || `Geschoss ${idx + 1}`;
                const fbhvName = floor.bezFbhv ? ` (Verteiler: ${floor.bezFbhv})` : '';
                textSpan.textContent = `${ebeneName}${fbhvName}`;
                
                label.appendChild(cb);
                label.appendChild(textSpan);
                div.appendChild(label);
                reportFloorList.appendChild(div);
            });
        }
        
        radioScopeAll.checked = true;
        updateFloorScopeUI();
        reportModal.classList.remove('hidden');
    }

    if (btnPrintReport) {
        btnPrintReport.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            openReportModal('print');
        });
    }

    function updateFloorScopeUI() {
        if (!reportFloorSelectContainer) return;
        if (radioScopeAll && radioScopeAll.checked) {
            reportFloorSelectContainer.style.opacity = '0.5';
            reportFloorSelectContainer.style.pointerEvents = 'none';
        } else {
            reportFloorSelectContainer.style.opacity = '1';
            reportFloorSelectContainer.style.pointerEvents = 'auto';
        }
    }

    if (radioScopeAll) radioScopeAll.addEventListener('change', updateFloorScopeUI);
    if (radioScopeSelected) radioScopeSelected.addEventListener('change', updateFloorScopeUI);

    if (btnReportCancel) {
        btnReportCancel.addEventListener('click', () => {
            reportModal.classList.add('hidden');
        });
    }

    if (reportModal) {
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) {
                reportModal.classList.add('hidden');
            }
        });
    }

    if (btnReportGenerate) {
        btnReportGenerate.addEventListener('click', async () => {
            const projectData = getCurrentProjectData();
            
            const selectedIndices = [];
            if (radioScopeAll && radioScopeAll.checked) {
                projectData.floors.forEach((_, idx) => selectedIndices.push(idx));
            } else {
                const checkedCbs = document.querySelectorAll('input[name="report-floor-item"]:checked');
                checkedCbs.forEach(cb => selectedIndices.push(parseInt(cb.value)));
            }
            
            if (selectedIndices.length === 0) {
                alert("Bitte wählen Sie mindestens ein Geschoss aus!");
                return;
            }
            
            let totalArea = 0;
            let totalPipe = 0;
            let totalAntriebe = 0;
            let totalThermostate = 0;
            const verteilerCounts = {};
            
            const selectedFloorsData = selectedIndices.map(idx => {
                const floor = projectData.floors[idx];
                let floorRings = 0;
                let floorThermostats = 0;
                let floorAntriebe = 0;
                let floorAreaRz = 0;
                let floorAreaIz = 0;
                let floorFugen = 0;
                let floorDist = 0;
                let floorPipe = 0;
                
                floor.rooms.forEach(room => {
                    const areaRz = parseFloat(room.areaRz) || 0;
                    const areaIz = parseFloat(room.areaIz) || 0;
                    const pipeSum = parseFloat(room.totalPipe) || 0;
                    const rings = parseInt(room.rings) || 0;
                    
                    totalArea += areaRz + areaIz;
                    totalPipe += pipeSum;
                    floorRings += rings;
                    
                    floorAreaRz += areaRz;
                    floorAreaIz += areaIz;
                    floorFugen += parseInt(room.fugen) || 0;
                    floorDist += parseFloat(room.dist) || 0;
                    floorPipe += pipeSum;
                    
                    if (room.antrieb) {
                        const antriebCount = room.isCombined ? 1 : Math.max(1, rings);
                        totalAntriebe += antriebCount;
                        floorAntriebe += antriebCount;
                    }
                    if (room.thermostat) {
                        totalThermostate++;
                        floorThermostats++;
                    }
                });
                
                if (floorRings > 0) {
                    verteilerCounts[floorRings] = (verteilerCounts[floorRings] || 0) + 1;
                }
                
                return {
                    ...floor,
                    floorRings,
                    floorThermostats,
                    floorAntriebe,
                    floorAreaRz,
                    floorAreaIz,
                    floorFugen,
                    floorDist,
                    floorPipe
                };
            });
            
            const schieneFactor = projectData.settings.schieneFactor || 1.0;
            const klipsDistM = projectData.settings.klipsDist || 0.5;
            
            const totalSchiene = totalArea * schieneFactor;
            let totalKlips = 0;
            if (klipsDistM > 0) {
                totalKlips = Math.ceil(totalPipe / klipsDistM);
            }
            
            const optIncludeBOM = document.getElementById('opt-include-bom');
            const includeBOM = optIncludeBOM ? optIncludeBOM.checked : true;
            
            const showDetails = optShowDetails ? optShowDetails.checked : true;
            const compactMode = optCompactMode ? optCompactMode.checked : true;
            
            const bomVerteiler = {};
            const bomErweiterungen = {};
            const bomKaesten = {};
            const bomAnschlussSets = {};
            
            let totalFugen = 0;
            
            const distTypesGlobal = getSelectedDistributorTypesFromUI();
            const vTypeGlobal = distTypesGlobal.length > 0 ? distTypesGlobal[0] : 'metalplast';
            const db = window.FBHV_DATABASE;
            const noWmzActive = !document.getElementById('cb-vconfig-wmz')?.checked;
            
            const horToVerMap = {
                'stramax_horiz': 'stramax_vert',
                'anschluss_horiz': 'anschluss_vert',
                'wmz_horiz': 'wmz_vert',
                'metalplast_wmz_horiz': 'metalplast_wmz_vert',
                'oventrop_hycocon_horiz': 'oventrop_hycocon_vert',
                'oventrop_cocon_horiz': 'oventrop_cocon_vert',
                'danfoss_horiz': 'danfoss_vert'
            };
            const verToHorMap = {
                'stramax_vert': 'stramax_horiz',
                'anschluss_vert': 'anschluss_horiz',
                'wmz_vert': 'wmz_horiz',
                'metalplast_wmz_vert': 'metalplast_wmz_horiz',
                'oventrop_hycocon_vert': 'oventrop_hycocon_horiz',
                'oventrop_cocon_vert': 'oventrop_cocon_horiz',
                'danfoss_vert': 'danfoss_horiz'
            };

            // Smart Page Packing: Calculate heights to determine if 2 floor blocks fit on 1 page without splitting
            const MAX_PAGE_HEIGHT = 580;
            const DOC_HEADER_HEIGHT = 65;
            let runningPageHeight = DOC_HEADER_HEIGHT;

            const floorLayoutList = selectedFloorsData.map((floor, idx) => {
                const roomCount = floor.rooms ? floor.rooms.length : 0;
                const blockHeight = 145 + (roomCount * 25);
                
                let breakBefore = false;
                if (idx === 0) {
                    runningPageHeight += blockHeight;
                    breakBefore = false;
                } else {
                    const spacing = 18;
                    if (runningPageHeight + spacing + blockHeight <= MAX_PAGE_HEIGHT) {
                        runningPageHeight += spacing + blockHeight;
                        breakBefore = false;
                    } else {
                        runningPageHeight = blockHeight;
                        breakBefore = true;
                    }
                }
                return { floor, blockHeight, breakBefore };
            });

            let floorsHTML = '';
            if (showDetails) {
                floorLayoutList.forEach(({ floor, breakBefore }, floorIdx) => {
                    totalFugen += floor.floorFugen || 0;
                    
                    // Determine connection set & cabinet recommendation for this specific floor
                    let connToUse = floor.selectedConnKey || 'auto';
                    if (connToUse === 'auto') {
                        const orientation = floor.connOrientation || 'hor';
                        let primaryConn = (orientation === 'hor') 
                            ? (document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz')
                            : (document.getElementById('vconfig-primary-connection-ver')?.value || 'anschluss_vert');
                            
                        if (orientation === 'ver' && horToVerMap[primaryConn]) {
                            connToUse = horToVerMap[primaryConn];
                        } else if (orientation === 'hor' && verToHorMap[primaryConn]) {
                            connToUse = verToHorMap[primaryConn];
                        } else {
                            connToUse = primaryConn;
                        }
                        
                        if (noWmzActive) {
                            const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
                            if (setObj && setObj.isWmz) {
                                connToUse = (orientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
                            }
                        }
                    }
                    
                    const kastenKey = floor.selectedKastenKey || 'auto';
                    const allowedCabs = (kastenKey && kastenKey !== 'auto') ? [kastenKey] : getSelectedCabinetTypesFromUI();
                    const rec = db.getRecommendation(vTypeGlobal, connToUse, floor.floorRings > 0 ? floor.floorRings : 2, allowedCabs);
                    
                    const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
                    const connName = rec ? rec.connectionSetName : (setObj ? setObj.name : 'Anschluss-Set horizontal');
                    
                    let kastenFull = 'Kein Kasten gewählt';
                    let cabObj = null;
                    let reqIndex = '-';
                    if (rec && rec.matchingCabinets && rec.matchingCabinets.length > 0) {
                        cabObj = rec.matchingCabinets[0];
                        reqIndex = rec.requiredIndex;
                        const depthStr = cabObj.depth > 0 ? `${cabObj.depth} mm` : 'Fronttür';
                        const heightStr = cabObj.height || '750-850 mm';
                        kastenFull = `${cabObj.shortName} | Index ${reqIndex} | B: ${cabObj.width} mm × H: ${heightStr} × T: ${depthStr} (L: ${rec.manifoldLength} mm)${cabObj.articleNo ? ' | Art.-Nr. ' + cabObj.articleNo : ''}`;
                    } else if (rec) {
                        reqIndex = rec.requiredIndex;
                        kastenFull = `Index ${reqIndex} | B ≥ ${rec.minWidth} mm (L: ${rec.manifoldLength} mm) | Kein passendes Modell`;
                    }
                    
                    // Accumulate into BOM dictionaries if rings > 0
                    if (floor.floorRings > 0) {
                        const vTypeName = (vTypeGlobal === 'stramax') ? 'Stramax Messing-Verteiler 1"' : 'metalplast Inox-Verteiler 1"';
                        if (floor.floorRings <= 12) {
                            const vKey = `${vTypeName} ${floor.floorRings}-fach`;
                            if (!bomVerteiler[vKey]) {
                                bomVerteiler[vKey] = { name: vKey, count: 0, rings: floor.floorRings, vType: vTypeGlobal };
                            }
                            bomVerteiler[vKey].count++;
                        } else {
                            const vKeyBase = `${vTypeName} 12-fach`;
                            if (!bomVerteiler[vKeyBase]) {
                                bomVerteiler[vKeyBase] = { name: vKeyBase, count: 0, rings: 12, vType: vTypeGlobal };
                            }
                            bomVerteiler[vKeyBase].count++;
                            
                            const extraRings = floor.floorRings - 12;
                            const extraKey = `Verteiler-Erweiterung 1-fach (${vTypeGlobal === 'stramax' ? 'Messing' : 'Edelstahl Inox'})`;
                            if (!bomErweiterungen[extraKey]) {
                                bomErweiterungen[extraKey] = { name: extraKey, count: 0, vType: vTypeGlobal };
                            }
                            bomErweiterungen[extraKey].count += extraRings;
                        }
                    }
                    
                    if (cabObj) {
                        const cabKey = `${cabObj.name} (Index ${reqIndex}, B: ${cabObj.width}mm, Art. ${cabObj.articleNo})`;
                        if (!bomKaesten[cabKey]) {
                            bomKaesten[cabKey] = {
                                name: cabObj.name,
                                shortName: cabObj.shortName,
                                index: reqIndex,
                                width: cabObj.width,
                                articleNo: cabObj.articleNo,
                                count: 0
                            };
                        }
                        bomKaesten[cabKey].count++;
                    }
                    
                    if (connName) {
                        const artStr = (setObj && setObj.articles && setObj.articles.length > 0) ? setObj.articles.join('/') : '';
                        const connKey = `${connName}${artStr ? ' (' + artStr + ')' : ''}`;
                        if (!bomAnschlussSets[connKey]) {
                            bomAnschlussSets[connKey] = { name: connName, articles: artStr, count: 0 };
                        }
                        bomAnschlussSets[connKey].count++;
                    }

                    const pageBreakClass = breakBefore ? 'break-before-page' : '';
                    const pageBreakInline = breakBefore ? 'page-break-before: always; break-before: page; margin-top: 0 !important;' : 'margin-top: 0 !important;';

                    floorsHTML += `
                    <div class="floor-card-block ${pageBreakClass}" style="${pageBreakInline} margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #fff;">
                        <!-- Floor Header Table (Standard HTML table for flawless print page-break handling) -->
                        <table style="width: 100%; border-collapse: collapse; background: #f0f9ff; border-bottom: 2px solid #0078d7;">
                            <tr>
                                <td style="padding: 8px 12px; text-align: left; vertical-align: middle;">
                                    <div style="font-size: 10.5pt; font-weight: 700; color: #0078d7; display: inline-flex; align-items: center; gap: 8px;">
                                        ${floor.bezFbhv ? `<span style="background: #0078d7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold;">${floor.bezFbhv}</span>` : ''}
                                        <span>Geschoss: <strong>${floor.ebene || 'Ebene'}</strong></span>
                                    </div>
                                </td>
                                <td style="padding: 8px 12px; text-align: right; vertical-align: middle;">
                                    <div style="font-size: 8.5pt; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 3px 10px; border-radius: 4px; border: 1px solid #bae6fd; display: inline-block;">
                                        🔌 Anschluss-Set: <strong>${connName}</strong>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 0 12px 8px 12px;">
                                    <div style="font-size: 8.5pt; color: #0f172a; background: #ffffff; padding: 4px 10px; border-radius: 4px; border: 1px solid #bae6fd; font-weight: 600;">
                                        📦 Verteilerkasten: ${kastenFull}
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <table class="data-table" style="margin-bottom: 0; border: none;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; width: 20%;">Raum</th>
                                    <th style="width: 13%;">Randzone (Rz)<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">VA / Fläche</span></th>
                                    <th style="width: 13%;">Innenzone (Iz)<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">VA / Fläche</span></th>
                                    <th style="width: 6%;">Komb.<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Rz+Iz</span></th>
                                    <th style="width: 8%;">RT / SA<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Ther./Antr.</span></th>
                                    <th style="width: 8%;">Anb.<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Länge</span></th>
                                    <th style="width: 7%;">Fugen<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Anzahl</span></th>
                                    <th style="width: 9%;">Rohr ges.<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Meter</span></th>
                                    <th style="width: 9%;">Ringe<br><span style="font-size: 7.5pt; font-weight: normal; color: #64748b;">Anzahl</span></th>
                                    <th style="width: 7%;">Zus. Ring</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    
                    if (floor.rooms.length === 0) {
                        floorsHTML += `<tr><td colspan="10" class="text-center" style="color: #64748b; font-style: italic;">Keine Räume eingetragen</td></tr>`;
                    } else {
                        floor.rooms.forEach(room => {
                            const areaRz = parseFloat(room.areaRz) || 0;
                            const vaRz = parseFloat(room.vaRz) || 0;
                            const rzText = areaRz > 0 ? `${vaRz} cm / ${areaRz.toFixed(2)} m²` : '&mdash;';
                            
                            const areaIz = parseFloat(room.areaIz) || 0;
                            const vaIz = parseFloat(room.vaIz) || 0;
                            const izText = areaIz > 0 ? `${vaIz} cm / ${areaIz.toFixed(2)} m²` : '&mdash;';
                            
                            const kombText = room.isCombined ? 'Ja' : 'Nein';
                            const rtText = room.thermostat ? '✔' : '✖';
                            const saText = room.antrieb ? '✔' : '✖';
                            
                            const distText = room.dist ? `${room.dist} m` : '0 m';
                            const fugenText = parseInt(room.fugen) > 0 ? `${room.fugen} Stk` : '&mdash;';
                            
                            floorsHTML += `
                                <tr>
                                    <td class="text-left" style="font-weight: 500;">${room.name || 'Raumbezeichnung'}</td>
                                    <td class="text-center">${rzText}</td>
                                    <td class="text-center">${izText}</td>
                                    <td class="text-center">${kombText}</td>
                                    <td class="text-center" style="letter-spacing: 2px;">${rtText} / ${saText}</td>
                                    <td class="text-center">${distText}</td>
                                    <td class="text-center">${fugenText}</td>
                                    <td class="text-right" style="font-weight: 600;">${parseFloat(room.totalPipe).toFixed(2)} m</td>
                                    <td class="text-center" style="font-weight: 600; background-color: #f0fdf4;">${room.rings}</td>
                                    <td class="text-center"></td>
                                </tr>
                            `;
                        });
                        
                        const vertText = floor.floorRings === 0 ? '0-fach' : (floor.floorRings <= 12 ? `${floor.floorRings}-fach` : '12-fach');
                        const erweitText = floor.floorRings > 12 ? `+ ${floor.floorRings - 12}` : '';
                        floorsHTML += `
                            <tr class="floor-section-header">
                                <td class="text-left" style="font-weight: bold; color: #0078d7;">Summe / Verteiler</td>
                                <td class="text-center" style="font-weight: bold;">${floor.floorAreaRz > 0 ? floor.floorAreaRz.toFixed(2) + ' m²' : '&mdash;'}</td>
                                <td class="text-center" style="font-weight: bold;">${floor.floorAreaIz > 0 ? floor.floorAreaIz.toFixed(2) + ' m²' : '&mdash;'}</td>
                                <td></td>
                                <td class="text-center" style="font-weight: bold;">${floor.floorThermostats} RT / ${floor.floorAntriebe} SA</td>
                                <td class="text-center" style="font-weight: bold;">${floor.floorDist > 0 ? floor.floorDist + ' m' : '&mdash;'}</td>
                                <td class="text-center" style="font-weight: bold;">${floor.floorFugen > 0 ? floor.floorFugen + ' Stk' : '&mdash;'}</td>
                                <td class="text-right" style="font-weight: bold; color: #0078d7;">${floor.floorPipe.toFixed(2)} m</td>
                                <td class="text-center" style="background-color: #cbd5e1 !important; font-weight: bold; color: #1e293b;">${vertText}</td>
                                <td class="text-center" style="background-color: #cbd5e1 !important; font-weight: bold; color: #1e293b;">${erweitText}</td>
                            </tr>
                        `;
                    }
                    
                    floorsHTML += `
                            </tbody>
                        </table>
                    </div>
                    `;
                });
            }
            
            const objektBezVal = projectData.objektBez || 'Keine Angabe';
            const dateStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            let bomHTML = '';
            if (includeBOM) {
                const vertRows = Object.values(bomVerteiler).map(item => `
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">${item.name}</td>
                        <td class="text-center" style="color: #475569;">${item.vType === 'stramax' ? 'Stramax Messing 1"' : 'metalplast Edelstahl Inox 1"'}</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${item.count} Stk</td>
                    </tr>
                `).join('');

                const erweitRows = Object.values(bomErweiterungen).map(item => `
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #d35400;">${item.name}</td>
                        <td class="text-center" style="color: #475569;">Erweiterungs-Kit für Verteiler > 12-fach</td>
                        <td class="text-right" style="font-weight: 700; color: #d35400; font-size: 9.5pt;">${item.count} Stk</td>
                    </tr>
                `).join('');

                const kastenRows = Object.values(bomKaesten).map(item => `
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">${item.name}</td>
                        <td class="text-center" style="color: #475569;">Index ${item.index} | B: ${item.width} mm${item.articleNo ? ' | Art.-Nr. ' + item.articleNo : ''}</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${item.count} Stk</td>
                    </tr>
                `).join('');

                const connRows = Object.values(bomAnschlussSets).map(item => `
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">${item.name}</td>
                        <td class="text-center" style="color: #475569;">${item.articles ? 'Art.-Nr. ' + item.articles : 'Standard Garnitur'}</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${item.count} Stk</td>
                    </tr>
                `).join('');

                bomHTML = `
        <!-- Dynamic BOM / Piece-Count Section for Calculation Software -->
        <div style="margin-top: 25px; page-break-before: always; break-before: page; page-break-inside: avoid;">
            <div style="border-bottom: 3px solid #0078d7; padding-bottom: 8px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h2 style="margin: 0; color: #0078d7; font-size: 14pt; font-weight: 700; text-transform: uppercase;">
                        📋 Material-Stückliste (Kalkulations-Summen)
                    </h2>
                    <div style="font-size: 8.5pt; color: #64748b; margin-top: 3px;">
                        Aggregierte Summen aller gleichen Bauteile für den direkten Übertrag in Kalkulations- & Angebotsprogramme
                    </div>
                </div>
                <div style="font-size: 8.5pt; color: #0f172a; text-align: right;">
                    Objekt: <strong>${objektBezVal}</strong> &bull; Datum: <strong>${dateStr}</strong>
                </div>
            </div>

            <!-- Group 1: Verteiler, Kästen & Anschluss-Sets -->
            <h3 style="color: #0f172a; font-size: 10.5pt; font-weight: 700; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px;">
                1. Heizkreisverteiler, Verteilerkästen & Anschluss-Sets
            </h3>
            <table class="data-table" style="width: 100%; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 45%;">Bauteil / Material</th>
                        <th style="text-align: center; width: 35%;">Spezifikation / Artikelnummer</th>
                        <th style="text-align: right; width: 20%;">Menge (Gesamt)</th>
                    </tr>
                </thead>
                <tbody>
                    ${vertRows || `<tr><td colspan="3" class="text-center" style="color:#64748b; font-style:italic;">Keine Heizkreisverteiler erforderlich</td></tr>`}
                    ${erweitRows}
                    ${kastenRows || `<tr><td colspan="3" class="text-center" style="color:#64748b; font-style:italic;">Keine Verteilerkästen ausgewählt</td></tr>`}
                    ${connRows || `<tr><td colspan="3" class="text-center" style="color:#64748b; font-style:italic;">Keine Anschluss-Sets ausgewählt</td></tr>`}
                </tbody>
            </table>

            <!-- Group 2: FBH-Rohr, Schienen & Befestigung -->
            <h3 style="color: #0f172a; font-size: 10.5pt; font-weight: 700; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px;">
                2. FBH-Rohr, Verlegematerial & Zubehör
            </h3>
            <table class="data-table" style="width: 100%; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 45%;">Materialbezeichnung</th>
                        <th style="text-align: center; width: 35%;">Berechnungsgrundlage</th>
                        <th style="text-align: right; width: 20%;">Menge (Gesamt)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">FBH-Systemrohr (z.B. 16 x 2.0 mm)</td>
                        <td class="text-center" style="color: #475569;">Gesamtrohrlänge (Heizkreise + Anbindungen)</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalPipe.toFixed(2)} m</td>
                    </tr>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">Verlegeschienen / Klemmschienen</td>
                        <td class="text-center" style="color: #475569;">Faktor ${schieneFactor.toFixed(1)} lfm / m² Fläche</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalSchiene.toFixed(2)} lfm</td>
                    </tr>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">Befestigungsklips / Tackerclips</td>
                        <td class="text-center" style="color: #475569;">Abstand ca. ${klipsDistM.toFixed(1)} m</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalKlips} Stk</td>
                    </tr>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">Fugen-Schutzschläuche / Profilstücke</td>
                        <td class="text-center" style="color: #475569;">Dehnfugen-Durchführungen</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalFugen} Stk</td>
                    </tr>
                </tbody>
            </table>

            <!-- Group 3: Einzelraumregelung -->
            <h3 style="color: #0f172a; font-size: 10.5pt; font-weight: 700; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-top: 15px; margin-bottom: 8px;">
                3. Elektro- & Einzelraumregelung
            </h3>
            <table class="data-table" style="width: 100%; margin-bottom: 10px;">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 45%;">Komponente</th>
                        <th style="text-align: center; width: 35%;">Spezifikation / Funktion</th>
                        <th style="text-align: right; width: 20%;">Menge (Gesamt)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">Raumthermostate (RT)</td>
                        <td class="text-center" style="color: #475569;">Einzelraumtemperatur-Regler (230V / 24V)</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalThermostate} Stk</td>
                    </tr>
                    <tr>
                        <td class="text-left" style="font-weight: 600; color: #0f172a;">Stellantriebe (SA)</td>
                        <td class="text-center" style="color: #475569;">Elektrothermische Stellantriebe (NC)</td>
                        <td class="text-right" style="font-weight: 700; color: #0078d7; font-size: 9.5pt;">${totalAntriebe} Stk</td>
                    </tr>
                </tbody>
            </table>
        </div>
                `;
            }

            const styleHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @page { size: A4 landscape; margin: 10mm; }
        
        body, .report-pdf-body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            background-color: #fff;
            margin: 0;
            padding: 15px;
            font-size: 10pt;
            line-height: 1.4;
        }
        
        /* Layout modes */
        .compact-mode {
            font-size: 8.5pt;
            line-height: 1.3;
            padding: 5px;
        }
        
        .compact-mode h1 { font-size: 14pt; margin-bottom: 5px; }
        .compact-mode h2 { font-size: 11pt; margin-top: 10px; margin-bottom: 5px; }
        .compact-mode h3 { font-size: 9.5pt; margin-top: 8px; margin-bottom: 4px; }
        .compact-mode th { padding: 4px 6px; font-size: 7.5pt !important; }
        .compact-mode td { padding: 4px 6px; font-size: 7.5pt !important; }
        .compact-mode .summary-box { padding: 8px; margin-bottom: 10px; }
        
        /* Core Elements */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border-bottom: 3px solid #0078d7;
        }
        .header-table td {
            border: none;
            padding: 5px 0;
            vertical-align: bottom;
        }
        .header-title {
            font-size: 16pt;
            font-weight: 700;
            color: #0078d7;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header-meta {
            text-align: right;
            font-size: 8.5pt;
            color: #64748b;
            line-height: 1.4;
        }
        .header-meta strong {
            color: #0f172a;
        }
        
        /* Summary Box */
        .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .summary-title {
            font-weight: 700;
            font-size: 9pt;
            color: #475569;
            margin-top: 0;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }
        .summary-item {
            background-color: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
        }
        .summary-label {
            font-size: 8pt;
            color: #64748b;
            display: block;
            margin-bottom: 2px;
        }
        .summary-value {
            font-size: 11pt;
            font-weight: 700;
            color: #0f172a;
        }
        .summary-value .unit {
            font-weight: 400;
            font-size: 8.5pt;
            color: #64748b;
            margin-left: 2px;
        }
        
        .verteiler-box {
            grid-column: span 3;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 8px;
            margin-top: 5px;
        }
        .verteiler-title {
            font-weight: 600;
            font-size: 8.5pt;
            color: #475569;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        /* Table Styles */
        table.data-table {
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            font-weight: 600;
            font-size: 8pt;
            text-align: center;
            padding: 6px;
        }
        table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            font-size: 8pt;
            vertical-align: middle;
        }
        table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .floor-section-header {
            background-color: #f1f5f9 !important;
            font-weight: 700;
            color: #1e293b;
        }
        .floor-section-header:not(.floor-section-verteiler) td {
            border-bottom: hidden !important;
        }
        .floor-section-verteiler td {
            border-top: hidden !important;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            font-size: 8pt;
            color: #64748b;
            text-align: center;
        }
        
        /* Print rules */
        @media print {
            body {
                background-color: #fff;
                color: #000;
                padding: 0;
            }
            .no-print {
                display: none;
            }
            .page-break {
                page-break-before: always !important;
                break-before: page !important;
            }
            .floor-card-block {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-top: 0 !important;
            }
            .floor-card-block.break-before-page {
                page-break-before: always !important;
                break-before: page !important;
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
            table {
                page-break-inside: avoid !important;
            }
            tr {
                page-break-inside: avoid !important;
            }
        }
    </style>
            `;

            const bodyHTML = `
    <div class="report-pdf-body ${compactMode ? 'compact-mode' : ''}">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td>
                    <h1 class="header-title">FBH Material-Report</h1>
                    <div style="font-size: 8.5pt; color: #64748b; margin-top: 3px;">Erstellt mit FBH Material Rechner v3.0</div>
                </td>
                <td class="header-meta">
                    Objekt: <strong>${objektBezVal}</strong><br>
                    Datum: <strong>${dateStr}</strong>
                </td>
            </tr>
        </table>

        <!-- Details (Floors) -->
        ${floorsHTML}

        <!-- Total Summary Table at the end -->
        <div style="margin-top: 40px; page-break-inside: avoid;">
            <h3 style="border-bottom: 3px solid #0078d7; padding-bottom: 8px; color: #0f172a; font-size: 14pt; font-weight: 700; text-transform: uppercase; margin-bottom: 0;">
                Gesamtbedarf & Materialzusammenfassung
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: 'Inter', sans-serif;">
                <tbody>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt; width: 60%;">Gesamtfläche (Rand- & Innenzonen)</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalArea.toFixed(2)} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">m²</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt;">Gesamtrohrlänge</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalPipe.toFixed(2)} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">m</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt;">Verlegeschiene</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalSchiene.toFixed(2)} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">lfm</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt;">Befestigungsklips</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalKlips} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">Stk</span></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt;">Stellantriebe (SA)</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalAntriebe} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">Stk</span></td>
                    </tr>
                    <tr style="border-bottom: 2px solid #cbd5e1; background-color: #f8fafc;">
                        <td style="padding: 12px 8px; font-weight: 600; color: #475569; font-size: 10pt;">Raumthermostate (RT)</td>
                        <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 12pt; color: #0f172a;">${totalThermostate} <span style="font-size: 9pt; font-weight: normal; color: #64748b;">Stk</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${bomHTML}

        <!-- Footer -->
        <div class="footer">
            FBH Material Rechner &bull; Alle Angaben ohne Gewähr.
        </div>
    </div>
            `;

            const reportWindow = window.open('', '_blank');
            if (!reportWindow) {
                alert("Bitte erlauben Sie Popups für diese Seite, um den Report zu öffnen.");
                return;
            }
            
            const reportHTML = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>FBH Material-Report - ${objektBezVal}</title>
    ${styleHTML}
</head>
<body>
    ${bodyHTML}
    <!-- Auto Print Script -->
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
</body>
</html>
            `;
            
            reportWindow.document.write(reportHTML);
            reportWindow.document.close();
            reportModal.classList.add('hidden');
        });
    }

    // --- Import / Export Listeners ---
    if (btnExport) {
        btnExport.addEventListener('click', async (e) => {
            if (e.target.closest('.drag-handle')) return;
            debouncedSave.flush();
            const savedData = localStorage.getItem('fbhData');
            if (savedData) {
                let objName = document.getElementById('objekt-bez').value || 'Projekt';
                objName = objName.replace(/[^a-zA-Z0-9_\-]/g, '_');
                const defaultName = `FBH_${objName}.json`;

                if ('showSaveFilePicker' in window) {
                    try {
                        const pickerOpt = {
                            suggestedName: defaultName,
                            types: [{
                                description: 'Projektdatei (JSON)',
                                accept: {
                                    'application/json': ['.json']
                                }
                            }]
                        };
                        const handle = await window.showSaveFilePicker(pickerOpt);
                        const blob = new Blob([savedData], { type: 'application/json' });
                        const writable = await handle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                    } catch (err) {
                        // User cancelled the picker or closed it
                        console.log("Export abgebrochen: ", err);
                    }
                } else {
                    // Fallback to classic link download
                    const blob = new Blob([savedData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = defaultName;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            } else {
                alert("Keine Daten zum Exportieren vorhanden.");
            }
        });
    }

    if (btnImport && fileInput) {
        btnImport.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target.result);
                    loadData(data);
                    debouncedSave.flush();
                } catch (err) {
                    alert('Fehler beim Lesen der Datei! Ist es eine gültige Projektdatei?');
                }
                fileInput.value = ''; // clear
            };
            reader.readAsText(file);
        });
    }

    if (btnClearCache) {
        btnClearCache.addEventListener('click', async (e) => {
            if (e.target.closest('.drag-handle')) return;
            const confirmed = await showCustomConfirm(
                "Sie legen ein neues Projekt an.\n\n❓ WARUM DIESES FENSTER ERSCHEINT:\nDamit alle Ihre neuen Ergebnisse, Berichte und CAD-Daten direkt am richtigen Ort auf Ihrer Festplatte gespeichert werden, fordert die Anwendung Sie nun auf, Ihren Ziel-Projektordner festzulegen.\n\n👉 WAS ZU TUN IST:\n1. Klicken Sie unten auf '📁 Projektordner wählen'.\n2. Es öffnet sich der Dateibrowser – wählen Sie Ihren gewünschten Zielordner (z. B. g:\\FBH Mat\\FBH_Projekte) oder erstellen Sie einen neuen Ordner.",
                "🆕 Neues Projekt – Ordnerauswahl erforderlich",
                "📁 Projektordner wählen",
                "Abbrechen",
                false
            );
            if (confirmed) {
                localStorage.removeItem('fbhData');
                document.getElementById('objekt-bez').value = "";
                const existingFloors = document.querySelectorAll('tbody.floor-group');
                existingFloors.forEach(f => f.remove());
                floorCounter = 0;
                cadRoomPool = [];
                if (typeof renderCadPoolList === 'function') {
                    renderCadPoolList();
                }
                if (btnAddFloor) {
                    btnAddFloor.click();
                } else {
                    floorCounter++;
                    const fb = addNewFloor(floorCounter);
                    addRoomToFloor(fb);
                    calculateGlobalSum();
                    if (!isLoading) debouncedSave();
                }

                // Automatically trigger the directory selection browser dialog (equivalent to clicking Bild 1)
                await selectProjectDirectory();
            }
        });
    }


    // --- IndexedDB for File System Access API Handles ---
    const FBH_DB = {
        dbName: 'FBH_StorageDB',
        storeName: 'directory_handles',
        dbPromise: null,
        init() {
            if (!this.dbPromise) {
                this.dbPromise = new Promise((resolve, reject) => {
                    const req = indexedDB.open(this.dbName, 1);
                    req.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(this.storeName)) {
                            db.createObjectStore(this.storeName);
                        }
                    };
                    req.onsuccess = (e) => resolve(e.target.result);
                    req.onerror = (e) => reject(e.target.error);
                });
            }
            return this.dbPromise;
        },
        async setDirHandle(handle) {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const req = store.put(handle, 'projectDir');
                req.onsuccess = () => resolve();
                req.onerror = (e) => reject(e.target.error);
            });
        },
        async getDirHandle() {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const req = store.get('projectDir');
                req.onsuccess = (e) => resolve(e.target.result || null);
                req.onerror = (e) => reject(e.target.error);
            });
        },
        async clearDirHandle() {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                const req = store.delete('projectDir');
                req.onsuccess = () => resolve();
                req.onerror = (e) => reject(e.target.error);
            });
        }
    };

    // State for selected directory handle
    let projectDirectoryHandle = null;

    // Elements for folder feature
    const btnSelectFolder = document.getElementById('btn-select-folder');
    const folderStatusBadge = document.getElementById('folder-status-badge');
    const btnSaveToFolder = document.getElementById('btn-save-to-folder');
    const btnLoadFromFolder = document.getElementById('btn-load-from-folder');
    const folderFilesModal = document.getElementById('folder-files-modal');
    const btnFolderFilesClose = document.getElementById('btn-folder-files-close');
    const btnFolderFilesRefresh = document.getElementById('btn-folder-files-refresh');
    const folderFilesList = document.getElementById('folder-files-list');

    // Helper: Verify / Request Permission for Directory Handle
    async function verifyDirPermission(handle, readWrite = true) {
        const options = { mode: readWrite ? 'readwrite' : 'read' };
        try {
            if ((await handle.queryPermission(options)) === 'granted') {
                return true;
            }
            if ((await handle.requestPermission(options)) === 'granted') {
                return true;
            }
        } catch (e) {
            console.warn("Permission verification error:", e);
        }
        return false;
    }

    // Helper: Update UI for Directory State & Header Path Display
    function updateFolderUI() {
        const headerFolderName = document.getElementById('header-folder-name');
        const headerFolderBadge = document.getElementById('header-folder-badge');

        if (projectDirectoryHandle) {
            const folderName = projectDirectoryHandle.name || 'FBH_Projekte';
            let fullPath = localStorage.getItem('fbhFullPath');
            if (!fullPath) {
                fullPath = `g:\\FBH Mat\\${folderName}`;
            }

            if (headerFolderName) {
                headerFolderName.textContent = fullPath;
            }
            if (headerFolderBadge) {
                headerFolderBadge.title = `Aktueller Zielordner: ${fullPath} (Klicken zum Ändern)`;
            }
        } else {
            let defaultPath = localStorage.getItem('fbhFullPath') || 'g:\\FBH Mat\\FBH_Projekte';

            if (headerFolderName) {
                headerFolderName.textContent = defaultPath;
            }
        }
        updateActiveProjectFileDisplay();
    }

    function updateActiveProjectFileDisplay(customFileName = null) {
        const headerProjectFileName = document.getElementById('header-project-filename');
        if (!headerProjectFileName) return;

        if (customFileName) {
            let clean = customFileName.trim();
            if (!clean.toLowerCase().endsWith('.json')) clean += '.json';
            headerProjectFileName.textContent = clean;
            return;
        }

        const objInput = document.getElementById('objekt-bez');
        let objName = (objInput ? objInput.value : '').trim() || 'Projekt';
        objName = objName.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, '_').replace(/ /g, '_');
        const fileName = objName.toLowerCase().startsWith('fbh_') 
            ? `${objName}.json` 
            : `FBH_${objName}.json`;
            
        headerProjectFileName.textContent = fileName;
    }

    const objBezInput = document.getElementById('objekt-bez');
    if (objBezInput) {
        ['input', 'change'].forEach(evt => {
            objBezInput.addEventListener(evt, () => {
                updateActiveProjectFileDisplay();
            });
        });
    }

    const btnActiveProjectFile = document.getElementById('btn-active-project-file');
    if (btnActiveProjectFile) {
        btnActiveProjectFile.addEventListener('click', async (e) => {
            if (e.target.closest('.drag-handle')) return;
            if (!projectDirectoryHandle) {
                await selectProjectDirectory();
                if (!projectDirectoryHandle) return;
            }
            if (folderFilesModal) {
                folderFilesModal.classList.remove('hidden');
                refreshFolderFilesList();
            }
        });
    }

    // Header folder badge click event
    const headerFolderBadge = document.getElementById('header-folder-badge');
    if (headerFolderBadge) {
        headerFolderBadge.addEventListener('click', () => {
            if (projectDirectoryHandle) {
                if (folderFilesModal) {
                    folderFilesModal.classList.remove('hidden');
                    refreshFolderFilesList();
                }
            } else {
                selectProjectDirectory();
            }
        });
    }

    // Function: Pick Directory
    async function selectProjectDirectory() {
        if (!('showDirectoryPicker' in window)) {
            alert('Ihr Browser unterstützt die direkte Ordnerauswahl (File System Access API) leider nicht. Sie können stattdessen die normale Export/Import-Funktion nutzen.');
            return;
        }
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            projectDirectoryHandle = handle;
            const fullPath = `g:\\FBH Mat\\${handle.name}`;
            localStorage.setItem('fbhFullPath', fullPath);
            await FBH_DB.setDirHandle(handle);
            updateFolderUI();

            // Automatically open the folder files modal
            if (folderFilesModal) {
                folderFilesModal.classList.remove('hidden');
                refreshFolderFilesList();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("Ordnerauswahl Fehler:", err);
                alert("Fehler bei der Ordnerauswahl: " + err.message);
            }
        }
    }

    // Function: Save current project to selected folder
    async function saveProjectToFolder() {
        if (typeof calculateGlobalSum === 'function') calculateGlobalSum();
        if (typeof saveData === 'function') saveData();
        if (debouncedSave && typeof debouncedSave.flush === 'function') debouncedSave.flush();

        const savedData = localStorage.getItem('fbhData');
        if (!savedData) {
            alert('Keine Daten zum Speichern vorhanden.');
            return;
        }
        if (!projectDirectoryHandle) {
            const confirmed = await showCustomConfirm(
                "Sie möchten Ihr Projekt auf der Festplatte sichern.\n\n❓ WARUM DIESES FENSTER ERSCHEINT:\nDamit Ihre Projektdaten, Berechnungen und Berichte direkt am richtigen Ort auf Ihrer Festplatte gespeichert werden, fordert die Anwendung Sie nun auf, Ihren Ziel-Projektordner festzulegen.\n\n👉 WAS ZU TUN IST:\n1. Klicken Sie unten auf '📁 Projektordner wählen'.\n2. Es öffnet sich der Dateibrowser – wählen Sie Ihren gewünschten Zielordner (z. B. g:\\FBH Mat\\FBH_Projekte) oder erstellen Sie einen neuen Ordner.",
                "💾 Projekt sichern – Ordnerauswahl erforderlich",
                "📁 Projektordner wählen",
                "Abbrechen",
                false
            );

            if (!confirmed) return;

            await selectProjectDirectory();
            if (!projectDirectoryHandle) return;
        }

        try {
            const hasPermission = await verifyDirPermission(projectDirectoryHandle, true);
            if (!hasPermission) {
                alert('Keine Berechtigung zum Schreiben in den ausgewählten Ordner.');
                return;
            }
            let objName = document.getElementById('objekt-bez').value || 'Projekt';
            objName = objName.trim().replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, '_').replace(/ /g, '_');
            const fileName = objName.toLowerCase().startsWith('fbh_') 
                ? `${objName}.json` 
                : `FBH_${objName}.json`;

            const fileHandle = await projectDirectoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(savedData);
            await writable.close();

            // Visual feedback on button
            if (btnSaveToFolder) {
                const origHtml = btnSaveToFolder.innerHTML;
                btnSaveToFolder.innerHTML = '<span class="drag-handle">⋮⋮</span> ✔ Gesichert!';
                btnSaveToFolder.style.backgroundColor = '#10b981';
                btnSaveToFolder.style.color = '#ffffff';
                setTimeout(() => {
                    btnSaveToFolder.innerHTML = origHtml;
                    btnSaveToFolder.style.backgroundColor = '';
                    btnSaveToFolder.style.color = '';
                }, 2000);
            }

            // Visual Toast notification
            showToast(`✔ Projekt in Datei "${fileName}" gesichert!`, 'success', 'Projekt gesichert', 3500);

        } catch (err) {
            console.error("Fehler beim Speichern im Ordner:", err);
            alert("Fehler beim Speichern der Datei im Ordner: " + err.message);
        }
    }

    // Function: Open folder files modal and scan directory for .json files
    async function refreshFolderFilesList() {
        if (!projectDirectoryHandle) return;
        folderFilesList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.9em; margin: 5px;">Ordner wird gelesen...</p>';
        try {
            const hasPermission = await verifyDirPermission(projectDirectoryHandle, false);
            if (!hasPermission) {
                folderFilesList.innerHTML = '<p style="color: #d9534f; font-size: 0.9em; margin: 5px;">Kein Zugriff auf den Ordner erlaubt.</p>';
                return;
            }

            const files = [];
            for await (const entry of projectDirectoryHandle.values()) {
                if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.json')) {
                    try {
                        const fileData = await entry.getFile();
                        files.push({
                            name: entry.name,
                            handle: entry,
                            lastModified: new Date(fileData.lastModified),
                            size: fileData.size
                        });
                    } catch (e) {
                        files.push({ name: entry.name, handle: entry, lastModified: null, size: 0 });
                    }
                }
            }

            files.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

            folderFilesList.innerHTML = '';
            if (files.length === 0) {
                folderFilesList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.9em; margin: 10px;">Keine .json-Projektdateien im Ordner gefunden.</p>';
                return;
            }

            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'folder-file-item';
                const dateStr = file.lastModified 
                    ? file.lastModified.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Unbekanntes Datum';
                const sizeStr = (file.size / 1024).toFixed(1) + ' KB';

                item.innerHTML = `
                    <div class="file-info">
                        <span class="file-name">📄 ${file.name}</span>
                        <span class="file-meta">Geändert: ${dateStr} &bull; ${sizeStr}</span>
                    </div>
                    <div class="file-actions" style="display: flex; gap: 6px; align-items: center;">
                        <button class="btn-secondary btn-delete-file-entry" style="font-size: 0.85em; padding: 4px 8px; background: #fee2e2; border: 1px solid #fca5a5; color: #dc2626; border-radius: 4px; cursor: pointer;" title="Datei '${file.name}' aus Ordner löschen">🗑️</button>
                        <button class="btn-primary btn-load-file-entry" style="font-size: 0.8em; padding: 4px 10px;">Laden</button>
                    </div>
                `;

                const btnDelete = item.querySelector('.btn-delete-file-entry');
                if (btnDelete) {
                    btnDelete.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const confirmed = await showCustomConfirm(
                            `Möchten Sie die Projektdatei "${file.name}" wirklich endgültig aus dem Ordner löschen?`,
                            "Projektdatei löschen",
                            "Datei löschen",
                            "Abbrechen",
                            true
                        );
                        if (confirmed) {
                            try {
                                const hasPermission = await verifyDirPermission(projectDirectoryHandle, true);
                                if (!hasPermission) {
                                    alert('Keine Berechtigung zum Löschen im Zielordner.');
                                    return;
                                }
                                await projectDirectoryHandle.removeEntry(file.name);
                                showToast(`✔ Datei "${file.name}" wurde aus dem Ordner gelöscht.`, 'info', 'Datei gelöscht', 3000);
                                await refreshFolderFilesList();
                            } catch (err) {
                                console.error("Fehler beim Löschen der Datei:", err);
                                alert("Fehler beim Löschen der Datei: " + err.message);
                            }
                        }
                    });
                }

                item.querySelector('.btn-load-file-entry').addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await loadFileFromHandle(file.handle);
                });

                item.addEventListener('click', async () => {
                    await loadFileFromHandle(file.handle);
                });

                folderFilesList.appendChild(item);
            });

        } catch (err) {
            console.error("Fehler beim Lesen des Ordners:", err);
            folderFilesList.innerHTML = `<p style="color: #d9534f; font-size: 0.9em; margin: 5px;">Fehler: ${err.message}</p>`;
        }
    }

    async function loadFileFromHandle(fileHandle) {
        try {
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            loadData(data);
            debouncedSave.flush();
            if (folderFilesModal) folderFilesModal.classList.add('hidden');
            alert(`Projekt "${fileHandle.name}" wurde erfolgreich geladen!`);
        } catch (err) {
            console.error("Fehler beim Einlesen der Datei:", err);
            alert("Fehler beim Einlesen der Datei: " + err.message);
        }
    }

    // Initialize stored directory handle on startup
    (async () => {
        try {
            const storedHandle = await FBH_DB.getDirHandle();
            if (storedHandle) {
                projectDirectoryHandle = storedHandle;
                updateFolderUI();
            }
        } catch (e) {
            console.log("Kein vorheriger Ordner in IndexedDB gefunden.", e);
        }
    })();

    // Folder Event Listeners
    if (btnSelectFolder) {
        btnSelectFolder.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            selectProjectDirectory();
        });
    }
    if (btnSaveToFolder) {
        btnSaveToFolder.addEventListener('click', (e) => {
            if (e.target.closest('.drag-handle')) return;
            saveProjectToFolder();
        });
    }
    if (btnLoadFromFolder) {
        btnLoadFromFolder.addEventListener('click', async (e) => {
            if (e.target.closest('.drag-handle')) return;
            if (!projectDirectoryHandle) {
                await selectProjectDirectory();
                if (!projectDirectoryHandle) return;
            }
            if (folderFilesModal) {
                folderFilesModal.classList.remove('hidden');
                refreshFolderFilesList();
            }
        });
    }
    if (btnFolderFilesClose) {
        btnFolderFilesClose.addEventListener('click', () => {
            if (folderFilesModal) folderFilesModal.classList.add('hidden');
        });
    }
    if (btnFolderFilesRefresh) {
        btnFolderFilesRefresh.addEventListener('click', refreshFolderFilesList);
    }
    const btnFolderFilesChangeDir = document.getElementById('btn-folder-files-change-dir');
    if (btnFolderFilesChangeDir) {
        btnFolderFilesChangeDir.addEventListener('click', async () => {
            if (folderFilesModal) folderFilesModal.classList.add('hidden');
            await selectProjectDirectory();
        });
    }
    async function createNewProjectFileInFolder(projectName) {
        if (!projectDirectoryHandle) {
            alert('Kein Zielordner ausgewählt.');
            return;
        }
        let cleanName = (projectName || 'Neues_Projekt').trim();
        cleanName = cleanName.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, '_');
        if (!cleanName) cleanName = 'Neues_Projekt';

        let fileBaseName = cleanName.replace(/ /g, '_');
        const fileName = fileBaseName.toLowerCase().startsWith('fbh_') 
            ? `${fileBaseName}.json` 
            : `FBH_${fileBaseName}.json`;

        const confirmed = await showCustomConfirm(
            `Möchten Sie das neue Projekt "${projectName || cleanName}" jetzt übernehmen und als aktiven Arbeitsbereich laden?\n\nDatei im Ordner: ${fileName}`,
            "Projekt übernehmen",
            "Projekt übernehmen (Enter ↵)",
            "Abbrechen",
            false
        );

        if (!confirmed) return;

        try {
            const hasPermission = await verifyDirPermission(projectDirectoryHandle, true);
            if (!hasPermission) {
                alert('Keine Schreibberechtigung für den Zielordner.');
                return;
            }

            const initialData = {
                version: "3.0",
                objektBez: projectName || cleanName,
                floors: [],
                createdAt: new Date().toISOString()
            };

            const fileHandle = await projectDirectoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(initialData, null, 2));
            await writable.close();

            localStorage.removeItem('fbhData');
            document.getElementById('objekt-bez').value = projectName || cleanName;
            const existingFloors = document.querySelectorAll('tbody.floor-group');
            existingFloors.forEach(f => f.remove());
            floorCounter = 0;
            cadRoomPool = [];
            if (typeof renderCadPoolList === 'function') renderCadPoolList();

            if (btnAddFloor) {
                btnAddFloor.click();
            } else {
                floorCounter++;
                const fb = addNewFloor(floorCounter);
                addRoomToFloor(fb);
                calculateGlobalSum();
                if (!isLoading) debouncedSave();
            }

            debouncedSave.flush();
            await refreshFolderFilesList();
            const inputNewFile = document.getElementById('input-new-project-filename');
            if (inputNewFile) inputNewFile.value = '';

            if (folderFilesModal) folderFilesModal.classList.add('hidden');
            showToast(`✔ Projekt "${fileName}" wurde erfolgreich übernommen und geladen!`, 'success', 'Projekt übernommen', 4000);

        } catch (err) {
            console.error("Fehler beim Erstellen der neuen Datei im Ordner:", err);
            alert("Fehler beim Erstellen der Datei: " + err.message);
        }
    }

    const btnConfirmCreateNewFile = document.getElementById('btn-confirm-create-new-file');
    const inputNewProjectFilename = document.getElementById('input-new-project-filename');

    if (btnConfirmCreateNewFile && inputNewProjectFilename) {
        btnConfirmCreateNewFile.addEventListener('click', async () => {
            const val = inputNewProjectFilename.value.trim();
            await createNewProjectFileInFolder(val);
        });

        inputNewProjectFilename.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = inputNewProjectFilename.value.trim();
                await createNewProjectFileInFolder(val);
            }
        });
    }
    if (folderFilesModal) {
        folderFilesModal.addEventListener('click', (e) => {
            if (e.target === folderFilesModal) folderFilesModal.classList.add('hidden');
        });
    }


    // --- CAD / CD Excel Import Feature ---
    const btnImportCad = document.getElementById('btn-import-cad');
    const cadImportModal = document.getElementById('cad-import-modal');
    const btnCloseCadModal = document.getElementById('btn-close-cad-modal');
    const btnCancelCadImport = document.getElementById('btn-cancel-cad-import');
    const btnApplyCadImport = document.getElementById('btn-apply-cad-import');
    const cadDropZone = document.getElementById('cad-drop-zone');
    const cadFileInput = document.getElementById('cad-file-input');
    const cadPreviewSection = document.getElementById('cad-preview-section');
    const cadPreviewTbody = document.getElementById('cad-preview-tbody');
    const cadRoomCount = document.getElementById('cad-room-count');
    const cadFileNameBadge = document.getElementById('cad-file-name-badge');

    let parsedCadRooms = [];
    let cadRoomPool = [];

    let lastCadImportToggleTime = 0;

    function openCadImportModal() {
        const now = Date.now();
        if (now - lastCadImportToggleTime < 300) return;
        lastCadImportToggleTime = now;

        if (cadImportModal) {
            cadImportModal.classList.remove('hidden');
            resetCadModal();
        }
    }

    function closeCadImportModal() {
        if (cadImportModal) {
            cadImportModal.classList.add('hidden');
        }
    }

    function resetCadModal() {
        parsedCadRooms = [];
        if (cadPreviewSection) cadPreviewSection.style.display = 'none';
        if (btnApplyCadImport) btnApplyCadImport.style.display = 'none';
        if (cadPreviewTbody) cadPreviewTbody.innerHTML = '';
        if (cadRoomCount) cadRoomCount.textContent = '0';
        if (cadFileNameBadge) cadFileNameBadge.textContent = '';
        if (cadFileInput) cadFileInput.value = '';
    }

    if (btnImportCad) {
        btnImportCad.addEventListener('click', (e) => {
            e.preventDefault();
            openCadImportModal();
        });
    }

    if (btnCloseCadModal) btnCloseCadModal.addEventListener('click', closeCadImportModal);
    if (btnCancelCadImport) btnCancelCadImport.addEventListener('click', closeCadImportModal);

    if (cadDropZone && cadFileInput) {
        cadDropZone.addEventListener('click', () => cadFileInput.click());

        cadDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            cadDropZone.style.borderColor = '#005a9e';
            cadDropZone.style.backgroundColor = 'rgba(0, 120, 215, 0.12)';
        });

        cadDropZone.addEventListener('dragleave', () => {
            cadDropZone.style.borderColor = '#0078d7';
            cadDropZone.style.backgroundColor = 'rgba(0, 120, 215, 0.04)';
        });

        cadDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            cadDropZone.style.borderColor = '#0078d7';
            cadDropZone.style.backgroundColor = 'rgba(0, 120, 215, 0.04)';

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleCadExcelFile(files[0]);
            }
        });

        cadFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleCadExcelFile(e.target.files[0]);
            }
        });
    }

    function handleCadExcelFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                if (typeof XLSX === 'undefined') {
                    alert('Excel-Bibliothek wird geladen. Bitte versuchen Sie es in wenigen Sekunden erneut.');
                    return;
                }
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                parseCadExcelRows(rows, file.name);
            } catch (err) {
                console.error("Fehler beim Lesen der Excel-Datei:", err);
                alert("Fehler beim Lesen der Excel-Datei: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function parseCadExcelRows(rows, fileName) {
        if (!rows || rows.length < 2) {
            alert('Keine gültigen Daten in der Excel-Datei gefunden.');
            return;
        }

        let headerRowIdx = -1;
        let colRoomNr = -1;
        let colRoomDesc = -1;
        let colArea = -1;

        // 1. Locate header row and candidate columns
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const row = rows[i];
            if (!Array.isArray(row)) continue;

            for (let c = 0; c < row.length; c++) {
                const cell = String(row[c] || '').trim().toLowerCase();

                if (cell.includes('grundfl') || cell === 'grundflaeche' || cell === 'grundfläche') {
                    colArea = c;
                } else if (colArea === -1 && (cell === 'flaeche' || cell === 'fläche' || cell === 'area')) {
                    colArea = c;
                } else if (cell.includes('besch') || cell.includes('bescheibung') || cell.includes('geschoss')) {
                    colRoomDesc = c;
                }
            }

            if (colArea !== -1) {
                headerRowIdx = i;
                break;
            }
        }

        // 2. Identify which 'Nr' column actually contains string room codes in data rows
        if (headerRowIdx !== -1) {
            for (let c = 0; c < rows[headerRowIdx].length; c++) {
                const cell = String(rows[headerRowIdx][c] || '').trim().toLowerCase();
                if (cell === 'nr' || cell.includes('raum')) {
                    let nonNullCount = 0;
                    for (let r = headerRowIdx + 1; r < Math.min(headerRowIdx + 6, rows.length); r++) {
                        if (rows[r] && rows[r][c] !== undefined && rows[r][c] !== null && String(rows[r][c]).trim() !== '') {
                            nonNullCount++;
                        }
                    }
                    if (nonNullCount > 0) {
                        colRoomNr = c;
                        break;
                    }
                }
            }
        }

        // Fallbacks matching CAD export format (Col 5 = Nr, Col 6 = Bescheibung, Col 11 = Grundflaeche)
        if (colRoomNr === -1) colRoomNr = 5;
        if (colRoomDesc === -1) colRoomDesc = 6;
        if (colArea === -1) colArea = 11;
        if (headerRowIdx === -1) headerRowIdx = 0;

        parsedCadRooms = [];

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row)) continue;

            const roomCode = String(row[colRoomNr] !== undefined && row[colRoomNr] !== null ? row[colRoomNr] : '').trim();
            const desc = String(row[colRoomDesc] !== undefined && row[colRoomDesc] !== null ? row[colRoomDesc] : '').trim();
            const rawArea = row[colArea];

            if (!roomCode && !desc && (rawArea === undefined || rawArea === null)) continue;

            let areaVal = 0;
            if (typeof rawArea === 'number') {
                areaVal = rawArea;
            } else if (typeof rawArea === 'string') {
                areaVal = parseFloat(rawArea.replace(',', '.')) || 0;
            }

            if (areaVal > 0 || roomCode) {
                let fullName = roomCode;
                if (desc && roomCode) {
                    const cleanDesc = desc.replace(/^_+|_+$/g, '');
                    fullName = `${roomCode}_${cleanDesc}_`;
                } else if (desc) {
                    fullName = desc;
                }

                parsedCadRooms.push({
                    name: fullName || `Raum ${parsedCadRooms.length + 1}`,
                    area: parseFloat(areaVal.toFixed(2))
                });
            }
        }

        if (parsedCadRooms.length === 0) {
            alert('Es konnten keine gültigen Räume und Flächen in der Datei erkannt werden.');
            return;
        }

        cadPreviewTbody.innerHTML = '';
        parsedCadRooms.forEach((rm, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';
            tr.innerHTML = `
                <td style="padding: 6px 12px; color: #64748b;">${idx + 1}</td>
                <td style="padding: 6px 12px; font-weight: 600; color: #1e293b;">${rm.name}</td>
                <td style="padding: 6px 12px; text-align: right; font-weight: bold; color: #0284c7;">${rm.area.toFixed(2)} m²</td>
            `;
            cadPreviewTbody.appendChild(tr);
        });

        cadRoomCount.textContent = parsedCadRooms.length;
        cadFileNameBadge.textContent = `📄 ${fileName}`;
        cadPreviewSection.style.display = 'block';
        btnApplyCadImport.textContent = '✔ In CAD-Pool speichern';
        btnApplyCadImport.style.display = 'inline-block';
    }

    if (btnApplyCadImport) {
        btnApplyCadImport.addEventListener('click', () => {
            if (parsedCadRooms.length === 0) return;

            parsedCadRooms.forEach(rm => {
                cadRoomPool.push({
                    id: 'cad_rm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    name: rm.name,
                    area: rm.area,
                    assignedFloor: null
                });
            });

            debouncedSave();
            closeCadImportModal();
            openCadPoolModal();

            alert(`Erfolg! ${parsedCadRooms.length} Räume wurden in den CAD-Pool gespeichert.\n\nSie können die Räume jetzt über das Fenster "📋 CAD-Pool" per Drag-and-Drop in Ihre Verteiler ziehen.`);
        });
    }

    // --- CAD Pool System & Floating Draggable Window ---
    const btnOpenCadPool = document.getElementById('btn-open-cad-pool');
    const cadPoolWindow = document.getElementById('cad-pool-window');
    const cadPoolHeader = document.getElementById('cad-pool-header');
    const btnCloseCadPoolModal = document.getElementById('btn-close-cad-pool-modal');
    const btnClearCadPool = document.getElementById('btn-clear-cad-pool');
    const cadPoolList = document.getElementById('cad-pool-list');
    const cadPoolCount = document.getElementById('cad-pool-count');

    // Helper to make any window draggable
    function makeElementDraggable(header, windowEl) {
        if (!header || !windowEl) return;
        let isDragging = false;
        let startX = 0, startY = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX - windowEl.offsetLeft;
            startY = e.clientY - windowEl.offsetTop;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowEl.style.left = (e.clientX - startX) + 'px';
                windowEl.style.top = (e.clientY - startY) + 'px';
                windowEl.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';
            }
        });
    }

    makeElementDraggable(cadPoolHeader, cadPoolWindow);

    // --- PDF Viewer Floating Draggable & Resizable Window System ---
    const pdfViewerWindow = document.getElementById('pdf-viewer-window');
    const pdfViewerHeader = document.getElementById('pdf-viewer-header');
    const pdfViewerBody = document.getElementById('pdf-viewer-body');
    const pdfViewerObject = document.getElementById('pdf-viewer-object');
    const pdfViewerEmbed = document.getElementById('pdf-viewer-embed');
    const pdfCanvasContainer = document.getElementById('pdf-canvas-container');
    const btnClosePdfViewerX = document.getElementById('btn-close-pdf-viewer-x');
    const btnPdfZoomIn = document.getElementById('btn-pdf-zoom-in');
    const btnPdfZoomOut = document.getElementById('btn-pdf-zoom-out');
    const btnPdfZoomReset = document.getElementById('btn-pdf-zoom-reset');
    const btnPdfFitWidth = document.getElementById('btn-pdf-fit-width');
    const pdfZoomText = document.getElementById('pdf-zoom-text');
    const pdfPageCountText = document.getElementById('pdf-page-count-text');
    const cbPdfWheelZoom = document.getElementById('cb-pdf-wheel-zoom');
    const pdfResizeHandle = document.getElementById('pdf-viewer-resize-handle');

    let pdfLoaded = false;
    let cachedPdfDoc = null;
    let currentPdfScale = 1.25; // Base scale = 100%

    function updateZoomDisplay() {
        if (pdfZoomText) {
            const pct = Math.round((currentPdfScale / 1.25) * 100);
            pdfZoomText.textContent = `${pct}%`;
        }
    }

    function renderAllPdfPages(onComplete) {
        if (!cachedPdfDoc || !pdfCanvasContainer) return;

        updateZoomDisplay();
        pdfCanvasContainer.innerHTML = '';

        let pagesRendered = 0;
        const totalPages = cachedPdfDoc.numPages;

        const renderPage = (pageNum) => {
            if (pageNum > totalPages) {
                if (typeof onComplete === 'function') onComplete();
                return;
            }
            cachedPdfDoc.getPage(pageNum).then((page) => {
                const viewport = page.getViewport({ scale: currentPdfScale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.style.cssText = 'box-shadow: 0 4px 15px rgba(0,0,0,0.5); border-radius: 4px; background: #ffffff; margin-bottom: 12px; display: block;';
                
                pdfCanvasContainer.appendChild(canvas);
                
                page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                    pagesRendered++;
                    if (pagesRendered === 1 && typeof onComplete === 'function') {
                        onComplete();
                    }
                    renderPage(pageNum + 1);
                });
            });
        };

        renderPage(1);
    }

    function zoomAtPoint(zoomFactor, clientX, clientY) {
        if (!pdfViewerBody || !cachedPdfDoc) return;

        const oldScale = currentPdfScale;
        let newScale = Math.min(4.0, Math.max(0.4, oldScale * zoomFactor));
        if (Math.abs(newScale - oldScale) < 0.001) return;

        const rect = pdfViewerBody.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Current scroll positions
        const scrollLeft = pdfViewerBody.scrollLeft;
        const scrollTop = pdfViewerBody.scrollTop;

        // Mouse position in unscaled content coordinates
        const contentX = (scrollLeft + mouseX) / oldScale;
        const contentY = (scrollTop + mouseY) / oldScale;

        currentPdfScale = newScale;

        renderAllPdfPages(() => {
            // Adjust scroll position to keep the mouse focus stationary
            pdfViewerBody.scrollLeft = (contentX * newScale) - mouseX;
            pdfViewerBody.scrollTop = (contentY * newScale) - mouseY;
        });
    }

    function setZoom(newScale) {
        currentPdfScale = Math.min(4.0, Math.max(0.4, newScale));
        if (cachedPdfDoc) {
            renderAllPdfPages();
        }
    }

    if (btnPdfZoomIn) {
        btnPdfZoomIn.addEventListener('click', (e) => {
            e.preventDefault();
            setZoom(currentPdfScale + 0.25);
        });
    }

    if (btnPdfZoomOut) {
        btnPdfZoomOut.addEventListener('click', (e) => {
            e.preventDefault();
            setZoom(currentPdfScale - 0.25);
        });
    }

    if (btnPdfZoomReset) {
        btnPdfZoomReset.addEventListener('click', (e) => {
            e.preventDefault();
            setZoom(1.25); // Reset to 100%
        });
    }

    if (btnPdfFitWidth) {
        btnPdfFitWidth.addEventListener('click', (e) => {
            e.preventDefault();
            if (pdfViewerWindow && cachedPdfDoc) {
                const winWidth = pdfViewerWindow.clientWidth - 50;
                const fitScale = (winWidth / 600) * 1.0;
                setZoom(fitScale);
            }
        });
    }

    // Focal point wheel zoom on mouse location
    if (pdfViewerBody) {
        pdfViewerBody.addEventListener('wheel', (e) => {
            const isWheelZoomActive = cbPdfWheelZoom ? cbPdfWheelZoom.checked : true;
            if (e.ctrlKey || isWheelZoomActive) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
                zoomAtPoint(factor, e.clientX, e.clientY);
            }
        }, { passive: false, capture: true });

        // Deaktiviert Seitennavigation per Maus/Tastatur während des Zooms bei gedrückter Strg-Taste
        window.addEventListener('keydown', (e) => {
            if (!pdfViewerWindow || pdfViewerWindow.classList.contains('hidden') || pdfViewerWindow.style.display === 'none') return;
            if (e.ctrlKey) {
                if (['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'BrowserBack', 'BrowserForward'].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, { capture: true });

        window.addEventListener('auxclick', (e) => {
            if (!pdfViewerWindow || pdfViewerWindow.classList.contains('hidden') || pdfViewerWindow.style.display === 'none') return;
            if (e.button === 3 || e.button === 4 || e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { capture: true });

        // Drag-to-Pan (Hand Tool)
        let isPanning = false;
        let panStartX = 0, panStartY = 0;
        let initialScrollLeft = 0, initialScrollTop = 0;

        pdfViewerBody.style.cursor = 'grab';

        pdfViewerBody.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
            isPanning = true;
            pdfViewerBody.style.cursor = 'grabbing';
            panStartX = e.clientX;
            panStartY = e.clientY;
            initialScrollLeft = pdfViewerBody.scrollLeft;
            initialScrollTop = pdfViewerBody.scrollTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - panStartX;
                const dy = e.clientY - panStartY;
                pdfViewerBody.scrollLeft = initialScrollLeft - dx;
                pdfViewerBody.scrollTop = initialScrollTop - dy;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isPanning) {
                isPanning = false;
                pdfViewerBody.style.cursor = 'grab';
            }
        });
    }

    // Window Resizing via corner drag handle
    if (pdfResizeHandle && pdfViewerWindow) {
        let isResizing = false;
        let startW = 0, startH = 0, startX = 0, startY = 0;

        pdfResizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            startW = pdfViewerWindow.clientWidth;
            startH = pdfViewerWindow.clientHeight;
            startX = e.clientX;
            startY = e.clientY;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                const newW = Math.max(480, startW + (e.clientX - startX));
                const newH = Math.max(350, startH + (e.clientY - startY));
                pdfViewerWindow.style.width = `${newW}px`;
                pdfViewerWindow.style.height = `${newH}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
            }
        });
    }

    function fallbackToObjectEmbed(pdfUrl) {
        if (pdfCanvasContainer) pdfCanvasContainer.style.display = 'none';
        if (pdfViewerObject) {
            pdfViewerObject.style.display = 'block';
            pdfViewerObject.data = pdfUrl;
        }
        if (pdfViewerEmbed) {
            pdfViewerEmbed.src = pdfUrl;
        }
        pdfLoaded = true;
    }

    function openPdfViewerModal() {
        if (!pdfViewerWindow) return;

        // Make window visible first
        pdfViewerWindow.style.zIndex = '10000005';
        pdfViewerWindow.classList.remove('hidden');
        pdfViewerWindow.style.display = 'flex';

        if (pdfLoaded) return;

        const pdfUrl = 'FBHV_Kasten/FBH_Verteilerkaesten.pdf';

        if (typeof pdfjsLib !== 'undefined') {
            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                if (pdfCanvasContainer) {
                    pdfCanvasContainer.innerHTML = '<div style="color: #ffffff; padding: 25px; font-weight: bold; font-size: 1.05em;">⏳ Lade PDF-Grundlagendokument...</div>';
                }
                
                pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
                    cachedPdfDoc = pdf;
                    pdfLoaded = true;

                    if (pdfPageCountText) {
                        pdfPageCountText.textContent = `${pdf.numPages} ${pdf.numPages === 1 ? 'Seite' : 'Seiten'}`;
                    }

                    renderAllPdfPages();
                }).catch((err) => {
                    console.warn('PDF.js renderer failed or offline, switching to object fallback', err);
                    fallbackToObjectEmbed(pdfUrl);
                });
            } catch (err) {
                console.warn('PDF.js init error, switching to object fallback', err);
                fallbackToObjectEmbed(pdfUrl);
            }
        } else {
            setTimeout(() => {
                fallbackToObjectEmbed(pdfUrl);
            }, 100);
        }
    }

    function closePdfViewerModal() {
        if (!pdfViewerWindow) return;
        pdfViewerWindow.classList.add('hidden');
        pdfViewerWindow.style.display = 'none';
    }

    if (btnClosePdfViewerX) {
        btnClosePdfViewerX.addEventListener('click', (e) => {
            e.preventDefault();
            closePdfViewerModal();
        });
    }

    // Global listener for any PDF button
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btn-open-pdf-viewer, .btn-open-pdf-viewer');
        if (btn) {
            e.preventDefault();
            openPdfViewerModal();
        }
    });

    makeElementDraggable(pdfViewerHeader, pdfViewerWindow);

    let lastCadPoolToggleTime = 0;

    function isCadPoolOpen() {
        if (!cadPoolWindow) return false;
        return !cadPoolWindow.classList.contains('hidden') && cadPoolWindow.style.display !== 'none';
    }

    function openCadPoolModal() {
        if (!cadPoolWindow) return;

        // Ensure window remains visible within current viewport bounds
        if (!cadPoolWindow.style.left || cadPoolWindow.style.left === 'auto') {
            cadPoolWindow.style.top = '120px';
            cadPoolWindow.style.right = '40px';
            cadPoolWindow.style.left = 'auto';
        } else {
            const currentLeft = parseInt(cadPoolWindow.style.left, 10);
            const currentTop = parseInt(cadPoolWindow.style.top, 10);
            const winWidth = window.innerWidth || 1000;
            const winHeight = window.innerHeight || 800;

            if (isNaN(currentLeft) || currentLeft < 0 || currentLeft > winWidth - 100 ||
                isNaN(currentTop) || currentTop < 0 || currentTop > winHeight - 100) {
                cadPoolWindow.style.top = '120px';
                cadPoolWindow.style.right = '40px';
                cadPoolWindow.style.left = 'auto';
            }
        }

        cadPoolWindow.style.zIndex = '999999';
        cadPoolWindow.classList.remove('hidden');
        cadPoolWindow.style.display = 'flex';
        renderCadPoolList();
    }

    function closeCadPoolModal() {
        if (!cadPoolWindow) return;
        cadPoolWindow.classList.add('hidden');
        cadPoolWindow.style.display = 'none';
    }

    function toggleCadPoolModal() {
        const now = Date.now();
        if (now - lastCadPoolToggleTime < 300) return; // Prevent double-triggering within 300ms
        lastCadPoolToggleTime = now;

        if (isCadPoolOpen()) {
            closeCadPoolModal();
        } else {
            openCadPoolModal();
        }
    }

    if (btnOpenCadPool) {
        btnOpenCadPool.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCadPoolModal();
        });
    }

    if (btnCloseCadPoolModal) {
        btnCloseCadPoolModal.addEventListener('click', (e) => {
            e.preventDefault();
            closeCadPoolModal();
        });
    }

    // --- Tools-Verwaltung Floating Draggable Window ---
    const btnOpenTools = document.getElementById('btn-open-tools');
    const toolsWindow = document.getElementById('tools-window');
    const toolsHeader = document.getElementById('tools-header');
    const btnCloseTools = document.getElementById('btn-close-tools');

    makeElementDraggable(toolsHeader, toolsWindow);

    let lastToolsToggleTime = 0;

    function isToolsOpen() {
        if (!toolsWindow) return false;
        return !toolsWindow.classList.contains('hidden') && toolsWindow.style.display !== 'none';
    }

    function openToolsModal() {
        if (!toolsWindow) return;

        if (!toolsWindow.style.left || toolsWindow.style.left === 'auto') {
            toolsWindow.style.top = '120px';
            toolsWindow.style.right = '50px';
            toolsWindow.style.left = 'auto';
        } else {
            const currentLeft = parseInt(toolsWindow.style.left, 10);
            const currentTop = parseInt(toolsWindow.style.top, 10);
            const winWidth = window.innerWidth || 1000;
            const winHeight = window.innerHeight || 800;

            if (isNaN(currentLeft) || currentLeft < 0 || currentLeft > winWidth - 100 ||
                isNaN(currentTop) || currentTop < 0 || currentTop > winHeight - 100) {
                toolsWindow.style.top = '120px';
                toolsWindow.style.right = '50px';
                toolsWindow.style.left = 'auto';
            }
        }

        toolsWindow.style.zIndex = '999999';
        toolsWindow.classList.remove('hidden');
        toolsWindow.style.display = 'flex';
    }

    function closeToolsModal() {
        if (!toolsWindow) return;
        toolsWindow.classList.add('hidden');
        toolsWindow.style.display = 'none';
    }

    function toggleToolsModal() {
        const now = Date.now();
        if (now - lastToolsToggleTime < 300) return;
        lastToolsToggleTime = now;

        if (isToolsOpen()) {
            closeToolsModal();
        } else {
            openToolsModal();
        }
    }

    if (btnOpenTools) {
        btnOpenTools.addEventListener('click', (e) => {
            e.preventDefault();
            toggleToolsModal();
        });
    }

    if (btnCloseTools) {
        btnCloseTools.addEventListener('click', (e) => {
            e.preventDefault();
            closeToolsModal();
        });
    }

    // --- Verteiler-Übersicht Floating Draggable Window ---
    const btnOpenVerteilerOverview = document.getElementById('btn-open-verteiler-overview');
    const verteilerOverviewWindow = document.getElementById('verteiler-overview-window');
    const verteilerOverviewHeader = document.getElementById('verteiler-overview-header');
    const btnCloseVerteilerOverview = document.getElementById('btn-close-verteiler-overview');
    const verteilerOverviewList = document.getElementById('verteiler-overview-list');

    makeElementDraggable(verteilerOverviewHeader, verteilerOverviewWindow);

    let lastVerteilerToggleTime = 0;

    function isVerteilerOverviewOpen() {
        if (!verteilerOverviewWindow) return false;
        return !verteilerOverviewWindow.classList.contains('hidden') && verteilerOverviewWindow.style.display !== 'none';
    }

    function openVerteilerOverviewModal() {
        if (!verteilerOverviewWindow) return;

        if (!verteilerOverviewWindow.style.left || verteilerOverviewWindow.style.left === 'auto') {
            verteilerOverviewWindow.style.top = '120px';
            verteilerOverviewWindow.style.right = '500px';
            verteilerOverviewWindow.style.left = 'auto';
        } else {
            const currentLeft = parseInt(verteilerOverviewWindow.style.left, 10);
            const currentTop = parseInt(verteilerOverviewWindow.style.top, 10);
            const winWidth = window.innerWidth || 1000;
            const winHeight = window.innerHeight || 800;

            if (isNaN(currentLeft) || currentLeft < 0 || currentLeft > winWidth - 100 ||
                isNaN(currentTop) || currentTop < 0 || currentTop > winHeight - 100) {
                verteilerOverviewWindow.style.top = '120px';
                verteilerOverviewWindow.style.right = '500px';
                verteilerOverviewWindow.style.left = 'auto';
            }
        }

        verteilerOverviewWindow.style.zIndex = '999999';
        verteilerOverviewWindow.classList.remove('hidden');
        verteilerOverviewWindow.style.display = 'flex';
        renderVerteilerOverviewList();
    }

    function closeVerteilerOverviewModal() {
        if (!verteilerOverviewWindow) return;
        verteilerOverviewWindow.classList.add('hidden');
        verteilerOverviewWindow.style.display = 'none';
    }

    function toggleVerteilerOverviewModal() {
        const now = Date.now();
        if (now - lastVerteilerToggleTime < 300) return;
        lastVerteilerToggleTime = now;

        if (isVerteilerOverviewOpen()) {
            closeVerteilerOverviewModal();
        } else {
            openVerteilerOverviewModal();
        }
    }

    if (btnOpenVerteilerOverview) {
        btnOpenVerteilerOverview.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleVerteilerOverviewModal();
        });
    }

    if (btnCloseVerteilerOverview) {
        btnCloseVerteilerOverview.addEventListener('click', (e) => {
            e.stopPropagation();
            closeVerteilerOverviewModal();
        });
    }

    // --- Live Rapportliste Floating Draggable Window ---
    const btnOpenRapportliste = document.getElementById('btn-open-rapportliste');
    const rapportlisteWindow = document.getElementById('rapportliste-window');
    const rapportlisteHeader = document.getElementById('rapportliste-header');
    const btnCloseRapportliste = document.getElementById('btn-close-rapportliste');

    if (rapportlisteHeader && rapportlisteWindow) {
        makeElementDraggable(rapportlisteHeader, rapportlisteWindow);
    }

    function isRapportlisteOpen() {
        if (!rapportlisteWindow) return false;
        return !rapportlisteWindow.classList.contains('hidden') && rapportlisteWindow.style.display !== 'none';
    }

    function openRapportlisteModal() {
        if (!rapportlisteWindow) return;
        if (!rapportlisteWindow.style.left || rapportlisteWindow.style.left === 'auto') {
            rapportlisteWindow.style.top = '120px';
            rapportlisteWindow.style.right = '80px';
            rapportlisteWindow.style.left = 'auto';
        }
        rapportlisteWindow.style.zIndex = '999999';
        rapportlisteWindow.classList.remove('hidden');
        rapportlisteWindow.style.display = 'flex';
        calculateGlobalSum();
    }

    function closeRapportlisteModal() {
        if (!rapportlisteWindow) return;
        rapportlisteWindow.classList.add('hidden');
        rapportlisteWindow.style.display = 'none';
    }

    if (btnOpenRapportliste) {
        btnOpenRapportliste.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isRapportlisteOpen()) {
                closeRapportlisteModal();
            } else {
                openRapportlisteModal();
            }
        });
    }

    if (btnCloseRapportliste) {
        btnCloseRapportliste.addEventListener('click', (e) => {
            e.stopPropagation();
            closeRapportlisteModal();
        });
    }

    // --- Verteilerkasten Konfigurator Modal Handlers ---
    const btnVerteilerkastenConfig = document.getElementById('btn-verteilerkasten-config');
    const vconfigModal = document.getElementById('verteilerkasten-config-modal');
    const btnVconfigClose = document.getElementById('btn-vconfig-close');
    const btnVconfigCloseX = document.getElementById('btn-vconfig-close-x');
    const btnVconfigSave = document.getElementById('btn-vconfig-save');
    const btnVconfigCabsAll = document.getElementById('btn-vconfig-cabs-all');
    const btnVconfigCabsNone = document.getElementById('btn-vconfig-cabs-none');
    const btnVconfigConnAll = document.getElementById('btn-vconfig-conn-all');
    const btnVconfigConnNone = document.getElementById('btn-vconfig-conn-none');
    const vconfigPrimaryConnection = document.getElementById('vconfig-primary-connection');

    const cbVconfigWmz = document.getElementById('cb-vconfig-wmz');

    function updateWmzConnectionState() {
        const noWmzActive = cbVconfigWmz ? cbVconfigWmz.checked : false;
        
        // Update Connection Checkboxes
        document.querySelectorAll('.cb-vconfig-conn').forEach(cb => {
            const isSetWmz = cb.dataset.isWmz === 'true';
            const label = cb.closest('.lbl-vconfig-conn');
            
            // Wenn "Kein WMZ" aktiv ist, werden WMZ-Sets deaktiviert und ausgegraut
            if (noWmzActive && isSetWmz) {
                cb.checked = false;
                cb.disabled = true;
                if (label) label.classList.add('vconfig-disabled');
            } else {
                cb.disabled = false;
                if (label) label.classList.remove('vconfig-disabled');
            }
        });

        // Get all currently checked connection set IDs in Section 3
        const checkedConnIds = getSelectedConnectionTypesFromUI();

        // Update Primary Connection Dropdown Options (Hor & Ver)
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
        const selHor = document.getElementById('vconfig-primary-connection-hor');
        const selVer = document.getElementById('vconfig-primary-connection-ver');
        const oldSel = document.getElementById('vconfig-primary-connection');

        [selHor, selVer, oldSel].forEach(sel => {
            if (sel && db && db.connectionSets) {
                let selectedStillValid = false;
                Array.from(sel.options).forEach(opt => {
                    const connId = opt.value;
                    const isChecked = checkedConnIds.length === 0 || checkedConnIds.includes(connId);

                    if (!isChecked) {
                        opt.disabled = true;
                        opt.style.display = 'none';
                        opt.style.color = '#94a3b8';
                    } else {
                        opt.disabled = false;
                        opt.style.display = '';
                        opt.style.color = '';
                        if (opt.value === sel.value) {
                            selectedStillValid = true;
                        }
                    }
                });

                // If currently selected option is disabled, switch to first valid option
                if (!selectedStillValid) {
                    const firstValidOpt = Array.from(sel.options).find(opt => !opt.disabled);
                    if (firstValidOpt) {
                        sel.value = firstValidOpt.value;
                    }
                }
            }
        });
    }

    [document.getElementById('vconfig-primary-connection-hor'), document.getElementById('vconfig-primary-connection-ver')].forEach(sel => {
        if (sel) {
            sel.addEventListener('change', () => {
                calculateGlobalSum();
                debouncedSave();
            });
        }
    });

    if (cbVconfigWmz) {
        cbVconfigWmz.addEventListener('change', () => {
            updateWmzConnectionState();
            calculateGlobalSum();
            debouncedSave();
        });
    }

    function openVconfigModal() {
        if (vconfigModal) {
            updateWmzConnectionState();
            vconfigModal.classList.remove('hidden');
        }
    }
    function closeVconfigModal() {
        if (vconfigModal) {
            vconfigModal.classList.add('hidden');
        }
    }

    if (btnVerteilerkastenConfig) {
        btnVerteilerkastenConfig.addEventListener('click', (e) => {
            e.preventDefault();
            openVconfigModal();
        });
    }
    if (btnVconfigClose) {
        btnVconfigClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeVconfigModal();
        });
    }
    if (btnVconfigCloseX) {
        btnVconfigCloseX.addEventListener('click', (e) => {
            e.preventDefault();
            closeVconfigModal();
        });
    }
    if (btnVconfigSave) {
        btnVconfigSave.addEventListener('click', (e) => {
            e.preventDefault();
            calculateGlobalSum();
            debouncedSave();
            closeVconfigModal();
        });
    }

    function syncCabinetCheckboxes(sourceCb) {
        if (!sourceCb) return;
        const val = sourceCb.value;
        const state = sourceCb.checked;
        document.querySelectorAll(`.cb-vconfig-cabinet[value="${val}"], .cb-cabinet-type[value="${val}"]`).forEach(cb => {
            cb.checked = state;
        });
    }

    if (btnVconfigCabsAll) {
        btnVconfigCabsAll.addEventListener('click', () => {
            document.querySelectorAll('.cb-vconfig-cabinet, .cb-cabinet-type').forEach(cb => cb.checked = true);
            calculateGlobalSum();
            debouncedSave();
        });
    }
    if (btnVconfigCabsNone) {
        btnVconfigCabsNone.addEventListener('click', () => {
            document.querySelectorAll('.cb-vconfig-cabinet, .cb-cabinet-type').forEach(cb => cb.checked = false);
            calculateGlobalSum();
            debouncedSave();
        });
    }

    if (btnVconfigConnAll) {
        btnVconfigConnAll.addEventListener('click', () => {
            const noWmzActive = cbVconfigWmz ? cbVconfigWmz.checked : false;
            document.querySelectorAll('.cb-vconfig-conn').forEach(cb => {
                const isSetWmz = cb.dataset.isWmz === 'true';
                if (!noWmzActive || !isSetWmz) {
                    cb.checked = true;
                }
            });
            updateWmzConnectionState();
            calculateGlobalSum();
            debouncedSave();
        });
    }
    if (btnVconfigConnNone) {
        btnVconfigConnNone.addEventListener('click', () => {
            document.querySelectorAll('.cb-vconfig-conn').forEach(cb => cb.checked = false);
            updateWmzConnectionState();
            calculateGlobalSum();
            debouncedSave();
        });
    }

    document.querySelectorAll('.cb-vconfig-conn').forEach(cb => {
        cb.addEventListener('change', () => {
            updateWmzConnectionState();
            calculateGlobalSum();
            debouncedSave();
        });
    });

    document.querySelectorAll('.cb-vconfig-cabinet, .cb-cabinet-type').forEach(cb => {
        cb.addEventListener('change', () => {
            syncCabinetCheckboxes(cb);
            calculateGlobalSum();
            debouncedSave();
        });
    });

    document.querySelectorAll('.cb-vconfig-dtype, .cb-vconfig-conn').forEach(cb => {
        cb.addEventListener('change', () => {
            calculateGlobalSum();
            debouncedSave();
        });
    });

    if (vconfigPrimaryConnection || settingConnectionType) {
        const syncConn = (source) => {
            const val = source.value;
            if (vconfigPrimaryConnection && vconfigPrimaryConnection !== source) vconfigPrimaryConnection.value = val;
            if (settingConnectionType && settingConnectionType !== source) settingConnectionType.value = val;
            calculateGlobalSum();
            debouncedSave();
        };
        if (vconfigPrimaryConnection) vconfigPrimaryConnection.addEventListener('change', (e) => syncConn(e.target));
        if (settingConnectionType) settingConnectionType.addEventListener('change', (e) => syncConn(e.target));
    }

    if (settingVerteilerType) {
        settingVerteilerType.addEventListener('change', () => {
            const val = settingVerteilerType.value;
            document.querySelectorAll('.cb-vconfig-dtype').forEach(cb => {
                cb.checked = (cb.value === val);
            });
            calculateGlobalSum();
            debouncedSave();
        });
    }

    function renderVerteilerOverviewList() {
        if (!verteilerOverviewList) return;
        
        verteilerOverviewList.innerHTML = '';
        
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        if (floorBodies.length === 0) {
            verteilerOverviewList.innerHTML = '<p style="color: var(--text-secondary, #94a3b8); font-style: italic; font-size: 0.88em; margin: 15px; text-align: center;">Keine Verteiler vorhanden.</p>';
            return;
        }
        
        floorBodies.forEach((fb) => {
            const floorIndex = fb.dataset.floorIndex;
            const ebeneInput = fb.querySelector('.input-floor-name');
            const ebeneName = ebeneInput ? ebeneInput.value : '';

            const fbhvInput = fb.querySelector('.input-fbhv-name');
            const fbhvName = fbhvInput ? fbhvInput.value : '';
            
            const posInput = fb.querySelector('.input-pos-nr');
            const posVal = posInput ? posInput.value : '';

            const displayEbene = ebeneName.trim() || '--- Geschoss ---';
            const displayFbhv = fbhvName.trim() || '--- FBHV ---';
            
            const roomRows = fb.querySelectorAll('tr.room-row');
            let assignedRoomCount = 0;
            roomRows.forEach(tr => {
                const name = tr.querySelector('.input-room-name')?.value || '';
                if (name) assignedRoomCount++;
            });

            const card = document.createElement('div');
            card.className = 'verteiler-card';
            card.dataset.floorIndex = floorIndex;
            
            // Large, clear bar design for high-accuracy dropping
            card.style.cssText = 'padding: 18px 22px; background: var(--bg-container, #ffffff); border: 2px solid var(--border-color, #cbd5e1); border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.05);';
            
            let totalFloorRings = 0;
            roomRows.forEach(tr => {
                const rings = parseInt(tr.querySelector('.input-rings')?.value || 0) || 0;
                totalFloorRings += rings;
            });

            const rec = getVerteilerRecommendationForFloor(totalFloorRings);
            let recHTML = '';
            if (rec) {
                const cabinetBadges = rec.matchingCabinets.length > 0 
                    ? rec.matchingCabinets.map(c => `<span style="display:inline-block; background:var(--zebra-even, #f1f5f9); padding:2px 8px; border-radius:4px; font-weight:600; border:1px solid #cbd5e1; color:#1e293b;">${c.shortName} (${c.width}mm | Art. ${c.articleNo})</span>`).join(' ')
                    : '<span style="color:#dc2626; font-style:italic;">Kein Schrankmodell für gewählte Bauformen erlaubt</span>';

                recHTML = `
                    <div style="margin-top: 6px; padding: 10px 12px; background: rgba(0, 120, 215, 0.04); border-left: 4px solid var(--primary-color, #0078d7); border-radius: 6px; font-size: 0.85em; pointer-events: none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-weight: bold; color: var(--primary-color, #0078d7);">📦 Empfohlener Verteilerkasten:</span>
                            <span style="font-weight:bold; background: #e0f2fe; color: #0369a1; padding: 2px 10px; border-radius: 12px; font-size: 0.9em;">Index ${rec.requiredIndex} &mdash; Breite ≥ ${rec.minWidth} mm</span>
                        </div>
                        <div style="color: var(--text-secondary, #64748b); margin-bottom: 6px; font-size:0.92em;">
                            Auslegung: <strong>${totalFloorRings} Ringe</strong> | Verteilerlänge: <strong>${rec.manifoldLength} mm</strong> (${rec.distributorType}) | Set: <em>${rec.connectionSetName}</em>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
                            ${cabinetBadges}
                        </div>
                    </div>
                `;
            } else {
                recHTML = `
                    <div style="font-size: 0.85em; color: var(--text-secondary, #64748b); pointer-events: none; margin-top:2px;">
                        Ringe gesamt: <strong>${totalFloorRings}</strong>
                    </div>
                `;
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
                    <strong style="font-size: 1.1em; color: var(--text-main, #0f172a);">${displayEbene}</strong>
                    <span style="font-size: 0.82em; color: var(--text-secondary, #64748b); font-weight: 600;">
                        Zugeordnete Räume: <strong style="color: var(--primary-color, #0078d7);">${assignedRoomCount}</strong>
                    </span>
                </div>
                <div style="font-size: 0.9em; color: var(--text-secondary, #64748b); pointer-events: none; display: flex; gap: 14px;">
                    <span>Pos. Nr.: <strong style="color: var(--text-main, #0f172a);">${posVal || '-'}</strong></span>
                    <span>Bez. FBHV: <strong style="color: var(--text-main, #0f172a);">${displayFbhv}</strong></span>
                </div>
                ${recHTML}
            `;
            
            // Drag and Drop listeners with visual feedback to make dropping accurate
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                card.style.borderColor = 'var(--primary-color, #0078d7)';
                card.style.backgroundColor = 'rgba(0, 120, 215, 0.08)';
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 5px 15px rgba(0, 120, 215, 0.15)';
            });
            
            card.addEventListener('dragleave', () => {
                card.style.borderColor = '';
                card.style.backgroundColor = '';
                card.style.transform = '';
                card.style.boxShadow = '';
            });
            
            card.addEventListener('drop', (e) => {
                card.style.borderColor = '';
                card.style.backgroundColor = '';
                card.style.transform = '';
                card.style.boxShadow = '';
                
                let jsonStr = '';
                if (e.dataTransfer) {
                    jsonStr = e.dataTransfer.getData('text/cad-room-json') || e.dataTransfer.getData('text/plain') || '';
                }
                
                if (jsonStr) {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                        let roomDataList = JSON.parse(jsonStr);
                        if (!Array.isArray(roomDataList)) {
                            roomDataList = [roomDataList];
                        }
                        
                        const targetFloorBody = document.querySelector(`tbody.floor-group[data-floor-index="${floorIndex}"]`);
                        if (targetFloorBody) {
                            assignRoomsToFloor(targetFloorBody, roomDataList);
                        }
                    } catch (err) {
                        console.error("Fehler beim Droppen auf Verteiler-Karte:", err);
                    }
                }
            });
            
            verteilerOverviewList.appendChild(card);
        });
    }

    if (btnClearCadPool) {
        btnClearCadPool.addEventListener('click', async () => {
            const confirmed = await showCustomConfirm(
                "Möchten Sie wirklich alle gespeicherten Räume aus dem CAD-Pool löschen?",
                "CAD-Pool leeren",
                "CAD-Pool löschen",
                "Abbrechen",
                true
            );
            if (confirmed) {
                cadRoomPool = [];
                renderCadPoolList();
                debouncedSave();
            }
        });
    }

    function renderCadPoolList() {
        if (!cadPoolList) return;

        // Attach filter & sort event listeners once
        const filterInput = document.getElementById('cad-pool-filter');
        if (filterInput && !filterInput.dataset.listenerAttached) {
            filterInput.dataset.listenerAttached = "true";
            filterInput.addEventListener('input', () => {
                renderCadPoolList();
            });
        }

        const sortSelect = document.getElementById('cad-pool-sort');
        if (sortSelect && !sortSelect.dataset.listenerAttached) {
            sortSelect.dataset.listenerAttached = "true";
            sortSelect.addEventListener('change', () => {
                renderCadPoolList();
            });
        }

        const hideAssignedCheckbox = document.getElementById('cad-pool-hide-assigned');
        if (hideAssignedCheckbox && !hideAssignedCheckbox.dataset.listenerAttached) {
            hideAssignedCheckbox.dataset.listenerAttached = "true";
            hideAssignedCheckbox.addEventListener('change', () => {
                renderCadPoolList();
            });
        }

        cadPoolList.innerHTML = '';

        if (cadPoolCount) cadPoolCount.textContent = cadRoomPool.length;

        if (cadRoomPool.length === 0) {
            cadPoolList.innerHTML = '<p style="color: var(--text-secondary, #94a3b8); font-style: italic; font-size: 0.88em; margin: 15px; text-align: center;">Keine Räume im CAD-Pool.<br>Importieren Sie zuerst eine CAD Excel-Datei über "Import aus CAD".</p>';
            return;
        }

        // Apply Filter & Sort on a copy of the room array
        let roomsToRender = [...cadRoomPool];

        // 1. Text Filter (Search)
        const filterText = filterInput ? filterInput.value.toLowerCase().trim() : "";
        if (filterText) {
            roomsToRender = roomsToRender.filter(rm => {
                const name = (rm.name || "").toLowerCase();
                return name.includes(filterText);
            });
        }

        // 2. Hide Assigned Filter
        const hideAssigned = hideAssignedCheckbox ? hideAssignedCheckbox.checked : false;
        if (hideAssigned) {
            roomsToRender = roomsToRender.filter(rm => !rm.assignedFloor);
        }

        // 3. Sorting
        const sortVal = sortSelect ? sortSelect.value : "prio";
        if (sortVal === "prio") {
            roomsToRender.sort((a, b) => {
                const assignedA = a.assignedFloor ? 1 : 0;
                const assignedB = b.assignedFloor ? 1 : 0;
                if (assignedA !== assignedB) {
                    return assignedA - assignedB; // Unassigned (0) comes first, Assigned (1) comes last
                }
                return (a.name || "").localeCompare(b.name || ""); // Then alphabetical A-Z
            });
        } else if (sortVal === "name-asc") {
            roomsToRender.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortVal === "name-desc") {
            roomsToRender.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        } else if (sortVal === "area-desc") {
            roomsToRender.sort((a, b) => {
                const areaA = typeof a.area === 'number' ? a.area : (parseFloat(a.area) || 0);
                const areaB = typeof b.area === 'number' ? b.area : (parseFloat(b.area) || 0);
                return areaB - areaA;
            });
        } else if (sortVal === "area-asc") {
            roomsToRender.sort((a, b) => {
                const areaA = typeof a.area === 'number' ? a.area : (parseFloat(a.area) || 0);
                const areaB = typeof b.area === 'number' ? b.area : (parseFloat(b.area) || 0);
                return areaA - areaB;
            });
        }

        roomsToRender.forEach((rm) => {
            const card = document.createElement('div');
            const areaNum = typeof rm.area === 'number' ? rm.area : (parseFloat(rm.area) || 0);

            if (rm.assignedFloor) {
                card.className = 'cad-room-card assigned';
                card.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--header-bg, #f1f5f9); border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; opacity: 0.75; font-size: 0.85em;';
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap;">
                        <span style="color: #64748b;">✔</span>
                        <input type="text" class="cad-room-name-input" value="${rm.name}" style="background: transparent; border: 1px solid transparent; font-weight: bold; color: var(--text-secondary, #475569); text-decoration: line-through; width: 130px; font-size: 1.05em; padding: 2px; border-radius: 4px; outline: none;" title="Name im CAD Pool bearbeiten">
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                        <span style="color: #64748b; font-size: 0.85em;">${areaNum.toFixed(2)} m²</span>
                        <span style="font-size: 0.72em; padding: 1px 5px; background: #dcfce7; color: #15803d; border-radius: 4px; font-weight: 600;">Zugeordnet</span>
                        <button class="btn-unassign-cad" style="background: none; border: none; cursor: pointer; color: #64748b; font-size: 0.9em;" title="Zuweisung zurücksetzen">↩</button>
                    </div>
                `;

                const nameInput = card.querySelector('.cad-room-name-input');
                if (nameInput) {
                    nameInput.addEventListener('mousedown', (e) => e.stopPropagation());
                    nameInput.addEventListener('focus', () => {
                        nameInput.style.textDecoration = 'none';
                    });
                    nameInput.addEventListener('blur', () => {
                        nameInput.style.textDecoration = 'line-through';
                    });
                    nameInput.addEventListener('change', () => {
                        const newName = nameInput.value.trim();
                        if (newName) {
                            rm.name = newName;
                            const assignedTr = document.querySelector(`tr.room-row[data-cad-id="${rm.id}"]`);
                            if (assignedTr) {
                                const tblInput = assignedTr.querySelector('.input-room-name');
                                if (tblInput) tblInput.value = newName;
                            }
                            debouncedSave();
                        } else {
                            nameInput.value = rm.name;
                        }
                    });
                }

                card.querySelector('.btn-unassign-cad').addEventListener('click', () => {
                    const assignedTr = document.querySelector(`tr.room-row[data-cad-id="${rm.id}"]`);
                    if (assignedTr) {
                        unassignCadRoomForTr(assignedTr);
                    } else {
                        rm.assignedFloor = null;
                    }
                    renderCadPoolList();
                    debouncedSave();
                });
            } else {
                card.className = 'cad-room-card';
                card.draggable = true;
                card.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-container, #ffffff); border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; cursor: grab; box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-size: 0.85em; transition: all 0.15s ease; user-select: none;';

                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap;">
                        <input type="checkbox" class="cad-room-checkbox" data-id="${rm.id}" style="cursor: pointer; margin-right: 4px; transform: scale(1.15);">
                        <span style="cursor: grab; color: #94a3b8; font-weight: bold; margin-right: 2px;">⋮⋮</span>
                        <input type="text" class="cad-room-name-input" value="${rm.name}" style="background: transparent; border: 1px solid transparent; font-weight: bold; color: var(--text-main, #0f172a); width: 130px; font-size: 1.05em; padding: 2px; border-radius: 4px; outline: none;" title="Name im CAD Pool bearbeiten">
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        <span style="font-weight: bold; color: var(--primary-color, #0078d7);">${areaNum.toFixed(2)} m²</span>
                        <span style="font-size: 0.72em; padding: 1px 5px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: 600;">🟢 Bereit</span>
                    </div>
                `;

                const checkbox = card.querySelector('.cad-room-checkbox');
                checkbox.addEventListener('change', () => {
                    updateMultiSelectUI();
                });

                const nameInput = card.querySelector('.cad-room-name-input');
                if (nameInput) {
                    nameInput.addEventListener('mousedown', (e) => e.stopPropagation());
                    nameInput.addEventListener('change', () => {
                        const newName = nameInput.value.trim();
                        if (newName) {
                            rm.name = newName;
                            debouncedSave();
                        } else {
                            nameInput.value = rm.name;
                        }
                    });
                }

                card.addEventListener('dragstart', (e) => {
                    card.style.opacity = '0.4';
                    if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = 'copy';
                        
                        const isChecked = checkbox && checkbox.checked;
                        let payloadList = [];
                        
                        if (isChecked) {
                            const checkedCheckboxes = cadPoolList.querySelectorAll('.cad-room-checkbox:checked');
                            checkedCheckboxes.forEach(cb => {
                                const checkedId = cb.dataset.id;
                                const checkedRm = cadRoomPool.find(r => r.id === checkedId);
                                if (checkedRm) {
                                    const aNum = typeof checkedRm.area === 'number' ? checkedRm.area : (parseFloat(checkedRm.area) || 0);
                                    payloadList.push({ id: checkedRm.id, name: checkedRm.name, area: aNum });
                                }
                            });
                        } else {
                            payloadList.push({ id: rm.id, name: rm.name, area: areaNum });
                        }

                        const payload = JSON.stringify(payloadList);
                        e.dataTransfer.setData('text/cad-room-json', payload);
                        e.dataTransfer.setData('text/plain', payload);
                    }
                });

                card.addEventListener('dragend', () => {
                    card.style.opacity = '1';
                });
            }

            cadPoolList.appendChild(card);
        });

        // Update target dropdown & multi-select actions visibility
        updateMultiSelectUI();
    }

    function updateMultiSelectUI() {
        const multiActionsDiv = document.getElementById('cad-multi-actions');
        const selectedCountSpan = document.getElementById('cad-selected-count');
        if (!multiActionsDiv || !selectedCountSpan) return;
        
        const checkedCount = cadPoolList.querySelectorAll('.cad-room-checkbox:checked').length;
        if (checkedCount > 0) {
            selectedCountSpan.textContent = checkedCount;
            multiActionsDiv.style.display = 'flex';
            populateTargetFloorDropdown();
        } else {
            multiActionsDiv.style.display = 'none';
        }
    }

    function populateTargetFloorDropdown() {
        const select = document.getElementById('select-target-floor');
        if (!select) return;
        
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Geschoss wählen --</option>';
        
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach((fb, idx) => {
            const ebeneInput = fb.querySelector('.input-floor-name');
            const ebeneName = ebeneInput ? ebeneInput.value : `Geschoss ${idx + 1}`;
            
            const opt = document.createElement('option');
            opt.value = fb.dataset.floorIndex;
            opt.textContent = (ebeneName || `Geschoss ${idx + 1}`).trim();
            select.appendChild(opt);
        });
        
        select.value = currentVal;
    }

    // Initialize Assign Selected button
    const btnAssignSelected = document.getElementById('btn-assign-selected-rooms');
    if (btnAssignSelected && !btnAssignSelected.dataset.listenerAttached) {
        btnAssignSelected.dataset.listenerAttached = "true";
        btnAssignSelected.addEventListener('click', () => {
            const select = document.getElementById('select-target-floor');
            const floorIndex = select ? select.value : "";
            if (!floorIndex) {
                alert("Bitte wählen Sie ein Ziel-Geschoss aus!");
                return;
            }
            
            const floorBody = document.querySelector(`tbody.floor-group[data-floor-index="${floorIndex}"]`);
            if (!floorBody) {
                alert("Ziel-Geschoss konnte nicht gefunden werden.");
                return;
            }
            
            const checkedCheckboxes = cadPoolList.querySelectorAll('.cad-room-checkbox:checked');
            if (checkedCheckboxes.length === 0) {
                alert("Bitte wählen Sie mindestens einen Raum aus!");
                return;
            }
            
            const selectedRooms = [];
            checkedCheckboxes.forEach(cb => {
                const roomId = cb.dataset.id;
                const roomData = cadRoomPool.find(r => r.id === roomId);
                if (roomData) {
                    selectedRooms.push(roomData);
                }
            });
            
            if (selectedRooms.length > 0) {
                assignRoomsToFloor(floorBody, selectedRooms);
            }
        });
    }

    // --- Dynamic Multi-Row Draggable Toolbar & Layout Persistence ---
    function initDraggableToolbar() {
        const rowsContainer = document.getElementById('toolbar-rows-container');
        const btnAddRow = document.getElementById('btn-add-toolbar-row');
        const btnReset = document.getElementById('btn-reset-layout');
        const stickyHeader = document.querySelector('.sticky-header');

        if (!rowsContainer) return;

        let isMenuEditMode = false;

        const defaultLayout = window.DEFAULT_TOOLBAR_LAYOUT || {
            "rows": [
                {
                    "collapsed": false,
                    "items": [
                        { "id": "btn-settings", "left": 15 },
                        { "id": "btn-design", "left": 160 },
                        { "id": "btn-print-report", "left": 280 },
                        { "id": "btn-verteilerkasten-config", "left": 440 },
                        { "id": "btn-open-rapportliste", "left": 600 },
                        { "id": "btn-multi-paste", "left": 760 }
                    ]
                },
                {
                    "collapsed": false,
                    "items": [
                        { "id": "btn-select-folder", "left": 15 },
                        { "id": "btn-save-to-folder", "left": 160 },
                        { "id": "btn-load-from-folder", "left": 320 },
                        { "id": "btn-import-cad", "left": 480 },
                        { "id": "btn-open-cad-pool", "left": 630 },
                        { "id": "btn-open-verteiler-overview", "left": 760 },
                        { "id": "btn-export-file", "left": 935 },
                        { "id": "btn-import-file", "left": 1030 },
                        { "id": "btn-clear-cache", "left": 1130 }
                    ]
                }
            ],
            "toolsPool": []
        };

        // Map all draggable toolbar items by data-btn-id
        const allItemsMap = {};
        document.querySelectorAll('.toolbar-item').forEach(item => {
            if (item.dataset.btnId) {
                allItemsMap[item.dataset.btnId] = item;
            }
        });

        function setMenuEditMode(active) {
            isMenuEditMode = Boolean(active);
            const btnToggle = document.getElementById('btn-toggle-menu-edit');
            const actionsDiv = document.getElementById('menu-edit-actions');

            if (isMenuEditMode) {
                document.body.classList.add('menu-edit-mode');
                if (typeof updateCoordinateRuler === 'function') updateCoordinateRuler();
                if (btnToggle) {
                    btnToggle.innerHTML = '✔ Bearbeitung beenden';
                    btnToggle.style.backgroundColor = '#10b981';
                    btnToggle.style.color = '#ffffff';
                    btnToggle.style.borderColor = '#059669';
                }
                if (actionsDiv) actionsDiv.style.display = 'flex';

                // Initialize top header bar drag row
                const topBarRow = document.querySelector('.header-top-bar.fh-drag-row');
                if (topBarRow && typeof attachFhRowListeners === 'function') {
                    attachFhRowListeners(topBarRow);
                }


                // Initialize floor-header drag for ALL existing floors
                document.querySelectorAll('tbody.floor-group').forEach(fb => {
                    if (typeof setupFloorHeaderDrag === 'function') setupFloorHeaderDrag(fb);
                });

                document.querySelectorAll('.toolbar-item, .fh-draggable-item').forEach(item => {
                    item.draggable = true;
                });

                const firstItem = document.querySelector('.toolbar-item');
                if (firstItem && typeof selectMenuItemForKeyboard === 'function') selectMenuItemForKeyboard(firstItem);

            } else {
                document.body.classList.remove('menu-edit-mode');
                if (typeof clearMenuItemSelection === 'function') clearMenuItemSelection();
                if (btnToggle) {
                    btnToggle.innerHTML = '✏️ Menüs bearbeiten';
                    btnToggle.style.backgroundColor = '';
                    btnToggle.style.color = '';
                    btnToggle.style.borderColor = '';
                }
                if (actionsDiv) actionsDiv.style.display = 'none';

                const modalWidths = document.getElementById('column-widths-modal');
                if (modalWidths) modalWidths.classList.add('hidden');
                const btnWidths = document.getElementById('btn-column-widths');
                if (btnWidths) {
                    btnWidths.classList.remove('active');
                    btnWidths.style.backgroundColor = '';
                    btnWidths.style.color = '';
                }
                document.body.classList.remove('column-resize-mode');

                document.querySelectorAll('.toolbar-item, .fh-draggable-item').forEach(item => {
                    item.draggable = false;
                });
            }
            updateRowDeleteButtons();
        }

        // Dynamic Height Observer using ResizeObserver
        if (stickyHeader) {
            const updateHeight = () => {
                const height = stickyHeader.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-height', height + 'px');
            };

            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(stickyHeader);
            updateHeight();
        }

        function createRowElement(rowIndex, isCollapsed = false) {
            const row = document.createElement('div');
            row.className = 'toolbar-row' + (isCollapsed ? ' collapsed' : '');
            row.dataset.rowIndex = rowIndex;

            const btnToggle = document.createElement('button');
            btnToggle.className = 'btn-toggle-row';
            btnToggle.title = isCollapsed ? 'Zeile einblenden' : 'Zeile einklappen';
            btnToggle.innerHTML = isCollapsed ? '👁️‍🗨️' : '👁️';
            btnToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                row.classList.toggle('collapsed');
                const nowCollapsed = row.classList.contains('collapsed');
                btnToggle.innerHTML = nowCollapsed ? '👁️‍🗨️' : '👁️';
                btnToggle.title = nowCollapsed ? 'Zeile einblenden' : 'Zeile einklappen';
                saveLayout();
            });

            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete-row';
            btnDelete.title = 'Diese leere Zeile löschen';
            btnDelete.innerHTML = '🗑️';
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteRow(row);
            });

            row.appendChild(btnToggle);
            row.appendChild(btnDelete);
            attachRowDragListeners(row);
            return row;
        }

        function deleteRow(row) {
            const rows = Array.from(rowsContainer.querySelectorAll('.toolbar-row'));
            const rowIdx = rows.indexOf(row);
            if (rowIdx === 0) return; // Row 1 (Master Header) can NEVER be deleted

            const items = row.querySelectorAll('.toolbar-item');
            if (items.length > 0) return; // Non-empty rows cannot be deleted

            if (rows.length > 1) {
                row.remove();
            }

            saveLayout();
        }

        function updateRowDeleteButtons() {
            const rows = Array.from(rowsContainer.querySelectorAll('.toolbar-row'));
            rows.forEach((row, idx) => {
                const items = row.querySelectorAll('.toolbar-item');
                const btnDelete = row.querySelector('.btn-delete-row');
                const btnToggle = row.querySelector('.btn-toggle-row');

                if (idx === 0) {
                    if (btnDelete) btnDelete.style.display = 'none';
                    if (btnToggle) btnToggle.style.right = '8px';
                } else if (items.length === 0 && isMenuEditMode) {
                    if (btnDelete) btnDelete.style.display = 'inline-flex';
                    if (btnToggle) btnToggle.style.right = '32px';
                } else {
                    if (btnDelete) btnDelete.style.display = 'none';
                    if (btnToggle) btnToggle.style.right = '8px';
                }
            });
        }

        const GRID_SECTOR_SIZE = 5; // Fine 5px grid sector units

        function snapToSector(posX) {
            return Math.round(posX / GRID_SECTOR_SIZE) * GRID_SECTOR_SIZE;
        }

        function updateCoordinateRuler() {
            const ruler = document.getElementById('toolbar-coordinate-ruler');
            if (!ruler) return;
            ruler.innerHTML = '';
            const maxPx = 2000;
            const stepPx = 50;
            for (let x = 0; x <= maxPx; x += stepPx) {
                const tick = document.createElement('div');
                const isMajor = (x % 100 === 0);
                tick.className = 'toolbar-ruler-tick' + (isMajor ? ' major-tick' : '');
                tick.style.left = x + 'px';
                tick.textContent = isMajor ? `${x}px` : '|';
                ruler.appendChild(tick);
            }
        }

        function updateCoordinateBadge(item) {
            const badge = document.getElementById('menu-coordinate-badge');
            if (!badge) return;
            if (!item || !document.body.classList.contains('menu-edit-mode')) {
                badge.innerHTML = '📍 Pos: X = -- (Grid: --)';
                return;
            }
            if (item.classList.contains('toolbar-item')) {
                const leftVal = parseInt(item.style.left, 10) || 10;
                const sectorVal = Math.round(leftVal / GRID_SECTOR_SIZE);
                const row = item.closest('.toolbar-row');
                const rowIdx = row ? (parseInt(row.dataset.rowIndex, 10) + 1) : '?';
                let labelText = (item.innerText || item.getAttribute('title') || 'Knopf').replace(/[⋮⋮\n\r]/g, ' ').trim();
                if (labelText.length > 18) labelText = labelText.substring(0, 16) + '…';
                badge.innerHTML = `📍 Zeile ${rowIdx} | <strong>${labelText}</strong>: X=${leftVal}px (Grid: ${sectorVal})`;
            } else if (item.classList.contains('fh-draggable-item')) {
                const marginVal = parseInt(item.style.marginLeft, 10) || 0;
                let labelText = (item.innerText || item.getAttribute('title') || 'Element').replace(/[⋮⋮\n\r]/g, ' ').trim();
                if (labelText.length > 18) labelText = labelText.substring(0, 16) + '…';
                badge.innerHTML = `📍 Verteiler-Header | <strong>${labelText}</strong>: Margin=${marginVal}px`;
            }
        }

        let boundaryToastTimeout = null;
        function showMenuBoundaryToast(msg) {
            let toastEl = document.getElementById('menu-boundary-toast');
            if (!toastEl) {
                toastEl = document.createElement('div');
                toastEl.id = 'menu-boundary-toast';
                toastEl.style.cssText = `
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background-color: #0f172a;
                    color: #ffffff;
                    border-left: 4px solid #f59e0b;
                    padding: 12px 18px;
                    border-radius: 6px;
                    font-size: 0.9em;
                    font-weight: 600;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: opacity 0.25s ease, transform 0.25s ease;
                    opacity: 0;
                    transform: translateY(10px);
                    pointer-events: none;
                `;
                document.body.appendChild(toastEl);
            }

            toastEl.innerHTML = `<span style="font-size: 1.2em;">⚠️</span> <span>${msg || 'Rechter Rand erreicht! Das Menü wird nicht automatisch verbreitert.'}</span>`;
            toastEl.style.opacity = '1';
            toastEl.style.transform = 'translateY(0)';

            if (boundaryToastTimeout) clearTimeout(boundaryToastTimeout);
            boundaryToastTimeout = setTimeout(() => {
                toastEl.style.opacity = '0';
                toastEl.style.transform = 'translateY(10px)';
            }, 3000);
        }

        function resolveDropOverlapByPushingRight(targetRow, itemToPlace, proposedLeft, showToastOnBoundary = true) {
            if (!targetRow || !itemToPlace) return;
            const minLeft = 10;
            const itemWidth = itemToPlace.offsetWidth || 110;
            const rowWidth = targetRow.clientWidth || 1200;
            const maxLeft = Math.max(minLeft, rowWidth - itemWidth - 25);

            // 1. Initial-Prüfung: Begrenzt die angeforderte left-Position auf min/max Grenzen & snapped auf Sektor
            let hitRightEdge = false;
            if (proposedLeft > maxLeft) {
                hitRightEdge = true;
            }

            let snappedLeft = snapToSector(proposedLeft);
            let leftVal = Math.max(minLeft, Math.min(maxLeft, snappedLeft));
            itemToPlace.style.left = leftVal + 'px';
            itemToPlace.dataset.sector = Math.round(leftVal / GRID_SECTOR_SIZE);

            if (itemToPlace.parentNode !== targetRow) {
                targetRow.appendChild(itemToPlace);
            }

            const items = Array.from(targetRow.querySelectorAll('.toolbar-item'))
                .map(el => ({
                    el: el,
                    left: parseInt(el.style.left, 10) || minLeft,
                    width: el.offsetWidth || 110
                }))
                .sort((a, b) => a.left - b.left);

            if (items.length <= 1) {
                updateCoordinateBadge(itemToPlace);
                return;
            }

            // 2. Pass 1 (Links-nach-Rechts): Überlappt ein Knopf seinen linken Nachbarn, wird er kaskadierend auf Sektor-Raster nach rechts geschoben.
            for (let i = 1; i < items.length; i++) {
                const previous = items[i - 1];
                const current = items[i];
                const minAllowedLeft = snapToSector(previous.left + previous.width + 10);
                if (current.left < minAllowedLeft) {
                    current.left = minAllowedLeft;
                    current.el.style.left = current.left + 'px';
                    current.el.dataset.sector = Math.round(current.left / GRID_SECTOR_SIZE);
                }
            }

            // 3. Pass 2 (Rechts-nach-Links): Ragt ein Knopf am rechten Zeilenende heraus, wird er nach links korrigiert und schiebt bei Bedarf Nachbarn ein.
            for (let i = items.length - 1; i >= 0; i--) {
                const current = items[i];
                const currentWidth = current.el.offsetWidth || 110;
                const currentMaxLeft = snapToSector(Math.max(minLeft, rowWidth - currentWidth - 25));

                if (current.left > currentMaxLeft) {
                    current.left = currentMaxLeft;
                    current.el.style.left = current.left + 'px';
                    current.el.dataset.sector = Math.round(current.left / GRID_SECTOR_SIZE);
                    hitRightEdge = true;
                }

                if (i > 0) {
                    const previous = items[i - 1];
                    const maxAllowedLeftForPrev = snapToSector(current.left - previous.width - 10);
                    if (previous.left > maxAllowedLeftForPrev) {
                        previous.left = Math.max(minLeft, maxAllowedLeftForPrev);
                        previous.el.style.left = previous.left + 'px';
                        previous.el.dataset.sector = Math.round(previous.left / GRID_SECTOR_SIZE);
                    }
                }
            }

            updateCoordinateBadge(itemToPlace);

            if (hitRightEdge && showToastOnBoundary) {
                showMenuBoundaryToast('⚠️ Rechter Rand erreicht! Das Element wurde am Rand eingepasst.');
            }
        }

        function saveLayout() {
            const layoutData = getLayoutDataObject();
            localStorage.setItem('fbhToolbarLayout', JSON.stringify(layoutData));
            updateRowDeleteButtons();
            updateHeaderHeight();
        }

        function getLayoutDataObject() {
            const rows = Array.from(rowsContainer.querySelectorAll('.toolbar-row'));
            const rowsLayout = rows.map(container => {
                return {
                    collapsed: container.classList.contains('collapsed'),
                    items: Array.from(container.querySelectorAll('.toolbar-item'))
                        .map(el => {
                            const leftVal = snapToSector(parseInt(el.style.left, 10) || 15);
                            const sectorVal = Math.round(leftVal / GRID_SECTOR_SIZE);
                            el.dataset.sector = sectorVal;
                            return {
                                id: el.dataset.btnId,
                                left: leftVal,
                                sector: sectorVal
                            };
                        })
                        .filter(item => Boolean(item.id))
                };
            });

            const poolContainer = document.getElementById('tools-pool-container');
            const poolItems = poolContainer ? Array.from(poolContainer.querySelectorAll('.toolbar-item'))
                .map(el => el.dataset.btnId)
                .filter(Boolean) : [];

            // Collect current floor-header order and margins from the live DOM
            const currentFloorOrder = Object.assign({}, savedFloorHeaderOrder);
            document.querySelectorAll('.fh-drag-row[data-fh-row]').forEach(row => {
                const rowType = row.dataset.fhRow;
                if (rowType) {
                    const items = Array.from(row.querySelectorAll('.fh-draggable-item'));
                    currentFloorOrder[rowType] = {
                        order: items.map(i => i.dataset.fhId).filter(Boolean),
                        margins: items.reduce((acc, i) => {
                            if (i.dataset.fhId) {
                                acc[i.dataset.fhId] = i.style.marginLeft || '0px';
                            }
                            return acc;
                        }, {})
                    };
                }
            });

            return {
                updatedAt: Date.now(),
                rows: rowsLayout,
                toolsPool: poolItems,
                floorHeaderOrder: currentFloorOrder,
                columnWidths: (typeof window.getStoredColumnWidths === 'function') ? window.getStoredColumnWidths() : null
            };
        }


        function restoreLayout(layoutData) {
            let layoutArray = [];
            let toolsPoolArray = [];
            let floorHeaderOrderData = {};

            if (layoutData && typeof layoutData === 'object' && !Array.isArray(layoutData)) {
                layoutArray = layoutData.rows || [];
                toolsPoolArray = layoutData.toolsPool || [];
                floorHeaderOrderData = layoutData.floorHeaderOrder || {};

                if (typeof window.getStoredColumnWidths === 'function' && typeof window.applyColumnWidths === 'function') {
                    if (layoutData && layoutData.columnWidths && (layoutData._isUserImport || layoutData === defaultLayout || !localStorage.getItem('fbhColumnWidths'))) {
                        window.saveStoredColumnWidths(layoutData.columnWidths);
                        window.applyColumnWidths(layoutData.columnWidths);
                    } else {
                        window.applyColumnWidths(window.getStoredColumnWidths());
                    }
                }
            } else if (Array.isArray(layoutData)) {
                layoutArray = layoutData;
            } else {
                layoutArray = defaultLayout.rows || defaultLayout;
            }

            rowsContainer.innerHTML = '';
            const placedIds = new Set();

            layoutArray.forEach((rowData, idx) => {
                let rowItems = [];
                let isCollapsed = false;

                if (Array.isArray(rowData)) {
                    rowItems = rowData;
                } else if (rowData && typeof rowData === 'object') {
                    rowItems = rowData.items || [];
                    isCollapsed = Boolean(rowData.collapsed);
                }

                const row = createRowElement(idx, isCollapsed);
                rowsContainer.appendChild(row);

                if (Array.isArray(rowItems)) {
                    rowItems.forEach((itemInfo, itemIdx) => {
                        let id, left, sector;
                        if (typeof itemInfo === 'string') {
                            id = itemInfo;
                        } else if (itemInfo && typeof itemInfo === 'object') {
                            id = itemInfo.id;
                            left = itemInfo.left;
                            sector = itemInfo.sector;
                        }

                        if (id && allItemsMap[id]) {
                            const el = allItemsMap[id];
                            if (typeof left !== 'number' || isNaN(left)) {
                                left = 15 + itemIdx * 140;
                            }
                            left = snapToSector(left);
                            if (typeof sector !== 'number' || isNaN(sector)) {
                                sector = Math.round(left / GRID_SECTOR_SIZE);
                            }
                            el.style.left = left + 'px';
                            el.dataset.sector = sector;
                            el.style.position = 'absolute';
                            row.appendChild(el);
                            placedIds.add(id);
                        }
                    });
                }
            });

            // Populate tools pool
            const toolsPoolContainer = document.getElementById('tools-pool-container');
            if (toolsPoolContainer) {
                toolsPoolContainer.innerHTML = '';
                toolsPoolArray.forEach(id => {
                    if (id && allItemsMap[id]) {
                        const el = allItemsMap[id];
                        el.style.left = '';
                        el.style.top = '';
                        el.style.position = '';
                        toolsPoolContainer.appendChild(el);
                        placedIds.add(id);
                    }
                });
            }

            // Fallback for any unassigned toolbar items -> place in row 0
            const firstRow = rowsContainer.querySelector('.toolbar-row') || createRowElement(0);
            if (!rowsContainer.contains(firstRow)) rowsContainer.appendChild(firstRow);

            let defaultOffset = 15;
            Object.keys(allItemsMap).forEach(id => {
                if (!placedIds.has(id)) {
                    const el = allItemsMap[id];
                    if (!el.style.left) {
                        el.style.left = defaultOffset + 'px';
                        defaultOffset += 140;
                    }
                    el.style.position = 'absolute';
                    firstRow.appendChild(el);
                }
            });

            // Resolve any overlaps in all rows after restoring layout
            rowsContainer.querySelectorAll('.toolbar-row').forEach(row => {
                const items = Array.from(row.querySelectorAll('.toolbar-item'));
                items.forEach(el => {
                    const currentLeft = parseInt(el.style.left, 10) || 15;
                    resolveDropOverlapByPushingRight(row, el, currentLeft);
                });
            });

            attachItemDragListeners();
            attachDeleteRowListeners();
            updateRowDeleteButtons();
            updateHeaderHeight();

            // Restore floor-header element order if saved
            if (Object.keys(floorHeaderOrderData).length > 0) {
                if (typeof restoreFloorHeaderOrders === 'function') {
                    restoreFloorHeaderOrders(floorHeaderOrderData);
                }
            }
        }

        restoreToolbarLayout = restoreLayout;

        function attachDeleteRowListeners() {
            const rows = Array.from(rowsContainer.querySelectorAll('.toolbar-row'));
            rows.forEach((row, idx) => {
                if (idx === 0) {
                    const existingBtn = row.querySelector('.btn-delete-row');
                    if (existingBtn) existingBtn.remove();
                    return;
                }

                let btnDelete = row.querySelector('.btn-delete-row');
                if (!btnDelete) {
                    btnDelete = document.createElement('button');
                    btnDelete.className = 'btn-delete-row';
                    btnDelete.title = 'Diese leere Zeile löschen';
                    btnDelete.innerHTML = '🗑️';
                    row.appendChild(btnDelete);
                }
                if (!btnDelete.dataset.deleteListenerAttached) {
                    btnDelete.dataset.deleteListenerAttached = "true";
                    btnDelete.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteRow(row);
                    });
                }
            });
            updateRowDeleteButtons();
        }

        function updateHeaderHeight() {
            if (stickyHeader) {
                const height = stickyHeader.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-height', height + 'px');
            }
        }

        let draggedItem = null;
        let dragOffsetX = 0;
        let initialRow = null;
        let initialLeft = '15px';
        let wasDropped = false;

        // Mouse-based drag state for toolbar row items (replaces HTML5 drag API)
        let mbDragItem = null;
        let mbDragOffsetX = 0;
        let mbDragCurrentRow = null;
        let mbDragInitialRow = null;
        let mbDragInitialLeft = '15px';

        function attachItemDragListeners() {
            // Toolbar row items now use mouse-based drag (see global mousemove/mouseup below).
            // HTML5 drag is only kept for pool-item -> row transfers.
            document.querySelectorAll('.toolbar-item').forEach(item => {
                if (item.dataset.dragInitialized) return;
                item.dataset.dragInitialized = 'true';

                const inPool = () => !!item.closest('#tools-pool-container');

                item.draggable = false;  // Off by default; pool items enable on mousedown

                item.addEventListener('mouseup', () => {
                    item.draggable = false;
                });

                // HTML5 drag: only used when item is in the tools pool
                item.addEventListener('dragstart', (e) => {
                    if (!isMenuEditMode || !inPool()) {
                        e.preventDefault();
                        return false;
                    }
                    draggedItem = item;
                    initialRow = item.closest('#tools-pool-container');
                    initialLeft = item.style.left || '15px';
                    wasDropped = false;
                    item.classList.add('dragging');
                    const rect = item.getBoundingClientRect();
                    dragOffsetX = e.clientX - rect.left;
                    if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', item.dataset.btnId || '');
                    }
                });

                item.addEventListener('dragend', () => {
                    item.draggable = false;
                    if (draggedItem && !wasDropped && initialRow) {
                        draggedItem.style.position = '';
                        draggedItem.style.left = '';
                        draggedItem.style.top = '';
                        initialRow.appendChild(draggedItem);
                    }
                    if (draggedItem) draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    initialRow = null;
                    wasDropped = false;
                    document.querySelectorAll('.toolbar-row').forEach(r => r.classList.remove('drag-over'));
                    saveLayout();
                });
            });
        }

        function attachRowDragListeners(rowContainer) {
            if (!rowContainer || rowContainer.dataset.dropListenersAttached) return;
            rowContainer.dataset.dropListenersAttached = "true";

            const handleDragOver = (e) => {
                if (!isMenuEditMode) return;
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                rowContainer.classList.add('drag-over');

                if (draggedItem) {
                    // Während des Ziehens: nur den gezogenen Knopf frei bewegen.
                    // Alle anderen Knöpfe bleiben an ihrer Stelle (kein cascading).
                    // Erst beim drop werden Kollisionen aufgelöst.
                    if (draggedItem.parentNode !== rowContainer) {
                        draggedItem.style.position = 'absolute';
                        rowContainer.appendChild(draggedItem);
                    }
                    const rect = rowContainer.getBoundingClientRect();
                    const rowWidth = rowContainer.clientWidth || 1200;
                    const itemWidth = draggedItem.offsetWidth || 110;
                    let posX = e.clientX - rect.left - (dragOffsetX || 20);
                    posX = Math.max(10, Math.min(rowWidth - itemWidth - 25, posX));
                    draggedItem.style.left = posX + 'px';
                }
            };

            rowContainer.addEventListener('dragenter', handleDragOver);
            rowContainer.addEventListener('dragover', handleDragOver);

            rowContainer.addEventListener('dragleave', (e) => {
                if (!rowContainer.contains(e.relatedTarget)) {
                    rowContainer.classList.remove('drag-over');
                }
            });

            rowContainer.addEventListener('drop', (e) => {
                if (!isMenuEditMode) return;
                e.preventDefault();
                e.stopPropagation();
                rowContainer.classList.remove('drag-over');

                if (draggedItem) {
                    draggedItem.style.position = 'absolute';
                    const rect = rowContainer.getBoundingClientRect();
                    let posX = e.clientX - rect.left - (dragOffsetX || 20);

                    resolveDropOverlapByPushingRight(rowContainer, draggedItem, posX, true);
                    wasDropped = true;
                }
                saveLayout();
            });
        }

        // Attach listeners to initial rows
        rowsContainer.querySelectorAll('.toolbar-row').forEach(row => attachRowDragListeners(row));

        // Drag and drop listeners on tools-pool-container to receive dropped items
        const toolsPoolContainer = document.getElementById('tools-pool-container');
        if (toolsPoolContainer) {
            toolsPoolContainer.addEventListener('dragover', (e) => {
                if (!isMenuEditMode) return;
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                toolsPoolContainer.style.borderColor = 'var(--primary-color, #0078d7)';
                toolsPoolContainer.style.backgroundColor = 'rgba(0, 120, 215, 0.05)';
            });

            toolsPoolContainer.addEventListener('dragleave', () => {
                toolsPoolContainer.style.borderColor = '';
                toolsPoolContainer.style.backgroundColor = '';
            });

            toolsPoolContainer.addEventListener('drop', (e) => {
                if (!isMenuEditMode) return;
                e.preventDefault();
                e.stopPropagation();
                toolsPoolContainer.style.borderColor = '';
                toolsPoolContainer.style.backgroundColor = '';

                if (draggedItem) {
                    draggedItem.style.position = '';
                    draggedItem.style.left = '';
                    draggedItem.style.top = '';
                    toolsPoolContainer.appendChild(draggedItem);
                    wasDropped = true;
                    saveLayout();
                }
            });
        }
        attachDeleteRowListeners();

        /** Keyboard arrow key menu item selection and precision nudging system */
        function selectMenuItemForKeyboard(item) {
            if (!item) return;
            document.querySelectorAll('.selected-menu-item').forEach(i => i.classList.remove('selected-menu-item'));
            item.classList.add('selected-menu-item');
            if (typeof updateCoordinateBadge === 'function') updateCoordinateBadge(item);
        }

        function clearMenuItemSelection() {
            document.querySelectorAll('.selected-menu-item').forEach(i => i.classList.remove('selected-menu-item'));
            if (typeof updateCoordinateBadge === 'function') updateCoordinateBadge(null);
        }

        function nudgeMenuItem(item, deltaX) {
            if (!item) return;
            if (item.classList.contains('toolbar-item')) {
                const rawLeft = parseInt(item.style.left, 10);
                const currentLeft = isNaN(rawLeft) ? (item.offsetLeft || 15) : rawLeft;
                const newLeft = snapToSector(Math.max(10, currentLeft + deltaX));
                const row = item.closest('.toolbar-row');

                if (row) {
                    resolveDropOverlapByPushingRight(row, item, newLeft, true);
                } else {
                    item.style.left = newLeft + 'px';
                    item.dataset.sector = Math.round(newLeft / GRID_SECTOR_SIZE);
                }
                saveLayout();
            } else if (item.classList.contains('fh-draggable-item')) {
                const row = item.closest('.fh-drag-row');
                if (!row) return;

                const currentMargin = parseInt(item.style.marginLeft, 10) || 0;
                const newMargin = currentMargin + deltaX;

                if (deltaX > 0) {
                    const container = item.closest('.floor-header-container') || row;
                    const containerRect = container.getBoundingClientRect();
                    const itemRect = item.getBoundingClientRect();

                    if (itemRect.right + deltaX >= containerRect.right - 10) {
                        showMenuBoundaryToast('⚠️ Rechter Rand im Verteiler-Header erreicht! Element gestoppt.');
                        return;
                    }

                    const nextItem = item.nextElementSibling;
                    if (nextItem && nextItem.classList.contains('fh-draggable-item')) {
                        const nextRect = nextItem.getBoundingClientRect();
                        if (itemRect.left + deltaX > nextRect.left + (nextRect.width / 2)) {
                            row.insertBefore(nextItem, item);
                            item.style.marginLeft = '0px';
                            nextItem.style.marginLeft = '8px';
                            applyFhOrderToAll(row);
                            saveLayout();
                            return;
                        }
                    }
                    item.style.marginLeft = Math.max(0, newMargin) + 'px';
                    applyFhOrderToAll(row);
                    saveLayout();

                } else if (deltaX < 0) {
                    if (newMargin < 0) {
                        const prevItem = item.previousElementSibling;
                        if (prevItem && prevItem.classList.contains('fh-draggable-item')) {
                            row.insertBefore(item, prevItem);
                            item.style.marginLeft = '8px';
                            applyFhOrderToAll(row);
                            saveLayout();
                            return;
                        }
                        item.style.marginLeft = '0px';
                    } else {
                        item.style.marginLeft = newMargin + 'px';
                    }
                    applyFhOrderToAll(row);
                    saveLayout();
                }
            }
        }

        function moveMenuItemRow(item, direction) {
            if (!item) return;
            if (item.classList.contains('toolbar-item')) {
                const currentRow = item.closest('.toolbar-row');
                if (!currentRow) return;
                const allRows = Array.from(document.querySelectorAll('#toolbar-rows-container .toolbar-row'));
                const currentIndex = allRows.indexOf(currentRow);
                const targetIndex = currentIndex + direction;

                if (targetIndex >= 0 && targetIndex < allRows.length) {
                    const targetRow = allRows[targetIndex];
                    const rawLeft = parseInt(item.style.left, 10);
                    const currentLeft = isNaN(rawLeft) ? (item.offsetLeft || 15) : rawLeft;
                    resolveDropOverlapByPushingRight(targetRow, item, currentLeft);
                    saveLayout();
                }
            } else if (item.classList.contains('fh-draggable-item')) {
                const headerContainer = item.closest('.floor-header-container');
                if (!headerContainer) return;
                const currentRow = item.closest('.fh-drag-row');
                if (!currentRow) return;

                const rows = Array.from(headerContainer.querySelectorAll('.fh-drag-row'));
                const currentIndex = rows.indexOf(currentRow);
                const targetIndex = currentIndex + direction;

                if (targetIndex >= 0 && targetIndex < rows.length) {
                    const targetRow = rows[targetIndex];
                    placeFhItemInRow(targetRow, item, item.getBoundingClientRect().left);
                    applyFhOrderToAll(targetRow);
                    saveLayout();
                }
            }
        }

        // Capturing click listener: Deactivates and blocks ALL button functions during menu edit mode
        document.addEventListener('click', (e) => {
            if (!document.body.classList.contains('menu-edit-mode')) return;

            // Allow clicking edit control buttons (Save Layout, Load Layout, Add Row, End Edit)
            if (e.target.closest('#btn-toggle-menu-edit, #menu-edit-actions')) {
                return;
            }

            const menuItem = e.target.closest('.toolbar-item, .fh-draggable-item');
            if (menuItem) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                selectMenuItemForKeyboard(menuItem);
            } else {
                const isToolbarContainer = e.target.closest('.toolbar-row, .fh-drag-row, #tools-pool-container, #toolbar-rows-container');
                if (!isToolbarContainer) {
                    clearMenuItemSelection();
                }
            }
        }, true);

        // Capturing mousedown: initiates mouse-drag for ALL .toolbar-item elements (in rows OR in tools pool)
        document.addEventListener('mousedown', (e) => {
            if (!document.body.classList.contains('menu-edit-mode')) return;
            if (e.target.closest('#btn-toggle-menu-edit, #menu-edit-actions')) return;

            const item = e.target.closest('.toolbar-item');
            if (item && e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const rect = item.getBoundingClientRect();
                mbDragItem = item;
                mbDragOffsetX = e.clientX - rect.left;
                mbDragCurrentRow = item.closest('.toolbar-row') || item.closest('#tools-pool-container');
                mbDragInitialRow = mbDragCurrentRow;
                mbDragInitialLeft = item.style.left || '15px';

                item.classList.add('dragging');
                item.style.zIndex = '10000';
                selectMenuItemForKeyboard(item);
                return;
            }

            const fhItem = e.target.closest('.fh-draggable-item');
            if (fhItem) {
                e.stopPropagation();
            }
        }, true);

        // Block change and input actions on toolbar items during menu edit mode
        ['change', 'input'].forEach(evtType => {
            document.addEventListener(evtType, (e) => {
                if (!document.body.classList.contains('menu-edit-mode')) return;
                if (e.target.closest('#btn-toggle-menu-edit, #menu-edit-actions')) return;
                const item = e.target.closest('.toolbar-item, .fh-draggable-item');
                if (item) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
        });

        // Global mousemove: freely move the toolbar item under the cursor (into rows or over tools pool)
        document.addEventListener('mousemove', (e) => {
            if (!mbDragItem || !document.body.classList.contains('menu-edit-mode')) return;

            const poolContainer = document.getElementById('tools-pool-container');
            const poolRect = poolContainer ? poolContainer.getBoundingClientRect() : null;

            const isOverPool = poolRect && (
                e.clientX >= poolRect.left && e.clientX <= poolRect.right &&
                e.clientY >= poolRect.top && e.clientY <= poolRect.bottom
            );

            if (poolContainer) {
                if (isOverPool) {
                    poolContainer.style.borderColor = 'var(--primary-color, #0078d7)';
                    poolContainer.style.backgroundColor = 'rgba(0, 120, 215, 0.08)';
                } else {
                    poolContainer.style.borderColor = '';
                    poolContainer.style.backgroundColor = '';
                }
            }

            if (isOverPool) {
                return;
            }

            // Find which toolbar-row the cursor is currently in (by Y bounding rect)
            let targetRow = null;
            const allRows = document.querySelectorAll('#toolbar-rows-container .toolbar-row');
            for (const row of allRows) {
                const rect = row.getBoundingClientRect();
                if (e.clientY >= rect.top - 15 && e.clientY <= rect.bottom + 15) {
                    targetRow = row;
                    break;
                }
            }

            if (!targetRow) return;

            // Move item to new row if cursor crossed a row boundary
            if (mbDragItem.parentNode !== targetRow) {
                mbDragCurrentRow = targetRow;
                mbDragItem.style.position = 'absolute';
                targetRow.appendChild(mbDragItem);
            }

            const rowRect = targetRow.getBoundingClientRect();
            const rowWidth = targetRow.clientWidth || 1200;
            const itemWidth = mbDragItem.offsetWidth || 110;
            let posX = e.clientX - rowRect.left - mbDragOffsetX;
            posX = snapToSector(Math.max(10, Math.min(rowWidth - itemWidth - 25, posX)));
            mbDragItem.style.position = 'absolute';
            mbDragItem.style.left = posX + 'px';
            mbDragItem.dataset.sector = Math.round(posX / GRID_SECTOR_SIZE);
            if (typeof updateCoordinateBadge === 'function') updateCoordinateBadge(mbDragItem);
        });

        // Global mouseup: resolve collisions at drop position (in toolbar row or tools pool), save layout
        document.addEventListener('mouseup', (e) => {
            if (!mbDragItem) return;
            const item = mbDragItem;
            mbDragItem = null;

            item.classList.remove('dragging');
            item.style.zIndex = '';

            const poolContainer = document.getElementById('tools-pool-container');
            if (poolContainer) {
                poolContainer.style.borderColor = '';
                poolContainer.style.backgroundColor = '';
            }

            const poolRect = poolContainer ? poolContainer.getBoundingClientRect() : null;
            const droppedInPool = poolRect && (
                e.clientX >= poolRect.left && e.clientX <= poolRect.right &&
                e.clientY >= poolRect.top && e.clientY <= poolRect.bottom
            );

            if (droppedInPool && poolContainer) {
                // Drop item into Tools Pool (ausblenden / in Pool verschieben)
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
                poolContainer.appendChild(item);
                saveLayout();
            } else {
                const row = item.closest('.toolbar-row');
                if (row) {
                    const currentLeft = parseInt(item.style.left, 10) || 10;
                    resolveDropOverlapByPushingRight(row, item, currentLeft, true);
                    saveLayout();
                } else if (mbDragInitialRow) {
                    mbDragInitialRow.appendChild(item);
                    item.style.position = 'absolute';
                    item.style.left = mbDragInitialLeft;
                    saveLayout();
                }
            }

            mbDragCurrentRow = null;
            mbDragInitialRow = null;
            document.querySelectorAll('.toolbar-row').forEach(r => r.classList.remove('drag-over'));
        });

        /** Ctrl + Arrow Key Selection Switcher System */
        function switchSelectionWithCtrl(key) {
            const allItems = Array.from(document.querySelectorAll('body.menu-edit-mode .toolbar-item, body.menu-edit-mode .fh-draggable-item'))
                .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

            if (allItems.length === 0) return;

            const currentSelected = document.querySelector('.selected-menu-item');
            if (!currentSelected) {
                selectMenuItemForKeyboard(allItems[0]);
                return;
            }

            const currentIndex = allItems.indexOf(currentSelected);

            if (key === 'ArrowRight') {
                const nextIndex = (currentIndex + 1) % allItems.length;
                selectMenuItemForKeyboard(allItems[nextIndex]);
            } else if (key === 'ArrowLeft') {
                const prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
                selectMenuItemForKeyboard(allItems[prevIndex]);
            } else if (key === 'ArrowDown' || key === 'ArrowUp') {
                const currentRow = currentSelected.closest('.toolbar-row, .fh-drag-row');
                const allRows = Array.from(document.querySelectorAll('body.menu-edit-mode .toolbar-row, body.menu-edit-mode .fh-drag-row'))
                    .filter(r => r.querySelectorAll('.toolbar-item, .fh-draggable-item').length > 0);

                if (!currentRow || allRows.length <= 1) return;

                const rowIdx = allRows.indexOf(currentRow);
                const targetRowIdx = rowIdx + (key === 'ArrowDown' ? 1 : -1);

                if (targetRowIdx >= 0 && targetRowIdx < allRows.length) {
                    const targetRow = allRows[targetRowIdx];
                    const targetRowItems = Array.from(targetRow.querySelectorAll('.toolbar-item, .fh-draggable-item'));
                    if (targetRowItems.length === 0) return;

                    const selRect = currentSelected.getBoundingClientRect();
                    const selCenterX = selRect.left + (selRect.width / 2);

                    let closestItem = targetRowItems[0];
                    let minDiff = Math.abs((closestItem.getBoundingClientRect().left + closestItem.getBoundingClientRect().width / 2) - selCenterX);

                    targetRowItems.forEach(i => {
                        const r = i.getBoundingClientRect();
                        const diff = Math.abs((r.left + r.width / 2) - selCenterX);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestItem = i;
                        }
                    });

                    selectMenuItemForKeyboard(closestItem);
                }
            }
        }

        window.addEventListener('keydown', (e) => {
            if (isVerteilerMoveMode && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                if (e.key === 'ArrowUp') {
                    moveActiveVerteiler(-1);
                } else if (e.key === 'ArrowDown') {
                    moveActiveVerteiler(1);
                }
                return;
            }

            if (!document.body.classList.contains('menu-edit-mode')) return;

            const activeEl = document.activeElement;
            const activeTag = activeEl ? activeEl.tagName : '';
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
                const parentItem = activeEl.closest('.toolbar-item, .fh-draggable-item');
                if (parentItem && document.body.classList.contains('menu-edit-mode')) {
                    activeEl.blur();
                    selectMenuItemForKeyboard(parentItem);
                } else {
                    return;
                }
            }

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                // Holding Ctrl (or Cmd) -> Switch selection between menu items!
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    switchSelectionWithCtrl(e.key);
                    return;
                }

                // Move/nudge selected item with Arrow keys!
                let selectedItem = document.querySelector('.selected-menu-item');
                if (!selectedItem) {
                    selectedItem = document.querySelector('body.menu-edit-mode .toolbar-item, body.menu-edit-mode .fh-draggable-item');
                    if (selectedItem) selectMenuItemForKeyboard(selectedItem);
                }

                if (!selectedItem) return;

                const isShift = e.shiftKey;
                const step = isShift ? 25 : 5; // 5px clearly visible step, 25px with Shift!

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    nudgeMenuItem(selectedItem, -step);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nudgeMenuItem(selectedItem, step);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveMenuItemRow(selectedItem, -1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveMenuItemRow(selectedItem, 1);
                }
            }
        });

        // Help Button Listener

        const btnHelp = document.getElementById('btn-help');
        if (btnHelp && !btnHelp.dataset.listenerAttached) {
            btnHelp.dataset.listenerAttached = "true";
            btnHelp.addEventListener('click', (e) => {
                if (e.target.closest('.drag-handle')) return;
                window.open('glossar.html', '_blank');
            });
        }

        // Edit Mode Toggle Button Listener

        const btnToggleEdit = document.getElementById('btn-toggle-menu-edit');
        if (btnToggleEdit && !btnToggleEdit.dataset.listenerAttached) {
            btnToggleEdit.dataset.listenerAttached = "true";
            btnToggleEdit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuEditMode(!isMenuEditMode);
            });
        }

        // Layout Export Button Listener
        const btnExportLayout = document.getElementById('btn-export-layout-file');
        if (btnExportLayout && !btnExportLayout.dataset.listenerAttached) {
            btnExportLayout.dataset.listenerAttached = "true";
            btnExportLayout.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const layoutData = getLayoutDataObject();
                const jsonStr = JSON.stringify(layoutData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'menu_layout.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        // Code-Sync (.bat) Button Listener
        const btnApplyLayoutBat = document.getElementById('btn-apply-layout-bat');
        const modalBatSyncInfo = document.getElementById('modal-bat-sync-info');
        const btnBatSyncClose = document.getElementById('btn-bat-sync-close');

        if (btnApplyLayoutBat && !btnApplyLayoutBat.dataset.listenerAttached) {
            btnApplyLayoutBat.dataset.listenerAttached = "true";
            btnApplyLayoutBat.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const layoutData = getLayoutDataObject();
                const jsonStr = JSON.stringify(layoutData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'menu_layout.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                if (modalBatSyncInfo) {
                    modalBatSyncInfo.classList.remove('hidden');
                    modalBatSyncInfo.style.display = 'flex';
                }
            });
        }

        if (btnBatSyncClose) {
            btnBatSyncClose.addEventListener('click', () => {
                if (modalBatSyncInfo) {
                    modalBatSyncInfo.classList.add('hidden');
                    modalBatSyncInfo.style.display = 'none';
                }
            });
        }
        if (modalBatSyncInfo) {
            modalBatSyncInfo.addEventListener('click', (e) => {
                if (e.target === modalBatSyncInfo) {
                    modalBatSyncInfo.classList.add('hidden');
                    modalBatSyncInfo.style.display = 'none';
                }
            });
        }

        // Layout Import Button Listener
        const btnImportLayout = document.getElementById('btn-import-layout-file');
        const fileInputLayout = document.getElementById('layout-file-input');
        if (btnImportLayout && fileInputLayout && !btnImportLayout.dataset.listenerAttached) {
            btnImportLayout.dataset.listenerAttached = "true";
            btnImportLayout.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputLayout.value = '';
                fileInputLayout.click();
            });

            fileInputLayout.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        try {
                            const parsed = JSON.parse(evt.target.result);
                            if (parsed && typeof parsed === 'object') {
                                localStorage.setItem('fbhToolbarLayout', JSON.stringify(parsed));
                                restoreLayout(parsed);
                                alert("Menü-Layout wurde erfolgreich importiert!");
                            } else {
                                alert("Ungültiges Menü-Layout Dateiformat.");
                            }
                        } catch(err) {
                            alert("Fehler beim Importieren des Menü-Layouts: " + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            });
        }

        // Add row button click (with duplicate guard)
        if (btnAddRow && !btnAddRow.dataset.listenerAttached) {
            btnAddRow.dataset.listenerAttached = "true";
            btnAddRow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const newIndex = rowsContainer.children.length;
                const newRow = createRowElement(newIndex);
                rowsContainer.appendChild(newRow);
                saveLayout();
                updateHeaderHeight();
            });
        }

        // Reset layout button click (with duplicate guard)
        if (btnReset && !btnReset.dataset.listenerAttached) {
            btnReset.dataset.listenerAttached = "true";
            btnReset.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('fbhToolbarLayout');
                restoreLayout(defaultLayout);
            });
        }

        // Initialize Edit Mode to false by default
        setMenuEditMode(false);

        // Load saved layout or default (auto-sync when default_toolbar_layout.js synced by BAT file is newer)
        const savedLayoutStr = localStorage.getItem('fbhToolbarLayout');
        let savedLayout = null;
        if (savedLayoutStr) {
            try { savedLayout = JSON.parse(savedLayoutStr); } catch (e) {}
        }

        // Auto-sync: If defaultLayout (from default_toolbar_layout.js synced by BAT file) is newer than browser's stale localStorage, adopt defaultLayout!
        if (defaultLayout && typeof defaultLayout === 'object' && defaultLayout.updatedAt) {
            if (!savedLayout || !savedLayout.updatedAt || defaultLayout.updatedAt > savedLayout.updatedAt) {
                try { localStorage.setItem('fbhToolbarLayout', JSON.stringify(defaultLayout)); } catch (e) {}
                savedLayout = defaultLayout;
            }
        }

        if (savedLayout && typeof savedLayout === 'object') {
            restoreLayout(savedLayout);
        } else if (defaultLayout && typeof defaultLayout === 'object') {
            restoreLayout(defaultLayout);
        }

    }

    // Initialize Draggable Toolbar



    // Initialize Draggable Toolbar

    initDraggableToolbar();

    // --- Functions ---

    function assignRoomsToFloor(floorBody, roomDataList) {
        if (!floorBody || !Array.isArray(roomDataList)) return;
        
        roomDataList.forEach(roomData => {
            if (roomData && roomData.name) {
                const existingRows = Array.from(floorBody.querySelectorAll('tr.room-row'));
                let targetTr = null;
                for (const tr of existingRows) {
                    const name = tr.querySelector('.input-room-name')?.value || '';
                    const areaRz = parseFloat(tr.querySelector('.input-area')?.value || 0);
                    const areaIz = parseFloat(tr.querySelector('.input-area-iz')?.value || 0);
                    if (!name && areaRz === 0 && areaIz === 0) {
                        targetTr = tr;
                        break;
                    }
                }

                if (!targetTr) {
                    targetTr = addRoomToFloor(floorBody);
                }

                unassignCadRoomForTr(targetTr);

                const inputName = targetTr.querySelector('.input-room-name');
                const inputAreaIz = targetTr.querySelector('.input-area-iz');
                const inputVaIz = targetTr.querySelector('.input-va-iz');

                if (inputName) {
                    inputName.value = roomData.name;
                    inputName.readOnly = true;
                }
                const aNum = typeof roomData.area === 'number' ? roomData.area : (parseFloat(roomData.area) || 0);
                if (inputAreaIz) inputAreaIz.value = aNum;
                if (inputVaIz && (!inputVaIz.value || parseFloat(inputVaIz.value) === 0)) {
                    inputVaIz.value = 20;
                }

                targetTr.dataset.cadId = roomData.id;

                calculateRow(targetTr);

                const poolRm = cadRoomPool.find(r => r.id === roomData.id);
                const ebeneName = floorBody.querySelector('.input-floor-name')?.value || 'Geschoss';
                if (poolRm) {
                    poolRm.assignedFloor = ebeneName;
                }
            }
        });

        calculateFloorSum(floorBody);
        calculateGlobalSum();
        renderCadPoolList();
        if (typeof renderVerteilerOverviewList === 'function') {
            renderVerteilerOverviewList();
        }
        debouncedSave();
    }

    function unassignCadRoomForTr(tr) {
        const nameInput = tr.querySelector('.input-room-name');
        if (nameInput) {
            nameInput.readOnly = false;
        }
        const cadId = tr.dataset.cadId;
        if (cadId) {
            const poolRm = cadRoomPool.find(r => r.id === cadId);
            if (poolRm) {
                poolRm.assignedFloor = null;
            }
            delete tr.dataset.cadId;
        } else {
            // Fallback: search by exact name match if cadId is missing
            const nameInput = tr.querySelector('.input-room-name');
            const name = nameInput ? nameInput.value : "";
            if (name) {
                const poolRm = cadRoomPool.find(r => r.name === name && r.assignedFloor !== null);
                if (poolRm) {
                    poolRm.assignedFloor = null;
                }
            }
        }
        if (typeof renderCadPoolList === 'function') {
            renderCadPoolList();
        }
    }

    function applyMainTableFilters() {
        const floorFilterInput = document.getElementById('main-floor-filter');
        const fbhvFilterInput = document.getElementById('main-fbhv-filter');
        
        const floorText = floorFilterInput ? floorFilterInput.value.toLowerCase().trim() : '';
        const fbhvText = fbhvFilterInput ? fbhvFilterInput.value.toLowerCase().trim() : '';
        
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach(fb => {
            const ebeneInput = fb.querySelector('.input-floor-name');
            const ebeneName = ebeneInput ? ebeneInput.value.toLowerCase() : '';
            
            const fbhvInput = fb.querySelector('.input-fbhv-name');
            const fbhvName = fbhvInput ? fbhvInput.value.toLowerCase() : '';
            
            const matchesFloor = !floorText || ebeneName.includes(floorText);
            const matchesFbhv = !fbhvText || fbhvName.includes(fbhvText);
            
            if (matchesFloor && matchesFbhv) {
                fb.style.display = ''; // Show floor
            } else {
                fb.style.display = 'none'; // Hide floor
            }
        });
    }

    // Bind event listeners for main table filters
    const mainFloorFilter = document.getElementById('main-floor-filter');
    if (mainFloorFilter) {
        mainFloorFilter.addEventListener('input', applyMainTableFilters);
    }
    const mainFbhvFilter = document.getElementById('main-fbhv-filter');
    if (mainFbhvFilter) {
        mainFbhvFilter.addEventListener('input', applyMainTableFilters);
    }

    function showDeleteModal(floorBody) {
        floorToDelete = floorBody;
        modalOverlay.classList.remove('hidden');
    }

    function hideDeleteModal() {
        modalOverlay.classList.add('hidden');
        floorToDelete = null;
    }

    // ══════════════════════════════════════════════════════════════════
    //  Floor-Header Drag-Reorder System
    //  Elements within .fh-drag-row containers can be rearranged when
    //  menu-edit-mode is active. The order is shared across ALL floors
    //  (since they use the same template) and persisted via the layout
    //  save mechanism (getLayoutDataObject / restoreLayout).
    //  NOTE: _fhDragItem and savedFloorHeaderOrder are declared early
    //  (top of DOMContentLoaded) to avoid TDZ errors.
    // ══════════════════════════════════════════════════════════════════

    /** Helper to find the nearest .fh-draggable-item target in a row relative to mouse clientX */
    function getClosestFhItem(rowEl, clientX, ignoreItem) {
        const items = Array.from(rowEl.querySelectorAll('.fh-draggable-item'))
            .filter(i => i !== ignoreItem);
        if (items.length === 0) return { target: null, position: 'after' };

        let closestItem = null;
        let closestOffset = Number.POSITIVE_INFINITY;
        let position = 'before';

        for (const item of items) {
            const box = item.getBoundingClientRect();
            const center = box.left + box.width / 2;
            const offset = clientX - center;

            if (Math.abs(offset) < Math.abs(closestOffset)) {
                closestOffset = offset;
                closestItem = item;
                position = offset < 0 ? 'before' : 'after';
            }
        }

        return { target: closestItem, position: position };
    }
    function getTargetFhRow(headerContainer, clientX, clientY) {
        if (!headerContainer) return null;
        const rows = Array.from(headerContainer.querySelectorAll('.fh-drag-row'));
        if (rows.length === 0) return null;

        let bestRow = rows[0];
        let minDistanceY = Infinity;

        rows.forEach(row => {
            const rect = row.getBoundingClientRect();
            let distY = 0;
            if (clientY < rect.top) {
                distY = rect.top - clientY;
            } else if (clientY > rect.bottom) {
                distY = clientY - rect.bottom;
            } else {
                distY = 0;
            }
            if (distY < minDistanceY) {
                minDistanceY = distY;
                bestRow = row;
            }
        });

        const row2Left = headerContainer.querySelector('.fh-drag-row[data-fh-row="row2-left"]');
        const row2Right = headerContainer.querySelector('.fh-drag-row[data-fh-row="row2-right"]');
        if (row2Left && row2Right && (bestRow === row2Left || bestRow === row2Right)) {
            const rightRect = row2Right.getBoundingClientRect();
            if (clientX >= rightRect.left - 40) {
                bestRow = row2Right;
            } else {
                bestRow = row2Left;
            }
        }

        return bestRow;
    }

    /** Place a draggable item precisely inside targetRow with overlap prevention */
    function placeFhItemInRow(targetRow, item, clientX) {
        if (!targetRow || !item) return;

        const { target, position } = getClosestFhItem(targetRow, clientX, item);
        if (target) {
            const insertParent = target.parentNode;
            if (position === 'before') {
                insertParent.insertBefore(item, target);
            } else {
                insertParent.insertBefore(item, target.nextSibling);
            }
        } else {
            const actionsDiv = targetRow.querySelector('#menu-edit-actions');
            if (actionsDiv && actionsDiv.parentNode === targetRow) {
                targetRow.insertBefore(item, actionsDiv);
            } else {
                targetRow.appendChild(item);
            }
        }

        const prevItem = item.previousElementSibling;
        if (prevItem && prevItem.classList.contains('fh-draggable-item')) {
            const prevRect = prevItem.getBoundingClientRect();
            const itemWidth = item.offsetWidth || 100;
            const customMargin = Math.max(0, Math.round(clientX - prevRect.right - (itemWidth / 2)));
            item.style.marginLeft = customMargin + 'px';
        } else {
            item.style.marginLeft = '0px';
        }
    }

    /** Apply complete floor-header layout config (order + margins across all rows) to a floorBody */
    function applyFloorHeaderLayoutToFloor(floorBody) {
        if (!floorBody || !savedFloorHeaderOrder || Object.keys(savedFloorHeaderOrder).length === 0) return;

        Object.entries(savedFloorHeaderOrder).forEach(([rowType, config]) => {
            const targetRow = floorBody.querySelector(`.fh-drag-row[data-fh-row="${rowType}"]`);
            if (!targetRow) return;

            let order = Array.isArray(config) ? config : (config.order || []);
            let margins = (!Array.isArray(config) && config.margins) ? config.margins : {};

            const actionsDiv = targetRow.querySelector('#menu-edit-actions');
            order.forEach(fhId => {
                const item = floorBody.querySelector(`.fh-draggable-item[data-fh-id="${fhId}"]`);
                if (item) {
                    if (actionsDiv && actionsDiv.parentNode === targetRow) {
                        targetRow.insertBefore(item, actionsDiv);
                    } else {
                        targetRow.appendChild(item);
                    }
                    if (margins[fhId] !== undefined) {
                        item.style.marginLeft = margins[fhId];
                    }
                }
            });
        });
    }

    /** Sync layout changes across all existing floors */
    function applyFhOrderToAll(changedRow) {
        const headerContainer = changedRow.closest('.floor-header-container');
        if (!headerContainer) return;

        headerContainer.querySelectorAll('.fh-drag-row[data-fh-row]').forEach(row => {
            const rowType = row.dataset.fhRow;
            if (rowType) {
                const items = Array.from(row.querySelectorAll('.fh-draggable-item'));
                savedFloorHeaderOrder[rowType] = {
                    order: items.map(i => i.dataset.fhId).filter(Boolean),
                    margins: items.reduce((acc, i) => {
                        if (i.dataset.fhId) {
                            acc[i.dataset.fhId] = i.style.marginLeft || '0px';
                        }
                        return acc;
                    }, {})
                };
            }
        });

        document.querySelectorAll('tbody.floor-group').forEach(fb => {
            applyFloorHeaderLayoutToFloor(fb);
        });
    }

    /** Attach drag listeners to a single .fh-drag-row container */
    function attachFhRowListeners(rowEl) {
        if (!rowEl || rowEl.dataset.fhDragSetup) return;
        rowEl.dataset.fhDragSetup = '1';

        rowEl.querySelectorAll('.fh-draggable-item').forEach(item => {
            item.draggable = document.body.classList.contains('menu-edit-mode');

            item.addEventListener('mousedown', (e) => {
                if (document.body.classList.contains('menu-edit-mode')) {
                    item.draggable = true;
                    selectMenuItemForKeyboard(item);
                }
            });
            item.addEventListener('mouseup', () => {
                if (!document.body.classList.contains('menu-edit-mode')) {
                    item.draggable = false;
                }
            });

            item.addEventListener('dragstart', (e) => {
                if (!document.body.classList.contains('menu-edit-mode')) { e.preventDefault(); return; }
                _fhDragItem = item;
                item.classList.add('fh-is-dragging');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', item.dataset.fhId || '');
                }
            });

            item.addEventListener('dragend', () => {
                item.draggable = false;
                item.classList.remove('fh-is-dragging');
                document.querySelectorAll('.fh-draggable-item').forEach(i => {
                    i.classList.remove('fh-drop-before', 'fh-drop-after');
                });
                _fhDragItem = null;
            });
        });

        rowEl.addEventListener('dragover', (e) => {
            if (!document.body.classList.contains('menu-edit-mode') || !_fhDragItem) return;
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
        });

        rowEl.addEventListener('drop', (e) => {
            if (!document.body.classList.contains('menu-edit-mode') || !_fhDragItem) return;
            e.preventDefault();
            e.stopPropagation();

            const headerContainer = rowEl.closest('.floor-header-container');
            const targetRow = headerContainer ? getTargetFhRow(headerContainer, e.clientX, e.clientY) : rowEl;

            placeFhItemInRow(targetRow, _fhDragItem, e.clientX);
            applyFhOrderToAll(targetRow);
            if (typeof saveLayout === 'function') saveLayout();
            _fhDragItem = null;
        });
    }

    /** Initialize floor-header drag for one floor tbody */
    function setupFloorHeaderDrag(floorBody) {
        if (!floorBody) return;

        const headerContainer = floorBody.querySelector('.floor-header-container');
        if (headerContainer && !headerContainer.dataset.dropListenersAttached) {
            headerContainer.dataset.dropListenersAttached = "true";

            headerContainer.addEventListener('dragover', (e) => {
                if (!document.body.classList.contains('menu-edit-mode') || !_fhDragItem) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
            });

            headerContainer.addEventListener('drop', (e) => {
                if (!document.body.classList.contains('menu-edit-mode') || !_fhDragItem) return;
                e.preventDefault();
                e.stopPropagation();

                const targetRow = getTargetFhRow(headerContainer, e.clientX, e.clientY);
                if (targetRow) {
                    placeFhItemInRow(targetRow, _fhDragItem, e.clientX);
                    applyFhOrderToAll(targetRow);
                    if (typeof saveLayout === 'function') saveLayout();
                }
                _fhDragItem = null;
            });
        }

        floorBody.querySelectorAll('.fh-drag-row').forEach(row => {
            attachFhRowListeners(row);
        });

        applyFloorHeaderLayoutToFloor(floorBody);
    }


    /** Restore all floor header orders from a layout object (called from restoreLayout) */
    function restoreFloorHeaderOrders(orderMap) {
        if (!orderMap || typeof orderMap !== 'object') return;
        savedFloorHeaderOrder = orderMap;
        document.querySelectorAll('tbody.floor-group').forEach(fb => {
            applyFloorHeaderLayoutToFloor(fb);
        });
    }

    function addNewFloor(index) {

        const floorBody = document.createElement('tbody');
        floorBody.classList.add('floor-group');
        floorBody.dataset.floorIndex = index;
        const markedCount = document.querySelectorAll('tbody.floor-group.active-verteiler').length;
        if (markedCount <= 1) {
            setActiveFloorGroup(floorBody);
        } else {
            activeFloorGroup = floorBody;
            lastSelectedFloorGroup = floorBody;
        }

        const headerRowFragment = tplFloorHeader.content.cloneNode(true);
        const trInfo = headerRowFragment.querySelector('.floor-header-row');

        // ── Sync-Button: Verteiler zur Mehrfachauswahl hinzufügen / entfernen ──
        const btnSync = headerRowFragment.querySelector('.btn-sync-mark');
        if (btnSync) {
            btnSync.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Toggle active-verteiler auf diesem Floor
                floorBody.classList.toggle('active-verteiler');
                // Alle Sync-Buttons visuell aktualisieren
                updateAllSyncButtons();
            });
        }

        const btnRz = headerRowFragment.querySelector('.btn-toggle-rz');
        if (btnRz) {

            btnRz.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                btnRz.classList.toggle('active');
                const isActive = btnRz.classList.contains('active');
                updateRzInputsState(floorBody, isActive);
                if (!isLoading) debouncedSave();

                // Snapshot JETZT aufnehmen, bevor irgendwas die Markierung löscht
                const markedNow = getMarkedFloors();
                if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                    // Mehrere markiert → direkt auf alle übertragen (nur RZ)
                    applyHeaderBatchToFloors(floorBody, markedNow, 'rz');
                } else {
                    // Einzeln → Ctrl-Popup (falls Ctrl gedrückt)
                    handleCtrlBatchAction('rz', floorBody, isActive, e);
                }
            });
        }

        const fbhvInput = trInfo.querySelector('.input-fbhv-name');
        if (fbhvInput) {
            fbhvInput.addEventListener('input', () => {
                if (!isLoading) debouncedSave();
                if (typeof renderVerteilerOverviewList === 'function') renderVerteilerOverviewList();
                if (typeof applyMainTableFilters === 'function') applyMainTableFilters();

                const markedNow = getMarkedFloors();
                if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                    applyHeaderBatchToFloors(floorBody, markedNow, 'fbhv');
                }
            });
            fbhvInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const markedNow = getMarkedFloors();
                    if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                        applyHeaderBatchToFloors(floorBody, markedNow, 'fbhv');
                    } else {
                        handleCtrlBatchAction('fbhv', floorBody, fbhvInput.value, e);
                    }
                }
            });
            fbhvInput.addEventListener('blur', (e) => {
                const markedNow = getMarkedFloors();
                if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                    applyHeaderBatchToFloors(floorBody, markedNow, 'fbhv');
                }
            });
        }

        const ebeneInput = trInfo.querySelector('.input-floor-name');
        if (ebeneInput) {
            ebeneInput.addEventListener('input', () => {
                if (!isLoading) debouncedSave();
                if (typeof renderVerteilerOverviewList === 'function') renderVerteilerOverviewList();
                if (typeof applyMainTableFilters === 'function') applyMainTableFilters();

                const markedNow = getMarkedFloors();
                if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                    applyHeaderBatchToFloors(floorBody, markedNow, 'ebene');
                }
            });
            ebeneInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const markedNow = getMarkedFloors();
                    if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                        applyHeaderBatchToFloors(floorBody, markedNow, 'ebene');
                    } else {
                        handleCtrlBatchAction('ebene', floorBody, ebeneInput.value, e);
                    }
                }
            });
            ebeneInput.addEventListener('blur', (e) => {
                const markedNow = getMarkedFloors();
                if (markedNow.length > 1 && markedNow.includes(floorBody)) {
                    applyHeaderBatchToFloors(floorBody, markedNow, 'ebene');
                }
            });
        }

        const posInput = trInfo.querySelector('.input-pos-nr');
        if (posInput) {
            posInput.addEventListener('focus', () => {
                if (posInput.dataset.isCustom !== 'true') {
                    posInput.select();
                }
            });
            posInput.addEventListener('input', () => {
                const val = posInput.value.trim();
                const autoVal = posInput.dataset.autoPos || '';
                if (val === '' || val === autoVal) {
                    delete posInput.dataset.isCustom;
                    posInput.classList.remove('is-custom');
                    posInput.classList.add('is-auto');
                    posInput.style.color = '#64748b';
                } else {
                    posInput.dataset.isCustom = 'true';
                    posInput.classList.remove('is-auto');
                    posInput.classList.add('is-custom');
                    posInput.style.color = '#000000';
                }

                if (!isLoading) debouncedSave();
            });
            posInput.addEventListener('blur', () => {
                const val = posInput.value.trim();
                if (val === '' || posInput.dataset.isCustom !== 'true') {
                    delete posInput.dataset.isCustom;
                    updateAllPosNumbers();
                }
            });
            posInput.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                delete posInput.dataset.isCustom;
                updateAllPosNumbers();
                if (!isLoading) debouncedSave();
            });
            posInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    delete posInput.dataset.isCustom;
                    updateAllPosNumbers();
                    posInput.blur();
                    if (!isLoading) debouncedSave();
                }
            });
        }

        // Hor / Ver Connection Orientation Toggle
        const cbHor = trInfo.querySelector('.cb-floor-hor');
        const cbVer = trInfo.querySelector('.cb-floor-ver');
        const selKasten = trInfo.querySelector('.select-floor-kasten');

        if (cbHor && cbVer) {
            cbHor.addEventListener('change', (e) => {
                if (cbHor.checked) {
                    cbVer.checked = false;
                } else {
                    cbVer.checked = true;
                }
                calculateFloorSum(floorBody);
                if (!isLoading) debouncedSave();

                handleCtrlBatchAction('hor', floorBody, 'Horizontal', e);
            });
            cbVer.addEventListener('change', (e) => {
                if (cbVer.checked) {
                    cbHor.checked = false;
                } else {
                    cbHor.checked = true;
                }
                calculateFloorSum(floorBody);
                if (!isLoading) debouncedSave();

                handleCtrlBatchAction('ver', floorBody, 'Vertikal', e);
            });
        }

        const selConn = trInfo.querySelector('.select-floor-conn');
        if (selConn) {
            selConn.addEventListener('change', (e) => {
                selConn.dataset.userVal = selConn.value;
                updateSelectAutoStyle(selConn);
                calculateFloorSum(floorBody);
                if (!isLoading) debouncedSave();

                handleCtrlBatchAction('conn', floorBody, selConn.value, e);
            });
        }

        if (selKasten) {
            selKasten.addEventListener('change', (e) => {
                updateSelectAutoStyle(selKasten);
                calculateFloorSum(floorBody);
                if (!isLoading) debouncedSave();

                handleCtrlBatchAction('kasten', floorBody, selKasten.value, e);
            });
        }

        const dimsSpan = trInfo.querySelector('.floor-kasten-dims');
        if (dimsSpan) {
            dimsSpan.addEventListener('click', (e) => {
                if (document.body.classList.contains('menu-edit-mode')) return;
                e.stopPropagation();
                openKastenDetailsModal(floorBody);
            });
        }

        // Delete Floor
        const btnDeleteFloor = trInfo.querySelector('.btn-delete-floor');
        if (btnDeleteFloor) {
            btnDeleteFloor.addEventListener('click', (e) => {
                if (document.body.classList.contains('menu-edit-mode')) return;
                e.stopPropagation();
                showDeleteModal(floorBody);
            });
        }

        // Toggle Floor (Expand/Collapse)
        const btnToggleFloor = trInfo.querySelector('.btn-toggle-floor');
        if (btnToggleFloor) {
            btnToggleFloor.addEventListener('click', (e) => {
                if (document.body.classList.contains('menu-edit-mode')) return;
                e.stopPropagation();
                
                const isCtrl = e.ctrlKey || e.metaKey;
                floorBody.classList.toggle('collapsed');
                
                if (isCtrl) {
                    const targetState = floorBody.classList.contains('collapsed');
                    document.querySelectorAll('tbody.floor-group').forEach(fb => {
                        if (targetState) {
                            fb.classList.add('collapsed');
                        } else {
                            fb.classList.remove('collapsed');
                        }
                    });
                }
                
                // Save layout to persist collapse state
                if (!isLoading) debouncedSave();
            });
        }

        // Add Floor (Inline G+)
        const btnAddFloorInline = trInfo.querySelector('.btn-add-floor-inline');
        if (btnAddFloorInline) {
            btnAddFloorInline.addEventListener('click', () => {
                floorCounter++;
                const fb = addNewFloor(floorCounter);
                addRoomToFloor(fb);
                calculateGlobalSum(); // Direkte Live-Auswertung nach G+
                if (!isLoading) debouncedSave();
            });
        }


        // Copy Floor (Inline Verteiler 1:1 duplizieren)
        const btnCopyFloorInline = trInfo.querySelector('.btn-copy-floor-inline');
        if (btnCopyFloorInline) {
            btnCopyFloorInline.addEventListener('click', (e) => {
                e.stopPropagation();
                openCopyFloorModal(floorBody);
            });
        }

        // Add Room (Inline if present)
        const btnAddRoomInline = trInfo.querySelector('.btn-add-room');
        if (btnAddRoomInline) {
            btnAddRoomInline.addEventListener('click', () => {
                addRoomToFloor(floorBody);
                calculateGlobalSum(); // Live Update wenn leerer Raum hinzugefügt wird
                if (!isLoading) debouncedSave();
            });
        }

        floorBody.appendChild(headerRowFragment);

        // Append Floor Footer Summary Row
        const tplFloorFooter = document.getElementById('tpl-floor-footer');
        if (tplFloorFooter) {
            const footerRowFragment = tplFloorFooter.content.cloneNode(true);
            floorBody.appendChild(footerRowFragment);
        }

        // Drag & Drop listener for CAD rooms onto this floor
        floorBody.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
            floorBody.style.outline = '2px dashed var(--primary-color, #0078d7)';
        });

        floorBody.addEventListener('dragleave', () => {
            floorBody.style.outline = '';
        });

        floorBody.addEventListener('drop', (e) => {
            floorBody.style.outline = '';
            let jsonStr = '';
            if (e.dataTransfer) {
                jsonStr = e.dataTransfer.getData('text/cad-room-json') || e.dataTransfer.getData('text/plain') || '';
            }

            if (jsonStr) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    let roomDataList = JSON.parse(jsonStr);
                    if (!Array.isArray(roomDataList)) {
                        roomDataList = [roomDataList];
                    }
                    assignRoomsToFloor(floorBody, roomDataList);
                } catch (err) {
                    console.error("Fehler beim Verarbeiten des CAD-Raum Drops:", err);
                }
            }
        });

        mainTable.appendChild(floorBody);

        // Initialize floor-header drag-reorder for this floor
        setupFloorHeaderDrag(floorBody);

        // Aktualisiere fortlaufende Pos. Nrn. sofort für alle Verteiler
        updateAllPosNumbers();

        return floorBody;
    }

    function duplicateFloor(sourceFloorBody) {
        openCopyFloorModal(sourceFloorBody);
    }

    function duplicateFloorWithOptions(sourceFloorBody, count = 1, position = 'after', clearNames = true) {
        if (!sourceFloorBody || count < 1) return;

        const mainTable = document.getElementById('main-table');
        const allFloors = mainTable ? Array.from(mainTable.querySelectorAll('tbody.floor-group')) : [];
        const firstFloor = allFloors.length > 0 ? allFloors[0] : null;

        let insertionRef = sourceFloorBody;

        for (let k = 0; k < count; k++) {
            floorCounter++;

            // 1. Neues <tbody> Element erzeugen
            const newFloorBody = addNewFloor(floorCounter);

            // 2. Kopfdaten (Verteilername & Geschossbezeichnung) kopieren/leeren
            const sourceFbhvInput = sourceFloorBody.querySelector('.input-fbhv-name');
            const sourceFloorInput = sourceFloorBody.querySelector('.input-floor-name');
            const sourceFbhv = sourceFbhvInput ? sourceFbhvInput.value : '';
            const sourceFloorName = sourceFloorInput ? sourceFloorInput.value : '';
            const sourceRzBtn = sourceFloorBody.querySelector('.btn-toggle-rz');

            const newFbhvInput = newFloorBody.querySelector('.input-fbhv-name');
            const newFloorInput = newFloorBody.querySelector('.input-floor-name');

            const sourcePosInput = sourceFloorBody.querySelector('.input-pos-nr');
            const newPosInput = newFloorBody.querySelector('.input-pos-nr');
            if (sourcePosInput && newPosInput) {
                if (!clearNames && sourcePosInput.dataset.isCustom === 'true') {
                    newPosInput.value = sourcePosInput.value;
                    newPosInput.dataset.isCustom = 'true';
                    newPosInput.classList.remove('is-auto');
                    newPosInput.classList.add('is-custom');
                    newPosInput.style.color = '#000000';
                }
            }

            if (clearNames) {
                if (newFbhvInput) newFbhvInput.value = '';
                if (newFloorInput) newFloorInput.value = '';
            } else {
                if (newFbhvInput) {
                    newFbhvInput.value = sourceFbhv ? `${sourceFbhv} (Kopie${count > 1 ? ' ' + (k + 1) : ''})` : '';
                }
                if (newFloorInput) {
                    newFloorInput.value = sourceFloorName || '';
                }
            }

            // Status der Randzone (RZ-Button) übernehmen
            const newRzBtn = newFloorBody.querySelector('.btn-toggle-rz');
            if (sourceRzBtn && newRzBtn) {
                if (sourceRzBtn.classList.contains('active')) {
                    newRzBtn.classList.add('active');
                } else {
                    newRzBtn.classList.remove('active');
                }
            }

            // Anschluss-Orientierung & Dropdowns übernehmen
            const sourceHor = sourceFloorBody.querySelector('.cb-floor-hor');
            const sourceVer = sourceFloorBody.querySelector('.cb-floor-ver');
            const newHor = newFloorBody.querySelector('.cb-floor-hor');
            const newVer = newFloorBody.querySelector('.cb-floor-ver');
            if (sourceHor && newHor) newHor.checked = sourceHor.checked;
            if (sourceVer && newVer) newVer.checked = sourceVer.checked;

            const sourceKasten = sourceFloorBody.querySelector('.select-floor-kasten');
            const newKasten = newFloorBody.querySelector('.select-floor-kasten');
            if (sourceKasten && newKasten) {
                newKasten.value = sourceKasten.value;
                if (typeof updateSelectAutoStyle === 'function') updateSelectAutoStyle(newKasten);
            }

            const sourceConn = sourceFloorBody.querySelector('.select-floor-conn');
            const newConn = newFloorBody.querySelector('.select-floor-conn');
            if (sourceConn && newConn) {
                newConn.value = sourceConn.value;
                if (sourceConn.dataset && sourceConn.dataset.userVal) {
                    newConn.dataset.userVal = sourceConn.dataset.userVal;
                }
                if (typeof updateSelectAutoStyle === 'function') updateSelectAutoStyle(newConn);
            }

            // 3. Im DOM an der gewünschten Position einfügen
            if (position === 'first') {
                if (firstFloor && mainTable) {
                    if (k === 0) {
                        mainTable.insertBefore(newFloorBody, firstFloor);
                        insertionRef = newFloorBody;
                    } else {
                        if (insertionRef.nextSibling) {
                            mainTable.insertBefore(newFloorBody, insertionRef.nextSibling);
                        } else {
                            mainTable.appendChild(newFloorBody);
                        }
                        insertionRef = newFloorBody;
                    }
                } else if (mainTable) {
                    mainTable.appendChild(newFloorBody);
                }
            } else if (position === 'last') {
                if (mainTable) {
                    mainTable.appendChild(newFloorBody);
                }
            } else if (position === 'before') {
                if (sourceFloorBody.parentNode) {
                    sourceFloorBody.parentNode.insertBefore(newFloorBody, sourceFloorBody);
                }
            } else {
                // Default: 'after'
                if (sourceFloorBody.parentNode) {
                    if (insertionRef.nextSibling) {
                        sourceFloorBody.parentNode.insertBefore(newFloorBody, insertionRef.nextSibling);
                    } else {
                        sourceFloorBody.parentNode.appendChild(newFloorBody);
                    }
                    insertionRef = newFloorBody;
                }
            }

            // 4. Alle Raum-Zeilen (tr.room-row) des Quell-Verteilers auslesen und kopieren
            const roomRows = sourceFloorBody.querySelectorAll('tr.room-row');
            roomRows.forEach(srcTr => {
                const newTr = addRoomToFloor(newFloorBody);

                const getVal = selector => {
                    const el = srcTr.querySelector(selector);
                    return el ? el.value : '';
                };
                const getCheck = selector => {
                    const el = srcTr.querySelector(selector);
                    return el ? el.checked : false;
                };

                const setVal = (selector, val) => {
                    const el = newTr.querySelector(selector);
                    if (el) el.value = val;
                };
                const setCheck = (selector, chk) => {
                    const el = newTr.querySelector(selector);
                    if (el) el.checked = chk;
                };

                setVal('.input-room-name', getVal('.input-room-name'));
                setVal('.input-va-rz', getVal('.input-va-rz'));
                setVal('.input-area', getVal('.input-area'));
                setVal('.input-va-iz', getVal('.input-va-iz'));
                setVal('.input-area-iz', getVal('.input-area-iz'));
                setCheck('.input-check-thermostat', getCheck('.input-check-thermostat'));
                setCheck('.input-check-antrieb', getCheck('.input-check-antrieb'));
                setCheck('.input-check-iz', getCheck('.input-check-iz'));
                setVal('.input-target', getVal('.input-target'));
                setVal('.input-fugen', getVal('.input-fugen'));
                setVal('.input-dist', getVal('.input-dist'));

                calculateRow(newTr);
            });

            // 5. Randzonen-Status anwenden & Summe für diesen Verteiler berechnen
            const isRzActive = newRzBtn ? newRzBtn.classList.contains('active') : true;
            updateRzInputsState(newFloorBody, isRzActive);
            calculateFloorSum(newFloorBody);
        }

        // Global neu berechnen & speichern
        updateAllPosNumbers();
        calculateGlobalSum();
        if (!isLoading) debouncedSave();
        if (typeof renderVerteilerOverviewList === 'function') {
            renderVerteilerOverviewList();
        }
    }

    function clearRoomRow(tr) {
        unassignCadRoomForTr(tr);

        const inputName = tr.querySelector('.input-room-name');
        if (inputName) {
            inputName.value = "";
            inputName.placeholder = "Raumbezeichnung";
        }
        const inputVaRz = tr.querySelector('.input-va-rz');
        if (inputVaRz) inputVaRz.value = 10;
        const inputAreaRz = tr.querySelector('.input-area');
        if (inputAreaRz) inputAreaRz.value = 0;
        const inputVaIz = tr.querySelector('.input-va-iz');
        if (inputVaIz) inputVaIz.value = 20;
        const inputAreaIz = tr.querySelector('.input-area-iz');
        if (inputAreaIz) inputAreaIz.value = 0;
        
        const checkThermo = tr.querySelector('.input-check-thermostat');
        if (checkThermo) checkThermo.checked = true;
        const checkAntrieb = tr.querySelector('.input-check-antrieb');
        if (checkAntrieb) checkAntrieb.checked = true;
        const checkIz = tr.querySelector('.input-check-iz');
        if (checkIz) checkIz.checked = false;

        const inputTarget = tr.querySelector('.input-target');
        if (inputTarget) {
            const globalTarget = inputSettingTarget ? parseFloat(inputSettingTarget.value) || 100 : 100;
            inputTarget.value = globalTarget;
        }
        const inputFugen = tr.querySelector('.input-fugen');
        if (inputFugen) inputFugen.value = 0;
        const inputDist = tr.querySelector('.input-dist');
        if (inputDist) {
            const globalDist = inputSettingDist ? parseFloat(inputSettingDist.value) || 10 : 10;
            inputDist.value = globalDist;
        }

        calculateRow(tr);
    }

    function addRoomToFloor(tbody) {
        const roomRow = tplRoomRow.content.cloneNode(true);
        const tr = roomRow.querySelector('tr');

        // Check if RZ button is active for this floor
        const btnRz = tbody.querySelector('.btn-toggle-rz');
        const isRzActive = btnRz ? btnRz.classList.contains('active') : true;
        if (!isRzActive) {
            const inputVaRz = tr.querySelector('.input-va-rz');
            const inputAreaRz = tr.querySelector('.input-area');
            if (inputVaRz) {
                inputVaRz.disabled = true;
                inputVaRz.tabIndex = -1;
            }
            if (inputAreaRz) {
                inputAreaRz.disabled = true;
                inputAreaRz.tabIndex = -1;
            }
        }

        // Delete Room
        tr.querySelector('.btn-delete-room').addEventListener('click', () => {
            const allRoomRows = document.querySelectorAll('tr.room-row');
            if (allRoomRows.length > 0 && allRoomRows[0] === tr) {
                // Die erste Zeile darf nie gelöscht werden, nur deren dynamische Eingabewerte
                clearRoomRow(tr);
                calculateFloorSum(tbody);
                calculateGlobalSum();
                if (!isLoading) debouncedSave();
            } else {
                unassignCadRoomForTr(tr);
                tr.remove();
                calculateFloorSum(tbody);
                calculateGlobalSum();
                if (!isLoading) debouncedSave();
            }
        });

        const inputName = tr.querySelector('.input-room-name');
        inputName.value = "";
        inputName.placeholder = "Raumbezeichnung"; 

        const inputTarget = tr.querySelector('.input-target');
        if (inputTarget) {
            const globalTarget = inputSettingTarget ? parseFloat(inputSettingTarget.value) || 100 : 100;
            inputTarget.value = globalTarget;
        } 

        const inputDist = tr.querySelector('.input-dist');
        if (inputDist) {
            const globalDist = inputSettingDist ? parseFloat(inputSettingDist.value) || 10 : 10;
            inputDist.value = globalDist;
        }

        const inputs = tr.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => calculateRow(tr));
            input.addEventListener('change', () => calculateRow(tr));
        });

        // Insert room row before the floor footer row
        const footerRow = tbody.querySelector('.floor-footer-row');
        if (footerRow) {
            tbody.insertBefore(roomRow, footerRow);
        } else {
            tbody.appendChild(roomRow);
        }

        calculateFloorSum(tbody);
        return tr;
    }

    function updateRzInputsState(floorBody, isActive) {
        const roomRows = floorBody.querySelectorAll('tr.room-row');
        roomRows.forEach(row => {
            const inputVaRz = row.querySelector('.input-va-rz');
            const inputAreaRz = row.querySelector('.input-area');
            if (inputVaRz) {
                inputVaRz.disabled = !isActive;
                inputVaRz.tabIndex = isActive ? "" : "-1";
            }
            if (inputAreaRz) {
                inputAreaRz.disabled = !isActive;
                inputAreaRz.tabIndex = isActive ? "" : "-1";
            }
            calculateRow(row);
        });
        calculateFloorSum(floorBody);
        calculateGlobalSum();
    }

    // --- Calculation Logic ---
    function calculateRow(row) {
        const inputVaRz = row.querySelector('.input-va-rz');
        const isRzOff = inputVaRz ? inputVaRz.disabled : false;

        const vaRz = isRzOff ? 0 : (parseFloat(row.querySelector('.input-va-rz').value) || 0);
        const areaRz = isRzOff ? 0 : (parseFloat(row.querySelector('.input-area').value) || 0);

        const vaIz = parseFloat(row.querySelector('.input-va-iz').value) || 0;
        const areaIz = parseFloat(row.querySelector('.input-area-iz').value) || 0;

        const targetLen = parseFloat(row.querySelector('.input-target').value) || 100;
        const maxOver = inputSettingMaxOver ? parseFloat(inputSettingMaxOver.value) || 0 : 0;
        const dist = parseFloat(row.querySelector('.input-dist').value) || 0;

        let pipeRz = 0;
        if (vaRz > 0) {
            pipeRz = areaRz * (100 / vaRz);
        }

        let pipeIz = 0;
        if (vaIz > 0) {
            pipeIz = areaIz * (100 / vaIz);
        }

        let supplyCount = 0;
        const isCombined = row.querySelector('.input-check-iz').checked;

        if (isCombined) {
            if (areaRz > 0 || areaIz > 0) {
                supplyCount = 1;
            }
        } else {
            if (areaRz > 0) supplyCount++;
            if (areaIz > 0) supplyCount++;
        }

        const pipeDist = supplyCount * (dist * 2);
        const totalPipe = pipeRz + pipeIz + pipeDist;

        let rings = 0;
        if (totalPipe > 0 && targetLen > 0) {
            rings = Math.ceil(totalPipe / (targetLen + maxOver));
        }

        row.querySelector('.input-sum').value = totalPipe.toFixed(2);
        row.querySelector('.input-rings').value = rings;

        const floorBody = row.closest('tbody');
        if (floorBody) {
            calculateFloorSum(floorBody);
        }
    }

    function calculateFloorSum(floorBody) {
        const footerRow = floorBody.querySelector('.floor-footer-row');
        if (!footerRow) return;

        let totalAreaRz = 0;
        let totalAreaIz = 0;
        let totalRT = 0;
        let totalSA = 0;
        let totalFugen = 0;
        let totalDist = 0;
        let totalPipe = 0;
        let totalRings = 0;

        const roomRows = floorBody.querySelectorAll('tr.room-row');
        roomRows.forEach(row => {
            const areaRz = parseFloat(row.querySelector('.input-area').value) || 0;
            const areaIz = parseFloat(row.querySelector('.input-area-iz').value) || 0;
            const fugen = parseFloat(row.querySelector('.input-fugen').value) || 0;
            const dist = parseFloat(row.querySelector('.input-dist').value) || 0;
            const pipe = parseFloat(row.querySelector('.input-sum').value) || 0;
            const rings = parseInt(row.querySelector('.input-rings').value) || 0;

            totalAreaRz += areaRz;
            totalAreaIz += areaIz;
            totalFugen += fugen;
            totalDist += dist;
            totalPipe += pipe;
            totalRings += rings;

            if (row.querySelector('.input-check-thermostat').checked) {
                totalRT++;
            }
            if (row.querySelector('.input-check-antrieb').checked) {
                const isCombined = row.querySelector('.input-check-iz').checked;
                totalSA += isCombined ? 1 : Math.max(1, rings);
            }
        });

        // Write sums to footer
        const cellAreaRz = footerRow.querySelector('.floor-sum-area-rz');
        if (cellAreaRz) cellAreaRz.textContent = totalAreaRz.toFixed(2);

        const cellAreaIz = footerRow.querySelector('.floor-sum-area-iz');
        if (cellAreaIz) cellAreaIz.textContent = totalAreaIz.toFixed(2);

        const cellRT = footerRow.querySelector('.floor-sum-thermostate');
        if (cellRT) cellRT.textContent = totalRT;

        const cellSA = footerRow.querySelector('.floor-sum-antriebe');
        if (cellSA) cellSA.textContent = totalSA;

        const cellFugen = footerRow.querySelector('.floor-sum-fugen');
        if (cellFugen) cellFugen.textContent = totalFugen;

        const cellDist = footerRow.querySelector('.floor-sum-dist');
        if (cellDist) cellDist.textContent = totalDist;

        const cellPipe = footerRow.querySelector('.floor-sum-pipe');
        if (cellPipe) cellPipe.textContent = totalPipe.toFixed(2);

        const cellVerteiler = floorBody.querySelector('.floor-sum-verteiler');
        const cellErweit = floorBody.querySelector('.floor-sum-erweit');
        const cellInfoInput = floorBody.querySelector('.input-floor-info');
        const AUTO_INFO_TEXT = "Grösse Vert. Kasten prüfen";

        if (cellVerteiler) {
            cellVerteiler.dataset.rings = totalRings; // Store the numerical value in data attribute for calculations
            if (totalRings === 0) {
                cellVerteiler.textContent = "0";
                if (cellErweit) cellErweit.textContent = "";
                if (cellInfoInput && (cellInfoInput.value === AUTO_INFO_TEXT || cellInfoInput.dataset.autoSet === "true")) {
                    cellInfoInput.value = "";
                    cellInfoInput.dataset.autoSet = "false";
                }
            } else if (totalRings <= 12) {
                cellVerteiler.textContent = `${totalRings}`;
                if (cellErweit) cellErweit.textContent = "";
                if (cellInfoInput && (cellInfoInput.value === AUTO_INFO_TEXT || cellInfoInput.dataset.autoSet === "true")) {
                    cellInfoInput.value = "";
                    cellInfoInput.dataset.autoSet = "false";
                }
            } else {
                const extra = totalRings - 12;
                cellVerteiler.textContent = "12";
                if (cellErweit) cellErweit.textContent = `+ ${extra}`;
                if (cellInfoInput) {
                    if (!cellInfoInput.value || cellInfoInput.value === AUTO_INFO_TEXT || cellInfoInput.dataset.autoSet === "true") {
                        cellInfoInput.value = AUTO_INFO_TEXT;
                        cellInfoInput.dataset.autoSet = "true";
                    }
                }
            }
        }

        updateFloorKastenDisplay(floorBody);
        calculateGlobalSum();
    }

    const horToVerMap = {
        'anschluss_horiz': 'anschluss_vert',
        'wmz_horiz': 'wmz_vert',
        'wmz_horiz_mp': 'wmz_vert_mp',
        'stramax_horiz': 'stramax_vert',
        'danfoss_horiz': 'danfoss_vert',
        'oventrop_hycocon_horiz': 'oventrop_hycocon_vert',
        'oventrop_cocon_horiz': 'oventrop_cocon_vert',
        'ta_compact_dp_horiz': 'ta_compact_dp_vert',
        'ta_compact_p_horiz': 'ta_compact_p_vert'
    };
    const verToHorMap = {
        'anschluss_vert': 'anschluss_horiz',
        'wmz_vert': 'wmz_horiz',
        'wmz_vert_mp': 'wmz_horiz_mp',
        'stramax_vert': 'stramax_horiz',
        'danfoss_vert': 'danfoss_horiz',
        'oventrop_hycocon_vert': 'oventrop_hycocon_horiz',
        'oventrop_cocon_vert': 'oventrop_cocon_horiz',
        'ta_compact_dp_vert': 'ta_compact_dp_horiz',
        'ta_compact_p_vert': 'ta_compact_p_horiz'
    };

    function updateSelectAutoStyle(selectEl) {
        if (!selectEl) return;
        if (selectEl.value === 'auto') {
            selectEl.style.background = '#e0f2fe';
            selectEl.style.color = '#0369a1';
            selectEl.style.borderColor = '#bae6fd';
            selectEl.style.fontWeight = 'bold';
        } else {
            selectEl.style.background = '#ffffff';
            selectEl.style.color = '#0f172a';
            selectEl.style.borderColor = '#cbd5e1';
            selectEl.style.fontWeight = 'normal';
        }
    }

    function populateFloorConnSelect(floorBody) {
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
        if (!floorBody || !db || !db.connectionSets) return;

        const selConn = floorBody.querySelector('.select-floor-conn');
        if (!selConn) return;

        const cbHor = floorBody.querySelector('.cb-floor-hor');
        const isHor = cbHor ? cbHor.checked : true;
        const orientation = isHor ? 'hor' : 'ver';
        const noWmzActive = document.getElementById('cb-vconfig-wmz')?.checked || false;

        const currentVal = selConn.dataset.userVal || selConn.value || 'auto';

        // Filter connection sets by orientation & WMZ setting
        const matchingSets = db.connectionSets.filter(set => {
            if (noWmzActive && set.isWmz) return false;

            if (orientation === 'hor') {
                return set.id.endsWith('_horiz') || set.id.includes('_horiz_') || set.id === 'kugelhahnset' || set.id === 'stramax_versal1';
            } else {
                return set.id.endsWith('_vert') || set.id.includes('_vert_') || set.id === 'winkel_wmz_vert_mp';
            }
        });

        // Resolve Auto recommendation set ID
        const allowedConns = getSelectedConnectionTypesFromUI();
        let primaryConn = 'anschluss_horiz';
        if (orientation === 'hor') {
            primaryConn = document.getElementById('vconfig-primary-connection-hor')?.value || 
                          document.getElementById('vconfig-primary-connection')?.value || 
                          'anschluss_horiz';
        } else {
            primaryConn = document.getElementById('vconfig-primary-connection-ver')?.value || 
                          document.getElementById('vconfig-primary-connection')?.value || 
                          'anschluss_vert';
        }

        if (allowedConns.length > 0 && !allowedConns.includes(primaryConn)) {
            const matchOrient = allowedConns.find(c => orientation === 'ver' ? c.endsWith('_vert') : c.endsWith('_horiz'));
            primaryConn = matchOrient || allowedConns[0];
        }

        let autoConnId = primaryConn;
        if (orientation === 'ver' && horToVerMap[primaryConn]) autoConnId = horToVerMap[primaryConn];
        else if (orientation === 'hor' && verToHorMap[primaryConn]) autoConnId = verToHorMap[primaryConn];

        if (noWmzActive) {
            const autoObj = db.connectionSets.find(s => s.id === autoConnId);
            if (autoObj && autoObj.isWmz) autoConnId = (orientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
        }

        const autoObj = db.connectionSets.find(s => s.id === autoConnId);
        const autoName = autoObj ? autoObj.name : 'Empfehlung aus Konfigurator';

        let html = `<option value="auto">🚗 Auto (${autoName})</option>`;

        matchingSets.forEach(set => {
            let artStr = '';
            if (set.articles && set.articles.length > 0) {
                artStr = ` (${set.articles.join('/')})`;
            }
            html += `<option value="${set.id}">✋ ${set.name}${artStr}</option>`;
        });

        selConn.innerHTML = html;

        // Try to restore currentVal or map it if orientation changed
        let mappedVal = currentVal;
        if (currentVal !== 'auto') {
            if (orientation === 'ver' && horToVerMap[currentVal]) mappedVal = horToVerMap[currentVal];
            else if (orientation === 'hor' && verToHorMap[currentVal]) mappedVal = verToHorMap[currentVal];
        }

        if (Array.from(selConn.options).some(opt => opt.value === mappedVal)) {
            selConn.value = mappedVal;
            selConn.dataset.userVal = mappedVal;
        } else {
            selConn.value = 'auto';
            selConn.dataset.userVal = 'auto';
        }

        updateSelectAutoStyle(selConn);
    }

    function updateFloorKastenDisplay(floorBody) {
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
        if (!floorBody || !db) return;

        const dimsSpan = floorBody.querySelector('.floor-kasten-dims');
        if (!dimsSpan) return;

        let ringsFromDataset = 0;
        const cellVerteiler = floorBody.querySelector('.floor-sum-verteiler');
        if (cellVerteiler && cellVerteiler.dataset.rings !== undefined) {
            ringsFromDataset = parseInt(cellVerteiler.dataset.rings, 10) || 0;
        }
        
        let ringsFromInputs = 0;
        const ringInputs = floorBody.querySelectorAll('tr.room-row .input-rings');
        ringInputs.forEach(inp => {
            ringsFromInputs += parseInt(inp.value, 10) || 0;
        });

        const rings = Math.max(ringsFromDataset, ringsFromInputs);

        const cbHor = floorBody.querySelector('.cb-floor-hor');
        const isHor = cbHor ? cbHor.checked : true;
        const orientation = isHor ? 'hor' : 'ver';

        const selKasten = floorBody.querySelector('.select-floor-kasten');
        const kastenKey = selKasten ? selKasten.value : 'auto';

        populateFloorConnSelect(floorBody);

        const selConn = floorBody.querySelector('.select-floor-conn');
        const selectedConnId = selConn ? selConn.value : 'auto';

        updateSelectAutoStyle(selConn);
        updateSelectAutoStyle(selKasten);

        const distTypes = getSelectedDistributorTypesFromUI();
        const vType = distTypes.length > 0 ? distTypes[0] : 'metalplast';

        const noWmzActive = document.getElementById('cb-vconfig-wmz')?.checked || false;

        let connToUse = 'anschluss_horiz';

        if (selectedConnId && selectedConnId !== 'auto') {
            connToUse = selectedConnId;
        } else {
            const allowedConns = getSelectedConnectionTypesFromUI();
            let primaryConn = 'anschluss_horiz';
            if (orientation === 'hor') {
                primaryConn = document.getElementById('vconfig-primary-connection-hor')?.value || 
                              document.getElementById('vconfig-primary-connection')?.value || 
                              'anschluss_horiz';
            } else {
                primaryConn = document.getElementById('vconfig-primary-connection-ver')?.value || 
                              document.getElementById('vconfig-primary-connection')?.value || 
                              'anschluss_vert';
            }

            if (allowedConns.length > 0 && !allowedConns.includes(primaryConn)) {
                const matchOrient = allowedConns.find(c => orientation === 'ver' ? c.endsWith('_vert') : c.endsWith('_horiz'));
                primaryConn = matchOrient || allowedConns[0];
            }

            if (orientation === 'ver' && horToVerMap[primaryConn]) {
                connToUse = horToVerMap[primaryConn];
            } else if (orientation === 'hor' && verToHorMap[primaryConn]) {
                connToUse = verToHorMap[primaryConn];
            } else {
                connToUse = primaryConn;
            }

            if (noWmzActive) {
                const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
                if (setObj && setObj.isWmz) {
                    connToUse = (orientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
                }
            }
        }

        const allowedCabs = (kastenKey && kastenKey !== 'auto') ? [kastenKey] : getSelectedCabinetTypesFromUI();
        const rec = db.getRecommendation(vType, connToUse, rings > 0 ? rings : 2, allowedCabs);

        // Tooltip update for select-floor-conn
        const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
        const currentConnName = rec ? rec.connectionSetName : (setObj ? setObj.name : 'Anschluss-Set horizontal');
        if (selConn) {
            selConn.title = `Für die Kastenberechnung berücksichtigtes Anschluss-Set: ${currentConnName}\n• Ausrichtung: ${orientation === 'ver' ? 'Vertikal (Kugelhahn unten)' : 'Horizontal (Kugelhahn seitlich)'}${rings > 0 && rec ? '\n• Verteiler-Länge (L): ' + rec.manifoldLength + ' mm\n• Erforderlicher Index: ' + rec.requiredIndex : ''}`;
        }

        if (selKasten) {
            const optAuto = selKasten.querySelector('option[value="auto"]');
            if (optAuto) {
                optAuto.textContent = '🚗 Auto (Empfehlung)';
            }
        }

        const sep = `<span style="margin: 0 14px; opacity: 0.45; font-weight: normal;">|</span>`;

        if (rings <= 0) {
            dimsSpan.innerHTML = `Verteilerkasten: -${sep}Index -${sep}B: - × H: - × T: - ℹ️`;
            dimsSpan.title = "Keine Heizkreise ausgelegt (Klicken für Details)";
            dimsSpan.style.background = "#f1f5f9";
            dimsSpan.style.color = "#64748b";
            dimsSpan.style.borderColor = "#cbd5e1";
            return;
        }

        if (rec) {
            const isAuto = (kastenKey === 'auto');
            if (rec.matchingCabinets && rec.matchingCabinets.length > 0) {
                const cab = rec.matchingCabinets[0];
                const prefix = isAuto ? '🚗 Auto: ' : '✋ ';
                const depthStr = cab.depth > 0 ? `${cab.depth} mm` : 'Fronttür';
                const heightStr = cab.height || '750-850 mm';
                const widthStr = `${cab.width} mm`;
                const lenStr = `${rec.manifoldLength} mm`;
                
                dimsSpan.innerHTML = `${prefix}${cab.shortName}${sep}Index ${rec.requiredIndex}${sep}B: ${widthStr} × H: ${heightStr} × T: ${depthStr} (L: ${lenStr}) <span style="margin-left: 4px;">ℹ️</span>`;
                dimsSpan.title = `${cab.name}\n• Index: ${rec.requiredIndex}\n• Anschluss: ${rec.connectionSetName}\n• Kastenbreite (B): ${widthStr}\n• Höhe (H): ${heightStr}\n• Tiefe (T): ${depthStr}\n• Verteiler-Länge (L): ${lenStr}\n• Artikelnummer: ${cab.articleNo}\n\n(Klicken für Details & Alternativen)`;
            } else {
                const isAuto = (kastenKey === 'auto');
                const prefix = isAuto ? '🚗 Auto: ' : '✋ ';
                dimsSpan.innerHTML = `${prefix}Index ${rec.requiredIndex}${sep}B ≥ ${rec.minWidth} mm (L: ${rec.manifoldLength} mm)${sep}Kein passendes Modell ℹ️`;
                const cabNames = rec.matchingCabinets ? rec.matchingCabinets.map(c => c.shortName).join(', ') : '';
                dimsSpan.title = `Mindestbreite: ${rec.minWidth} mm | Index: ${rec.requiredIndex} | Passend: ${cabNames || 'Keine'} (Klicken für Details)`;
            }

            if (isAuto) {
                dimsSpan.style.background = "#e0f2fe";
                dimsSpan.style.color = "#0369a1";
                dimsSpan.style.borderColor = "#bae6fd";
            } else {
                dimsSpan.style.background = "#ffffff";
                dimsSpan.style.color = "#0f172a";
                dimsSpan.style.borderColor = "#cbd5e1";
            }
        } else {
            dimsSpan.innerHTML = `Kein Kasten${sep}Index - ℹ️`;
            dimsSpan.title = "Kein passender Verteilerkasten für die gewählten Kriterien";
            dimsSpan.style.background = "#fee2e2";
            dimsSpan.style.color = "#991b1b";
            dimsSpan.style.borderColor = "#fca5a5";
        }
    }

    // --- Kasten Details Modal Logic ---
    const kdetailsModal = document.getElementById('kasten-details-modal');
    const btnKdetailsClose = document.getElementById('btn-kdetails-close');
    const btnKdetailsCloseX = document.getElementById('btn-kdetails-close-x');

    function openKastenDetailsModal(floorBody) {
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
        if (!kdetailsModal || !floorBody || !db) return;

        const ebeneName = floorBody.querySelector('.input-floor-name')?.value || 'Geschoss';
        const fbhvName = floorBody.querySelector('.input-fbhv-name')?.value || '-';

        let ringsFromDataset = 0;
        const cellVerteiler = floorBody.querySelector('.floor-sum-verteiler');
        if (cellVerteiler && cellVerteiler.dataset.rings !== undefined) {
            ringsFromDataset = parseInt(cellVerteiler.dataset.rings, 10) || 0;
        }
        
        let ringsFromInputs = 0;
        const ringInputs = floorBody.querySelectorAll('tr.room-row .input-rings');
        ringInputs.forEach(inp => {
            ringsFromInputs += parseInt(inp.value, 10) || 0;
        });

        const rings = Math.max(ringsFromDataset, ringsFromInputs);

        const headerInfo = document.getElementById('kdetails-header-info');
        if (headerInfo) {
            headerInfo.innerHTML = `<strong>Geschoss:</strong> ${ebeneName} &nbsp;|&nbsp; <strong>Verteiler:</strong> ${fbhvName} &nbsp;|&nbsp; <strong>Kreise / Ringe:</strong> ${rings}-fach`;
        }

        const cbHor = floorBody.querySelector('.cb-floor-hor');
        const isHor = cbHor ? cbHor.checked : true;
        const orientation = isHor ? 'hor' : 'ver';

        const selKasten = floorBody.querySelector('.select-floor-kasten');
        const kastenKey = selKasten ? selKasten.value : 'auto';

        const distTypes = getSelectedDistributorTypesFromUI();
        const vType = distTypes.length > 0 ? distTypes[0] : 'metalplast';

        const noWmzActive = document.getElementById('cb-vconfig-wmz')?.checked || false;
        let baseConn = document.getElementById('vconfig-primary-connection')?.value || 'anschluss_horiz';

        const horToVer = {
            'anschluss_horiz': 'anschluss_vert',
            'wmz_horiz': 'wmz_vert',
            'wmz_horiz_mp': 'wmz_vert_mp',
            'stramax_horiz': 'stramax_vert',
            'danfoss_horiz': 'danfoss_vert',
            'oventrop_hycocon_horiz': 'oventrop_hycocon_vert',
            'oventrop_cocon_horiz': 'oventrop_cocon_vert',
            'ta_compact_dp_horiz': 'ta_compact_dp_vert',
            'ta_compact_p_horiz': 'ta_compact_p_vert'
        };
        const verToHor = {
            'anschluss_vert': 'anschluss_horiz',
            'wmz_vert': 'wmz_horiz',
            'wmz_vert_mp': 'wmz_horiz_mp',
            'stramax_vert': 'stramax_horiz',
            'danfoss_vert': 'danfoss_horiz',
            'oventrop_hycocon_vert': 'oventrop_hycocon_horiz',
            'oventrop_cocon_vert': 'oventrop_cocon_horiz',
            'ta_compact_dp_vert': 'ta_compact_dp_horiz',
            'ta_compact_p_vert': 'ta_compact_p_horiz'
        };

        let connToUse = baseConn;
        if (orientation === 'ver' && horToVer[baseConn]) {
            connToUse = horToVer[baseConn];
        } else if (orientation === 'hor' && verToHor[baseConn]) {
            connToUse = verToHor[baseConn];
        }

        if (noWmzActive) {
            const setObj = FBHV_DATABASE.connectionSets.find(s => s.id === connToUse);
            if (setObj && setObj.isWmz) {
                connToUse = (orientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
            }
        }

        const allowedCabs = (kastenKey && kastenKey !== 'auto') ? [kastenKey] : getSelectedCabinetTypesFromUI();
        const rec = FBHV_DATABASE.getRecommendation(vType, connToUse, rings > 0 ? rings : 2, allowedCabs);

        const titleEl = document.getElementById('kdetails-primary-title');
        const widthEl = document.getElementById('kdetails-width');
        const heightEl = document.getElementById('kdetails-height');
        const depthEl = document.getElementById('kdetails-depth');
        const lenEl = document.getElementById('kdetails-len');
        const indexEl = document.getElementById('kdetails-index');
        const articleEl = document.getElementById('kdetails-article');
        const altListEl = document.getElementById('kdetails-alternatives-list');

        if (rec && rec.matchingCabinets.length > 0) {
            const primaryCab = rec.matchingCabinets[0];
            if (titleEl) titleEl.textContent = `Gewählter / Empfohlener Kasten: ${primaryCab.name}`;
            if (widthEl) widthEl.textContent = `${primaryCab.width} mm (Mindestbreite)`;
            if (heightEl) heightEl.textContent = primaryCab.height || '750 - 850 mm';
            if (depthEl) depthEl.textContent = primaryCab.depth > 0 ? `${primaryCab.depth} mm` : 'Fronttür';
            if (lenEl) lenEl.textContent = `${rec.manifoldLength} mm (Verteiler inkl. Garnitur)`;
            if (indexEl) indexEl.textContent = `Index ${rec.requiredIndex}`;
            if (articleEl) articleEl.textContent = primaryCab.articleNo;

            if (altListEl) {
                altListEl.innerHTML = '';
                rec.matchingCabinets.forEach(cab => {
                    const div = document.createElement('div');
                    div.style.cssText = "background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;";
                    div.innerHTML = `<div><strong>${cab.name}</strong><br><span style="color:#64748b; font-size:0.9em;">Maße: B ${cab.width} mm &times; H ${cab.height || '750mm'} &times; T ${cab.depth > 0 ? cab.depth + 'mm' : 'Fronttür'}</span></div>
                                     <div style="text-align:right;"><span style="color:#0078d7; font-weight:bold; font-size:0.95em;">Art. ${cab.articleNo}</span></div>`;
                    altListEl.appendChild(div);
                });
            }
        } else {
            if (titleEl) titleEl.textContent = "Kein Kasten ausgewählt";
            if (widthEl) widthEl.textContent = "-";
            if (heightEl) heightEl.textContent = "-";
            if (depthEl) depthEl.textContent = "-";
            if (lenEl) lenEl.textContent = "-";
            if (indexEl) indexEl.textContent = "-";
            if (articleEl) articleEl.textContent = "-";
            if (altListEl) altListEl.innerHTML = '<div style="color:#94a3b8; font-style:italic;">Keine passenden Modelle für dieses Geschoss gefunden</div>';
        }

        kdetailsModal.classList.remove('hidden');
    }

    function closeKastenDetailsModal() {
        if (kdetailsModal) kdetailsModal.classList.add('hidden');
    }


    // ── Sync-Buttons visuell aktualisieren ────────────────────────────────
    function updateAllSyncButtons() {
        const markedFloors = Array.from(document.querySelectorAll('tbody.floor-group.active-verteiler'));
        const count = markedFloors.length;
        document.querySelectorAll('tbody.floor-group').forEach(fb => {
            const btn = fb.querySelector('.btn-sync-mark');
            if (!btn) return;
            const isMarked = fb.classList.contains('active-verteiler');
            if (isMarked && count > 1) {
                btn.textContent = '☑ Sync';
                btn.style.border = '2px solid #16a34a';
                btn.style.background = '#dcfce7';
                btn.style.color = '#15803d';
            } else {
                btn.textContent = '☐ Sync';
                btn.style.border = '2px solid #94a3b8';
                btn.style.background = '#f8fafc';
                btn.style.color = '#64748b';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //  BATCH-ÜBERTRAGUNG: Verteiler-Header-Felder (Bez., Ebene, RZ)
    //  Strategie: markierte Floors werden BEIM AUSLÖSEN gespeichert,
    //  nicht erst beim Bestätigen – so geht keine Selektion verloren.
    // ═══════════════════════════════════════════════════════════════════


    // Snap: aktuelle Auswahl sofort einfrieren
    function getMarkedFloors() {
        return Array.from(document.querySelectorAll('tbody.floor-group.active-verteiler'));
    }

    // Feld-spezifische Header-Übertragung vom Quell-Verteiler in alle Ziel-Verteiler
    function applyHeaderBatchToFloors(sourceFloorBody, targetFloors, fieldType = null) {
        if (!sourceFloorBody || !targetFloors || targetFloors.length === 0) return;

        const sourceFbhv  = sourceFloorBody.querySelector('.input-fbhv-name')?.value  ?? '';
        const sourceEbene = sourceFloorBody.querySelector('.input-floor-name')?.value ?? '';
        const sourceBtnRz = sourceFloorBody.querySelector('.btn-toggle-rz');
        const sourceRzActive = sourceBtnRz ? sourceBtnRz.classList.contains('active') : false;

        targetFloors.forEach(fb => {
            if (fb === sourceFloorBody) return;

            const tFbhv  = fb.querySelector('.input-fbhv-name');
            const tEbene = fb.querySelector('.input-floor-name');
            const tBtnRz = fb.querySelector('.btn-toggle-rz');

            if ((!fieldType || fieldType === 'fbhv') && tFbhv) {
                tFbhv.value = sourceFbhv;
            }
            if ((!fieldType || fieldType === 'ebene') && tEbene) {
                tEbene.value = sourceEbene;
            }
            if ((!fieldType || fieldType === 'rz') && tBtnRz) {
                tBtnRz.classList.toggle('active', sourceRzActive);
                updateRzInputsState(fb, sourceRzActive);
            }
            calculateFloorSum(fb);
        });

        calculateFloorSum(sourceFloorBody);
        calculateGlobalSum();
        if (typeof renderVerteilerOverviewList === 'function') renderVerteilerOverviewList();
        if (typeof applyMainTableFilters === 'function') applyMainTableFilters();
        if (!isLoading) debouncedSave();
    }

    // Haupteinstieg: wird aufgerufen, wenn RZ, Bez. oder Ebene geändert wird
    function triggerHeaderBatch(sourceFloorBody) {
        if (!sourceFloorBody) return;
        // Sofort-Snapshot der markierten Verteiler
        const marked = getMarkedFloors();
        if (marked.length > 1 && marked.includes(sourceFloorBody)) {
            // Mehrfach-Markierung aktiv → sofort ohne Popup übertragen
            applyHeaderBatchToFloors(sourceFloorBody, marked);
        }
        // Einzeln markiert: nichts tun (kein Popup für diese 3 Felder ohne Ctrl)
    }

    // Einstieg über Ctrl-Taste (für Ctrl+Enter / Ctrl+RZ)
    function triggerHeaderBatchCtrl(sourceFloorBody) {
        if (!sourceFloorBody) return;
        const marked = getMarkedFloors();
        if (marked.length > 1 && marked.includes(sourceFloorBody)) {
            applyHeaderBatchToFloors(sourceFloorBody, marked);
            return;
        }
        // Nur ein Verteiler markiert → Popup anzeigen mit Strg-Optionen
        // (nutzt die bestehende handleCtrlBatchAction-Infrastruktur)
    }

    // Ctrl-Key Batch Apply Logic
    let isCtrlPressed = false;
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Control' || e.ctrlKey || e.metaKey) {
            isCtrlPressed = true;
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'Control' || !e.ctrlKey) {
            isCtrlPressed = false;
        }
    });
    window.addEventListener('blur', () => {
        isCtrlPressed = false;
    });

    let pendingCtrlBatch = null;

    function handleCtrlBatchAction(actionType, floorBody, val, event) {
        if (!floorBody) return false;

        const ebeneName = floorBody.querySelector('.input-floor-name')?.value || '';
        // Snapshot markierte Verteiler sofort beim Auslösen
        const snapshotMarked = getMarkedFloors();
        const isFloorInMarked = snapshotMarked.includes(floorBody);
        const ctrlActive = (event && (event.ctrlKey || event.metaKey)) || isCtrlPressed;

        if (!ctrlActive) return false;

        // Pendingdaten INKL. snapshot speichern – so gehen Markierungen nicht verloren
        pendingCtrlBatch = {
            actionType,
            sourceFloorBody: floorBody,
            val,
            ebeneName,
            snapshotMarked  // ← entscheidend: jetzt eingefroren!
        };

        // Wenn mehrere Verteiler markiert sind und dieser dabei ist → direkt anwenden
        if (snapshotMarked.length > 1 && isFloorInMarked) {
            applyCtrlBatch('marked');
            return true;
        }

        // Sonst → Popup für Auswahl
        let changeLabel = '';
        if (actionType === 'fbhv') changeLabel = `Bez. Verteiler / FBHV: ${val}`;
        else if (actionType === 'ebene') changeLabel = `Ebene / Geschoss: ${val}`;
        else if (actionType === 'hor') changeLabel = 'Anschluss-Ausrichtung: Horizontal';
        else if (actionType === 'ver') changeLabel = 'Anschluss-Ausrichtung: Vertikal';
        else if (actionType === 'kasten') {
            const selKasten = floorBody.querySelector('.select-floor-kasten');
            const txt = selKasten?.options[selKasten.selectedIndex]?.text || val;
            changeLabel = `Verteilerkasten: ${txt}`;
        } else if (actionType === 'conn') {
            const selConn = floorBody.querySelector('.select-floor-conn');
            const txt = selConn?.options[selConn.selectedIndex]?.text || val;
            changeLabel = `Anschluss-Set: ${txt}`;
        } else if (actionType === 'rz') {
            changeLabel = `Randzone (RZ): ${val ? 'Aktiviert' : 'Deaktiviert'}`;
        }

        const ctrlModal = document.getElementById('ctrl-batch-modal');
        const descEl = document.getElementById('ctrl-batch-desc');
        const lblSame = document.getElementById('lbl-ctrl-apply-same');

        if (descEl) {
            descEl.innerHTML = `Sie haben mit gedrückter <strong>Ctrl-Taste</strong> folgende Einstellung geändert:<br><span style="display:inline-block; margin-top:6px; padding:4px 10px; background:#e0f2fe; color:#0369a1; border-radius:4px; font-weight:bold;">${changeLabel}</span>`;
        }

        if (lblSame) {
            const ebeneTitle = ebeneName.trim() ? `"${ebeneName}"` : 'gleicher Bezeichnung';
            lblSame.innerHTML = `Nur in Verteilern vom gleichen Geschoss (<strong>${ebeneTitle}</strong>) übernehmen`;
        }

        if (ctrlModal) {
            ctrlModal.classList.remove('hidden');
        }
        return true;
    }

    function applyCtrlBatch(scope) {
        if (!pendingCtrlBatch) return;

        const { actionType, sourceFloorBody, val, ebeneName, snapshotMarked } = pendingCtrlBatch;
        const allFloorBodies = document.querySelectorAll('tbody.floor-group');

        allFloorBodies.forEach(fb => {
            if (fb === sourceFloorBody && scope !== 'all' && scope !== 'same' && scope !== 'marked') return;

            const floorEbene = fb.querySelector('.input-floor-name')?.value || '';
            const isSameEbene = ebeneName.trim() && floorEbene.trim().toLowerCase() === ebeneName.trim().toLowerCase();
            // Für 'marked': gespeicherten Snapshot verwenden, NICHT erneut querySelectorAll!
            const isMarked = snapshotMarked && snapshotMarked.includes(fb);

            if (scope === 'all' || (scope === 'same' && isSameEbene) || (scope === 'marked' && isMarked)) {
                const targetFbhvInput = fb.querySelector('.input-fbhv-name');
                const targetEbeneInput = fb.querySelector('.input-floor-name');
                const targetCbHor = fb.querySelector('.cb-floor-hor');
                const targetCbVer = fb.querySelector('.cb-floor-ver');
                const targetSelKasten = fb.querySelector('.select-floor-kasten');
                const targetSelConn = fb.querySelector('.select-floor-conn');
                const targetBtnRz = fb.querySelector('.btn-toggle-rz');

                const sourceFbhvVal = sourceFloorBody ? (sourceFloorBody.querySelector('.input-fbhv-name')?.value || '') : '';
                const sourceEbeneVal = sourceFloorBody ? (sourceFloorBody.querySelector('.input-floor-name')?.value || '') : '';
                const sourceBtnRz = sourceFloorBody ? sourceFloorBody.querySelector('.btn-toggle-rz') : null;
                const isSourceRzActive = sourceBtnRz ? sourceBtnRz.classList.contains('active') : !!val;

                if (actionType === 'fbhv') {
                    if (targetFbhvInput && sourceFbhvVal) targetFbhvInput.value = sourceFbhvVal;
                } else if (actionType === 'ebene') {
                    if (targetEbeneInput && sourceEbeneVal) targetEbeneInput.value = sourceEbeneVal;
                } else if (actionType === 'rz') {
                    if (targetBtnRz) {
                        targetBtnRz.classList.toggle('active', isSourceRzActive);
                        updateRzInputsState(fb, isSourceRzActive);
                    }
                } else if (actionType === 'hor') {
                    if (targetCbHor) targetCbHor.checked = true;
                    if (targetCbVer) targetCbVer.checked = false;
                } else if (actionType === 'ver') {
                    if (targetCbHor) targetCbHor.checked = false;
                    if (targetCbVer) targetCbVer.checked = true;
                } else if (actionType === 'kasten') {
                    if (targetSelKasten) {
                        targetSelKasten.value = val;
                        updateSelectAutoStyle(targetSelKasten);
                    }
                } else if (actionType === 'conn') {
                    if (targetSelConn) {
                        targetSelConn.dataset.userVal = val;
                        targetSelConn.value = val;
                        updateSelectAutoStyle(targetSelConn);
                    }
                }

                calculateFloorSum(fb);
            }
        });

        calculateGlobalSum();
        if (typeof renderVerteilerOverviewList === 'function') renderVerteilerOverviewList();
        if (typeof applyMainTableFilters === 'function') applyMainTableFilters();
        if (!isLoading) debouncedSave();

        const ctrlModal = document.getElementById('ctrl-batch-modal');
        if (ctrlModal) ctrlModal.classList.add('hidden');
        pendingCtrlBatch = null;
    }


    const btnCtrlApplyMarked = document.getElementById('btn-ctrl-apply-marked');
    const btnCtrlApplyAll = document.getElementById('btn-ctrl-apply-all');
    const btnCtrlApplySame = document.getElementById('btn-ctrl-apply-same');
    const btnCtrlApplySingle = document.getElementById('btn-ctrl-apply-single');
    const ctrlBatchModal = document.getElementById('ctrl-batch-modal');

    if (btnCtrlApplyMarked) {
        btnCtrlApplyMarked.addEventListener('click', () => applyCtrlBatch('marked'));
    }
    if (btnCtrlApplyAll) {
        btnCtrlApplyAll.addEventListener('click', () => applyCtrlBatch('all'));
    }
    if (btnCtrlApplySame) {
        btnCtrlApplySame.addEventListener('click', () => applyCtrlBatch('same'));
    }
    if (btnCtrlApplySingle) {
        btnCtrlApplySingle.addEventListener('click', () => applyCtrlBatch('single'));
    }
    if (ctrlBatchModal) {
        ctrlBatchModal.addEventListener('click', (e) => {
            if (e.target === ctrlBatchModal) {
                applyCtrlBatch('single');
            }
        });
    }

    // Multi-Paste (Text stempeln) Logic
    let isMultiPasteActive = false;
    let multiPasteText = '';

    function showMultiPasteToast(text) {
        const toast = document.getElementById('multi-paste-toast');
        const textEl = document.getElementById('multi-paste-toast-text');
        if (textEl) {
            const shortText = text.length > 25 ? text.substring(0, 25) + '...' : text;
            textEl.textContent = `"${shortText}"`;
        }
        if (toast) {
            toast.classList.remove('hidden');
        }
    }

    function hideMultiPasteToast() {
        const toast = document.getElementById('multi-paste-toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    }

    function startMultiPasteMode(textToPaste) {
        if (!textToPaste && textToPaste !== 0) return;
        multiPasteText = String(textToPaste);
        isMultiPasteActive = true;

        const btn = document.getElementById('btn-multi-paste');
        if (btn) {
            btn.classList.add('active');
            btn.style.background = '#dcfce7';
            btn.style.color = '#15803d';
            btn.style.borderColor = '#86efac';
            btn.innerHTML = `<span class="drag-handle">⋮⋮</span> 📋 Stempeln: "${multiPasteText.length > 12 ? multiPasteText.substring(0, 12) + '...' : multiPasteText}"`;
        }

        showMultiPasteToast(multiPasteText);
        document.body.classList.add('multi-paste-mode-active');
    }

    function stopMultiPasteMode() {
        isMultiPasteActive = false;
        multiPasteText = '';

        const btn = document.getElementById('btn-multi-paste');
        if (btn) {
            btn.classList.remove('active');
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.innerHTML = `<span class="drag-handle">⋮⋮</span> 📋 Text Multi.`;
        }

        hideMultiPasteToast();
        document.body.classList.remove('multi-paste-mode-active');
    }

    const btnMultiPaste = document.getElementById('btn-multi-paste');
    if (btnMultiPaste) {
        btnMultiPaste.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (isMultiPasteActive) {
                stopMultiPasteMode();
                return;
            }

            let selText = window.getSelection().toString().trim();

            const activeEl = document.activeElement;
            if (!selText && activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                const start = activeEl.selectionStart;
                const end = activeEl.selectionEnd;
                if (start !== undefined && end !== undefined && start !== end) {
                    selText = activeEl.value.substring(start, end).trim();
                } else if (activeEl.value) {
                    selText = activeEl.value.trim();
                }
            }

            if (!selText && navigator.clipboard && navigator.clipboard.readText) {
                try {
                    const clipText = await navigator.clipboard.readText();
                    if (clipText && clipText.trim()) {
                        selText = clipText.trim();
                    }
                } catch (err) {}
            }

            if (!selText) {
                selText = await showCustomPrompt("Kein Text markiert. Bitte Text zum Stempeln eingeben:", "", "Text stempeln");
                if (selText) selText = selText.trim();
            }

            if (selText) {
                startMultiPasteMode(selText);
            }
        });
    }

    const btnMultiPasteClose = document.getElementById('btn-multi-paste-close');
    if (btnMultiPasteClose) {
        btnMultiPasteClose.addEventListener('click', (e) => {
            e.stopPropagation();
            stopMultiPasteMode();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMultiPasteActive) {
            stopMultiPasteMode();
        }
    });

    document.addEventListener('click', (e) => {
        if (!isMultiPasteActive) return;

        if (e.target.closest('#btn-multi-paste') || e.target.closest('#multi-paste-toast')) {
            return;
        }

        const targetInput = e.target.closest('input[type="text"], input:not([type]), textarea, input[type="search"]');
        if (targetInput && !targetInput.readOnly && !targetInput.disabled) {
            e.preventDefault();
            e.stopPropagation();

            targetInput.value = multiPasteText;
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));

            const floorBody = targetInput.closest('tbody.floor-group');
            if (floorBody && typeof calculateFloorSum === 'function') {
                calculateFloorSum(floorBody);
            }
            if (typeof debouncedSave === 'function' && !isLoading) {
                debouncedSave();
            }
            const origBg = targetInput.style.backgroundColor;
            targetInput.style.backgroundColor = '#bbf7d0';
            setTimeout(() => {
                targetInput.style.backgroundColor = origBg;
            }, 300);
        }
    }, true);

    function calculateGlobalSum() {
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach(fb => {
            updateFloorKastenDisplay(fb);
        });
    }

    /* ==========================================================================
       EXCEL-STYLE COLUMN WIDTH MANAGER SYSTEM
       ========================================================================== */
    function initColumnWidthsManager() {
        const DEFAULT_COLUMN_WIDTHS = {
            col_rz: 45,
            col_action: 100,
            col_room_name: 394,
            col_va_rz: 75,
            col_area_rz: 76,
            col_va_iz: 70,
            col_area_iz: 75,
            col_thermostat: 65,
            col_antrieb: 65,
            col_rz_iz: 65,
            col_target_pipe: 75,
            col_fugen: 63,
            col_connection: 75,
            col_total_len: 113,
            col_rings: 99,
            col_zus_ring: 120,
            col_extra: 248,
            col_expand: 368
        };

        const COLUMN_CONFIG = [
            { key: 'col_rz', label: 'RZ (Randzone Knopf)', index: 1, min: 35, max: 200 },
            { key: 'col_action', label: 'Löschen (🗑️ Knopf)', index: 2, min: 30, max: 150 },
            { key: 'col_room_name', label: 'Raum Bezeichnung', index: 3, min: 100, max: 600 },
            { key: 'col_va_rz', label: 'VA Rz [cm]', index: 4, min: 40, max: 250 },
            { key: 'col_area_rz', label: 'Fläche Rz [m²]', index: 5, min: 40, max: 250 },
            { key: 'col_va_iz', label: 'VA Iz [cm]', index: 6, min: 40, max: 250 },
            { key: 'col_area_iz', label: 'Fläche Iz [m²]', index: 7, min: 40, max: 250 },
            { key: 'col_thermostat', label: 'Raum-Thermostat', index: 8, min: 40, max: 250 },
            { key: 'col_antrieb', label: 'Stellantrieb', index: 9, min: 40, max: 250 },
            { key: 'col_rz_iz', label: 'Rz+Iz Gesamt', index: 10, min: 40, max: 250 },
            { key: 'col_target_pipe', label: 'Ziel Ringlänge [m]', index: 11, min: 40, max: 250 },
            { key: 'col_fugen', label: 'Fugen [Stk]', index: 12, min: 40, max: 200 },
            { key: 'col_connection', label: 'Anbindung [m]', index: 13, min: 40, max: 250 },
            { key: 'col_total_len', label: 'Gesamtlänge [m]', index: 14, min: 40, max: 250 },
            { key: 'col_rings', label: 'Ringe [Stk]', index: 15, min: 50, max: 250 },
            { key: 'col_zus_ring', label: 'Zus. Ring', index: 16, min: 30, max: 600 },
            { key: 'col_extra', label: 'Info (Textfeld)', index: 17, min: 30, max: 600 }
        ];

        function getStoredWidths() {
            const codeLayout = window.DEFAULT_TOOLBAR_LAYOUT;
            const codeWidths = (codeLayout && codeLayout.columnWidths) ? codeLayout.columnWidths : null;
            const codeUpdatedAt = (codeLayout && codeLayout.updatedAt) ? codeLayout.updatedAt : 0;

            try {
                const storedStr = localStorage.getItem('fbhColumnWidths');
                if (storedStr) {
                    const stored = JSON.parse(storedStr);
                    const storedUpdatedAt = stored._updatedAt || 0;

                    // Wenn der Code (default_toolbar_layout.js) ein neueres Datum hat als der Speicher, lade die Code-Breiten!
                    if (codeWidths && codeUpdatedAt > storedUpdatedAt) {
                        const merged = Object.assign({}, DEFAULT_COLUMN_WIDTHS, codeWidths, { _updatedAt: codeUpdatedAt });
                        try {
                            localStorage.setItem('fbhColumnWidths', JSON.stringify(merged));
                        } catch (e) {}
                        return merged;
                    }

                    return Object.assign({}, DEFAULT_COLUMN_WIDTHS, stored);
                }
            } catch (e) {
                console.warn('Could not read fbhColumnWidths', e);
            }

            if (codeWidths) {
                return Object.assign({}, DEFAULT_COLUMN_WIDTHS, codeWidths);
            }
            return Object.assign({}, DEFAULT_COLUMN_WIDTHS);
        }

        function saveStoredWidths(widths) {
            try {
                widths._updatedAt = Date.now();
                localStorage.setItem('fbhColumnWidths', JSON.stringify(widths));

                if (window.DEFAULT_TOOLBAR_LAYOUT) {
                    window.DEFAULT_TOOLBAR_LAYOUT.columnWidths = Object.assign({}, widths);
                    window.DEFAULT_TOOLBAR_LAYOUT.updatedAt = Date.now();
                }

                const savedLayoutStr = localStorage.getItem('fbhToolbarLayout');
                if (savedLayoutStr) {
                    try {
                        let layout = JSON.parse(savedLayoutStr);
                        if (layout && typeof layout === 'object') {
                            layout.columnWidths = Object.assign({}, widths);
                            layout.updatedAt = Date.now();
                            localStorage.setItem('fbhToolbarLayout', JSON.stringify(layout));
                        }
                    } catch (e) {}
                }

                const savedFbhDataStr = localStorage.getItem('fbhData');
                if (savedFbhDataStr) {
                    try {
                        let fbhData = JSON.parse(savedFbhDataStr);
                        if (fbhData && typeof fbhData === 'object') {
                            fbhData.columnWidths = Object.assign({}, widths);
                            localStorage.setItem('fbhData', JSON.stringify(fbhData));
                        }
                    } catch (e) {}
                }
            } catch (e) {
                console.warn('Could not save fbhColumnWidths', e);
            }
        }

        function applyColumnWidths(widths) {
            const activeWidths = widths || getStoredWidths();
            let styleEl = document.getElementById('dynamic-column-widths-css');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'dynamic-column-widths-css';
                document.head.appendChild(styleEl);
            }

            let cssRules = `#main-table, .floor-table, table.floor-table { table-layout: fixed !important; width: auto !important; border-collapse: collapse; }\n`;
            COLUMN_CONFIG.forEach(col => {
                const w = activeWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key];
                cssRules += `#main-table th:nth-child(${col.index}), #main-table td:nth-child(${col.index}), .floor-table th:nth-child(${col.index}), .floor-table td:nth-child(${col.index}) { width: ${w}px !important; min-width: ${w}px !important; max-width: ${w}px !important; box-sizing: border-box !important; overflow: hidden !important; }\n`;
                cssRules += `#main-table td:nth-child(${col.index}) input:not([type="checkbox"]), #main-table td:nth-child(${col.index}) select { width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }\n`;
            });

            styleEl.textContent = cssRules;
        }

        window.getStoredColumnWidths = getStoredWidths;
        window.saveStoredColumnWidths = saveStoredWidths;
        window.applyColumnWidths = applyColumnWidths;

        let activeResizing = null;

        function isColumnResizeEnabled() {
            const btnOpen = document.getElementById('btn-column-widths');
            const modal = document.getElementById('column-widths-modal');
            const isModalOpen = modal && !modal.classList.contains('hidden');
            const isBtnActive = btnOpen && btnOpen.classList.contains('active');
            const isBodyActive = document.body.classList.contains('column-resize-mode');
            return isModalOpen || isBtnActive || isBodyActive;
        }

        document.addEventListener('mousemove', (e) => {
            if (activeResizing) return;
            if (!isColumnResizeEnabled()) return;

            const th = e.target.closest('#main-table th, .column-header-row th');
            if (!th) return;

            const rect = th.getBoundingClientRect();
            const isNearRightEdge = (e.clientX >= rect.right - 14 && e.clientX <= rect.right + 10);

            if (isNearRightEdge) {
                th.style.cursor = 'col-resize';
            } else {
                th.style.cursor = '';
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (!isColumnResizeEnabled()) return;

            const th = e.target.closest('#main-table th, .column-header-row th');
            if (!th) return;

            const rect = th.getBoundingClientRect();
            const isNearRightEdge = (e.clientX >= rect.right - 14 && e.clientX <= rect.right + 10);
            if (!isNearRightEdge) return;

            e.preventDefault();
            e.stopPropagation();

            const row = th.parentElement;
            const ths = Array.from(row.children);
            const colIndex = ths.indexOf(th);

            if (colIndex < 0 || colIndex >= COLUMN_CONFIG.length) return;
            const colConfig = COLUMN_CONFIG[colIndex];

            const startX = e.clientX;
            const currentWidths = getStoredWidths();
            const startW = currentWidths[colConfig.key] || DEFAULT_COLUMN_WIDTHS[colConfig.key];

            activeResizing = {
                colConfig,
                startX,
                startW,
                th
            };

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }, true);

        window.addEventListener('mousemove', (e) => {
            if (!activeResizing) return;

            e.preventDefault();
            const deltaX = e.clientX - activeResizing.startX;
            const newW = Math.max(activeResizing.colConfig.min, Math.min(activeResizing.colConfig.max, activeResizing.startW + deltaX));

            const currentWidths = getStoredWidths();
            currentWidths[activeResizing.colConfig.key] = newW;
            applyColumnWidths(currentWidths);
            saveStoredWidths(currentWidths);
            syncPopupWindow(currentWidths);
        });

        window.addEventListener('mouseup', () => {
            if (activeResizing) {
                activeResizing = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });

        let popupWindowRef = null;

        function syncPopupWindow(widths) {
            if (popupWindowRef && !popupWindowRef.closed && typeof popupWindowRef.updatePopupControls === 'function') {
                popupWindowRef.updatePopupControls(widths);
            }
        }

        function openColumnWidthsPopup() {
            const width = 660;
            const height = 760;
            const left = window.screen.width ? Math.max(50, Math.round((window.screen.width - width) / 2)) : 100;
            const top = window.screen.height ? Math.max(50, Math.round((window.screen.height - height) / 2)) : 100;

            if (popupWindowRef && !popupWindowRef.closed) {
                popupWindowRef.focus();
                return;
            }

            popupWindowRef = window.open(
                '',
                'FBH_Spaltenbreiten_Popup',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
            );

            if (!popupWindowRef) {
                const widths = getStoredWidths();
                renderControls(widths);
                if (modal) modal.classList.remove('hidden');
                return;
            }

            const pdoc = popupWindowRef.document;
            pdoc.open();
            pdoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>📏 Spaltenbreiten anpassen (Excel-Modus)</title>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 15px; box-sizing: border-box; }
                        h3 { margin-top: 0; margin-bottom: 8px; color: #0078d7; display: flex; align-items: center; gap: 8px; font-size: 1.15em; }
                        .info-box { font-size: 0.85em; color: #475569; margin-bottom: 12px; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1; line-height: 1.4; }
                        .control-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px 10px; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 6px; }
                        .control-label { font-weight: 600; font-size: 0.88em; min-width: 160px; flex-shrink: 0; }
                        .control-slider { flex: 1; cursor: pointer; accent-color: #0078d7; }
                        .control-num { width: 60px; padding: 3px 5px; font-weight: bold; font-size: 0.88em; border-radius: 4px; border: 1px solid #cbd5e1; text-align: right; }
                        .control-unit { font-size: 0.82em; color: #64748b; font-weight: bold; width: 18px; }
                        .footer-bar { margin-top: 15px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; }
                        .btn { padding: 6px 14px; border-radius: 4px; font-weight: 600; font-size: 0.85em; cursor: pointer; border: 1px solid #cbd5e1; background: #ffffff; }
                        .btn-primary { background: #0078d7; color: #ffffff; border-color: #0078d7; }
                        .btn-save { background: #22c55e; color: #ffffff; border-color: #16a34a; font-weight: bold; }
                        .btn-save:hover { background: #16a34a; }
                    </style>
                </head>
                <body>
                    <h3>📏 Spaltenbreiten anpassen (Excel-Modus)</h3>
                    <div class="info-box">
                        💡 <strong>Multimonitor-Funktion:</strong> Ziehen Sie dieses Fenster auf Ihren zweiten Bildschirm! Jede Reglerbewegung verändert die Hauptanwendung live in Echtzeit.
                    </div>
                    <div class="footer-bar" style="margin-top: 0; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #cbd5e1; border-top: none; display: flex; justify-content: space-between; align-items: center;">
                        <button class="btn" id="btn-reset">🔄 Standardbreiten zurücksetzen</button>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-save" id="btn-save">💾 Speichern</button>
                            <button class="btn btn-primary" onclick="window.close()">✔ Schließen</button>
                        </div>
                    </div>
                    <div id="controls-list"></div>
                </body>
                </html>
            `);
            pdoc.close();

            const initPopupControls = () => {
                const container = pdoc.getElementById('controls-list');
                if (!container) return;
                const currentWidths = getStoredWidths();
                container.innerHTML = '';

                COLUMN_CONFIG.forEach(col => {
                    const val = currentWidths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key];

                    const row = pdoc.createElement('div');
                    row.className = 'control-row';

                    const lbl = pdoc.createElement('div');
                    lbl.className = 'control-label';
                    lbl.textContent = col.label;

                    const slider = pdoc.createElement('input');
                    slider.type = 'range';
                    slider.className = 'control-slider';
                    slider.min = col.min;
                    slider.max = col.max;
                    slider.value = val;
                    slider.dataset.key = col.key;

                    const num = pdoc.createElement('input');
                    num.type = 'number';
                    num.className = 'control-num';
                    num.min = col.min;
                    num.max = col.max;
                    num.value = val;
                    num.dataset.key = col.key;

                    const unit = pdoc.createElement('span');
                    unit.className = 'control-unit';
                    unit.textContent = 'px';

                    const update = (newVal) => {
                        const clamped = Math.max(col.min, Math.min(col.max, parseInt(newVal, 10) || col.min));
                        slider.value = clamped;
                        num.value = clamped;
                        currentWidths[col.key] = clamped;
                        saveStoredWidths(currentWidths);
                        applyColumnWidths(currentWidths);
                    };

                    slider.addEventListener('input', (e) => update(e.target.value));
                    num.addEventListener('input', (e) => update(e.target.value));

                    row.appendChild(lbl);
                    row.appendChild(slider);
                    row.appendChild(num);
                    row.appendChild(unit);
                    container.appendChild(row);
                });

                const btnReset = pdoc.getElementById('btn-reset');
                if (btnReset) {
                    btnReset.addEventListener('click', () => {
                        const defaults = Object.assign({}, DEFAULT_COLUMN_WIDTHS);
                        saveStoredWidths(defaults);
                        applyColumnWidths(defaults);
                        initPopupControls();
                    });
                }

                const btnSave = pdoc.getElementById('btn-save');
                if (btnSave) {
                    btnSave.addEventListener('click', () => {
                        const widths = getStoredWidths();
                        saveStoredWidths(widths);
                        if (typeof debouncedSave === 'function') debouncedSave();
                        btnSave.textContent = '✓ Gespeichert!';
                        btnSave.style.background = '#16a34a';
                        setTimeout(() => {
                            btnSave.textContent = '💾 Speichern';
                            btnSave.style.background = '#22c55e';
                        }, 1500);
                    });
                }
            };

            popupWindowRef.updatePopupControls = (widths) => {
                if (!pdoc) return;
                COLUMN_CONFIG.forEach(col => {
                    const val = widths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key];
                    const slider = pdoc.querySelector(`.control-slider[data-key="${col.key}"]`);
                    const num = pdoc.querySelector(`.control-num[data-key="${col.key}"]`);
                    if (slider) slider.value = val;
                    if (num) num.value = val;
                });
            };

            setTimeout(initPopupControls, 150);
        }

        function renderControls(widths) {
            const container = document.getElementById('column-width-controls-list');
            if (!container) return;
            container.innerHTML = '';

            COLUMN_CONFIG.forEach(col => {
                const currentW = widths[col.key] || DEFAULT_COLUMN_WIDTHS[col.key];

                const row = document.createElement('div');
                row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 10px; background: var(--bg-container-alt, #f8fafc); border-radius: 6px; border: 1px solid var(--border-color, #e2e8f0);';

                const labelEl = document.createElement('label');
                labelEl.style.cssText = 'font-weight: 600; font-size: 0.88em; color: var(--text-main, #0f172a); min-width: 170px; flex-shrink: 0;';
                labelEl.textContent = col.label;

                const sliderEl = document.createElement('input');
                sliderEl.type = 'range';
                sliderEl.min = col.min;
                sliderEl.max = col.max;
                sliderEl.value = currentW;
                sliderEl.style.cssText = 'flex: 1; cursor: pointer; accent-color: var(--primary-color, #0078d7);';

                const numEl = document.createElement('input');
                numEl.type = 'number';
                numEl.min = col.min;
                numEl.max = col.max;
                numEl.value = currentW;
                numEl.style.cssText = 'width: 65px; padding: 3px 6px; font-weight: bold; font-size: 0.88em; border-radius: 4px; border: 1px solid var(--border-color, #cbd5e1); text-align: right;';

                const unitEl = document.createElement('span');
                unitEl.style.cssText = 'font-size: 0.82em; color: var(--text-secondary, #64748b); font-weight: bold; min-width: 20px;';
                unitEl.textContent = 'px';

                const updateValue = (newW) => {
                    const clamped = Math.max(col.min, Math.min(col.max, parseInt(newW, 10) || col.min));
                    sliderEl.value = clamped;
                    numEl.value = clamped;
                    widths[col.key] = clamped;
                    applyColumnWidths(widths);
                    saveStoredWidths(widths);
                };

                sliderEl.addEventListener('input', (e) => updateValue(e.target.value));
                numEl.addEventListener('input', (e) => updateValue(e.target.value));

                row.appendChild(labelEl);
                row.appendChild(sliderEl);
                row.appendChild(numEl);
                row.appendChild(unitEl);
                container.appendChild(row);
            });
        }

        const modal = document.getElementById('column-widths-modal');
        const btnOpen = document.getElementById('btn-column-widths');
        const btnClose = document.getElementById('btn-close-column-widths');
        const btnCloseX = document.getElementById('btn-close-column-widths-x');
        const btnReset = document.getElementById('btn-reset-column-widths');

        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = btnOpen.classList.toggle('active');
                if (isActive) {
                    document.body.classList.add('column-resize-mode');
                    btnOpen.style.backgroundColor = '#16a34a';
                    btnOpen.style.color = '#ffffff';
                    openColumnWidthsPopup();
                } else {
                    document.body.classList.remove('column-resize-mode');
                    btnOpen.style.backgroundColor = '';
                    btnOpen.style.color = '';
                    if (modal) modal.classList.add('hidden');
                }
            });
        }

        const closeModal = () => {
            if (modal) modal.classList.add('hidden');
            if (btnOpen) {
                btnOpen.classList.remove('active');
                btnOpen.style.backgroundColor = '';
                btnOpen.style.color = '';
            }
            document.body.classList.remove('column-resize-mode');
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCloseX) btnCloseX.addEventListener('click', closeModal);

        const btnSaveModal = document.getElementById('btn-save-column-widths');
        if (btnSaveModal) {
            btnSaveModal.addEventListener('click', () => {
                const currentWidths = getStoredWidths();
                saveStoredWidths(currentWidths);
                if (typeof debouncedSave === 'function') debouncedSave();
                btnSaveModal.textContent = '✓ Gespeichert!';
                btnSaveModal.style.backgroundColor = '#16a34a';
                setTimeout(() => {
                    btnSaveModal.textContent = '💾 Spaltenbreiten speichern';
                    btnSaveModal.style.backgroundColor = '#22c55e';
                }, 1500);
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                const defaults = Object.assign({}, DEFAULT_COLUMN_WIDTHS);
                saveStoredWidths(defaults);
                applyColumnWidths(defaults);
                renderControls(defaults);
            });
        }

        // Apply on load
        applyColumnWidths();
    }

    initColumnWidthsManager();

    /* ==========================================================================
       DATABASE CHECK MANAGER SYSTEM (DB-Check 2 bis 12 Ringe)
       ========================================================================== */
    function initDatabaseCheckManager() {
        const modal = document.getElementById('db-check-modal');
        const btnOpen = document.getElementById('btn-db-check');
        const btnClose = document.getElementById('btn-close-db-check');
        const btnCloseX = document.getElementById('btn-close-db-check-x');
        const tabHor = document.getElementById('tab-db-check-hor');
        const tabVer = document.getElementById('tab-db-check-ver');
        const btnPrint = document.getElementById('btn-print-db-check');

        let currentOrientation = 'hor';
        let isManualOverride = false;
        let manualOverrideState = {
            vType: 'metalplast',
            orientation: 'hor',
            primaryConn: 'anschluss_horiz',
            cabSelection: 'all'
        };

        function renderDbCheckTable(orientation) {
            currentOrientation = orientation || currentOrientation || 'hor';
            const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (typeof window !== 'undefined' ? window.FBHV_DATABASE : null);
            if (!db) return;

            const horToVerMap = {
                'stramax_horiz': 'stramax_vert',
                'anschluss_horiz': 'anschluss_vert',
                'wmz_horiz': 'wmz_vert',
                'wmz_horiz_mp': 'wmz_vert_mp',
                'metalplast_wmz_horiz': 'wmz_vert_mp',
                'oventrop_hycocon_horiz': 'oventrop_hycocon_vert',
                'oventrop_cocon_horiz': 'oventrop_cocon_vert',
                'danfoss_horiz': 'danfoss_vert',
                'ta_compact_dp_horiz': 'ta_compact_dp_vert',
                'ta_compact_p_horiz': 'ta_compact_p_vert'
            };

            const verToHorMap = {
                'stramax_vert': 'stramax_horiz',
                'anschluss_vert': 'anschluss_horiz',
                'wmz_vert': 'wmz_horiz',
                'wmz_vert_mp': 'wmz_horiz_mp',
                'metalplast_wmz_vert': 'wmz_horiz_mp',
                'oventrop_hycocon_vert': 'oventrop_hycocon_horiz',
                'oventrop_cocon_vert': 'oventrop_cocon_horiz',
                'danfoss_vert': 'danfoss_horiz',
                'ta_compact_dp_vert': 'ta_compact_dp_horiz',
                'ta_compact_p_vert': 'ta_compact_p_horiz'
            };

            let vType, primaryConn, allowedCabs;

            if (isManualOverride) {
                manualOverrideState.orientation = currentOrientation;
                vType = manualOverrideState.vType;
                primaryConn = manualOverrideState.primaryConn;
                if (!manualOverrideState.cabSelection || manualOverrideState.cabSelection === 'all') {
                    allowedCabs = [];
                } else {
                    allowedCabs = [manualOverrideState.cabSelection];
                }
            } else {
                const distTypes = typeof getSelectedDistributorTypesFromUI === 'function' ? getSelectedDistributorTypesFromUI() : [];
                vType = distTypes.length > 0 ? distTypes[0] : 'metalplast';

                if (currentOrientation === 'hor') {
                    primaryConn = document.getElementById('vconfig-primary-connection-hor')?.value || 
                                  document.getElementById('vconfig-primary-connection')?.value || 
                                  'anschluss_horiz';
                    if (verToHorMap[primaryConn]) primaryConn = verToHorMap[primaryConn];
                } else {
                    primaryConn = document.getElementById('vconfig-primary-connection-ver')?.value || 
                                  document.getElementById('vconfig-primary-connection')?.value || 
                                  'anschluss_vert';
                    if (horToVerMap[primaryConn]) primaryConn = horToVerMap[primaryConn];
                }

                allowedCabs = typeof getSelectedCabinetTypesFromUI === 'function' ? getSelectedCabinetTypesFromUI() : [];

                const noWmzActive = !document.getElementById('cb-vconfig-wmz')?.checked;
                if (noWmzActive && db) {
                    const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === primaryConn) : null;
                    if (setObj && setObj.isWmz) {
                        primaryConn = (currentOrientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
                    }
                }

                // Sync initial manual state
                manualOverrideState.vType = vType;
                manualOverrideState.orientation = currentOrientation;
                manualOverrideState.primaryConn = primaryConn;
                manualOverrideState.cabSelection = (allowedCabs.length === 1) ? allowedCabs[0] : 'all';
            }

            const connSetObj = db.connectionSets.find(s => s.id === primaryConn);
            const connName = connSetObj ? connSetObj.name : primaryConn;
            const vTypeName = vType === 'stramax' ? 'Stramax Verteiler' : 'metalplast Verteiler';
            const cabListStr = (allowedCabs.length > 0) ? allowedCabs.map(c => db.cabinetModels[c]?.shortName || c).join(', ') : 'Alle Schrankmodelle';

            const summaryEl = document.getElementById('db-check-config-summary');
            if (summaryEl) {
                if (!isManualOverride) {
                    summaryEl.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-weight: bold; color: var(--primary-color, #0078d7);">⚙️ Grundlagen für diese Auto-Berechnung:</div>
                                <button type="button" class="btn-open-pdf-viewer" style="background: #ffffff; border: 1px solid #bae6fd; color: #0284c7; font-size: 0.8em; font-weight: bold; padding: 2px 8px; border-radius: 4px; cursor: pointer;" title="FBH_Verteilerkaesten.pdf anzeigen">
                                    📄 PDF-Grundlage öffnen
                                </button>
                            </div>
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em; color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 6px; border: 1px solid #bae6fd; font-weight: bold;" title="Aktivieren, um die Ausgangslage (Verteiler, Anschluss, Schrank) frei für Tests anzupassen">
                                <input type="checkbox" id="cb-db-check-override"> ✏️ Test-Parameter manuell anpassen
                            </label>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 6px;">
                            <div>• <strong>Verteiler-System:</strong> ${vTypeName}</div>
                            <div>• <strong>Bevorzugtes Anschluss-Set:</strong> ${connName}</div>
                            <div>• <strong>Zugewiesene Schränke:</strong> ${cabListStr}</div>
                        </div>
                    `;
                } else {
                    const connOptionsHtml = db.connectionSets.map(s => `
                        <option value="${s.id}" ${s.id === primaryConn ? 'selected' : ''}>${s.name}</option>
                    `).join('');

                    const cabKeys = Object.keys(db.cabinetModels);
                    const cabOptionsHtml = cabKeys.map(k => {
                        const cab = db.cabinetModels[k];
                        return `<option value="${k}" ${manualOverrideState.cabSelection === k ? 'selected' : ''}>${cab.shortName || cab.name}</option>`;
                    }).join('');

                    summaryEl.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <div style="font-weight: bold; color: #d35400; display: flex; align-items: center; gap: 6px;">
                                    ⚙️ <strong>Manuelle Test-Ausgangslage:</strong> <span style="font-weight: normal; font-size: 0.88em; color: #64748b;">(Beliebig anpassen – wirkt nur für dieses Fenster)</span>
                                </div>
                                <button type="button" class="btn-open-pdf-viewer" style="background: #ffffff; border: 1px solid #ffe0b2; color: #d35400; font-size: 0.8em; font-weight: bold; padding: 2px 8px; border-radius: 4px; cursor: pointer;" title="FBH_Verteilerkaesten.pdf anzeigen">
                                    📄 PDF-Grundlage öffnen
                                </button>
                            </div>
                            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85em; color: #d35400; background: #fff3e0; padding: 4px 10px; border-radius: 6px; border: 1px solid #ffe0b2; font-weight: bold;">
                                <input type="checkbox" id="cb-db-check-override" checked> ✏️ Test-Parameter aktiv (Manuell)
                            </label>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; background: #ffffff; padding: 10px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
                            <div>
                                <label style="display: block; font-weight: bold; font-size: 0.82em; margin-bottom: 3px; color: #475569;">Verteiler-System:</label>
                                <select id="db-check-ov-vtype" style="width: 100%; padding: 4px 8px; font-size: 0.88em; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; font-weight: bold; color: #0f172a;">
                                    <option value="metalplast" ${vType === 'metalplast' ? 'selected' : ''}>metalplast Verteiler (Inox)</option>
                                    <option value="stramax" ${vType === 'stramax' ? 'selected' : ''}>Stramax Verteiler (Messing)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: bold; font-size: 0.82em; margin-bottom: 3px; color: #475569;">Bevorzugtes Anschluss-Set:</label>
                                <select id="db-check-ov-conn" style="width: 100%; padding: 4px 8px; font-size: 0.88em; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; font-weight: bold; color: #0f172a;">
                                    ${connOptionsHtml}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: bold; font-size: 0.82em; margin-bottom: 3px; color: #475569;">Zugewiesene Schränke:</label>
                                <select id="db-check-ov-cab" style="width: 100%; padding: 4px 8px; font-size: 0.88em; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; font-weight: bold; color: #0f172a;">
                                    <option value="all" ${manualOverrideState.cabSelection === 'all' ? 'selected' : ''}>Alle Schrankmodelle</option>
                                    ${cabOptionsHtml}
                                </select>
                            </div>
                        </div>
                    `;
                }

                const cbOverride = document.getElementById('cb-db-check-override');
                if (cbOverride) {
                    cbOverride.addEventListener('change', (e) => {
                        isManualOverride = e.target.checked;
                        renderDbCheckTable(currentOrientation);
                    });
                }

                if (isManualOverride) {
                    const selVtype = document.getElementById('db-check-ov-vtype');
                    if (selVtype) {
                        selVtype.addEventListener('change', (e) => {
                            manualOverrideState.vType = e.target.value;
                            renderDbCheckTable(currentOrientation);
                        });
                    }

                    const selOrient = document.getElementById('db-check-ov-orient');
                    if (selOrient) {
                        selOrient.addEventListener('change', (e) => {
                            const newOrient = e.target.value;
                            if (newOrient === 'ver' && horToVerMap[manualOverrideState.primaryConn]) {
                                manualOverrideState.primaryConn = horToVerMap[manualOverrideState.primaryConn];
                            } else if (newOrient === 'hor' && verToHorMap[manualOverrideState.primaryConn]) {
                                manualOverrideState.primaryConn = verToHorMap[manualOverrideState.primaryConn];
                            }
                            currentOrientation = newOrient;
                            manualOverrideState.orientation = newOrient;
                            renderDbCheckTable(newOrient);
                        });
                    }

                    const selConn = document.getElementById('db-check-ov-conn');
                    if (selConn) {
                        selConn.addEventListener('change', (e) => {
                            manualOverrideState.primaryConn = e.target.value;
                            renderDbCheckTable(currentOrientation);
                        });
                    }

                    const selCab = document.getElementById('db-check-ov-cab');
                    if (selCab) {
                        selCab.addEventListener('change', (e) => {
                            manualOverrideState.cabSelection = e.target.value;
                            renderDbCheckTable(currentOrientation);
                        });
                    }
                }
            }

            if (tabHor && tabVer) {
                if (orientation === 'hor') {
                    tabHor.classList.add('active');
                    tabHor.style.borderColor = 'var(--primary-color, #0078d7)';
                    tabVer.classList.remove('active');
                    tabVer.style.borderColor = 'transparent';
                } else {
                    tabVer.classList.add('active');
                    tabVer.style.borderColor = 'var(--primary-color, #0078d7)';
                    tabHor.classList.remove('active');
                    tabHor.style.borderColor = 'transparent';
                }
            }

            let tableHtml = `
                <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 0.88em; text-align: left;">
                    <thead>
                        <tr style="background: var(--primary-color, #0078d7); color: #ffffff;">
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; width: 70px;">Ringe</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; width: 125px;">Index</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1;">Anschluss-Set</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; width: 110px;">Verteiler L [mm]</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1;">Empfohlener Verteilerkasten</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; width: 160px;">Maße (B × H × T) [mm]</th>
                            <th style="padding: 8px 10px; border: 1px solid #cbd5e1; width: 100px;">Art. Nr.</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (let rings = 2; rings <= 12; rings++) {
                const rec = db.getRecommendation(vType, primaryConn, rings, allowedCabs);
                const cab = (rec && rec.matchingCabinets && rec.matchingCabinets.length > 0) ? rec.matchingCabinets[0] : (rec ? rec.primaryCabinet : null);

                if (rec && cab) {
                    const bgStyle = (rings % 2 === 0) ? 'background: var(--zebra-even, #f8fafc);' : 'background: #ffffff;';

                    tableHtml += `
                        <tr style="${bgStyle}">
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; color: var(--primary-color, #0078d7);">${rings} Ringe</td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; text-align: center;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; white-space: nowrap;">Index ${rec.requiredIndex}</span></td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${rec.connectionSetName}</td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${rec.manifoldLength} mm</td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${cab.name}</td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0f172a;">${cab.width} × ${cab.height} × ${cab.depth} mm</td>
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #475569;">${cab.articleNo || '-'}</td>
                        </tr>
                    `;
                } else {
                    tableHtml += `
                        <tr style="background: #fef2f2;">
                            <td style="padding: 4px 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; color: #dc2626;">${rings} Ringe</td>
                            <td colspan="6" style="padding: 4px 10px; border: 1px solid #cbd5e1; color: #dc2626; font-style: italic;">Keine passende Kasten-Kombination gefunden</td>
                        </tr>
                    `;
                }
            }

            tableHtml += `</tbody></table>`;

            const container = document.getElementById('db-check-table-container');
            if (container) container.innerHTML = tableHtml;
        }

        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                if (document.body.classList.contains('menu-edit-mode')) return;
                e.preventDefault();
                renderDbCheckTable('hor');
                if (modal) modal.classList.remove('hidden');
            });
        }

        const closeModal = () => {
            if (modal) modal.classList.add('hidden');
        };

        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCloseX) btnCloseX.addEventListener('click', closeModal);

        if (tabHor) tabHor.addEventListener('click', () => renderDbCheckTable('hor'));
        if (tabVer) tabVer.addEventListener('click', () => renderDbCheckTable('ver'));

        function cycleConnectionSet(isPrevious = false) {
            isManualOverride = true;
            if (!FBHV_DATABASE || !FBHV_DATABASE.connectionSets) return;

            const availableSets = FBHV_DATABASE.connectionSets;
            if (availableSets.length === 0) return;

            let currentIndex = availableSets.findIndex(s => s.id === manualOverrideState.primaryConn);
            if (currentIndex < 0) currentIndex = 0;

            let nextIndex;
            if (isPrevious) {
                // Shift + Klick => Vorheriges Set (nach oben)
                nextIndex = (currentIndex - 1 + availableSets.length) % availableSets.length;
            } else {
                // Klick / Strg + Klick => Nächstes Set (nach unten)
                nextIndex = (currentIndex + 1) % availableSets.length;
            }

            const nextSet = availableSets[nextIndex];
            if (nextSet) {
                manualOverrideState.primaryConn = nextSet.id;
                renderDbCheckTable(currentOrientation);
            }
        }

        // Schnellwechsel per Strg/Shift Klick oder Doppelklick in der Tabelle
        if (modal) {
            modal.addEventListener('mousedown', (e) => {
                if (['BUTTON', 'A', 'INPUT'].includes(e.target.tagName)) return;

                // Nur bei gedrückter Strg- oder Shift-Taste das native Dropdown abfangen
                if (e.ctrlKey || e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isPrevious = e.shiftKey && !e.ctrlKey;
                    cycleConnectionSet(isPrevious);
                }
            });

            modal.addEventListener('dblclick', (e) => {
                if (['BUTTON', 'A', 'INPUT'].includes(e.target.tagName)) return;

                e.preventDefault();
                e.stopPropagation();

                if (e.target.id === 'db-check-ov-vtype') {
                    isManualOverride = true;
                    manualOverrideState.vType = (manualOverrideState.vType === 'stramax') ? 'metalplast' : 'stramax';
                    renderDbCheckTable(currentOrientation);
                    return;
                }

                const isPrevious = e.shiftKey && !e.ctrlKey;
                cycleConnectionSet(isPrevious);
            });
        }

        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                const container = document.getElementById('db-check-table-container');
                const summary = document.getElementById('db-check-config-summary');
                if (!container) return;

                const printWin = window.open('', '_blank', 'width=950,height=750');
                if (printWin) {
                    printWin.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>FBH Materialplaner - Datenbank & Auslegungs-Check (2 bis 12 Ringe)</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
                                h2 { color: #0078d7; margin-top: 0; }
                                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                                th, td { border: 1px solid #cbd5e1; padding: 8px; }
                                th { background: #0078d7; color: #fff; text-align: left; }
                                .summary-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; font-size: 13px; }
                            </style>
                        </head>
                        <body>
                            <h2>🔍 FBH Materialplaner - Datenbank-Auslegungs-Check (2 bis 12 Ringe)</h2>
                            <div class="summary-box">\${summary ? summary.innerHTML : ''}</div>
                            \${container.innerHTML}
                            <script>window.print();<\/script>
                        </body>
                        </html>
                    `);
                    printWin.document.close();
                }
            });
        }
    }

    initDatabaseCheckManager();

    if (btnKdetailsClose) {
        btnKdetailsClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeKastenDetailsModal();
        });
    }
    if (btnKdetailsCloseX) {
        btnKdetailsCloseX.addEventListener('click', (e) => {
            e.preventDefault();
            closeKastenDetailsModal();
        });
    }

    function calculateGlobalSum() {
        const floorBodies = document.querySelectorAll('tbody.floor-group');
        floorBodies.forEach(fb => {
            updateFloorKastenDisplay(fb);
        });

        const projectData = getCurrentProjectData();
        const db = (typeof FBHV_DATABASE !== 'undefined') ? FBHV_DATABASE : (window.FBHV_DATABASE || null);
        
        let totalArea = 0;
        let totalPipe = 0;
        let totalAntriebeGlobal = 0;
        let totalThermostateGlobal = 0;
        let totalFugenGlobal = 0;
        
        const bomVerteiler = {};
        const bomErweiterungen = {};
        const bomKaesten = {};
        const bomAnschlussSets = {};

        const distTypesGlobal = getSelectedDistributorTypesFromUI();
        const vTypeGlobal = distTypesGlobal.length > 0 ? distTypesGlobal[0] : 'metalplast';
        const noWmzActive = !document.getElementById('cb-vconfig-wmz')?.checked;
        
        const horToVerMap = {
            'stramax_horiz': 'stramax_vert',
            'anschluss_horiz': 'anschluss_vert',
            'wmz_horiz': 'wmz_vert',
            'metalplast_wmz_horiz': 'metalplast_wmz_vert',
            'oventrop_hycocon_horiz': 'oventrop_hycocon_vert',
            'oventrop_cocon_horiz': 'oventrop_cocon_vert',
            'danfoss_horiz': 'danfoss_vert'
        };
        const verToHorMap = {
            'stramax_vert': 'stramax_horiz',
            'anschluss_vert': 'anschluss_horiz',
            'wmz_vert': 'wmz_horiz',
            'metalplast_wmz_vert': 'metalplast_wmz_horiz',
            'oventrop_hycocon_vert': 'oventrop_hycocon_horiz',
            'oventrop_cocon_vert': 'oventrop_cocon_horiz',
            'danfoss_vert': 'danfoss_horiz'
        };

        projectData.floors.forEach(floor => {
            let floorRings = 0;
            let floorThermostats = 0;
            let floorAntriebe = 0;
            let floorAreaRz = 0;
            let floorAreaIz = 0;
            let floorFugen = 0;
            let floorDist = 0;
            let floorPipe = 0;
            
            if (floor.rooms) {
                floor.rooms.forEach(room => {
                    const areaRz = parseFloat(room.areaRz) || 0;
                    const areaIz = parseFloat(room.areaIz) || 0;
                    const pipeSum = parseFloat(room.totalPipe) || 0;
                    const rings = parseInt(room.rings) || 0;
                    
                    totalArea += areaRz + areaIz;
                    totalPipe += pipeSum;
                    floorRings += rings;
                    
                    floorAreaRz += areaRz;
                    floorAreaIz += areaIz;
                    const fugen = parseInt(room.fugen) || 0;
                    floorFugen += fugen;
                    totalFugenGlobal += fugen;
                    
                    const dist = parseFloat(room.dist) || 0;
                    floorDist += dist;
                    floorPipe += pipeSum;
                    
                    if (room.antrieb) {
                        const antriebCount = room.isCombined ? 1 : Math.max(1, rings);
                        totalAntriebeGlobal += antriebCount;
                        floorAntriebe += antriebCount;
                    }
                    if (room.thermostat) {
                        totalThermostateGlobal++;
                        floorThermostats++;
                    }
                });
            }
            
            let connToUse = floor.selectedConnKey || 'auto';
            if (connToUse === 'auto') {
                const orientation = floor.connOrientation || 'hor';
                let primaryConn = (orientation === 'hor') 
                    ? (document.getElementById('vconfig-primary-connection-hor')?.value || 'anschluss_horiz')
                    : (document.getElementById('vconfig-primary-connection-ver')?.value || 'anschluss_vert');
                    
                if (orientation === 'ver' && horToVerMap[primaryConn]) {
                    connToUse = horToVerMap[primaryConn];
                } else if (orientation === 'hor' && verToHorMap[primaryConn]) {
                    connToUse = verToHorMap[primaryConn];
                } else {
                    connToUse = primaryConn;
                }
                
                if (noWmzActive && db) {
                    const setObj = db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
                    if (setObj && setObj.isWmz) {
                        connToUse = (orientation === 'ver') ? 'anschluss_vert' : 'anschluss_horiz';
                    }
                }
            }
            
            const kastenKey = floor.selectedKastenKey || 'auto';
            const allowedCabs = (kastenKey && kastenKey !== 'auto') ? [kastenKey] : getSelectedCabinetTypesFromUI();
            const rec = db ? db.getRecommendation(vTypeGlobal, connToUse, floorRings > 0 ? floorRings : 2, allowedCabs) : null;
            
            const setObj = db && db.connectionSets ? db.connectionSets.find(s => s.id === connToUse) : null;
            const connName = rec ? rec.connectionSetName : (setObj ? setObj.name : 'Anschluss-Set horizontal');
            
            let cabObj = null;
            let reqIndex = '-';
            if (rec && rec.matchingCabinets && rec.matchingCabinets.length > 0) {
                cabObj = rec.matchingCabinets[0];
                reqIndex = rec.requiredIndex;
            }
            
            if (floorRings > 0) {
                const vTypeName = (vTypeGlobal === 'stramax') ? 'Stramax Messing-Verteiler 1"' : 'metalplast Inox-Verteiler 1"';
                if (floorRings <= 12) {
                    const vKey = `${vTypeName} ${floorRings}-fach`;
                    if (!bomVerteiler[vKey]) {
                        bomVerteiler[vKey] = { name: vKey, count: 0, rings: floorRings, vType: vTypeGlobal };
                    }
                    bomVerteiler[vKey].count++;
                } else {
                    const vKeyBase = `${vTypeName} 12-fach`;
                    if (!bomVerteiler[vKeyBase]) {
                        bomVerteiler[vKeyBase] = { name: vKeyBase, count: 0, rings: 12, vType: vTypeGlobal };
                    }
                    bomVerteiler[vKeyBase].count++;
                    
                    const extraRings = floorRings - 12;
                    const extraKey = `Verteiler-Erweiterung 1-fach (${vTypeGlobal === 'stramax' ? 'Messing' : 'Edelstahl Inox'})`;
                    if (!bomErweiterungen[extraKey]) {
                        bomErweiterungen[extraKey] = { name: extraKey, count: 0, vType: vTypeGlobal };
                    }
                    bomErweiterungen[extraKey].count += extraRings;
                }
            }
            
            if (cabObj) {
                const cabKey = `${cabObj.name} (Index ${reqIndex}, B: ${cabObj.width}mm, Art. ${cabObj.articleNo})`;
                if (!bomKaesten[cabKey]) {
                    bomKaesten[cabKey] = {
                        name: cabObj.name,
                        shortName: cabObj.shortName,
                        index: reqIndex,
                        width: cabObj.width,
                        articleNo: cabObj.articleNo,
                        count: 0
                    };
                }
                bomKaesten[cabKey].count++;
            }
            
            if (connName) {
                const artStr = (setObj && setObj.articles && setObj.articles.length > 0) ? setObj.articles.join('/') : '';
                const connKey = `${connName}${artStr ? ' (' + artStr + ')' : ''}`;
                if (!bomAnschlussSets[connKey]) {
                    bomAnschlussSets[connKey] = { name: connName, articles: artStr, count: 0 };
                }
                bomAnschlussSets[connKey].count++;
            }
        });

        const schieneFactor = inputSettingSchiene ? parseFloat(inputSettingSchiene.value) : 1.0;
        const klipsDistM = inputSettingKlips ? parseFloat(inputSettingKlips.value) : 0.5;

        const totalSchiene = totalArea * schieneFactor;
        
        let totalKlips = 0;
        if (klipsDistM > 0) {
            totalKlips = Math.ceil(totalPipe / klipsDistM);
        }

        const sumFugenSpan = document.getElementById('sum-fugen');

        if (sumAreaSpan) sumAreaSpan.textContent = totalArea.toFixed(2);
        if (sumPipeSpan) sumPipeSpan.textContent = totalPipe.toFixed(2);
        if (sumSchieneSpan) sumSchieneSpan.textContent = totalSchiene.toFixed(2);
        if (sumKlipsSpan) sumKlipsSpan.textContent = totalKlips;
        if (sumFugenSpan) sumFugenSpan.textContent = totalFugenGlobal;
        if (sumAntriebeSpan) sumAntriebeSpan.textContent = totalAntriebeGlobal;
        if (sumThermostateSpan) sumThermostateSpan.textContent = totalThermostateGlobal;

        if (rapportVerteilerUl) {
            rapportVerteilerUl.innerHTML = '';
            let hasItems = false;
            
            // Verteiler
            Object.values(bomVerteiler).forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                li.innerHTML = `<strong>${item.count}x</strong> ${item.name}`;
                rapportVerteilerUl.appendChild(li);
                hasItems = true;
            });

            // Erweiterungen
            Object.values(bomErweiterungen).forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                li.innerHTML = `<strong style="color:#d35400;">${item.count}x</strong> <span style="color:#d35400;">${item.name}</span>`;
                rapportVerteilerUl.appendChild(li);
                hasItems = true;
            });

            // Kästen
            Object.values(bomKaesten).forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                li.innerHTML = `<strong>${item.count}x</strong> 📦 ${item.name} <span style="color:#0284c7; font-size:0.85em; display:block; padding-left:16px;">Index <strong>${item.index}</strong> (B: ${item.width}mm${item.articleNo ? ' | Art. ' + item.articleNo : ''})</span>`;
                rapportVerteilerUl.appendChild(li);
                hasItems = true;
            });

            // Anschluss-Sets
            Object.values(bomAnschlussSets).forEach(item => {
                const li = document.createElement('li');
                li.style.marginBottom = "8px";
                li.innerHTML = `<strong>${item.count}x</strong> 🔌 ${item.name} ${item.articles ? '<span style="color:#64748b; font-size:0.85em;">(Art. ' + item.articles + ')</span>' : ''}`;
                rapportVerteilerUl.appendChild(li);
                hasItems = true;
            });

            if (!hasItems) {
                rapportVerteilerUl.innerHTML = '<li><em style="color:#999;">Keine Verteiler angelegt</em></li>';
            }
        }
        
        if (typeof renderVerteilerOverviewList === 'function') {
            renderVerteilerOverviewList();
        }
    }

    // --- Load Data Logic ---
    function loadData(data) {
        isLoading = true;
        document.getElementById('objekt-bez').value = data.objektBez || "";
        updateActiveProjectFileDisplay();
        cadRoomPool = Array.isArray(data.cadPool) ? data.cadPool : [];
        if (typeof renderCadPoolList === 'function') renderCadPoolList();

        if (data.columnWidths && typeof window.applyColumnWidths === 'function') {
            const stored = localStorage.getItem('fbhColumnWidths');
            if (!stored || data._isExplicitFileImport) {
                window.saveStoredColumnWidths(data.columnWidths);
                window.applyColumnWidths(data.columnWidths);
            }
        }

        if (data.toolbarLayout) {
            localStorage.setItem('fbhToolbarLayout', JSON.stringify(data.toolbarLayout));
            if (typeof restoreToolbarLayout === 'function') {
                restoreToolbarLayout(data.toolbarLayout);
            }
        }
        
        if (data.settings) {
            if (inputSettingSchiene && data.settings.schieneFactor !== undefined) inputSettingSchiene.value = data.settings.schieneFactor;
            if (inputSettingKlips && data.settings.klipsDist !== undefined) {
                let dist = data.settings.klipsDist;
                // Migriere alte Speicherwerte (z.B. 50 cm) automatisch in Meter (0.5 m)
                if (dist >= 5) dist = dist / 100;
                inputSettingKlips.value = dist;
            }
            if (inputSettingTarget && data.settings.targetLen !== undefined) inputSettingTarget.value = data.settings.targetLen;
            if (inputSettingMaxOver && data.settings.maxOver !== undefined) inputSettingMaxOver.value = data.settings.maxOver;
            if (inputSettingDist && data.settings.defaultDist !== undefined) inputSettingDist.value = data.settings.defaultDist;
            if (Array.isArray(data.settings.allowedDistributorTypes)) {
                document.querySelectorAll('.cb-vconfig-dtype').forEach(cb => {
                    cb.checked = data.settings.allowedDistributorTypes.includes(cb.value);
                });
            }
            if (Array.isArray(data.settings.allowedCabinets)) {
                document.querySelectorAll('.cb-vconfig-cabinet, .cb-cabinet-type').forEach(cb => {
                    cb.checked = data.settings.allowedCabinets.includes(cb.value);
                });
            }
            if (Array.isArray(data.settings.allowedConnections)) {
                document.querySelectorAll('.cb-vconfig-conn').forEach(cb => {
                    cb.checked = data.settings.allowedConnections.includes(cb.value);
                });
            }
            if (data.settings.primaryConnectionHor) {
                const selHor = document.getElementById('vconfig-primary-connection-hor');
                if (selHor) selHor.value = data.settings.primaryConnectionHor;
            }
            if (data.settings.primaryConnectionVer) {
                const selVer = document.getElementById('vconfig-primary-connection-ver');
                if (selVer) selVer.value = data.settings.primaryConnectionVer;
            }
            if (data.settings.primaryConnection || data.settings.connectionType) {
                const connVal = data.settings.primaryConnection || data.settings.connectionType;
                const selHor = document.getElementById('vconfig-primary-connection-hor');
                if (selHor && !data.settings.primaryConnectionHor) selHor.value = connVal;
                if (settingConnectionType) settingConnectionType.value = connVal;
            }
            if (cbVconfigWmz) {
                cbVconfigWmz.checked = !!data.settings.withWmz;
            }
            if (typeof updateWmzConnectionState === 'function') {
                updateWmzConnectionState();
            }
        }

        const existingFloors = document.querySelectorAll('tbody.floor-group');
        existingFloors.forEach(f => f.remove());
        floorCounter = 0;

        if (data.floors && data.floors.length > 0) {
            data.floors.forEach(floorData => {
                floorCounter++;
                const fb = addNewFloor(floorCounter); 
                fb.querySelector('.input-fbhv-name').value = floorData.bezFbhv || "";
                fb.querySelector('.input-floor-name').value = floorData.ebene || "";
                const posInput = fb.querySelector('.input-pos-nr');
                if (posInput) {
                    if (floorData.isCustomPosNr) {
                        posInput.value = floorData.posNr !== undefined ? floorData.posNr : "";
                        posInput.dataset.isCustom = 'true';
                        posInput.classList.remove('is-auto');
                        posInput.classList.add('is-custom');
                        posInput.style.color = '#000000';
                    } else {
                        delete posInput.dataset.isCustom;
                    }
                }
                
                const cbHor = fb.querySelector('.cb-floor-hor');
                const cbVer = fb.querySelector('.cb-floor-ver');
                const selConn = fb.querySelector('.select-floor-conn');
                const selKasten = fb.querySelector('.select-floor-kasten');

                const orientation = floorData.connOrientation || 'hor';
                if (cbHor && cbVer) {
                    cbHor.checked = (orientation === 'hor');
                    cbVer.checked = (orientation === 'ver');
                }
                if (selConn && floorData.selectedConnKey) {
                    selConn.value = floorData.selectedConnKey;
                }
                if (selKasten && floorData.selectedKastenKey) {
                    selKasten.value = floorData.selectedKastenKey;
                }
                if (floorData.rzActive !== undefined) {
                    const btnRz = fb.querySelector('.btn-toggle-rz');
                    if (btnRz) {
                        btnRz.classList.toggle('active', !!floorData.rzActive);
                        updateRzInputsState(fb, !!floorData.rzActive);
                    }
                }
                
                if (floorData.rooms) {
                    floorData.rooms.forEach(roomData => {
                        const tr = addRoomToFloor(fb); 
                        tr.dataset.cadId = roomData.cadId || "";
                        const inputName = tr.querySelector('.input-room-name');
                        if (inputName) {
                            inputName.value = roomData.name || "";
                            if (roomData.cadId) {
                                inputName.readOnly = true;
                            }
                        }
                        tr.querySelector('.input-va-rz').value = roomData.vaRz || 10;
                        tr.querySelector('.input-area').value = roomData.areaRz || 0;
                        tr.querySelector('.input-va-iz').value = roomData.vaIz || 20;
                        tr.querySelector('.input-area-iz').value = roomData.areaIz || 0;
                        tr.querySelector('.input-check-thermostat').checked = roomData.thermostat !== false;
                        tr.querySelector('.input-check-antrieb').checked = roomData.antrieb !== false;
                        tr.querySelector('.input-check-iz').checked = roomData.isCombined || false;
                        tr.querySelector('.input-target').value = roomData.targetLen || 100;
                        tr.querySelector('.input-fugen').value = roomData.fugen || 0;
                        tr.querySelector('.input-dist').value = roomData.dist || 10;
                        
                        calculateRow(tr);
                    });
                }
            });
        }
        updateAllPosNumbers();
        calculateGlobalSum();
        if (typeof applyMainTableFilters === 'function') {
            applyMainTableFilters();
        }
        isLoading = false;
    }

    // Initialize
    const savedData = localStorage.getItem('fbhData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            loadData(data);
        } catch (e) {
            console.error("Laden fehlgeschlagen", e);
            createDefaultFloorAndRooms();
        }
    } else {
        if (window.location.search.includes('autotest=true')) {
            cadRoomPool = [
                { id: 'test_1', name: 'EG_Raum_101_Wohnen_', area: 24.50, assignedFloor: null },
                { id: 'test_2', name: 'EG_Raum_102_Kueche_', area: 12.30, assignedFloor: null },
                { id: 'test_3', name: 'EG_Raum_103_Bad_', area: 8.90, assignedFloor: null }
            ];
            setTimeout(() => {
                openCadPoolModal();
            }, 100);
        } else {
            createDefaultFloorAndRooms();
        }
    }

    function createDefaultFloorAndRooms() {
        if (floorCounter === 0) {
            floorCounter++;
            const fb = addNewFloor(floorCounter);
            const floorNameInput = fb.querySelector('.input-floor-name');
            if (floorNameInput) {
                floorNameInput.value = "EG";
            }
            addRoomToFloor(fb);
            calculateGlobalSum();
            if (!isLoading) debouncedSave();
        }
    }

    // --- Key Navigation & Blockers ---
    function isCaretAtStart(input) {
        if (input.type === 'number' || input.type === 'checkbox' || input.tagName === 'SELECT') return true;
        try {
            return input.selectionStart === 0 && input.selectionEnd === 0;
        } catch (e) {
            return true;
        }
    }

    function isCaretAtEnd(input) {
        if (input.type === 'number' || input.type === 'checkbox' || input.tagName === 'SELECT') return true;
        try {
            return input.selectionStart === input.value.length;
        } catch (e) {
            return true;
        }
    }

    function getVisibleInputs() {
        return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([readonly]):not([disabled]):not(#file-input), select'))
                    .filter(el => el.offsetParent !== null);
    }

    function findVerticalTarget(sourceInput, targetRow) {
        const targetInputs = Array.from(targetRow.querySelectorAll('input:not([type="hidden"]):not([readonly]):not([disabled]):not(#file-input), select'));
        if (targetInputs.length === 0) return null;

        const sourceRow = sourceInput.closest('tr');
        
        // Match by column td index if both are room rows
        if (sourceRow && sourceRow.classList.contains('room-row') && targetRow.classList.contains('room-row')) {
            const sourceTd = sourceInput.closest('td');
            if (sourceTd) {
                const colIndex = Array.from(sourceTd.parentNode.children).indexOf(sourceTd);
                const targetTd = targetRow.children[colIndex];
                if (targetTd) {
                    const targetInput = targetTd.querySelector('input:not([type="hidden"]):not([readonly]):not([disabled]), select');
                    if (targetInput) return targetInput;
                }
            }
        }

        // Fallback: position-based vertical target
        const sourceRect = sourceInput.getBoundingClientRect();
        const sourceCenterX = sourceRect.left + sourceRect.width / 2;

        let bestInput = null;
        let minDistance = Infinity;

        for (const input of targetInputs) {
            const rect = input.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const distance = Math.abs(centerX - sourceCenterX);
            if (distance < minDistance) {
                minDistance = distance;
                bestInput = input;
            }
        }

        return bestInput;
    }

    document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'SELECT')) return;

        // Prevent browser from changing values in number inputs on ArrowUp/ArrowDown
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && activeElement.type === 'number') {
            e.preventDefault();
        }

        // 1. Arrow Left
        if (e.key === 'ArrowLeft') {
            if (isCaretAtStart(activeElement)) {
                const inputs = getVisibleInputs();
                const idx = inputs.indexOf(activeElement);
                if (idx > 0) {
                    e.preventDefault();
                    const prevInput = inputs[idx - 1];
                    prevInput.focus();
                    if (prevInput.tagName === 'INPUT' && (prevInput.type === 'text' || prevInput.type === 'number')) {
                        prevInput.select();
                    }
                }
            }
        }
        // 2. Arrow Right
        else if (e.key === 'ArrowRight') {
            if (isCaretAtEnd(activeElement)) {
                const inputs = getVisibleInputs();
                const idx = inputs.indexOf(activeElement);
                if (idx > -1 && idx < inputs.length - 1) {
                    e.preventDefault();
                    const nextInput = inputs[idx + 1];
                    nextInput.focus();
                    if (nextInput.tagName === 'INPUT' && (nextInput.type === 'text' || nextInput.type === 'number')) {
                        nextInput.select();
                    }
                }
            }
        }
        // 3. Arrow Up
        else if (e.key === 'ArrowUp') {
            const currentRow = activeElement.closest('tr');
            if (currentRow) {
                const rows = Array.from(document.querySelectorAll('tr')).filter(r => r.offsetParent !== null);
                const rowIndex = rows.indexOf(currentRow);
                for (let i = rowIndex - 1; i >= 0; i--) {
                    const prevRow = rows[i];
                    const targetInput = findVerticalTarget(activeElement, prevRow);
                    if (targetInput) {
                        e.preventDefault();
                        targetInput.focus();
                        if (targetInput.tagName === 'INPUT' && (targetInput.type === 'text' || targetInput.type === 'number')) {
                            targetInput.select();
                        }
                        break;
                    }
                }
            }
        }
        // 4. Arrow Down
        else if (e.key === 'ArrowDown') {
            const currentRow = activeElement.closest('tr');
            if (currentRow) {
                const rows = Array.from(document.querySelectorAll('tr')).filter(r => r.offsetParent !== null);
                const rowIndex = rows.indexOf(currentRow);
                for (let i = rowIndex + 1; i < rows.length; i++) {
                    const nextRow = rows[i];
                    const targetInput = findVerticalTarget(activeElement, nextRow);
                    if (targetInput) {
                        e.preventDefault();
                        targetInput.focus();
                        if (targetInput.tagName === 'INPUT' && (targetInput.type === 'text' || targetInput.type === 'number')) {
                            targetInput.select();
                        }
                        break;
                    }
                }
            }
        }
        // 5. Enter Key
        else if (e.key === 'Enter') {
            e.preventDefault();
            // Sonderfall: Last input of the room -> Add new room automatically
            if (activeElement.classList.contains('input-dist')) {
                const currentRow = activeElement.closest('tr');
                const nextRow = currentRow.nextElementSibling;
                if (!nextRow || !nextRow.classList.contains('room-row')) {
                    const floorBody = activeElement.closest('.floor-group');
                    const btnAddRoom = floorBody.querySelector('.btn-add-room');
                    if (btnAddRoom) {
                        btnAddRoom.click();
                        const newRow = floorBody.querySelector('tr.room-row:last-child');
                        if (newRow) {
                            const firstInput = newRow.querySelector('.input-room-name');
                            if (firstInput) {
                                firstInput.focus();
                                firstInput.select();
                            }
                        }
                        return;
                    }
                }
            }
            
            const inputs = getVisibleInputs();
            const index = inputs.indexOf(activeElement);
            if (index > -1 && index < inputs.length - 1) {
                const nextInput = inputs[index + 1];
                nextInput.focus();
                if (nextInput.tagName === 'INPUT' && (nextInput.type === 'text' || nextInput.type === 'number')) {
                    nextInput.select();
                }
            }
        }
    });

    // --- Auto-Select on Focus ---
    // Inhalt automatisch markieren, wenn ein Feld per Maus oder Tab fokussiert wird
    document.addEventListener('focusin', (e) => {
        if (e.target && e.target.tagName === 'INPUT' && (e.target.type === 'text' || e.target.type === 'number')) {
            e.target.select();
        }
    });

    // --- Custom Tooltip System ---
    const tooltipEl = document.getElementById('custom-tooltip');
    let activeTooltipTarget = null;
    let tooltipTimeout = null;

    // Immediately hide tooltips if disabled via checkbox
    const toggleEl = document.getElementById('toggle-tooltips');
    const toggleTextEl = document.getElementById('toggle-tooltips-text');
    if (toggleEl && toggleTextEl) {
        toggleEl.addEventListener('change', () => {
            toggleTextEl.textContent = toggleEl.checked ? "💡 Info on" : "💡 Info off";
            if (!toggleEl.checked) {
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                activeTooltipTarget = null;
                hideTooltip();
            }
        });
    }

    const tooltipDescriptions = {
        // ID & Global elements
        'objekt-bez': "<strong>Objektbezeichnung:</strong> Der Name, die Projektnummer oder die Adresse des Bauprojekts / Gebäudes.",
        'setting-schiene-factor': "<strong>Schiene pro m²:</strong> Faktor für die benötigte Menge an Verlegeschienen in Laufmetern (lfm) pro Quadratmeter.",
        'setting-klips-dist': "<strong>Klips-Abstand:</strong> Der Abstand der Befestigungsklips pro Meter Rohr (z. B. 0.5 m).",
        'setting-target-len': "<strong>Ziel-Ringlänge:</strong> Die standardmäßig gewünschte Ziel-Rohrlänge pro Heizkreis.",
        'setting-max-over': "<strong>Max. Überschreitung:</strong> Maximale zulässige Überschreitung der Ziel-Ringlänge (z. B. 10m), bevor aufgeteilt wird.",
        'setting-dist': "<strong>Standard-Anbindung:</strong> Die standardmäßig gewünschte Länge der Anbindungsleitung pro Heizkreis.",
        'btn-settings': "<strong>Parameter:</strong> Material-Parameter und Faktoren für die Berechnung anpassen.",
        'btn-design': "<strong>Design:</strong> Farbdesign der Benutzeroberfläche wechseln (z. B. Hell, Dunkel, Blau, etc.).",
        'btn-print-report': "<strong>Drucken:</strong> Öffnet den Druckdialog des Browsers zur Erstellung eines übersichtlichen PDFs oder zum Ausdrucken.",
        'btn-export-file': "<strong>Projekt speichern:</strong> Exportiert die aktuellen Eingaben als .json-Datei auf Ihren Computer.",
        'btn-import-file': "<strong>Projekt laden:</strong> Importiert ein zuvor gespeichertes Projekt aus einer .json-Datei.",
        'btn-clear-cache': "<strong>Neues Projekt:</strong> Löscht alle aktuellen Daten und startet ein leeres Projekt.",

        // Dynamic buttons & classes
        'btn-add-floor-main': "<strong>Vert+ (Verteiler hinzufügen):</strong> Fügt eine neue Ebene bzw. einen neuen Verteiler unterhalb des ausgewählten Verteilers hinzu.",
        'btn-copy-floor-main': "<strong>Copy V. (Verteiler kopieren):</strong> Öffnet den Kopier-Dialog für den aktuell aktivierten Verteiler (📍 AKTIV).",
        'btn-add-room-main': "<strong>Raum+ (Raum hinzufügen):</strong> Fügt dem aktuell aktivierten Verteiler (📍 AKTIV) einen neuen Raum hinzu.",
        'btn-add-floor-inline': "<strong>Vert+ (Ebene hinzufügen):</strong> Fügt eine komplett neue Ebene bzw. ein neues Geschoss mit eigenem Verteiler hinzu.",
        'btn-copy-floor-inline': "<strong>Copy V. (Verteiler duplizieren):</strong> Öffnet den Kopier-Dialog für diesen Verteiler.",
        'btn-add-room': "<strong>Raum+ (Raum hinzufügen):</strong> Fügt dem aktuellen Geschoss einen neuen Raum als Tabellenzeile hinzu.",
        'btn-toggle-floor': "<strong>Ein-/Ausklappen:</strong> Blendet die Räume dieses Geschosses ein oder aus.",
        'btn-toggle-rz': "<strong>RZ (Randzone):</strong> Randzonen-Eingaben für dieses Geschoss aktivieren/deaktivieren. Bei gedrückter Strg-Taste auf alle Verteiler übertragbar.",
        'btn-delete-floor': "<strong>Geschoss löschen:</strong> Entfernt dieses Geschoss inklusive aller Räume unwiderruflich.",
        'btn-delete-room': "<strong>Raum löschen:</strong> Entfernt diesen Raum aus dem aktuellen Geschoss.",

        // Input classes
        'input-room-name': "<strong>Raumbezeichnung:</strong> Der Name des Raumes (z. B. Wohnzimmer, Bad, Küche).",
        'input-va-rz': "<strong>VA Randzone:</strong> Verlegeabstand in der Randzone (cm). Engere Verlegung für Bereiche mit höherem Wärmebedarf.",
        'input-area': "<strong>Fläche Randzone:</strong> Die Fläche der Randzone in Quadratmetern (m²).",
        'input-va-iz': "<strong>VA Innenzone:</strong> Verlegeabstand in der Innenzone (cm). Regulärer Abstand im normalen Raumbereich.",
        'input-area-iz': "<strong>Fläche Innenzone:</strong> Die Fläche der Innenzone in Quadratmetern (m²).",
        'input-check-thermostat': "<strong>Raumthermostat:</strong> Einzelraumregelung für diesen Raum. Zählt als 1x Raumthermostat.",
        'input-check-antrieb': "<strong>Antrieb:</strong> Stellantrieb für diesen Raum. Zählt standardmäßig einen Stellantrieb pro Heizkreis (bei Rz+Iz-Kombination nur 1 Stellantrieb pro Raum).",
        'input-check-iz': "<strong>Rz+Iz (Kombinieren):</strong> Verbindet Rand- und Innenzone an denselben Heizkreis. Deaktiviert bedeutet getrennte Heizkreise.",
        'input-target': "<strong>Ziel Ringlänge:</strong> Maximale Rohrlänge pro Heizkreis (z. B. 100m oder 120m), um Druckverluste gering zu halten.",
        'input-fugen': "<strong>Dehnungsfugen:</strong> Anzahl der Dehnungsfugen im Estrich, die von den Rohren gekreuzt werden.",
        'input-dist': "<strong>Distanz zum FBHV:</strong> Einfache Entfernung vom Raum zum Verteiler. Zuleitung (Vor-/Rücklauf) wird verdoppelt.",
        'input-sum': "<strong>Gesamtlänge:</strong> Die berechnete Gesamtrohrlänge für diesen Raum (Flächenrohre + Anbindungsrohre).",
        'input-rings': "<strong>Heizkreise:</strong> Anzahl der berechneten Heizkreise (Ringe) für diesen Raum.",
        'input-floor-name': "<strong>Ebene/Geschoss:</strong> Bezeichnung der aktuellen Ebene (z. B. EG, OG, Keller).",

        // Summary items
        'sum-area': "<strong>Gesamtfläche:</strong> Die addierte Fläche aller eingetragenen Räume (Randzone + Innenzone).",
        'sum-pipe': "<strong>Gesamtrohrlänge:</strong> Die addierte Länge aller berechneten Rohre inklusive aller Zuleitungen.",
        'sum-schiene': "<strong>Verlegeschiene:</strong> Benötigte Gesamtlänge an Befestigungsschienen (lfm), basierend auf der Gesamtfläche.",
        'sum-klips': "<strong>Befestigungsklips:</strong> Die berechnete Stückzahl der benötigten Halteklips für die Rohre.",
        'sum-antriebe': "<strong>Stellantriebe:</strong> Gesamtzahl der benötigten Stellantriebe (1 pro Heizkreis bzw. 1 pro Raum bei Rz+Iz-Kombination).",
        'sum-thermostate': "<strong>Raumthermostate:</strong> Gesamtzahl der benötigten Raumthermostate für die Einzelraumregelung.",
        'rapport-verteiler': "<strong>Heizkreisverteiler:</strong> Liste der benötigten Verteiler nach Größe (Zahl der Anschlüsse)."
    };

    const textToKey = {
        "raum bez.": "input-room-name",
        "va rz": "input-va-rz",
        "fläche rz": "input-area",
        "va iz": "input-va-iz",
        "fläche iz": "input-area-iz",
        "raum-therm.": "input-check-thermostat",
        "antrieb": "input-check-antrieb",
        "rz+iz": "input-check-iz",
        "ziel ringl.": "input-target",
        "fugen": "input-fugen",
        "anbindung": "input-dist",
        "gesamtl.": "input-sum",
        "ringe": "input-rings",
        "bez. fbhv": "btn-add-floor-inline",
        "ebene/geschoss": "input-floor-name"
    };

    function getTooltipDescription(el) {
        if (el.hasAttribute('data-tooltip')) {
            return el.getAttribute('data-tooltip');
        }

        // Check ID
        if (el.id && tooltipDescriptions[el.id]) {
            return tooltipDescriptions[el.id];
        }

        // Check Class
        for (const cls of el.classList) {
            if (tooltipDescriptions[cls]) {
                return tooltipDescriptions[cls];
            }
        }

        // Check for class match
        if (el.tagName === 'INPUT' && el.classList.contains('input-fbhv-name')) {
            return tooltipDescriptions['btn-add-floor-inline'];
        }

        // Check Table Headers
        if (el.tagName === 'TH') {
            const txt = el.textContent.trim().toLowerCase();
            for (const key in textToKey) {
                if (txt.includes(key)) {
                    return tooltipDescriptions[textToKey[key]];
                }
            }
            if (el.classList.contains('w-tiny')) {
                return tooltipDescriptions['btn-delete-room'];
            }
            if (el.classList.contains('w-action')) {
                return tooltipDescriptions['btn-add-room'];
            }
        }

        // Check Labels
        if (el.tagName === 'LABEL') {
            const txt = el.textContent.trim().toLowerCase();
            for (const key in textToKey) {
                if (txt.includes(key)) {
                    return tooltipDescriptions[textToKey[key]];
                }
            }
            if (txt.includes('objektbez.')) {
                return tooltipDescriptions['objekt-bez'];
            }
        }

        // Check Sidebar Summary Items
        if (el.classList.contains('summary-item')) {
            const textContent = el.textContent.toLowerCase();
            if (textContent.includes('gesamtfläche')) return tooltipDescriptions['sum-area'];
            if (textContent.includes('gesamtrohrlänge')) return tooltipDescriptions['sum-pipe'];
            if (textContent.includes('verlegeschiene')) return tooltipDescriptions['sum-schiene'];
            if (textContent.includes('befestigungsklips')) return tooltipDescriptions['sum-klips'];
            if (textContent.includes('stellantriebe')) return tooltipDescriptions['sum-antriebe'];
            if (textContent.includes('raumthermostate')) return tooltipDescriptions['sum-thermostate'];
        }

        return null;
    }

    function showTooltip(target, text) {
        if (!tooltipEl) return;
        tooltipEl.innerHTML = text;
        tooltipEl.style.display = 'block';
        
        // Position calculation
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        // Default position: above the element, centered
        let top = targetRect.top - tooltipRect.height - 8 + window.scrollY;
        let left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + window.scrollX;
        
        // Adjust if it goes off the screen
        if (top < window.scrollY) {
            // If it goes off the top, show it below the element instead
            top = targetRect.bottom + 8 + window.scrollY;
        }
        
        if (left < window.scrollX) {
            left = 8 + window.scrollX;
        } else if (left + tooltipRect.width > window.scrollX + window.innerWidth) {
            left = window.scrollX + window.innerWidth - tooltipRect.width - 8;
        }
        
        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
        
        // Trigger transition animation
        requestAnimationFrame(() => {
            tooltipEl.classList.add('visible');
        });
    }

    function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.classList.remove('visible');
        // Hide display after transition completes
        setTimeout(() => {
            if (!tooltipEl.classList.contains('visible')) {
                tooltipEl.style.display = 'none';
            }
        }, 200);
    }

    document.addEventListener('mouseover', (e) => {
        if (!tooltipsEnabled) return;

        const target = e.target.closest('[data-tooltip], th, input, select, button, label, .summary-item');
        if (!target) {
            if (activeTooltipTarget) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
                activeTooltipTarget = null;
                hideTooltip();
            }
            return;
        }

        // If we are still hovering over the same target, do nothing
        if (target === activeTooltipTarget) return;

        // We moved to a new target
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        activeTooltipTarget = target;

        const description = getTooltipDescription(target);
        if (!description) {
            hideTooltip();
            return;
        }

        tooltipTimeout = setTimeout(() => {
            showTooltip(target, description);
        }, 1000);
    });

    document.addEventListener('mouseout', (e) => {
        const relatedTarget = e.relatedTarget;
        if (activeTooltipTarget && (!relatedTarget || !activeTooltipTarget.contains(relatedTarget))) {
            // We left the active target completely
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            activeTooltipTarget = null;
            hideTooltip();
        }
    });

    // Toggle Tooltips Button
    const btnToggleTooltips = document.getElementById('btn-toggle-tooltips');
    let tooltipsEnabled = false;
    if (btnToggleTooltips) {
        btnToggleTooltips.addEventListener('click', (e) => {
            e.preventDefault();
            tooltipsEnabled = !tooltipsEnabled;
            btnToggleTooltips.textContent = tooltipsEnabled ? '💡 Info: An' : '💡 Info: Aus';
            btnToggleTooltips.style.opacity = tooltipsEnabled ? '1' : '0.6';
            if (!tooltipsEnabled) hideTooltip();
        });
    }
});
