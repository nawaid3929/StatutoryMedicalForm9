(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE_KEY = 'form9-dashboard-records';
  const PAGE_SIZE = 7;

  function showToast(msg) {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------------------------------------------------------------------
   * Seed data — demo records only (no backend; see README)
   * ------------------------------------------------------------------- */

  const SEED_RECORDS = [
    { id: 1, certNo: 'SMC-00061', employeeName: 'Basavaraj H. Naik', mineName: 'Ramgad Iron Ore Mine', personnelType: 'Employee', examType: 'Periodical', age: 41, examDate: '2026-09-18', status: 'Pending' },
    { id: 2, certNo: 'SMC-00060', employeeName: 'Chandrashekar M.', mineName: 'Deogiri Manganese Mine', personnelType: 'Employee', examType: 'Initial', age: 29, examDate: '2026-09-16', status: 'Pending' },
    { id: 3, certNo: 'SMC-00059', employeeName: 'Iqbal Ahmed', mineName: 'Vyasanakere Mine', personnelType: 'Contractor', examType: 'Initial', age: 34, examDate: '2026-09-14', status: 'Pending' },
    { id: 4, certNo: 'SMC-00058', employeeName: 'K. Ravindra Shetty', mineName: 'Narihalla Mine', personnelType: 'Employee', examType: 'Periodical', age: 47, examDate: '2026-09-10', status: 'Pending' },
    { id: 5, certNo: 'SMC-00057', employeeName: 'Manjunath Koli', mineName: 'Sandur Manganese Mine Complex', personnelType: 'Contractor', examType: 'Initial', age: 26, examDate: '2026-09-08', status: 'Pending' },
    { id: 6, certNo: 'SMC-00056', employeeName: 'Praveen Kumar B.', mineName: 'Yeshwantnagar Unit', personnelType: 'Employee', examType: 'Periodical', age: 52, examDate: '2026-09-05', status: 'Pending' },
    { id: 7, certNo: 'SMC-00055', employeeName: 'Ravi Teja Pujari', mineName: 'Ramgad Iron Ore Mine', personnelType: 'Employee', examType: 'Periodical', age: 38, examDate: '2026-09-02', status: 'Pending' },
    { id: 8, certNo: 'SMC-00054', employeeName: 'Somashekar Hadapad', mineName: 'Deogiri Manganese Mine', personnelType: 'Contractor', examType: 'Initial', age: 31, examDate: '2026-08-29', status: 'Pending' },
    { id: 9, certNo: 'SMC-00053', employeeName: 'Suresh Babu G.', mineName: 'Vyasanakere Mine', personnelType: 'Employee', examType: 'Periodical', age: 44, examDate: '2026-08-25', status: 'Pending' },
    { id: 10, certNo: 'SMC-00052', employeeName: 'Venkatesh Halli', mineName: 'Narihalla Mine', personnelType: 'Contractor', examType: 'Initial', age: 27, examDate: '2026-08-21', status: 'Pending' },

    { id: 11, certNo: null, employeeName: 'Anand Kumar Reddy', mineName: 'Sandur Manganese Mine Complex', personnelType: 'Employee', examType: 'Periodical', age: 36, examDate: '2026-09-20', status: 'Draft' },
    { id: 12, certNo: null, employeeName: 'Deepak S. Patil', mineName: 'Ramgad Iron Ore Mine', personnelType: 'Contractor', examType: 'Initial', age: 24, examDate: '2026-09-19', status: 'Draft' },
    { id: 13, certNo: null, employeeName: 'Girish Naik', mineName: 'Yeshwantnagar Unit', personnelType: 'Employee', examType: 'Periodical', age: 49, examDate: '2026-09-17', status: 'Draft' },
    { id: 14, certNo: null, employeeName: 'Harish Chandra', mineName: 'Deogiri Manganese Mine', personnelType: 'Employee', examType: 'Initial', age: 33, examDate: '2026-09-15', status: 'Draft' },
    { id: 15, certNo: null, employeeName: 'Imran Sheikh', mineName: 'Vyasanakere Mine', personnelType: 'Contractor', examType: 'Initial', age: 30, examDate: '2026-09-13', status: 'Draft' },

    { id: 16, certNo: 'SMC-00051', employeeName: 'Basappa Talwar', mineName: 'Narihalla Mine', personnelType: 'Employee', examType: 'Periodical', age: 45, examDate: '2026-08-18', status: 'Approved' },
    { id: 17, certNo: 'SMC-00050', employeeName: 'Chetan Kumar', mineName: 'Sandur Manganese Mine Complex', personnelType: 'Contractor', examType: 'Initial', age: 28, examDate: '2026-08-14', status: 'Approved' },
    { id: 18, certNo: 'SMC-00049', employeeName: 'Dinesh Rathod', mineName: 'Ramgad Iron Ore Mine', personnelType: 'Employee', examType: 'Periodical', age: 39, examDate: '2026-08-10', status: 'Approved' },
    { id: 19, certNo: 'SMC-00048', employeeName: 'Eshwar Gouda', mineName: 'Deogiri Manganese Mine', personnelType: 'Employee', examType: 'Initial', age: 32, examDate: '2026-08-06', status: 'Approved' },
    { id: 20, certNo: 'SMC-00047', employeeName: 'Feroz Khan', mineName: 'Vyasanakere Mine', personnelType: 'Contractor', examType: 'Initial', age: 35, examDate: '2026-08-02', status: 'Approved' },
    { id: 21, certNo: 'SMC-00046', employeeName: 'Gopal Krishna', mineName: 'Yeshwantnagar Unit', personnelType: 'Employee', examType: 'Periodical', age: 48, examDate: '2026-07-29', status: 'Approved' },
    { id: 22, certNo: 'SMC-00045', employeeName: 'Harsha Vardhan', mineName: 'Narihalla Mine', personnelType: 'Employee', examType: 'Periodical', age: 41, examDate: '2026-07-25', status: 'Approved' },

    { id: 23, certNo: 'SMC-00044', employeeName: 'Imtiaz Ali', mineName: 'Sandur Manganese Mine Complex', personnelType: 'Contractor', examType: 'Initial', age: 23, examDate: '2026-07-20', status: 'Rejected' },
    { id: 24, certNo: 'SMC-00043', employeeName: 'Jagadish Rao', mineName: 'Ramgad Iron Ore Mine', personnelType: 'Employee', examType: 'Periodical', age: 55, examDate: '2026-07-16', status: 'Rejected' },
  ];

  function loadRecords() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) { /* ignore */ }
    }
    return SEED_RECORDS.map((r) => ({ ...r }));
  }

  function saveRecords() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) { /* ignore */ }
  }

  let records = loadRecords();
  saveRecords();
  let activeStatus = 'All';
  let searchQuery = '';
  let currentPage = 1;

  /* ---------------------------------------------------------------------
   * Derived data
   * ------------------------------------------------------------------- */

  function daysPending(examDateStr) {
    const examDate = new Date(examDateStr + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - examDate) / 86400000);
    return diff > 0 ? diff : 0;
  }

  function formatDate(examDateStr) {
    const d = new Date(examDateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Every space-separated term must appear somewhere in the row's visible text.
  function matchesSearch(r) {
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const haystack = [
      r.certNo, r.employeeName, r.mineName, r.personnelType, r.examType,
      r.status, r.age, r.examDate, formatDate(r.examDate),
    ].join(' ').toLowerCase();
    return terms.every((t) => haystack.includes(t));
  }

  function statusCounts() {
    const searched = records.filter(matchesSearch);
    const counts = { All: searched.length, Draft: 0, Pending: 0, Approved: 0, Rejected: 0 };
    searched.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }

  function filteredRecords() {
    const searched = records.filter(matchesSearch);
    let list = activeStatus === 'All' ? searched : searched.filter((r) => r.status === activeStatus);
    return list.slice().sort((a, b) => new Date(b.examDate) - new Date(a.examDate));
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */

  function statusPillClass(status) {
    return {
      Draft: 'pill-draft',
      Pending: 'pill-pending',
      Approved: 'pill-approved',
      Rejected: 'pill-rejected',
    }[status] || '';
  }

  const ICONS = {
    view: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>',
    approve: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/><path d="m7.5 12.5 3 3 6-6.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reject: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/><path d="m8.5 8.5 7 7M15.5 8.5l-7 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L19.5 8.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    print: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  };

  function iconsForRow(r) {
    if (r.status === 'Draft') {
      return `<button type="button" class="icon-btn icon-btn--edit" data-action="edit" data-id="${r.id}" title="Continue draft">${ICONS.edit}</button>`;
    }
    if (r.status === 'Pending') {
      return `
        <button type="button" class="icon-btn icon-btn--approve" data-action="approve" data-id="${r.id}" title="Approve">${ICONS.approve}</button>
        <button type="button" class="icon-btn icon-btn--reject" data-action="reject" data-id="${r.id}" title="Reject">${ICONS.reject}</button>
        <button type="button" class="icon-btn icon-btn--view" data-action="view" data-id="${r.id}" title="View">${ICONS.view}</button>`;
    }
    if (r.status === 'Approved') {
      return `
        <button type="button" class="icon-btn icon-btn--view" data-action="view" data-id="${r.id}" title="View">${ICONS.view}</button>
        <button type="button" class="icon-btn icon-btn--print" data-action="print" data-id="${r.id}" title="Print / Export">${ICONS.print}</button>`;
    }
    return `<button type="button" class="icon-btn icon-btn--view" data-action="view" data-id="${r.id}" title="View">${ICONS.view}</button>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Employees known to the person master link to their full history.
  function nameCell(name) {
    const person = window.Form9People && window.Form9People.byName(name);
    return person
      ? `<a class="name-link" href="history.html?person=${person.id}" title="View full Form 9 history">${escapeHtml(name)}</a>`
      : escapeHtml(name);
  }

  function initTableSearch() {
    const input = $('#tableSearchInput');
    const clear = $('#tableSearchClear');
    const apply = () => {
      searchQuery = input.value.trim();
      clear.hidden = !input.value;
      currentPage = 1;
      renderTable();
    };
    input.addEventListener('input', apply);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) { input.value = ''; apply(); }
    });
    clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
    $('#tableSearch').addEventListener('submit', (e) => e.preventDefault());
  }

  function rowHtml(r, index) {
    return `<tr data-id="${r.id}">
      <td>${index}</td>
      <td><span class="mono-cell">${r.certNo ? escapeHtml(r.certNo) : '&mdash;'}</span></td>
      <td><strong>${nameCell(r.employeeName)}</strong></td>
      <td>${escapeHtml(r.mineName)}</td>
      <td>${r.personnelType}</td>
      <td>${r.examType}</td>
      <td>${r.age}</td>
      <td>${formatDate(r.examDate)}</td>
      <td>${daysPending(r.examDate)}</td>
      <td><span class="status-pill ${statusPillClass(r.status)}">${r.status}</span></td>
      <td class="row-actions">${iconsForRow(r)}</td>
    </tr>`;
  }

  function renderTabs() {
    const counts = statusCounts();
    $$('.status-tab').forEach((tab) => {
      const key = tab.dataset.status;
      tab.classList.toggle('active', key === activeStatus);
      const countEl = $('.tab-count', tab);
      if (countEl) countEl.textContent = counts[key] || 0;
    });
  }

  function renderPagination(total, totalPages, start, count) {
    const info = $('#dashPageInfo');
    info.textContent = total ? `Showing ${start + 1}-${start + count} of ${total} records` : 'No records match this view';

    const nav = $('#dashPagination');
    const parts = [];
    parts.push(`<button type="button" class="page-btn" id="dashPrev" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`);

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
        if (p === 2 || p === totalPages - 1) parts.push('<span class="page-ellipsis">&hellip;</span>');
        continue;
      }
      parts.push(`<button type="button" class="page-btn page-num ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`);
    }

    parts.push(`<button type="button" class="page-btn" id="dashNext" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`);
    nav.innerHTML = parts.join('');

    $('#dashPrev').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    $('#dashNext').addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderTable(); } });
    $$('.page-num', nav).forEach((btn) => {
      btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page, 10); renderTable(); });
    });
  }

  function renderTable() {
    const list = filteredRecords();
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    const tbody = $('#dashTableBody');
    tbody.innerHTML = pageItems.length
      ? pageItems.map((r, i) => rowHtml(r, start + i + 1)).join('')
      : `<tr><td colspan="11" class="dtable-empty">${searchQuery ? `No records match “${escapeHtml(searchQuery)}”.` : 'No records match this view.'}</td></tr>`;

    renderPagination(total, totalPages, start, pageItems.length);
    renderTabs();
  }

  /* ---------------------------------------------------------------------
   * Wiring
   * ------------------------------------------------------------------- */

  function initTabs() {
    $$('.status-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeStatus = tab.dataset.status;
        currentPage = 1;
        renderTable();
      });
    });
  }

  function initRowActions() {
    $('#dashTableBody').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const record = records.find((r) => r.id === id);
      if (!record) return;

      const action = btn.dataset.action;
      if (action === 'approve') {
        record.status = 'Approved';
        saveRecords();
        showToast(`${record.employeeName}'s record approved`);
        renderTable();
      } else if (action === 'reject') {
        record.status = 'Rejected';
        saveRecords();
        showToast(`${record.employeeName}'s record rejected`);
        renderTable();
      } else if (action === 'edit' || action === 'view') {
        showToast('Opening record in the Form 9 workspace…');
        window.location.href = `index.html?id=${record.id}${action === 'view' ? '&mode=view' : ''}`;
      } else if (action === 'print') {
        showToast('Opening record for print / export…');
        window.location.href = `index.html?id=${record.id}`;
      }
    });
  }

  function initToolbar() {
    $('#filterBtn').addEventListener('click', () => showToast('Advanced filters are not part of this prototype'));
    $('#sortBtn').addEventListener('click', () => showToast('Custom sorting is not part of this prototype'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initRowActions();
    initToolbar();
    initTableSearch();
    renderTable();
  });
})();
