(() => {
  'use strict';

  /* ---------------------------------------------------------------------
   * Config data
   * ------------------------------------------------------------------- */

  const PATHOLOGY_TESTS = [
    'Blood – TC, DC, Hb, ESR, Platelets',
    'Blood Sugar – Fasting & PP',
    'HbA1c (IME, and for diabetic person during PME)',
    'Lipid profile',
    'Blood Urea, Creatinine',
    'Urine (Reaction, Albumin, Sugar)',
    'Stool Routine',
    'Sputum test for AFB (food handling employees)',
    'Hemoglobin Electrophoresis for sickle cell disease/trait (IME)',
    'Bilirubin',
    'SGOT',
    'SGPT',
    'Delta aminolaevulinic acid in urine (for lead exposure)',
  ];

  // Row 8 (index 7) — the physical form leaves this Findings cell blank,
  // with no WNL/Abnormal template text, so it gets a plain input instead
  // of a pairgroup.
  const PATHOLOGY_PLAIN_ROW = 7;

  const ATTACHMENTS = [
    'X-Ray (Chest)', 'ECG', 'Echocardiography', 'Audiometry',
    'Spirometry', 'Ultrasonography', 'Pathology Lab Reports', 'Eye Test',
  ];

  // Free-form uploads for anything not covered above; shown on their own row.
  const OTHER_ATTACHMENTS = ['Other 1', 'Other 2', 'Other 3', 'Other 4', 'Other 5'];

  const state = { step: 1 };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
   * Certificate number (mock auto-generation, per proposal §7.4)
   * ------------------------------------------------------------------- */

  function initCertNumber() {
    let seq = null;
    try { seq = localStorage.getItem('form9-last-seq'); } catch (e) { /* ignore */ }
    const next = (parseInt(seq, 10) || 0) + 1;
    try { localStorage.setItem('form9-last-seq', String(next)); } catch (e) { /* ignore */ }
    const padded = String(next).padStart(5, '0');
    $('#certNoInline').textContent = padded;
    $('#annexCertNo').textContent = padded;
  }

  /* ---------------------------------------------------------------------
   * Prefill from a dashboard record — "View" / "Continue draft" pass the
   * record's id via ?id=, so the form opens with its data instead of blank.
   * ------------------------------------------------------------------- */

  // Demo findings for whatever the dashboard record itself doesn't carry —
  // the mock record model only has identity/exam-type fields, so "View"
  // fills in the rest of the multi-sheet exam with a plausible normal result.
  const DEMO_SPIROMETRY = {
    fvc: [3.8, 3.6], fev1: [3.2, 3.0], ratio: [84, 83], pef: [8.5, 8.1],
  };

  function prefillFromDashboardRecord() {
    const recordId = Number(new URLSearchParams(window.location.search).get('id'));
    if (!recordId) return;

    let records = [];
    try { records = JSON.parse(localStorage.getItem('form9-dashboard-records')) || []; } catch (e) { /* ignore */ }
    const record = records.find((r) => r.id === recordId);
    if (!record) return;

    const setValue = (fieldId, value) => {
      const el = document.getElementById(fieldId);
      if (!el || value === undefined || value === null) return;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const selectPair = (pair, value) => {
      const btn = $(`.pairgroup[data-pair="${pair}"] button[data-val="${value}"]`);
      if (btn) btn.click();
    };
    const selectClause = (letter) => {
      const tag = $(`.clause-tag[data-clause="${letter}"]`);
      if (tag) tag.click();
    };

    // Certificate number — plain text, not a form input
    if (record.certNo) {
      $('#certNoInline').textContent = record.certNo;
      $('#annexCertNo').textContent = record.certNo;
    }

    // Sheet 1 — identity & certificate
    selectPair('salutation', 'Shri');
    setValue('fullName', record.employeeName);
    setValue('designation', record.personnelType === 'Contractor' ? 'Contract Worker' : 'Mine Worker');
    setValue('mineName', record.mineName);
    setValue('personnelType', record.personnelType);
    const knownPerson = window.Form9People && window.Form9People.byName(record.employeeName);
    if (knownPerson) {
      setValue('employeeNo', knownPerson.empNo);
      setValue('aadhaarNo', knownPerson.aadhaar.replace(/(\d{4})(?=\d)/g, '$1 '));
    } else if (record.personnelType !== 'Contractor') {
      setValue('employeeNo', `EMP-${String(record.id).padStart(4, '0')}`);
    }
    if (record.examType) selectPair('examType', record.examType);
    setValue('age', record.age);

    selectClause('a');
    setValue('doctorRemarks', 'Fit for given job');

    setValue('place1', 'Sandur');
    setValue('date1', record.examDate);
    setValue('doctorName', 'Dr. K. Manjunath Rao');
    setValue('doctorReg', 'KMC 59142');

    // Sheet 2 — report of the examining authority
    setValue('examDate', record.examDate);
    setValue('identificationMark', 'Mole on left cheek');
    selectPair('generalDev', 'Good');
    setValue('height', 168);
    setValue('weight', 64);
    setValue('visionRight', '6/6');
    setValue('visionLeft', '6/6');
    setValue('eyeOrganic', 'NAD');
    setValue('nightBlindness', 'NAD');
    setValue('colorBlindness', 'NAD');
    setValue('squint', 'NAD');
    setValue('hearingRight', 'N');
    setValue('hearingLeft', 'N');
    setValue('earOrganic', 'NAD');
    selectPair('earL', 'Normal');
    selectPair('earR', 'Normal');
    selectPair('boneL', 'Normal');
    selectPair('boneR', 'Normal');
    selectPair('enc-audiometry', 'Enclosed');
    setValue('auscultatoryFinding', 'NVBS +');
    setValue('chestInsp', 88);
    setValue('chestExp', 84);
    Object.entries(DEMO_SPIROMETRY).forEach(([rowKey, [predicted, performed]]) => {
      const row = $(`#spiroTable tr[data-row="${rowKey}"]`);
      if (!row) return;
      const p = $('.predicted', row);
      const f = $('.performed', row);
      if (p) { p.value = predicted; p.dispatchEvent(new Event('input', { bubbles: true })); }
      if (f) { f.value = performed; f.dispatchEvent(new Event('input', { bubbles: true })); }
    });
    selectPair('enc-spirometry', 'Enclosed');
    setValue('bp', '124/80');
    setValue('pulse', 76);
    setValue('s1', 'Normal');
    setValue('s2', 'Normal');
    setValue('additionalSound', 'Nil');
    selectPair('ecg', 'Normal');
    selectPair('echo', 'Normal');
    selectPair('enc-ecg', 'Enclosed');
    selectPair('enc-echo', 'Enclosed');
    setValue('tenderness', 'NAD');
    setValue('liver', 'NAD');
    setValue('spleen', 'NAD');
    setValue('tumour', 'NAD');
    selectPair('ultrasonography', 'Normal');
    selectPair('enc-usg', 'Enclosed');
    setValue('fits', 'NAD');
    setValue('paralysis', 'NAD');
    setValue('mentalHealth', 'NAD');
    selectPair('superficial', 'Normal');
    selectPair('deep', 'Normal');
    selectPair('peripheral', 'Normal');
    selectPair('vibrational', 'Normal');
    selectPair('behavioral', 'Not Present');
    selectPair('speech', 'Not Present');
    selectPair('tremor', 'Not Present');
    selectPair('adiadocokinesia', 'Not Present');
    selectPair('emotional', 'Not Present');
    setValue('locomotor', 'NAD');
    setValue('skin', 'NAD');
    setValue('hydrocele', 'NAD');
    setValue('hernia', 'NAD');
    setValue('teeth', 'NAD');
    setValue('speech', 'NAD');

    // Sheet 3 — investigations & sign-off
    $$('#pathologyBody tr').forEach((row, i) => {
      if (i === PATHOLOGY_PLAIN_ROW) {
        const input = $('.blank', row);
        if (input) { input.value = 'Negative'; input.dispatchEvent(new Event('input', { bubbles: true })); }
      } else {
        selectPair(`path-${i}`, 'WNL');
      }
    });
    selectPair('enc-investigations', 'Enclosed');
    selectPair('profusion', 'Absent');
    setValue('iloGrade', '0/0');
    setValue('iloType', '—');
    selectPair('enc-xray', 'Enclosed');
    setValue('otherAbnormality', 'None');
    setValue('otherTest', 'None');
    setValue('specialistOpinion', 'None');
    setValue('place3', 'Sandur');
    setValue('date3', record.examDate);
  }

  /* ---------------------------------------------------------------------
   * Pairgroups — clickable strike-through choices (Shri/Smt./Miss,
   * Normal/Abnormal, Enclosed/Not Enclosed, etc.) — the same elements
   * are what prints, so there is nothing separate to keep in sync.
   * ------------------------------------------------------------------- */

  function applyPairSelection(container, value) {
    container.classList.toggle('has-value', !!value);
    $$('[data-val]', container).forEach((opt) => {
      opt.classList.toggle('selected', opt.dataset.val === value);
      opt.classList.toggle('struck', !!value && opt.dataset.val !== value);
    });
  }

  // "Type of exam" dropdown drives the Initial / Periodical / ReMedical
  // choice in the certificate sentence (and the sentence drives it back).
  function initExamTypeSelect() {
    const sel = $('#examTypeSelect');
    const group = $('.pairgroup[data-pair="examType"]');
    sel.addEventListener('change', () => applyPairSelection(group, sel.value));
  }

  function initPairgroups() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.pairgroup button[data-val]');
      if (!btn) return;
      const group = btn.closest('.pairgroup');
      applyPairSelection(group, btn.dataset.val);

      const key = group.dataset.pair;
      if (key === 'examType') {
        const sel = $('#examTypeSelect');
        if (sel) sel.value = btn.dataset.val;
      }
      if (key === 'salutation') {
        const mirror = $('.pairgroup[data-pair="salutation2"]');
        if (mirror) applyPairSelection(mirror, btn.dataset.val);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Fitness clause selector (a / b / c) — the certified outcome
   * ------------------------------------------------------------------- */

  function initClauseTags() {
    $$('.clause-tag').forEach((tag) => {
      tag.addEventListener('click', () => {
        $$('.clause-tag').forEach((t) => t.classList.remove('selected'));
        tag.classList.add('selected');
        checkFitnessValidity();
      });
    });
  }

  function checkFitnessValidity() {
    const ok = !!$('.clause-tag.selected');
    const note = $('#fitnessRequiredNote');
    if (note) note.classList.toggle('ok', ok);
    return ok;
  }

  function getFitnessLabel() {
    const tag = $('.clause-tag.selected');
    if (!tag) return null;
    const map = { a: 'Fit for any employment', b: 'Unfit', c: 'Conditional / re-exam' };
    return map[tag.dataset.clause];
  }

  /* ---------------------------------------------------------------------
   * Name / doctor identity echoes (mirrored onto later sign-off blocks)
   * ------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
   * Aadhaar entry + "previous records" hint (links to Employee History)
   * ------------------------------------------------------------------- */

  function initPersonLookup() {
    const aadhaar = $('#aadhaarNo');
    const empNo = $('#employeeNo');
    const hint = $('#historyHint');
    const People = window.Form9People;

    const updateHint = () => {
      const person = People && (People.isAadhaar(aadhaar.value) ? People.byAadhaar(aadhaar.value) : People.byEmpNo(empNo.value));
      const n = person ? person.records.length : 0;
      hint.hidden = !n;
      if (n) {
        hint.innerHTML = `${n} previous record${n === 1 ? '' : 's'} · <a href="history.html?person=${person.id}" target="_blank" rel="noopener">View history</a>`;
      }
    };

    aadhaar.addEventListener('input', () => {
      const d = aadhaar.value.replace(/\D/g, '').slice(0, 12);
      aadhaar.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
      updateHint();
    });
    empNo.addEventListener('input', updateHint);
    aadhaar.addEventListener('change', updateHint);
    updateHint();
  }

  function initEchoes() {
    $('#fullName').addEventListener('input', () => {
      $('#fullName2Echo').textContent = $('#fullName').value.trim();
    });

    const syncDoctor = () => {
      const name = $('#doctorName').value.trim();
      const reg = $('#doctorReg').value.trim();
      $('#doctorName3Echo').textContent = name;
      $('#doctorReg3Echo').textContent = reg ? `Reg. No. ${reg}` : '';
    };
    $('#doctorName').addEventListener('input', syncDoctor);
    $('#doctorReg').addEventListener('input', syncDoctor);
  }

  /* ---------------------------------------------------------------------
   * Stepper / sheet navigation
   * ------------------------------------------------------------------- */

  function goToStep(n) {
    state.step = n;
    $$('.sheet').forEach((s) => s.classList.remove('active'));
    $(`#sheet${n}`).classList.add('active');
    // size any pad that just became visible (does nothing once a pad is sized)
    signaturePadSetups.forEach((fn) => fn());

    $$('.step').forEach((s) => {
      const idx = Number(s.dataset.step);
      s.classList.toggle('active', idx === n);
      s.classList.toggle('complete', idx < n);
    });

    $('#prevBtn').disabled = n === 1;
    $('#nextBtn').hidden = n === 3;
    $('#submitBtn').hidden = n !== 3;

    renderStepSummaries(n);
    paintStepValidation(n);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initStepper() {
    $$('.step').forEach((btn) => {
      btn.addEventListener('click', () => goToStep(Number(btn.dataset.step)));
    });
    $('#prevBtn').addEventListener('click', () => goToStep(Math.max(1, state.step - 1)));
    $('#nextBtn').addEventListener('click', () => {
      if (!validateStepFields(state.step)) {
        showToast('Please complete the required fields before continuing');
        return;
      }
      goToStep(Math.min(3, state.step + 1));
    });
    $('#submitBtn').addEventListener('click', onSubmit);
  }

  /* ---------------------------------------------------------------------
   * Nav bar — Home / Dashboard links, search
   * ------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
   * Required-field validation (red underline on the blank itself)
   * ------------------------------------------------------------------- */

  // Only clears a stale invalid mark once a field is filled in — never adds
  // one just because the step was opened, so an untouched required field
  // (e.g. Date) doesn't show red before the user has had a chance to fill it.
  function paintStepValidation(n) {
    $$(`#sheet${n} .blank[required]`).forEach((el) => {
      if (el.value && el.value.trim()) el.classList.remove('invalid');
    });
    if (n === 1) checkFitnessValidity();
  }

  function validateStepFields(n) {
    let firstInvalid = null;
    $$(`#sheet${n} .blank[required]`).forEach((el) => {
      const empty = !el.value || !el.value.trim();
      el.classList.toggle('invalid', empty);
      if (empty && !firstInvalid) firstInvalid = el;
    });

    let fitnessOk = true;
    if (n === 1) fitnessOk = checkFitnessValidity();

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    // Every text field can be filled in while the a/b/c outcome is still
    // unset — that's not a `.blank[required]`, so nothing above catches it.
    // Without this, Next just re-shows the toast with no indication of what
    // to actually do next.
    if (!fitnessOk) {
      flagFitnessRequired();
      return false;
    }

    return true;
  }

  function flagFitnessRequired() {
    const clauses = $$('.clause');
    if (!clauses.length) return;
    clauses[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    clauses.forEach((c) => {
      c.classList.remove('flash');
      void c.offsetWidth; // restart the animation if it's already run once
      c.classList.add('flash');
    });
    setTimeout(() => clauses.forEach((c) => c.classList.remove('flash')), 1300);
  }

  // Only clears a field once it's filled in — never marks it red just for
  // being empty on blur/input. Red only ever appears after an actual
  // validation attempt (validateStepFields, on Next/Submit).
  function initValidationWiring() {
    $$('.blank[required]').forEach((el) => {
      el.addEventListener('input', () => {
        if (el.value && el.value.trim()) el.classList.remove('invalid');
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Completed-step summary banners (shown on later sheets)
   * ------------------------------------------------------------------- */

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function summaryChipsStep1() {
    const chips = [];
    const name = $('#fullName').value.trim();
    if (name) chips.push(name);
    const fitness = getFitnessLabel();
    if (fitness) chips.push(fitness);
    return chips.length ? chips : ['No details entered yet'];
  }

  function summaryDetailStep1() {
    const rows = [
      ['Designation', $('#designation').value],
      ['Mine', $('#mineName').value],
      ['Age', $('#age').value],
      ['Doctor', $('#doctorName').value],
      ['Reg. No.', $('#doctorReg').value],
    ].filter(([, v]) => v);
    return rows.length ? rows.map(([k, v]) => `${k}: ${v}`) : ['No additional details yet'];
  }

  function summaryChipsStep2() {
    const chips = [];
    const h = $('#height').value;
    const w = $('#weight').value;
    if (h || w) chips.push(`${h || '—'} cm / ${w || '—'} kg`);
    const mark = $('#identificationMark').value.trim();
    if (mark) chips.push(mark);
    const abnormal = $$('#sheet2 .pairgroup .selected[data-val="Abnormal"]').length;
    chips.push(`${abnormal} abnormal finding${abnormal === 1 ? '' : 's'}`);
    return chips;
  }

  function summaryDetailStep2() {
    const rows = $$('#sheet2 .pairgroup.has-value').map((g) => {
      const sel = $('.selected', g);
      return sel ? `${g.dataset.pair}: ${sel.dataset.val}` : null;
    }).filter(Boolean);
    return rows.length ? rows : ['No findings recorded yet'];
  }

  function buildSummaryBanner(stepNum) {
    const titles = { 1: 'Certificate', 2: 'Examination Findings' };
    const chips = stepNum === 1 ? summaryChipsStep1() : summaryChipsStep2();
    const details = stepNum === 1 ? summaryDetailStep1() : summaryDetailStep2();
    const detailId = `summaryDetail${stepNum}`;

    return `
      <div class="summary-banner" data-step="${stepNum}">
        <div class="summary-banner-row">
          <div class="summary-banner-title">
            <span class="summary-banner-num">${stepNum}</span>
            ${titles[stepNum]}
          </div>
          <div class="summary-chips">${chips.map((c) => `<span class="summary-chip">${escapeHtml(c)}</span>`).join('')}</div>
          <div class="summary-banner-actions">
            <button type="button" class="summary-edit-btn" data-goto="${stepNum}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
              Edit
            </button>
            <button type="button" class="summary-toggle-btn" data-toggle="${detailId}" aria-expanded="false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div class="summary-detail" id="${detailId}" hidden>${details.map((d) => `<span class="summary-chip">${escapeHtml(d)}</span>`).join('')}</div>
      </div>
    `;
  }

  function wireSummaryBanners() {
    $$('.summary-edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => goToStep(Number(btn.dataset.goto)));
    });
    $$('.summary-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const detail = document.getElementById(btn.dataset.toggle);
        const willOpen = detail.hidden;
        detail.hidden = !willOpen;
        btn.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', String(willOpen));
      });
    });
  }

  function renderStepSummaries(n) {
    if (n === 2) {
      $('#summaries2').innerHTML = buildSummaryBanner(1);
    } else if (n === 3) {
      $('#summaries3').innerHTML = buildSummaryBanner(1) + buildSummaryBanner(2);
    }
    wireSummaryBanners();
  }

  /* ---------------------------------------------------------------------
   * Spirometry % auto-calculation
   * ------------------------------------------------------------------- */

  function initSpirometry() {
    $$('#spiroTable tbody tr').forEach((row) => {
      const predicted = $('.predicted', row);
      const performed = $('.performed', row);
      const pct = $('.pct', row);

      const recalc = () => {
        const p = parseFloat(predicted.value);
        const f = parseFloat(performed.value);
        if (p > 0 && !isNaN(f)) {
          pct.textContent = `${Math.round((f / p) * 100)}%`;
        } else {
          pct.textContent = '—';
        }
      };
      predicted.addEventListener('input', recalc);
      performed.addEventListener('input', recalc);
    });
  }

  /* ---------------------------------------------------------------------
   * Pathology + attachment grids (generated from config)
   * ------------------------------------------------------------------- */

  function buildPathologyTable() {
    const body = $('#pathologyBody');
    body.innerHTML = PATHOLOGY_TESTS.map((test, i) => {
      const findingCell = i === PATHOLOGY_PLAIN_ROW
        ? '<input type="text" class="blank">'
        : `<span class="pairgroup" data-pair="path-${i}"><button type="button" data-val="WNL">WNL</button>/<button type="button" data-val="Abnormal">Abnormal</button></span>`;
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(test)}</td>
          <td>${findingCell}</td>
        </tr>
      `;
    }).join('');
  }

  function buildAttachmentGrid() {
    const tileHtml = (name, i) => `
      <div class="attachment-tile" data-idx="${i}" tabindex="0" role="button" aria-label="Upload ${name}">
        <span class="a-name">${name}</span>
        <span class="a-status">Click to upload</span>
      </div>
    `;
    const grid = $('#attachmentGrid');
    const othersGrid = $('#attachmentGridOthers');
    grid.innerHTML = ATTACHMENTS.map(tileHtml).join('');
    othersGrid.innerHTML = OTHER_ATTACHMENTS.map((name, i) => tileHtml(name, ATTACHMENTS.length + i)).join('');

    [...$$('.attachment-tile', grid), ...$$('.attachment-tile', othersGrid)].forEach((tile) => {
      tile.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf';
        input.onchange = () => {
          if (input.files.length) {
            tile.classList.add('filled');
            $('.a-status', tile).textContent = input.files[0].name;
          }
        };
        input.click();
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Photo upload
   * ------------------------------------------------------------------- */

  function initPhotoUpload() {
    const drop = $('#photoDrop');
    const input = $('#photoInput');
    const preview = $('#photoPreview');
    const placeholder = $('#photoPlaceholder');

    const setFile = (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.hidden = false;
        placeholder.hidden = true;
      };
      reader.readAsDataURL(file);
    };

    drop.addEventListener('click', () => input.click());
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    input.addEventListener('change', () => setFile(input.files[0]));

    ['dragover', 'dragenter'].forEach((evt) =>
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.style.borderColor = 'var(--primary)'; }));
    ['dragleave', 'drop'].forEach((evt) =>
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.style.borderColor = ''; }));
    drop.addEventListener('drop', (e) => setFile(e.dataTransfer.files[0]));
  }

  /* ---------------------------------------------------------------------
   * Signature / thumb-impression capture pads
   * ------------------------------------------------------------------- */

  const signaturePadSetups = [];

  function initSignaturePads() {
    $$('.sig-pad').forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      let sized = false;

      // Pads inside sheet 2 / 3 are `display:none` until the user steps to
      // them, so getBoundingClientRect() is 0x0 at page load — sizing the
      // canvas then would leave it permanently unusable. Retry via
      // ResizeObserver until the pad actually has layout size, then stop.
      const setup = () => {
        if (sized) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.lineWidth = canvas.classList.contains('thumb-pad') ? 2.2 : 1.8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#14202e';
        sized = true;
      };
      setup();
      signaturePadSetups.push(setup);

      if (!sized) {
        const observer = new ResizeObserver(() => {
          if (!sized) setup();
          if (sized) observer.disconnect();
        });
        observer.observe(canvas);
      }

      let drawing = false;
      let last = null;

      const pos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const point = e.touches ? e.touches[0] : e;
        return { x: point.clientX - rect.left, y: point.clientY - rect.top };
      };

      const start = (e) => { drawing = true; last = pos(e); e.preventDefault(); };
      const move = (e) => {
        if (!drawing) return;
        const p = pos(e);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last = p;
        e.preventDefault();
      };
      const end = () => { drawing = false; };

      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);
    });

    $$('.clear-sig').forEach((btn) => {
      btn.addEventListener('click', () => {
        const canvas = document.getElementById(btn.dataset.target);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    });
  }

  /* ---------------------------------------------------------------------
   * Toast
   * ------------------------------------------------------------------- */

  function showToast(msg) {
    const toast = $('#toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function onSubmit() {
    if (!validateStepFields(3)) {
      showToast('Please complete the required fields before continuing');
      return;
    }
    showToast('Record certified and routed for non-editable attachment storage');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  }

  /* ---------------------------------------------------------------------
   * Print / Save draft — the on-screen form is the print output, so
   * printing is just the browser's print dialog against this same page.
   * ------------------------------------------------------------------- */

  // Chromium's print/PDF pipeline does not reliably honor an
  // `@media print { display: block !important }` override of a base
  // `display: none` — it renders correctly on screen but the printed／
  // PDF output silently drops every sheet after the first. It also
  // does not reliably wait for a `beforeprint` handler to finish before
  // it snapshots layout, so the fix has to run synchronously, in the
  // same call that triggers printing: mark every sheet active (the same
  // class screen navigation already uses) right before printing, then
  // restore the current step afterwards.
  function prepareAllSheetsForPrint() {
    $$('.sheet').forEach((s) => s.classList.add('active'));
  }

  const isViewMode = new URLSearchParams(window.location.search).get('mode') === 'view';

  function initFooterButtons() {
    // Opened via "View" on the dashboard: nothing to save or submit, so the
    // footer keeps only Cancel (the other buttons are hidden in CSS).
    if (isViewMode) document.body.classList.add('view-mode');

    $('#cancelBtn').addEventListener('click', () => {
      if (isViewMode || confirm('Discard changes and return to the dashboard?')) {
        window.location.href = 'dashboard.html';
      }
    });
    $('#printBtn').addEventListener('click', () => {
      prepareAllSheetsForPrint();
      window.print();
      goToStep(state.step);
    });
    $('#saveDraftBtn').addEventListener('click', () => {
      showToast('Draft saved');
    });

    // Fallback for native Ctrl+P / browser print menu (bypasses our
    // button). beforeprint's timing isn't guaranteed relative to
    // Chromium's print snapshot, but it's better than nothing here.
    window.addEventListener('beforeprint', prepareAllSheetsForPrint);
    window.addEventListener('afterprint', () => goToStep(state.step));
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    initCertNumber();
    initPairgroups();
    initExamTypeSelect();
    initClauseTags();
    initEchoes();
    initPersonLookup();
    initStepper();
    initSpirometry();
    buildPathologyTable();
    buildAttachmentGrid();
    initPhotoUpload();
    initSignaturePads();
    initFooterButtons();
    initValidationWiring();
    prefillFromDashboardRecord();
    goToStep(1);
  });
})();
