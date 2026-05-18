const LIMIT = 20;
let currentPage = 0;

let lastSearch = "";
let lastClass = "";

let totalResults = 0;

const searchInput  = document.getElementById("searchInput");

const classFilter  = document.getElementById("classFilter");
const searchBtn    = document.getElementById("searchBtn");

const clearBtn     = document.getElementById("clearBtn");
const resultsEl    = document.getElementById("results");
const pagination   = document.getElementById("pagination");
const prevBtn      = document.getElementById("prevBtn");

const nextBtn      = document.getElementById("nextBtn");
const pageInfo     = document.getElementById("pageInfo");
const recentWrap   = document.getElementById("recentWrap");

const recentList   = document.getElementById("recentList");
const modalOverlay = document.getElementById("modalOverlay");
const closeModal   = document.getElementById("closeModal");

const modalTitle   = document.getElementById("modalTitle");
const modalBody    = document.getElementById("modalBody");

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadRecentSearches();
  fetchRecalls("", "", 0);

  searchBtn.addEventListener("click", handleSearch);
  clearBtn.addEventListener("click", handleClear);
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSearch(); });
  
  prevBtn.addEventListener("click", () => changePage(-1));
  nextBtn.addEventListener("click", () => changePage(1));
  closeModal.addEventListener("click", closeModalFn);
  modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModalFn(); });
});

async function loadStats() {
  try {
    const res  = await fetch("/api/stats");
    const data = await res.json();
    if (!data.results) return;

    const map = {};
    data.results.forEach(r => { map[r.term] = r.count; });

    document.getElementById("statI").textContent   = (map["Class I"]   || 0).toLocaleString();
    document.getElementById("statII").textContent  = (map["Class II"]  || 0).toLocaleString();
    document.getElementById("statIII").textContent = (map["Class III"] || 0).toLocaleString();

    renderChart(map);
  } catch (err) {
    console.error("Stats error:", err);
  }
}

function renderChart(map) {
  const ctx = document.getElementById("classChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Class I — High Risk", "Class II — Moderate", "Class III — Low Risk"],
      datasets: [{
        label: "Total Recalls",
        data: [map["Class I"] || 0, map["Class II"] || 0, map["Class III"] || 0],
        backgroundColor: [
          "rgba(255, 71, 87, 0.7)",
          "rgba(255, 179, 64, 0.7)",
          "rgba(0, 232, 122, 0.7)"
        ],
        borderColor: [
          "rgba(255, 71, 87, 1)",
          "rgba(255, 179, 64, 1)",
          "rgba(0, 232, 122, 1)"
        ],
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toLocaleString()} recalls`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#7a9690", font: { family: "DM Sans" } },
          grid:  { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "#7a9690", font: { family: "DM Sans" } },
          grid:  { color: "rgba(255,255,255,0.04)" }
        }
      }
    }
  });
}

async function fetchRecalls(search, classification, skip) {
  resultsEl.innerHTML = `<div class="state-msg">Loading recalls…</div>`;
  pagination.style.display = "none";

  try {
    const params = new URLSearchParams({ limit: LIMIT, skip });
    if (search)         params.set("search", search);
    if (classification) params.set("classification", classification);

    const res  = await fetch(`/api/recalls?${params}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsEl.innerHTML = `<div class="state-msg">No recalls found for that search.</div>`;
      return;
    }

    totalResults = data.meta?.results?.total || 0;
    renderResults(data.results);
    updatePagination();
  } catch (err) {
    console.error("Recall fetch error:", err);
    resultsEl.innerHTML = `<div class="state-msg">Failed to load data. Please try again.</div>`;
  }
}

function renderResults(recalls) {
  resultsEl.innerHTML = "";
  recalls.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "recall-card";
    card.innerHTML = `
      <div class="recall-card-header">
        <div class="recall-product">${sanitize(r.product_description || "Unknown Product")}</div>
        ${badgeHTML(r.classification)}
      </div>
      <div class="recall-reason">${sanitize(r.reason_for_recall || "No reason provided")}</div>
      <div class="recall-meta">
        <span>📅 ${formatDate(r.recall_initiation_date)}</span>
        <span>🏢 ${sanitize(r.recalling_firm || "—")}</span>
        <span>📍 ${sanitize((r.distribution_pattern || "").slice(0, 60))}${r.distribution_pattern?.length > 60 ? "…" : ""}</span>
      </div>
    `;
    card.addEventListener("click", () => openModal(r));
    resultsEl.appendChild(card);
  });
}

function openModal(r) {
  modalTitle.textContent = r.product_description || "Recall Details";
  modalBody.innerHTML = `
    ${field("Classification",         badgeHTML(r.classification), true)}
    ${field("Status",                 r.status || "—")}
    ${field("Recall Initiation Date", formatDate(r.recall_initiation_date))}
    ${field("Recalling Firm",         r.recalling_firm || "—")}
    
    ${field("Reason for Recall",      r.reason_for_recall || "—")}
    ${field("Product Description",    r.product_description || "—")}
    
    ${field("Distribution Pattern",   r.distribution_pattern || "—")}
    ${field("Quantity Recalled",      r.product_quantity || "—")}
    
    ${field("Recall Number",          r.recall_number || "—")}
    ${field("City / State",           [r.city, r.state].filter(Boolean).join(", ") || "—")}
  `;
  modalOverlay.classList.add("open");
}

function closeModalFn() { modalOverlay.classList.remove("open"); }

function field(label, val, raw = false) {
  return `<div class="modal-field">
    <label>${label}</label>
    <p>${raw ? val : sanitize(String(val))}</p>
  </div>`;
}

async function loadRecentSearches() {
  try {
    const res  = await fetch("/api/searches");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;

    recentWrap.style.display = "block";
    recentList.innerHTML = "";
    data.forEach(item => {
      const pill = document.createElement("button");
      pill.className = "recent-pill";
      pill.textContent = item.term;
      pill.addEventListener("click", () => {
        searchInput.value = item.term;
        handleSearch();
      });
      recentList.appendChild(pill);
    });
  } catch (err) {
    console.error("Recent searches error:", err);
  }
}

async function saveSearch(term) {
  try {
    await fetch("/api/searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term })
    });
  } catch (err) {
    console.error("Save search error:", err);
  }
}

function handleSearch() {
  const term = searchInput.value.trim();
  
  const cls  = classFilter.value;
  currentPage = 0;
  
  lastSearch  = term;
  lastClass   = cls;
  
  fetchRecalls(term, cls, 0);
  if (term) saveSearch(term).then(() => loadRecentSearches());
}

function handleClear() {
  searchInput.value = "";
  classFilter.value = "";
  
  currentPage = 0;
  lastSearch  = "";
  lastClass   = "";
  fetchRecalls("", "", 0);
}

function changePage(dir) {
  const newPage = currentPage + dir;
  if (newPage < 0) return;
  if (newPage * LIMIT >= totalResults) return;
  currentPage = newPage;
  fetchRecalls(lastSearch, lastClass, currentPage * LIMIT);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updatePagination() {
  const totalPages = Math.ceil(totalResults / LIMIT);
  if (totalPages <= 1) { pagination.style.display = "none"; return; }
  pagination.style.display = "flex";
  
  pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = (currentPage + 1) * LIMIT >= totalResults;
}

function sanitize(str) {
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

function formatDate(str) {
  if (!str) return "—";
  const y = str.slice(0, 4), m = str.slice(4, 6), d = str.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function badgeHTML(cls) {
  if (!cls) return "";
  const num = cls.replace("Class ", "").trim();
  const map = { "I": "badge-I", "II": "badge-II", "III": "badge-III" };
  return `<span class="badge ${map[num] || "badge-III"}">${sanitize(cls)}</span>`;
}