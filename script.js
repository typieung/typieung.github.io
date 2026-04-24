// ── Parse images from filename convention: Category_Type_Year_Name.png ────────
const IMAGE_FILES = [
  'Font_Custom_2023_여기어때.png',
  'Font_Custom_2025_KT.png',
  'Font_Retail_2024_onpyeon.png',
  'Font_Retail_2025_Heron.png',
];

function parseImageFile(filename) {
  const base  = filename.replace(/\.png$/i, '');
  const parts = base.split('_');
  const catRaw = parts[0];                        // e.g. "Font"
  const type   = parts[1];                        // "Retail" | "Custom"
  const year   = parseInt(parts[2], 10);          // e.g. 2025
  const name   = parts.slice(3).join(' ');        // e.g. "KT"

  return {
    id:          base,
    name,
    category:    catRaw === 'Font' ? 'Fonts' : catRaw,
    type,
    year,
    subject:     name,
    tag:         type,
    description: 'Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description Description',
    image:       `Image/${filename}`,
  };
}

const PARSED   = IMAGE_FILES.map(parseImageFile);
const PROJECTS = [
  ...PARSED,
  // Letterform placeholders
  { id: 'lf1', name: 'Project Name', category: 'Letterform', type: '', year: 2025, subject: 'Subject', tag: 'Tag', description: 'Description Description Description Description Description Description Description Description Description Description Description Description', image: '' },
  { id: 'lf2', name: 'Project Name', category: 'Letterform', type: '', year: 2024, subject: 'Subject', tag: 'Tag', description: 'Description Description Description Description Description Description Description Description Description Description Description Description', image: '' },
  { id: 'lf3', name: 'Project Name', category: 'Letterform', type: '', year: 2023, subject: 'Subject', tag: 'Tag', description: 'Description Description Description Description Description Description Description Description Description Description Description Description', image: '' },
  // Book placeholders
  { id: 'bk1', name: 'Project Name', category: 'Book', type: '', year: 2025, subject: 'Subject', tag: 'Tag', description: 'Description Description Description Description Description Description Description Description Description Description Description Description', image: '' },
  { id: 'bk2', name: 'Project Name', category: 'Book', type: '', year: 2024, subject: 'Subject', tag: 'Tag', description: 'Description Description Description Description Description Description Description Description Description Description Description Description', image: '' },
];

// ── Build type & year tabs dynamically from parsed images ─────────────────────
const rowType = document.getElementById('works-row-type');
const rowYear = document.getElementById('works-row-year');

function buildSubTabs() {
  const fontProjects = PROJECTS.filter(p => p.category === 'Fonts');

  // Unique types in order of appearance
  const types = [...new Set(fontProjects.map(p => p.type))].filter(Boolean);
  rowType.innerHTML = types.map(t =>
    `<button class="wtab2" data-type="${t}">${t}</button>`
  ).join('');

  // Unique years, descending
  const years = [...new Set(fontProjects.map(p => p.year))].sort((a, b) => b - a);
  rowYear.innerHTML = years.map(y =>
    `<button class="wtab3" data-year="${y}">${y}</button>`
  ).join('');
}

buildSubTabs();

// ── Works overlay state ───────────────────────────────────────────────────────
const worksBtn      = document.getElementById('works-btn');
const worksOverlay  = document.getElementById('works-overlay');
const worksList     = document.getElementById('works-list');
const worksDetail   = document.getElementById('works-detail');
const worksHoverImg = document.getElementById('works-hover-img');

let state = {
  open:     false,
  cat:      null,    // null = all | 'Fonts' | 'Letterform' | 'Book'
  type:     'all',   // 'all' | 'Retail' | 'Custom'
  year:     'all',   // 'all' | 2025 | 2024 | ...
  selected: null,
};

// ── Toggle Works overlay ──────────────────────────────────────────────────────
function setOverlay(open) {
  state.open = open;
  worksOverlay.classList.toggle('open', open);
  worksBtn.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';

  heroLogoGroup.classList.add('transitioning');
  updateLogo();
  setTimeout(() => heroLogoGroup.classList.remove('transitioning'), 400);

  if (open) renderList();
}

worksBtn.addEventListener('click', e => {
  e.preventDefault();
  setOverlay(!state.open);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.open) setOverlay(false);
});

// ── Category tabs ─────────────────────────────────────────────────────────────
document.querySelectorAll('.wtab').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;

    if (state.cat === cat) {
      // 같은 탭 재클릭 → 전체 해제
      state.cat = null;
      btn.classList.remove('active');
    } else {
      state.cat = cat;
      document.querySelectorAll('.wtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    const showSub = state.cat === 'Fonts';
    rowType.classList.toggle('hidden', !showSub);
    rowYear.classList.toggle('hidden', !showSub);

    if (!showSub) {
      state.type = 'all';
      state.year = 'all';
      rowType.querySelectorAll('.wtab2').forEach(b => b.classList.remove('active'));
      rowYear.querySelectorAll('.wtab3').forEach(b => b.classList.remove('active'));
    }

    clearSelection();
    renderList();
  });
});

// ── Type tabs — event delegation ──────────────────────────────────────────────
rowType.addEventListener('click', e => {
  const btn = e.target.closest('.wtab2');
  if (!btn) return;

  const type = btn.dataset.type;
  if (state.type === type) {
    // 재클릭 → 해제
    state.type = 'all';
    btn.classList.remove('active');
  } else {
    state.type = type;
    rowType.querySelectorAll('.wtab2').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  clearSelection();
  renderList();
});

// ── Year tabs — event delegation ──────────────────────────────────────────────
rowYear.addEventListener('click', e => {
  const btn = e.target.closest('.wtab3');
  if (!btn) return;

  const year = parseInt(btn.dataset.year, 10);
  if (state.year === year) {
    // 재클릭 → 해제
    state.year = 'all';
    btn.classList.remove('active');
  } else {
    state.year = year;
    rowYear.querySelectorAll('.wtab3').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  clearSelection();
  renderList();
});

// ── Render filtered project list ──────────────────────────────────────────────
function filteredProjects() {
  return PROJECTS.filter(p => {
    if (state.cat && p.category !== state.cat) return false;
    if (state.cat === 'Fonts') {
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (state.year !== 'all' && p.year !== state.year) return false;
    }
    return true;
  });
}

function renderList() {
  const projects = filteredProjects();
  worksList.innerHTML = projects.map(p => `
    <li class="works-item${state.selected === p.id ? ' selected' : ''}" data-id="${p.id}">
      ${p.name}
    </li>
  `).join('');

  worksList.querySelectorAll('.works-item').forEach(li => {
    const project = PROJECTS.find(p => p.id === li.dataset.id);

    li.addEventListener('mouseenter', () => {
      if (project.image) {
        worksHoverImg.src = project.image;
        worksHoverImg.classList.add('visible');
      } else {
        worksHoverImg.classList.remove('visible');
      }
    });

    li.addEventListener('mouseleave', () => {
      const sel = PROJECTS.find(p => p.id === state.selected);
      if (sel?.image) {
        worksHoverImg.src = sel.image;
        worksHoverImg.classList.add('visible');
      } else {
        worksHoverImg.classList.remove('visible');
      }
    });

    li.addEventListener('click', () => {
      state.selected = project.id;
      worksList.querySelectorAll('.works-item').forEach(el => el.classList.remove('selected'));
      li.classList.add('selected');
      showDetail(project);
      if (project.image) {
        worksHoverImg.src = project.image;
        worksHoverImg.classList.add('visible');
      }
    });
  });
}

function showDetail(project) {
  worksDetail.innerHTML = `
    <p class="detail-subject">${project.subject}</p>
    <p class="detail-tag">${project.tag}</p>
    <p class="detail-desc">${project.description}</p>
  `;
  worksDetail.classList.add('visible');
}

function clearSelection() {
  state.selected = null;
  worksDetail.classList.remove('visible');
  worksDetail.innerHTML = '';
  worksHoverImg.classList.remove('visible');
  worksHoverImg.src = '';
}

// ── Logo: shrinks and moves up to nav center on scroll ───────────────────────
const heroLogoGroup = document.getElementById('hero-logo-group');
const heroLogo      = document.getElementById('hero-logo');
const NAV_HEIGHT    = 48;
const NAV_FONT_SIZE = 15;

function easeOut(t) { return 1 - Math.pow(1 - t, 2); }

let heroFontSize = null;
let rafId = null;

function updateLogo() {
  if (!heroFontSize) heroFontSize = parseFloat(getComputedStyle(heroLogo).fontSize);

  const SCROLL_END = window.innerHeight * 0.6;
  const t = state.open ? 1 : easeOut(Math.min(window.scrollY / SCROLL_END, 1));

  const currentY = window.innerHeight / 2 + (NAV_HEIGHT / 2 - window.innerHeight / 2) * t;
  const scale    = 1 + (NAV_FONT_SIZE / heroFontSize - 1) * t;

  heroLogoGroup.style.top       = `${currentY}px`;
  heroLogoGroup.style.transform = `translateX(-50%) translateY(-50%) scale(${scale})`;

  const isEditable = t < 0.3;
  const isNavMode  = t > 0.7;

  heroLogoGroup.classList.toggle('editable', isEditable);
  heroLogoGroup.classList.toggle('nav-mode',  isNavMode);

  // nav 위치에선 편집 불가
  heroLogo.contentEditable = isEditable ? 'true' : 'false';

  rafId = null;
}

window.addEventListener('scroll', () => {
  if (!rafId) rafId = requestAnimationFrame(updateLogo);
}, { passive: true });

window.addEventListener('resize', () => {
  heroFontSize = null;
  updateLogo();
}, { passive: true });

// nav 위치에서 클릭 → 첫 화면으로
heroLogoGroup.addEventListener('click', () => {
  if (heroLogoGroup.classList.contains('nav-mode')) {
    if (state.open) setOverlay(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// 포커스: 커서 숨기고 텍스트 전체 선택
heroLogo.addEventListener('focus', () => {
  heroLogoGroup.classList.add('focused');
  const range = document.createRange();
  range.selectNodeContents(heroLogo);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
});

// 블러: 커서 다시 표시
heroLogo.addEventListener('blur', () => {
  heroLogoGroup.classList.remove('focused');
});

// Enter / Esc → 편집 종료
heroLogo.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    e.preventDefault();
    heroLogo.blur();
  }
});

// ── Main grid: render shuffled projects into two columns ──────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCard(project, delay) {
  const article = document.createElement('article');
  article.className = 'proj-card';
  article.style.transitionDelay = `${delay}s`;
  article.innerHTML = `
    <div class="proj-img"><img src="${project.image}" alt="${project.name}"></div>
    <div class="proj-info">
      <p class="proj-subject">${project.name}</p>
      <p class="proj-desc">${project.description}</p>
    </div>
  `;
  return article;
}

(function renderGrid() {
  const colLeft  = document.getElementById('proj-col-left');
  const colRight = document.getElementById('proj-col-right');

  // 이미지 있는 프로젝트만, 랜덤 순서로
  const pool = shuffle(PARSED.filter(p => p.image));

  pool.forEach((project, i) => {
    const col   = i % 2 === 0 ? colLeft : colRight;
    const row   = Math.floor(i / 2);
    const delay = row * 0.08 + (i % 2) * 0.1;
    col.appendChild(createCard(project, delay));
  });

  // Scroll-triggered float-up animation
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.proj-card').forEach(card => observer.observe(card));
})();
