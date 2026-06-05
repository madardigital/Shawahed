const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function arabicNumber(value) {
  return String(value).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function slugUrl(hash) {
  const base = window.location.origin + window.location.pathname;
  if (!hash) return base;
  if (hash.startsWith("http")) return hash;
  if (hash.startsWith("#")) return base + hash;
  return base + "#" + hash;
}

function createQr(target, label) {
  const template = $("#qrTemplate");
  const node = template.content.cloneNode(true);
  const box = $(".qr-box", node);
  const canvas = $("canvas", node);
  const small = $("small", node);
  const url = slugUrl(target);

  small.textContent = label || "QR";
  box.dataset.url = url;

  if (window.QRCode && window.QRCode.toCanvas) {
    window.QRCode.toCanvas(canvas, url, {
      width: 132,
      margin: 1,
      color: {
        dark: "#344054",
        light: "#ffffff"
      }
    }).catch(() => fallbackQr(canvas, url));
  } else {
    fallbackQr(canvas, url);
  }

  return node;
}

function fallbackQr(canvas, url) {
  const parent = canvas.parentElement;
  canvas.remove();

  const link = document.createElement("a");
  link.href = url;
  link.className = "qr-fallback";
  link.target = url.startsWith("http") ? "_blank" : "_self";
  link.rel = "noopener";
  link.textContent = "فتح الرابط";

  parent.prepend(link);
}

function pill(text) {
  return `<span class="pill">${text}</span>`;
}

function makeActionLink(url, text = "فتح الشاهد") {
  if (!url) return `<span class="disabled-link">بانتظار إضافة الرابط</span>`;

  const target = url.startsWith("http") ? ` target="_blank" rel="noopener"` : "";
  return `<a class="mini-link" href="${url}"${target}>${text}</a>`;
}

function renderIdentity() {
  const identity = PORTFOLIO.teacher;

  const items = [
    ["اسم المعلمة", identity.teacherName],
    ["المسمى", identity.jobTitle],
    ["الروضة / المدرسة", identity.school],
    ["المستوى / الشعبة", identity.classroom],
    ["العام الدراسي", identity.year],
    ["الإدارة التعليمية", identity.city],
    ["المقيمة", identity.supervisor]
  ];

  $("#identityGrid").innerHTML = items.map(([label, value]) => `
    <div class="identity-item">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderMinistry() {
  $("#ministryGrid").innerHTML = PORTFOLIO.ministry.map(item => `
    <article class="info-card">
      <span>${item.icon}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderElements() {
  const grid = $("#elementsGrid");
  grid.innerHTML = "";

  PORTFOLIO.elements.forEach(element => {
    const article = document.createElement("article");
    article.className = `element-card color-${element.color}`;
    article.id = `element-${element.id}`;
    article.dataset.search = [
      element.title,
      element.description,
      element.examples.join(" "),
      element.witnesses.join(" "),
      element.evidence.map(e => e.title).join(" ")
    ].join(" ");

    article.innerHTML = `
      <div class="card-top">
        <span class="number-badge">${arabicNumber(element.number)}</span>
        <div>
          <h3>${element.title}</h3>
          <p>${element.description}</p>
        </div>
      </div>

      <div class="weight-bar" aria-label="الوزن النسبي ${element.weight}%">
        <span style="width:${element.weight * 10}%"></span>
      </div>

      <div class="weight-line">
        <strong>${arabicNumber(element.weight)}%</strong>
        <span>الوزن النسبي</span>
      </div>

      <div class="two-col">
        <div>
          <h4>أمثلة تحقق العنصر</h4>
          <ul>${element.examples.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>الشواهد المقترحة</h4>
          <ul>${element.witnesses.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="evidence-list">
        ${element.evidence.map((item, index) => `
          <div class="evidence-chip" id="evidence-${element.id}-${index + 1}">
            <div>
              <strong>${item.title}</strong>
              <span>${item.type} · ${item.note}</span>
            </div>
            ${makeActionLink(
              item.mediaUrl,
              item.mediaUrl && item.mediaUrl.startsWith("#") ? "فتح القسم" : "فتح الشاهد"
            )}
          </div>
        `).join("")}
      </div>

      <div class="qr-row"></div>
    `;

    const qrRow = $(".qr-row", article);
    qrRow.append(createQr(`#element-${element.id}`, `QR ${element.title}`));

    element.evidence.forEach((item, index) => {
      const target = item.mediaUrl || `#evidence-${element.id}-${index + 1}`;
      qrRow.append(createQr(target, item.title));
    });

    grid.append(article);
  });
}

function renderUnits() {
  const intro = $("#unitsIntro");

  intro.innerHTML = `
    <div>
      <h3>فاصل رئيسي: الوحدات التعليمية</h3>
      <p>
        هذا القسم يعمل كفاصل رئيسي للوحدات. عند فتح باركود الوحدات تظهر الوحدات المنفذة،
        وكل وحدة تحتوي ملفات فرعية مثل اللقاء الصباحي، القراءة الجهرية، النشاط الأكاديمي،
        اللعب الخارجي، والركن الفني.
      </p>
      <div class="tag-row">
        ${["وحدة الماء", "وحدة الألوان", "وحدة العائلة", "القراءة الجهرية", "اللعب الخارجي"].map(pill).join("")}
      </div>
    </div>
    <div class="intro-qr"></div>
  `;

  $(".intro-qr", intro).append(createQr("#units", "QR الوحدات"));

  const grid = $("#unitsGrid");
  grid.innerHTML = "";

  PORTFOLIO.units.forEach(unit => {
    const article = document.createElement("article");
    article.className = `unit-card color-${unit.color}`;
    article.id = `unit-${unit.id}`;
    article.dataset.search = [
      unit.title,
      unit.goal,
      unit.folders.map(f => `${f.title} ${f.description}`).join(" ")
    ].join(" ");

    article.innerHTML = `
      <div class="card-top">
        <span class="number-badge">🧸</span>
        <div>
          <h3>${unit.title}</h3>
          <p>${unit.duration} · ${unit.goal}</p>
        </div>
      </div>

      <div class="folder-grid">
        ${unit.folders.map(folder => `
          <div class="folder-card" id="unit-${unit.id}-${folder.id}">
            <div class="folder-icon">📁</div>
            <h4>${folder.title}</h4>
            <p>${folder.description}</p>
            <div class="folder-meta">
              ${pill(folder.type)}
              ${makeActionLink(folder.mediaUrl, "فتح الوسائط")}
            </div>
            <div class="folder-qr"></div>
          </div>
        `).join("")}
      </div>

      <div class="qr-row unit-main-qr"></div>
    `;

    $(".unit-main-qr", article).append(createQr(`#unit-${unit.id}`, `QR ${unit.title}`));

    unit.folders.forEach(folder => {
      const folderNode = $(`#unit-${unit.id}-${folder.id}`, article);
      const target = folder.mediaUrl || `#unit-${unit.id}-${folder.id}`;
      $(".folder-qr", folderNode).append(createQr(target, folder.title));
    });

    grid.append(article);
  });
}

function renderPlans() {
  const grid = $("#plansGrid");
  grid.innerHTML = "";

  PORTFOLIO.plans.forEach(plan => {
    const article = document.createElement("article");
    article.className = "plan-card";
    article.id = `plan-${plan.id}`;
    article.dataset.search = [
      plan.title,
      plan.focus,
      plan.goals.join(" "),
      plan.steps.join(" "),
      plan.measures.join(" ")
    ].join(" ");

    article.innerHTML = `
      <div class="card-top">
        <span class="number-badge">🌱</span>
        <div>
          <h3>${plan.title}</h3>
          <p>${plan.focus} · ${plan.period}</p>
        </div>
      </div>

      <div class="two-col">
        <div>
          <h4>الأهداف العلاجية</h4>
          <ul>${plan.goals.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div>
          <h4>إجراءات التنفيذ</h4>
          <ul>${plan.steps.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      </div>

      <h4>مؤشرات القياس</h4>
      <div class="tag-row">${plan.measures.map(pill).join("")}</div>

      <div class="qr-row"></div>
    `;

    $(".qr-row", article).append(createQr(`#plan-${plan.id}`, `QR ${plan.title}`));

    if (plan.mediaUrl) {
      $(".qr-row", article).append(createQr(plan.mediaUrl, "وسائط الخطة"));
    }

    grid.append(article);
  });
}

function renderInitiatives() {
  const grid = $("#initiativesGrid");
  grid.innerHTML = "";

  PORTFOLIO.initiatives.forEach(item => {
    const article = document.createElement("article");
    article.className = "initiative-card";
    article.id = `initiative-${item.id}`;
    article.dataset.search = [
      item.title,
      item.element,
      item.summary,
      item.outputs.join(" ")
    ].join(" ");

    article.innerHTML = `
      <div class="card-top">
        <span class="number-badge">🎈</span>
        <div>
          <h3>${item.title}</h3>
          <p>${item.element}</p>
        </div>
      </div>

      <p>${item.summary}</p>

      <h4>المخرجات</h4>
      <div class="tag-row">${item.outputs.map(pill).join("")}</div>

      <div class="qr-row"></div>
    `;

    $(".qr-row", article).append(createQr(`#initiative-${item.id}`, `QR ${item.title}`));

    if (item.mediaUrl) {
      $(".qr-row", article).append(createQr(item.mediaUrl, "وسائط الفعالية"));
    }

    grid.append(article);
  });
}

function renderReports() {
  const list = $("#reportsList");
  list.innerHTML = "";

  PORTFOLIO.reports.forEach(report => {
    const article = document.createElement("article");
    article.className = "report-card";
    article.id = `report-${report.id}`;
    article.dataset.search = `${report.title} ${report.body}`;

    article.innerHTML = `
      <div class="report-head">
        <h3>${report.title}</h3>
        <button class="copy-btn" type="button">نسخ النص</button>
      </div>

      <p>${report.body}</p>

      <div class="qr-row"></div>
    `;

    $(".copy-btn", article).addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`${report.title}\n\n${report.body}`);
        $(".copy-btn", article).textContent = "تم النسخ ✓";

        setTimeout(() => {
          $(".copy-btn", article).textContent = "نسخ النص";
        }, 1500);
      } catch {
        alert("يمكنك تحديد النص ونسخه يدوياً.");
      }
    });

    $(".qr-row", article).append(createQr(`#report-${report.id}`, `QR ${report.title}`));

    list.append(article);
  });
}

function renderStats() {
  const totalWeight = PORTFOLIO.elements.reduce((sum, item) => sum + item.weight, 0);

  const evidenceCount =
    PORTFOLIO.elements.reduce((sum, item) => sum + item.evidence.length, 0) +
    PORTFOLIO.units.reduce((sum, unit) => sum + unit.folders.length, 0) +
    PORTFOLIO.plans.length +
    PORTFOLIO.initiatives.length;

  $("#totalWeight").textContent = `${arabicNumber(totalWeight)}%`;
  $("#sectionsCount").textContent = arabicNumber(PORTFOLIO.elements.length);
  $("#evidenceCount").textContent = arabicNumber(evidenceCount);
  $("#unitCount").textContent = arabicNumber(PORTFOLIO.units.length);
}

function setupSearch() {
  const input = $("#searchInput");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const cards = $$("[data-search]");

    cards.forEach(card => {
      const matches = !query || card.dataset.search.toLowerCase().includes(query);
      card.classList.toggle("is-hidden", !matches);
    });
  });
}

function setupButtons() {
  $("#printBtn").addEventListener("click", () => window.print());

  $("#themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    $("#themeBtn").textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  });
}

function init() {
  renderIdentity();
  renderMinistry();
  renderElements();
  renderUnits();
  renderPlans();
  renderInitiatives();
  renderReports();
  renderStats();
  setupSearch();
  setupButtons();
}

document.addEventListener("DOMContentLoaded", init);
