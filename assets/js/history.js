(() => {
  'use strict';

  const People = window.Form9People;
  const $ = (sel) => document.querySelector(sel);

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  function showToast(msg) {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  const PILL = { Draft: 'pill-draft', Submitted: 'pill-submitted' };

  function renderPerson(person) {
    const total = person.records.length;
    const years = [...person.records].sort((a, b) => b.year - a.year);

    const timeline = years.map((r) => `
      <li class="hist-item">
        <div class="hist-year">${r.year}</div>
        <div class="hist-card">
          <div class="hist-card-top">
            <span class="mono-cell">${escapeHtml(r.certNo)}</span>
            <span class="hist-type">${escapeHtml(r.examType)} examination</span>
            <span class="status-pill ${PILL[r.status] || 'pill-draft'}">${escapeHtml(r.status)}</span>
            ${r.recordId ? `<a class="btn-outline hist-view" href="index.html?id=${r.recordId}&mode=view">View Form 9</a>` : ''}
          </div>
          <p class="hist-outcome">${escapeHtml(r.outcome)}</p>
          <div class="hist-attach">
            <span class="hist-attach-label">Attachments (${r.attachments.length})</span>
            ${r.attachments.map((a) => `
              <button type="button" class="attach-chip" data-file="${escapeHtml(a.file)}" title="${escapeHtml(a.file)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
                ${escapeHtml(a.name)}
              </button>`).join('')}
          </div>
        </div>
      </li>`).join('');

    $('#historyResult').innerHTML = `
      <div class="person-card">
        <div class="person-avatar" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.8" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20c0-4.1 3.6-6.8 7.5-6.8s7.5 2.7 7.5 6.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </div>
        <div class="person-main">
          <h2 class="person-name">${escapeHtml(person.name)}
            <span class="status-pill ${person.type === 'Contractor' ? 'pill-pending' : 'pill-approved'}">${escapeHtml(person.type)}</span>
          </h2>
          <dl class="person-meta">
            <div><dt>${person.type === 'Contractor' ? 'Contractor No.' : 'Employee No.'}</dt><dd class="mono-cell">${escapeHtml(person.empNo)}</dd></div>
            <div><dt>Aadhaar</dt><dd class="mono-cell">${People.maskAadhaar(person.aadhaar)}</dd></div>
            <div><dt>Mine / Unit</dt><dd>${escapeHtml(person.mine)}</dd></div>
            <div><dt>Designation</dt><dd>${escapeHtml(person.designation)}</dd></div>
          </dl>
        </div>
        <div class="person-count"><strong>${total}</strong><span>Form 9 record${total === 1 ? '' : 's'}</span></div>
      </div>
      <h3 class="hist-heading">Year-wise history</h3>
      <ol class="hist-timeline">${timeline}</ol>`;
  }

  function renderEmpty(message) {
    $('#historyResult').innerHTML = `
      <div class="hist-empty">
        <strong>${escapeHtml(message)}</strong>
        <span>Check the number and try again.</span>
      </div>`;
  }

  function setError(msg) {
    const el = $('#searchError');
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function runSearch(raw) {
    const q = String(raw || '').trim();
    $('#historyResult').innerHTML = '';
    setError('');
    if (!q) {
      setError('Enter an Aadhaar number or an Employee / Contractor number.');
      return;
    }
    if (/^[\d\s-]+$/.test(q) && !People.isAadhaar(q)) {
      setError('An Aadhaar number must be exactly 12 digits.');
      return;
    }
    const person = People.search(q);
    if (person) renderPerson(person);
    else renderEmpty(`No records found for “${q}”`);
  }

  function formatAadhaarInput(input) {
    if (!/^[\d\s-]*$/.test(input.value)) return;
    const d = input.value.replace(/\D/g, '').slice(0, 12);
    input.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = $('#searchInput');

    input.addEventListener('input', () => {
      formatAadhaarInput(input);
      setError('');
    });

    $('#searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch(input.value);
    });

    $('#historyResult').addEventListener('click', (e) => {
      const chip = e.target.closest('.attach-chip');
      if (chip) showToast(`${chip.dataset.file} — file preview is not part of this prototype`);
    });

    const params = new URLSearchParams(window.location.search);
    const personId = params.get('person');
    const q = params.get('q');
    if (personId && People.byId(personId)) {
      renderPerson(People.byId(personId));
    } else if (q) {
      input.value = q;
      formatAadhaarInput(input);
      runSearch(input.value);
    }
  });
})();
