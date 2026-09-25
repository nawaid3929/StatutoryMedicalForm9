/* Mock person master + multi-year Form 9 history (prototype data).
 * In SharePoint this is the Employees/Persons list plus the Form 9 records
 * looking up to it; Aadhaar is stored only here, never on individual records. */
(function () {
  'use strict';

  const att = (year, names) => names.map((n) => ({
    name: n,
    file: `${n.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}.pdf`,
  }));

  const PEOPLE = [
    {
      id: 'P001', name: 'Basavaraj H. Naik', aadhaar: '482913765012', empNo: 'EMP-0001',
      type: 'Employee', mine: 'Ramgad Iron Ore Mine', designation: 'Mine Worker',
      records: [
        { year: 2026, certNo: 'SMC-00061', examType: 'Periodical', outcome: 'Fit for any employment', status: 'Submitted', recordId: 1, attachments: att(2026, ['X-Ray (Chest)', 'ECG', 'Pathology Lab Reports']) },
        { year: 2025, certNo: 'SMC-00012', examType: 'Periodical', outcome: 'Fit for any employment', status: 'Submitted', attachments: att(2025, ['X-Ray (Chest)', 'Audiometry', 'Spirometry', 'Pathology Lab Reports']) },
        { year: 2024, certNo: 'SMC-00007', examType: 'Initial', outcome: 'Fit for any employment', status: 'Submitted', attachments: att(2024, ['X-Ray (Chest)', 'ECG']) },
      ],
    },
    {
      id: 'P002', name: 'Chandrashekar M.', aadhaar: '731205948316', empNo: 'EMP-0217',
      type: 'Employee', mine: 'Deogiri Manganese Mine', designation: 'Dumper Operator',
      records: [
        { year: 2026, certNo: 'SMC-00060', examType: 'Initial', outcome: 'Fit for any employment', status: 'Submitted', recordId: 2, attachments: att(2026, ['X-Ray (Chest)', 'Pathology Lab Reports']) },
      ],
    },
    {
      id: 'P003', name: 'Iqbal Ahmed', aadhaar: '604827193540', empNo: 'CTR-1042',
      type: 'Contractor', mine: 'Vyasanakere Mine', designation: 'Contract Worker',
      records: [
        { year: 2026, certNo: 'SMC-00059', examType: 'Initial', outcome: 'Fit for any employment', status: 'Submitted', recordId: 3, attachments: att(2026, ['X-Ray (Chest)', 'Pathology Lab Reports']) },
      ],
    },
    {
      id: 'P004', name: 'Basappa Talwar', aadhaar: '295170384627', empNo: 'EMP-0388',
      type: 'Employee', mine: 'Narihalla Mine', designation: 'Mine Foreman',
      records: [
        { year: 2026, certNo: 'SMC-00051', examType: 'Periodical', outcome: 'Fit for any employment', status: 'Submitted', recordId: 16, attachments: att(2026, ['X-Ray (Chest)', 'ECG', 'Spirometry']) },
        { year: 2025, certNo: 'SMC-00019', examType: 'Periodical', outcome: 'Fit — re-examine in 6 months', status: 'Submitted', attachments: att(2025, ['X-Ray (Chest)', 'ECG', 'Echocardiography', 'Pathology Lab Reports']) },
        { year: 2024, certNo: 'SMC-00004', examType: 'Periodical', outcome: 'Fit for any employment', status: 'Submitted', attachments: att(2024, ['X-Ray (Chest)']) },
        { year: 2023, certNo: 'SMC-00002', examType: 'Initial', outcome: 'Fit for any employment', status: 'Submitted', attachments: att(2023, ['X-Ray (Chest)', 'Audiometry']) },
      ],
    },
    {
      id: 'P005', name: 'Chetan Kumar', aadhaar: '518362079481', empNo: 'CTR-0876',
      type: 'Contractor', mine: 'Sandur Manganese Mine Complex', designation: 'Contract Worker',
      records: [
        { year: 2026, certNo: 'SMC-00050', examType: 'Initial', outcome: 'Fit for any employment', status: 'Submitted', recordId: 17, attachments: att(2026, ['X-Ray (Chest)', 'Pathology Lab Reports']) },
        { year: 2025, certNo: 'SMC-00016', examType: 'Initial', outcome: 'Unfit for work below ground', status: 'Submitted', attachments: att(2025, ['X-Ray (Chest)', 'Spirometry']) },
      ],
    },
  ];

  const digits = (s) => String(s || '').replace(/\D/g, '');
  const norm = (s) => String(s || '').trim().toUpperCase();

  window.Form9People = {
    all: PEOPLE,
    isAadhaar: (q) => digits(q).length === 12 && /^[\d\s-]+$/.test(String(q).trim()),
    byAadhaar: (q) => PEOPLE.find((p) => p.aadhaar === digits(q)) || null,
    byEmpNo: (q) => PEOPLE.find((p) => norm(p.empNo) === norm(q)) || null,
    byId: (id) => PEOPLE.find((p) => p.id === id) || null,
    byName: (name) => PEOPLE.find((p) => p.name === name) || null,
    /* Exact match only — Aadhaar (12 digits) or Employee / Contractor No. */
    search(q) {
      if (!String(q || '').trim()) return null;
      return this.isAadhaar(q) ? this.byAadhaar(q) : this.byEmpNo(q);
    },
    maskAadhaar: (a) => `XXXX XXXX ${String(a).slice(-4)}`,
  };
})();
