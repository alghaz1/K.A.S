/* ============================================
   K.A.S — Kikir Adalah Sihir
   Core Application Logic
   ============================================ */

(function () {
  'use strict';

  // ========== DATA STORE ==========
  const STORAGE_KEYS = {
    PIN: 'kas_pin',
    PETI: 'kas_peti',
    TRANSACTIONS: 'kas_transactions',
    LOGGED_IN: 'kas_logged_in'
  };

  const PETI_ICONS = [
    'lucide:archive', 'lucide:wallet', 'lucide:piggy-bank', 'lucide:banknote',
    'lucide:coins', 'lucide:credit-card', 'lucide:gem', 'lucide:briefcase',
    'lucide:building-2', 'lucide:gift', 'lucide:heart', 'lucide:star',
    'lucide:trophy', 'lucide:flag', 'lucide:book-open', 'lucide:graduation-cap',
    'lucide:users', 'lucide:home', 'lucide:coffee', 'lucide:shopping-bag',
    'lucide:truck', 'lucide:wrench', 'lucide:music', 'lucide:camera'
  ];

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTH_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // ========== HELPERS ==========
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function formatCurrency(amount) {
    return 'Rp ' + Math.abs(amount).toLocaleString('id-ID');
  }

  function parseLocalDate(dateStr) {
    // Parse YYYY-MM-DD as local date to avoid UTC timezone offset issues
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDate(dateStr) {
    const d = parseLocalDate(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDateShort(dateStr) {
    const d = parseLocalDate(dateStr);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  }

  function getTodayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  // ========== LOCAL STORAGE ==========
  function getData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getPetiList() {
    return getData(STORAGE_KEYS.PETI) || [];
  }

  function savePetiList(list) {
    setData(STORAGE_KEYS.PETI, list);
  }

  function getTransactions() {
    return getData(STORAGE_KEYS.TRANSACTIONS) || [];
  }

  function saveTransactions(list) {
    setData(STORAGE_KEYS.TRANSACTIONS, list);
  }

  // ========== STATE ==========
  let currentPage = 'dashboard';
  let currentPetiId = null;
  let editingPetiId = null;
  let editingTxId = null;
  let selectedIcon = PETI_ICONS[0];
  let confirmCallback = null;
  let currentFilter = 'all';
  let detailFilter = 'all';

  // ========== DOM REFERENCES ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ========== TOAST ==========
  function showToast(message, type = 'success') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconMap = {
      success: 'lucide:check-circle',
      error: 'lucide:alert-circle',
      info: 'lucide:info'
    };

    toast.innerHTML = `
      <iconify-icon icon="${iconMap[type] || iconMap.info}"></iconify-icon>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== CONFIRM DIALOG ==========
  function showConfirm(title, message, callback) {
    $('#confirm-title').textContent = title;
    $('#confirm-message').textContent = message;
    $('#confirm-dialog').classList.add('active');
    confirmCallback = callback;
  }

  function hideConfirm() {
    $('#confirm-dialog').classList.remove('active');
    confirmCallback = null;
  }

  // ========== MODALS ==========
  function openModal(id) {
    $(`#${id}`).classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    $(`#${id}`).classList.remove('active');
    document.body.style.overflow = '';
  }

  // ========== LOGIN ==========
  function initLogin() {
    const pin = getData(STORAGE_KEYS.PIN);
    const isLoggedIn = getData(STORAGE_KEYS.LOGGED_IN);

    if (isLoggedIn) {
      showMainApp();
      return;
    }

    if (!pin) {
      // First time — setup PIN
      $('#pin-setup-text').style.display = 'block';
      $('#login-btn-text').textContent = 'Buat PIN';
      $('#login-hint').textContent = 'Buat 6-digit PIN baru';
    }

    // Create floating particles
    createParticles();

    // PIN input handlers
    const pinInputs = $$('.pin-input');
    pinInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        if (val && idx < pinInputs.length - 1) {
          pinInputs[idx + 1].focus();
        }
        // Auto-submit when all filled
        if (idx === pinInputs.length - 1 && val) {
          const fullPin = Array.from(pinInputs).map(i => i.value).join('');
          if (fullPin.length === 6) {
            handleLogin(fullPin);
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          pinInputs[idx - 1].focus();
          pinInputs[idx - 1].value = '';
        }
      });

      input.addEventListener('focus', () => {
        input.select();
      });
    });

    // Login button
    $('#login-btn').addEventListener('click', () => {
      const fullPin = Array.from(pinInputs).map(i => i.value).join('');
      handleLogin(fullPin);
    });

    // Focus first pin input
    setTimeout(() => pinInputs[0].focus(), 500);
  }

  function handleLogin(pin) {
    const storedPin = getData(STORAGE_KEYS.PIN);
    const errorEl = $('#login-error');

    if (!storedPin) {
      // Setting up new PIN
      if (pin.length < 6) {
        errorEl.textContent = 'PIN harus 6 digit';
        errorEl.classList.add('visible');
        return;
      }
      setData(STORAGE_KEYS.PIN, pin);
      setData(STORAGE_KEYS.LOGGED_IN, true);
      showToast('PIN berhasil dibuat! Selamat datang, Boss 💰', 'success');
      showMainApp();
    } else {
      // Verifying PIN
      if (pin === storedPin) {
        setData(STORAGE_KEYS.LOGGED_IN, true);
        showMainApp();
      } else {
        errorEl.textContent = 'PIN salah! Coba lagi.';
        errorEl.classList.add('visible');
        // Shake animation
        $$('.pin-input').forEach(i => { i.value = ''; });
        setTimeout(() => $$('.pin-input')[0].focus(), 100);
        setTimeout(() => errorEl.classList.remove('visible'), 2000);
      }
    }
  }

  function createParticles() {
    const container = $('#particles-container');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      container.appendChild(particle);
    }
  }

  function showMainApp() {
    $('#login-page').style.display = 'none';
    $('#main-app').style.display = 'flex';
    navigateTo('dashboard');
  }

  function logout() {
    setData(STORAGE_KEYS.LOGGED_IN, false);
    $('#login-page').style.display = '';
    $('#main-app').style.display = 'none';
    $$('.pin-input').forEach(i => { i.value = ''; });
    $('#login-error').classList.remove('visible');
    setTimeout(() => $$('.pin-input')[0]?.focus(), 300);
  }

  // ========== NAVIGATION ==========
  function navigateTo(page, data) {
    currentPage = page;

    // Update pages
    $$('.page').forEach(p => p.classList.remove('active'));

    // Update sidebar nav
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const sideNavItem = $(`.nav-item[data-page="${page}"]`);
    if (sideNavItem) sideNavItem.classList.add('active');

    // Update bottom nav
    $$('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    const bottomNavItem = $(`.bottom-nav-item[data-page="${page}"]`);
    if (bottomNavItem) bottomNavItem.classList.add('active');

    // Close mobile sidebar
    closeMobileSidebar();

    switch (page) {
      case 'dashboard':
        $('#page-dashboard').classList.add('active');
        updatePageTitle('Overview', 'Selamat Datang, <span>Boss</span>');
        updateHeaderActions('');
        renderDashboard();
        break;

      case 'peti':
        $('#page-peti').classList.add('active');
        updatePageTitle('Peti Emas', 'Kelola <span>Peti Emas</span>');
        updateHeaderActions(`
          <button class="btn-primary" id="btn-add-peti">
            <iconify-icon icon="lucide:plus"></iconify-icon>
            Buat Peti Baru
          </button>
        `);
        renderPetiGrid();
        // Bind add peti button
        setTimeout(() => {
          const addBtn = $('#btn-add-peti');
          if (addBtn) addBtn.addEventListener('click', () => openPetiModal());
        }, 0);
        break;

      case 'peti-detail': {
        currentPetiId = data;
        $('#page-peti-detail').classList.add('active');
        const peti = getPetiList().find(p => p.id === currentPetiId);
        if (peti) {
          updatePageTitle('Peti Emas', `<span>${peti.name}</span>`);
          updateHeaderActions(`
            <button class="btn-primary" id="btn-add-tx-header">
              <iconify-icon icon="lucide:plus"></iconify-icon>
              Tambah Transaksi
            </button>
          `);
          renderPetiDetail(peti);
          setTimeout(() => {
            const addTxBtn = $('#btn-add-tx-header');
            if (addTxBtn) addTxBtn.addEventListener('click', () => openTxModal(currentPetiId));
          }, 0);
        } else {
          navigateTo('peti');
        }
        // Update sidebar active state to peti
        $$('.nav-item').forEach(n => n.classList.remove('active'));
        const petiNav = $(`.nav-item[data-page="peti"]`);
        if (petiNav) petiNav.classList.add('active');
        $$('.bottom-nav-item').forEach(n => n.classList.remove('active'));
        const petiBottom = $(`.bottom-nav-item[data-page="peti"]`);
        if (petiBottom) petiBottom.classList.add('active');
        break;
      }

      case 'semua-transaksi': {
        currentFilter = 'all';
        $('#page-semua-transaksi').classList.add('active');
        updatePageTitle('Semua Transaksi', 'Riwayat <span>Transaksi</span>');
        updateHeaderActions(`
          <button class="btn-primary" id="btn-add-tx-all">
            <iconify-icon icon="lucide:plus"></iconify-icon>
            Tambah Transaksi
          </button>
        `);
        renderAllTransactions();
        // Reset filter buttons
        $$('#all-tx-filter .filter-btn').forEach(b => b.classList.remove('active'));
        $('#all-tx-filter .filter-btn[data-filter="all"]').classList.add('active');
        setTimeout(() => {
          const addTxBtn = $('#btn-add-tx-all');
          if (addTxBtn) addTxBtn.addEventListener('click', () => openTxModal());
        }, 0);
        break;
      }
    }
  }

  function updatePageTitle(label, titleHtml) {
    const group = $('#page-title-group');
    group.innerHTML = `
      <span class="page-label">${label}</span>
      <h1>${titleHtml}</h1>
    `;
  }

  function updateHeaderActions(html) {
    $('#header-actions').innerHTML = html;
  }

  function closeMobileSidebar() {
    $('#sidebar').classList.remove('mobile-open');
    $('#sidebar-overlay').classList.remove('active');
  }

  // ========== DASHBOARD ==========
  function renderDashboard() {
    const allTx = getTransactions();
    const totalIncome = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const incomeCount = allTx.filter(t => t.type === 'income').length;
    const expenseCount = allTx.filter(t => t.type === 'expense').length;

    // Animate counter
    animateCounter('stat-balance', balance, true);
    animateCounter('stat-income', totalIncome, true);
    animateCounter('stat-expense', totalExpense, true);
    $('#stat-income-count').textContent = `${incomeCount} transaksi masuk`;
    $('#stat-expense-count').textContent = `${expenseCount} transaksi keluar`;

    // Render chart
    renderBarChart(allTx);

    // Render recent transactions (last 8)
    const recentTx = [...allTx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    renderTransactionList('recent-transactions', recentTx, true);
  }

  function animateCounter(elementId, target, isCurrency) {
    const el = $(`#${elementId}`);
    if (!el) return;

    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      if (isCurrency) {
        el.textContent = formatCurrency(current);
      } else {
        el.textContent = current.toLocaleString('id-ID');
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function renderBarChart(transactions) {
    const chart = $('#bar-chart');
    if (!chart) return;

    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: MONTH_NAMES[d.getMonth()]
      });
    }

    const monthData = months.map(m => {
      const monthTx = transactions.filter(t => {
        const td = parseLocalDate(t.date);
        return td.getMonth() === m.month && td.getFullYear() === m.year;
      });
      return {
        label: m.label,
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      };
    });

    const maxValue = Math.max(...monthData.map(m => Math.max(m.income, m.expense)), 1);

    chart.innerHTML = monthData.map(m => {
      const incomeH = Math.max((m.income / maxValue) * 100, 2);
      const expenseH = Math.max((m.expense / maxValue) * 100, 2);
      return `
        <div class="bar-group">
          <div class="bar-pair">
            <div class="bar income-bar tooltip" style="height: ${incomeH}%" data-tooltip="${formatCurrency(m.income)}"></div>
            <div class="bar expense-bar tooltip" style="height: ${expenseH}%" data-tooltip="${formatCurrency(m.expense)}"></div>
          </div>
          <div class="bar-label">${m.label}</div>
        </div>
      `;
    }).join('');
  }

  // ========== TRANSACTION RENDERING ==========
  function renderTransactionList(containerId, transactions, showPetiName) {
    const container = $(`#${containerId}`);
    if (!container) return;

    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <iconify-icon icon="lucide:inbox"></iconify-icon>
          <h3>Belum Ada Transaksi</h3>
          <p>Mulai tambahkan transaksi pertama Anda untuk melacak keuangan organisasi.</p>
        </div>
      `;
      return;
    }

    const petiList = getPetiList();

    container.innerHTML = transactions.map(tx => {
      const typeClass = tx.type === 'income' ? 'income' : 'expense';
      const icon = tx.type === 'income' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right';
      const sign = tx.type === 'income' ? '+' : '-';
      const petiName = showPetiName && tx.petiId ? (petiList.find(p => p.id === tx.petiId)?.name || '') : '';

      return `
        <div class="transaction-item" data-tx-id="${tx.id}">
          <div class="transaction-type-indicator ${typeClass}"></div>
          <div class="transaction-icon-box ${typeClass}">
            <iconify-icon icon="${icon}"></iconify-icon>
          </div>
          <div class="transaction-details">
            <div class="tx-name">${escapeHtml(tx.description)}</div>
            <div class="tx-category">${escapeHtml(tx.category || '')}${petiName ? ' • ' + escapeHtml(petiName) : ''}</div>
          </div>
          <div class="transaction-amount ${typeClass}">${sign} ${formatCurrency(tx.amount)}</div>
          <div class="transaction-date">${formatDateShort(tx.date)}</div>
          <div class="transaction-item-actions">
            <button class="tx-action-btn tooltip" data-tooltip="Edit" onclick="KAS.editTx('${tx.id}')">
              <iconify-icon icon="lucide:pencil"></iconify-icon>
            </button>
            <button class="tx-action-btn delete tooltip" data-tooltip="Hapus" onclick="KAS.deleteTx('${tx.id}')">
              <iconify-icon icon="lucide:trash-2"></iconify-icon>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== PETI EMAS ==========
  function renderPetiGrid(filter) {
    const container = $('#peti-grid');
    if (!container) return;

    let petiList = getPetiList();
    const allTx = getTransactions();

    if (filter) {
      petiList = petiList.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.description.toLowerCase().includes(filter.toLowerCase())
      );
    }

    let html = '';

    petiList.forEach(peti => {
      const petiTx = allTx.filter(t => t.petiId === peti.id);
      const income = petiTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = petiTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const txCount = petiTx.length;

      html += `
        <div class="peti-card" data-peti-id="${peti.id}" onclick="KAS.openPeti('${peti.id}')">
          <div class="peti-card-top">
            <div class="peti-icon" style="color: ${peti.color || 'var(--gold-primary)'};">
              <iconify-icon icon="${peti.icon || 'lucide:archive'}"></iconify-icon>
            </div>
            <div class="peti-actions">
              <button class="peti-action-btn tooltip" data-tooltip="Edit" onclick="event.stopPropagation(); KAS.editPeti('${peti.id}')">
                <iconify-icon icon="lucide:pencil"></iconify-icon>
              </button>
              <button class="peti-action-btn delete tooltip" data-tooltip="Hapus" onclick="event.stopPropagation(); KAS.deletePeti('${peti.id}')">
                <iconify-icon icon="lucide:trash-2"></iconify-icon>
              </button>
            </div>
          </div>
          <h3>${escapeHtml(peti.name)}</h3>
          <p class="peti-desc">${escapeHtml(peti.description || 'Tidak ada deskripsi')}</p>
          <div class="peti-card-stats">
            <div class="peti-stat">
              <span class="label">Masuk</span>
              <span class="value income">${formatCurrency(income)}</span>
            </div>
            <div class="peti-stat">
              <span class="label">Keluar</span>
              <span class="value expense">${formatCurrency(expense)}</span>
            </div>
            <div class="peti-stat">
              <span class="label">Transaksi</span>
              <span class="value">${txCount}</span>
            </div>
          </div>
          <div class="peti-date">Dibuat: ${formatDate(peti.createdAt)}</div>
        </div>
      `;
    });

    // Add button card
    html += `
      <div class="add-peti-card" onclick="KAS.openPetiModal()">
        <iconify-icon icon="lucide:plus-circle"></iconify-icon>
        <span>Buat Peti Emas Baru</span>
      </div>
    `;

    container.innerHTML = html;
  }

  function openPetiModal(editId) {
    editingPetiId = editId || null;
    const modal = 'modal-peti';

    if (editId) {
      const peti = getPetiList().find(p => p.id === editId);
      if (peti) {
        $('#modal-peti-title').textContent = 'Edit Peti Emas';
        $('#peti-name').value = peti.name;
        $('#peti-desc').value = peti.description || '';
        selectedIcon = peti.icon || PETI_ICONS[0];
      }
    } else {
      $('#modal-peti-title').textContent = 'Buat Peti Emas Baru';
      $('#peti-name').value = '';
      $('#peti-desc').value = '';
      selectedIcon = PETI_ICONS[0];
    }

    renderIconPicker();
    openModal(modal);
  }

  function renderIconPicker() {
    const picker = $('#icon-picker');
    picker.innerHTML = PETI_ICONS.map(icon => `
      <div class="icon-option ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}" onclick="KAS.selectIcon('${icon}')">
        <iconify-icon icon="${icon}"></iconify-icon>
      </div>
    `).join('');
  }

  function selectIcon(icon) {
    selectedIcon = icon;
    $$('.icon-option').forEach(el => el.classList.remove('selected'));
    $(`.icon-option[data-icon="${icon}"]`)?.classList.add('selected');
  }

  function savePeti() {
    const name = $('#peti-name').value.trim();
    const desc = $('#peti-desc').value.trim();

    if (!name) {
      showToast('Nama peti tidak boleh kosong!', 'error');
      return;
    }

    const list = getPetiList();

    if (editingPetiId) {
      const idx = list.findIndex(p => p.id === editingPetiId);
      if (idx !== -1) {
        list[idx].name = name;
        list[idx].description = desc;
        list[idx].icon = selectedIcon;
        showToast('Peti Emas berhasil diperbarui! ✨', 'success');
      }
    } else {
      list.push({
        id: generateId(),
        name,
        description: desc,
        icon: selectedIcon,
        color: 'var(--gold-primary)',
        createdAt: getTodayStr()
      });
      showToast('Peti Emas baru berhasil dibuat! 💰', 'success');
    }

    savePetiList(list);
    closeModal('modal-peti');
    editingPetiId = null;

    // Re-render current page
    if (currentPage === 'peti') renderPetiGrid();
    if (currentPage === 'dashboard') renderDashboard();
  }

  function deletePeti(id) {
    const peti = getPetiList().find(p => p.id === id);
    if (!peti) return;

    const txCount = getTransactions().filter(t => t.petiId === id).length;
    showConfirm(
      'Hapus Peti Emas',
      `Apakah Anda yakin ingin menghapus "${peti.name}"? ${txCount > 0 ? `${txCount} transaksi di dalamnya juga akan dihapus.` : ''}`,
      () => {
        let list = getPetiList().filter(p => p.id !== id);
        let txList = getTransactions().filter(t => t.petiId !== id);
        savePetiList(list);
        saveTransactions(txList);
        hideConfirm();
        showToast('Peti Emas berhasil dihapus', 'success');
        if (currentPage === 'peti-detail' && currentPetiId === id) {
          navigateTo('peti');
        } else {
          renderPetiGrid();
        }
        if (currentPage === 'dashboard') renderDashboard();
      }
    );
  }

  function openPetiDetail(petiId) {
    navigateTo('peti-detail', petiId);
  }

  function renderPetiDetail(peti) {
    const allTx = getTransactions().filter(t => t.petiId === peti.id);
    const income = allTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = allTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    // Header
    $('#peti-detail-header').innerHTML = `
      <div class="peti-detail-icon">
        <iconify-icon icon="${peti.icon || 'lucide:archive'}"></iconify-icon>
      </div>
      <div class="peti-detail-info">
        <h2>${escapeHtml(peti.name)}</h2>
        <p>${escapeHtml(peti.description || 'Tidak ada deskripsi')} • Dibuat ${formatDate(peti.createdAt)}</p>
      </div>
    `;

    // Summary
    $('#peti-summary').innerHTML = `
      <div class="summary-item">
        <div class="summary-label">Pemasukan</div>
        <div class="summary-value income">${formatCurrency(income)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Pengeluaran</div>
        <div class="summary-value expense">${formatCurrency(expense)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Saldo</div>
        <div class="summary-value balance">${formatCurrency(balance)}</div>
      </div>
    `;

    // Transactions
    renderDetailTransactions();
  }

  function renderDetailTransactions() {
    let txList = getTransactions().filter(t => t.petiId === currentPetiId);
    if (detailFilter !== 'all') {
      txList = txList.filter(t => t.type === detailFilter);
    }
    txList.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTransactionList('detail-transactions', txList, false);
  }

  // ========== TRANSACTIONS ==========
  function openTxModal(petiId, editId) {
    editingTxId = editId || null;

    // Populate peti select
    const petiSelect = $('#tx-peti-select');
    const petiList = getPetiList();
    petiSelect.innerHTML = '<option value="">— Pilih Peti Emas —</option>' +
      petiList.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');

    if (editId) {
      const tx = getTransactions().find(t => t.id === editId);
      if (tx) {
        $('#modal-tx-title').textContent = 'Edit Transaksi';
        $(`#tx-type-${tx.type}`).checked = true;
        // Show formatted amount (with thousand separators)
        $('#tx-amount').value = tx.amount.toLocaleString('id-ID');
        $('#tx-description').value = tx.description;
        $('#tx-category').value = tx.category || '';
        $('#tx-date').value = tx.date;
        petiSelect.value = tx.petiId || '';
      }
    } else {
      $('#modal-tx-title').textContent = 'Tambah Transaksi';
      $('#tx-type-income').checked = true;
      $('#tx-amount').value = '';
      $('#tx-description').value = '';
      $('#tx-category').value = '';
      $('#tx-date').value = getTodayStr();
      petiSelect.value = petiId || '';
    }

    // Show/hide peti group based on context
    if (petiId && currentPage === 'peti-detail') {
      $('#tx-peti-group').style.display = 'none';
      petiSelect.value = petiId;
    } else {
      $('#tx-peti-group').style.display = '';
    }

    openModal('modal-tx');
  }

  function saveTx() {
    const type = $('input[name="tx-type"]:checked').value;
    const amountStr = $('#tx-amount').value.replace(/\D/g, '');
    const amount = parseInt(amountStr, 10);
    const description = $('#tx-description').value.trim();
    const category = $('#tx-category').value;
    const date = $('#tx-date').value;
    const petiId = $('#tx-peti-select').value;

    if (!amount || amount <= 0) {
      showToast('Jumlah harus lebih dari 0!', 'error');
      return;
    }
    if (!description) {
      showToast('Keterangan tidak boleh kosong!', 'error');
      return;
    }
    if (!date) {
      showToast('Tanggal harus diisi!', 'error');
      return;
    }
    if (!petiId) {
      showToast('Pilih Peti Emas terlebih dahulu!', 'error');
      return;
    }

    const txList = getTransactions();

    if (editingTxId) {
      const idx = txList.findIndex(t => t.id === editingTxId);
      if (idx !== -1) {
        txList[idx] = { ...txList[idx], type, amount, description, category, date, petiId };
        showToast('Transaksi berhasil diperbarui! ✨', 'success');
      }
    } else {
      txList.push({
        id: generateId(),
        type,
        amount,
        description,
        category,
        date,
        petiId,
        createdAt: new Date().toISOString()
      });
      showToast(type === 'income' ? 'Pemasukan berhasil dicatat! 💰' : 'Pengeluaran berhasil dicatat! 📝', 'success');
    }

    saveTransactions(txList);
    closeModal('modal-tx');
    editingTxId = null;

    // Re-render
    refreshCurrentPage();
  }

  function editTx(txId) {
    const tx = getTransactions().find(t => t.id === txId);
    if (tx) {
      openTxModal(tx.petiId, txId);
    }
  }

  function deleteTx(txId) {
    const tx = getTransactions().find(t => t.id === txId);
    if (!tx) return;

    showConfirm(
      'Hapus Transaksi',
      `Apakah Anda yakin ingin menghapus transaksi "${tx.description}" (${formatCurrency(tx.amount)})?`,
      () => {
        const txList = getTransactions().filter(t => t.id !== txId);
        saveTransactions(txList);
        hideConfirm();
        showToast('Transaksi berhasil dihapus', 'success');
        refreshCurrentPage();
      }
    );
  }

  // ========== ALL TRANSACTIONS ==========
  function renderAllTransactions(searchQuery) {
    let txList = getTransactions();

    if (currentFilter !== 'all') {
      txList = txList.filter(t => t.type === currentFilter);
    }

    if (searchQuery) {
      txList = txList.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    txList.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderTransactionList('all-transactions', txList, true);
  }

  function refreshCurrentPage() {
    switch (currentPage) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'peti':
        renderPetiGrid();
        break;
      case 'peti-detail': {
        const peti = getPetiList().find(p => p.id === currentPetiId);
        if (peti) renderPetiDetail(peti);
        break;
      }
      case 'semua-transaksi':
        renderAllTransactions($('#search-tx')?.value);
        break;
    }
  }

  // ========== EVENT BINDINGS ==========
  function bindEvents() {
    // Sidebar nav
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
      });
    });

    // Bottom nav
    $$('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        navigateTo(item.dataset.page);
      });
    });

    // Mobile menu
    $('#mobile-menu-btn')?.addEventListener('click', () => {
      $('#sidebar').classList.toggle('mobile-open');
      $('#sidebar-overlay').classList.toggle('active');
    });

    $('#sidebar-overlay')?.addEventListener('click', closeMobileSidebar);

    // Logout
    $('#logout-btn')?.addEventListener('click', () => {
      showConfirm('Keluar', 'Apakah Anda yakin ingin keluar dari akun?', () => {
        hideConfirm();
        logout();
      });
    });

    // See all transactions from dashboard
    $('#btn-see-all-tx')?.addEventListener('click', () => navigateTo('semua-transaksi'));

    // Peti modal buttons
    $('#modal-peti-close')?.addEventListener('click', () => closeModal('modal-peti'));
    $('#modal-peti-cancel')?.addEventListener('click', () => closeModal('modal-peti'));
    $('#modal-peti-save')?.addEventListener('click', savePeti);

    // Transaction modal buttons
    $('#modal-tx-close')?.addEventListener('click', () => closeModal('modal-tx'));
    $('#modal-tx-cancel')?.addEventListener('click', () => closeModal('modal-tx'));
    $('#modal-tx-save')?.addEventListener('click', saveTx);

    // Add transaction from detail page
    $('#btn-add-tx-detail')?.addEventListener('click', () => openTxModal(currentPetiId));

    // Back button from detail
    $('#btn-back-peti')?.addEventListener('click', () => navigateTo('peti'));

    // Confirm dialog
    $('#confirm-cancel')?.addEventListener('click', hideConfirm);
    $('#confirm-ok')?.addEventListener('click', () => {
      if (confirmCallback) confirmCallback();
    });

    // Close modals on overlay click
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Close confirm on overlay click
    $('#confirm-dialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'confirm-dialog') hideConfirm();
    });

    // Search Peti
    $('#search-peti')?.addEventListener('input', (e) => {
      renderPetiGrid(e.target.value);
    });

    // Search Transactions
    $('#search-tx')?.addEventListener('input', (e) => {
      renderAllTransactions(e.target.value);
    });

    // Filter buttons — All Transactions
    $$('#all-tx-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#all-tx-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderAllTransactions($('#search-tx')?.value);
      });
    });

    // Filter buttons — Detail Transactions
    $$('#detail-tx-filter .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#detail-tx-filter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        detailFilter = btn.dataset.filter;
        renderDetailTransactions();
      });
    });

    // Amount input formatting
    $('#tx-amount')?.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val) {
        val = parseInt(val, 10).toLocaleString('id-ID');
      }
      e.target.value = val;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
          document.body.style.overflow = '';
        });
        hideConfirm();
      }
    });
  }

  // ========== INIT ==========
  function init() {
    bindEvents();
    initLogin();
  }

  // ========== PUBLIC API ==========
  window.KAS = {
    openPeti: openPetiDetail,
    editPeti: (id) => openPetiModal(id),
    deletePeti: deletePeti,
    openPetiModal: () => openPetiModal(),
    selectIcon: selectIcon,
    editTx: editTx,
    deleteTx: deleteTx
  };

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
