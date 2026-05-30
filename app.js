const storageKey = "naukriAccessState";
const defaultUpi = "";

const starterJobs = [
  {
    id: crypto.randomUUID(),
    title: "Field Sales Executive",
    company: "Himachal Traders",
    city: "Chandigarh",
    salary: "Rs 18,000/month",
    category: "Sales",
    qualification: "12th pass",
    details: "Visit local retailers, collect orders, and maintain daily sales reports.",
    source: "Admin",
    applyUrl: "https://example.com/apply/field-sales"
  },
  {
    id: crypto.randomUUID(),
    title: "Delivery Partner",
    company: "QuickKart Logistics",
    city: "Mohali",
    salary: "Rs 22,000/month",
    category: "Delivery",
    qualification: "Bike and license required",
    details: "Deliver parcels within assigned route. Fuel allowance and weekly payout available.",
    source: "Admin",
    applyUrl: "https://example.com/apply/delivery"
  },
  {
    id: crypto.randomUUID(),
    title: "Back Office Assistant",
    company: "Bright HR Services",
    city: "Panchkula",
    salary: "Rs 15,000/month",
    category: "Office",
    qualification: "Graduate preferred",
    details: "Handle data entry, calls, interview scheduling, and document follow-up.",
    source: "Admin",
    applyUrl: "https://example.com/apply/back-office"
  },
  {
    id: crypto.randomUUID(),
    title: "Mobile Repair Technician",
    company: "FixPro Care",
    city: "Zirakpur",
    salary: "Rs 25,000/month",
    category: "Technical",
    qualification: "1 year experience",
    details: "Diagnose phones, replace screens, manage spare parts, and update service records.",
    source: "Admin",
    applyUrl: "https://example.com/apply/mobile-repair"
  }
];

const trustedFeedJobs = [
  {
    sourceId: "naukri-relationship-manager",
    title: "Relationship Manager",
    company: "Axis Banking Partner",
    city: "Delhi NCR",
    salary: "Rs 32,000/month",
    category: "Sales",
    qualification: "Graduate",
    details: "Manage customer leads, explain products, and coordinate branch appointments.",
    source: "Naukri",
    applyUrl: "https://www.naukri.com/"
  },
  {
    sourceId: "linkedin-support-associate",
    title: "Customer Support Associate",
    company: "CloudDesk India",
    city: "Remote",
    salary: "Rs 28,000/month",
    category: "Office",
    qualification: "English communication",
    details: "Handle chat support, update tickets, and coordinate with operations teams.",
    source: "LinkedIn",
    applyUrl: "https://www.linkedin.com/jobs/"
  },
  {
    sourceId: "google-jobs-electrician",
    title: "Electrician",
    company: "Metro Facility Services",
    city: "Gurugram",
    salary: "Rs 24,000/month",
    category: "Technical",
    qualification: "ITI preferred",
    details: "Maintain electrical systems, attend service calls, and update daily job cards.",
    source: "Google Jobs",
    applyUrl: "https://www.google.com/search?q=electrician+jobs"
  }
];

const state = loadState();
const jobList = document.querySelector("#jobList");
const accessTitle = document.querySelector("#accessTitle");
const accessCopy = document.querySelector("#accessCopy");
const payButton = document.querySelector("#payButton");
const paymentDialog = document.querySelector("#paymentDialog");
const verifyPayment = document.querySelector("#verifyPayment");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sourceFilter = document.querySelector("#sourceFilter");
const syncButton = document.querySelector("#syncButton");
const syncStatus = document.querySelector("#syncStatus");
const syncMeta = document.querySelector("#syncMeta");
const adminToggle = document.querySelector("#adminToggle");
const adminPanel = document.querySelector("#adminPanel");
const jobForm = document.querySelector("#jobForm");
const settingsForm = document.querySelector("#settingsForm");
const upiInput = document.querySelector("#upiInput");
const admobInput = document.querySelector("#admobInput");
const refreshInput = document.querySelector("#refreshInput");
const payeeUpi = document.querySelector("#payeeUpi");
const upiIntent = document.querySelector("#upiIntent");
const paymentStatus = document.querySelector("#paymentStatus");
const navItems = [...document.querySelectorAll(".nav-item")];

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return {
      paid: false,
      activeTab: "jobs",
      savedJobs: [],
      jobs: starterJobs,
      payment: null,
      settings: {
        upi: defaultUpi,
        admob: "",
        refresh: "hourly",
        connectors: ["Naukri", "LinkedIn", "Google Jobs"]
      },
      lastSync: null
    };
  }

  const parsed = JSON.parse(saved);
  parsed.settings ??= { upi: "", admob: "", connectors: ["Naukri", "LinkedIn", "Google Jobs"] };
  if (!parsed.settings.upi) {
    parsed.settings.upi = defaultUpi;
  }
  parsed.settings.refresh ??= "hourly";
  parsed.lastSync ??= null;
  parsed.jobs = parsed.jobs.map((job) => ({
    source: "Admin",
    applyUrl: "https://example.com/apply",
    ...job
  }));
  return parsed;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setPaid() {
  state.paid = true;
  state.payment = {
    amount: 100,
    status: "Paid",
    reference: `DEMO-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleString()
  };
  saveState();
  render();
}

function renderAccess() {
  payeeUpi.textContent = state.settings.upi ? maskUpi(state.settings.upi) : "Add UPI in admin";
  upiIntent.href = buildUpiLink();
  paymentStatus.textContent = state.settings.upi
    ? "Gateway confirmation unlocks listings automatically."
    : "Add your UPI in admin setup before taking live payments.";

  if (state.paid) {
    accessTitle.textContent = "Listings unlocked";
    accessCopy.textContent = `Payment verified. Receipt ${state.payment.reference}.`;
    payButton.textContent = "Receipt";
    payButton.classList.add("ghost-button");
    return;
  }

  accessTitle.textContent = "Listings are locked";
  accessCopy.textContent = "Complete the Rs 100 payment to view available jobs.";
  payButton.textContent = "Pay Rs 100";
  payButton.classList.remove("ghost-button");
}

function getVisibleJobs() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const source = sourceFilter.value;

  return state.jobs.filter((job) => {
    const matchesCategory = category === "all" || job.category === category;
    const matchesSource = source === "all" || job.source === source;
    const haystack = `${job.title} ${job.company} ${job.city} ${job.qualification}`.toLowerCase();
    return matchesCategory && matchesSource && haystack.includes(term);
  });
}

function renderJobs() {
  let jobs = getVisibleJobs();
  if (state.activeTab === "saved") {
    jobs = jobs.filter((job) => state.savedJobs.includes(job.id));
  }

  if (state.activeTab === "payments") {
    renderPaymentHistory();
    return;
  }

  if (!jobs.length) {
    jobList.innerHTML = `<div class="empty-state">No jobs found here yet.</div>`;
    return;
  }

  jobList.innerHTML = jobs.map((job) => {
    const saved = state.savedJobs.includes(job.id);
    const details = state.paid
      ? `<p>${escapeHtml(job.details)}</p><a class="apply-link" href="${escapeHtml(job.applyUrl)}" target="_blank" rel="noopener">Apply now</a>`
      : `<p class="lock-note">Pay Rs 100 to view full details and apply.</p>`;

    return `
      <article class="job-card ${state.paid ? "" : "locked"}">
        <header>
          <div>
            <h3>${escapeHtml(job.title)}</h3>
            <p>${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
          </div>
          <button class="save-button" type="button" data-save="${job.id}" aria-label="Save job">${saved ? "★" : "☆"}</button>
        </header>
        <div class="pill-row">
          <span class="pill">${escapeHtml(job.salary)}</span>
          <span class="pill">${escapeHtml(job.category)}</span>
          <span class="pill">${escapeHtml(job.qualification)}</span>
          <span class="pill source-pill">${escapeHtml(job.source)}</span>
        </div>
        ${details}
      </article>
    `;
  }).join("");
}

function renderPaymentHistory() {
  if (!state.payment) {
    jobList.innerHTML = `<div class="empty-state">No payment found. Pay Rs 100 to unlock job listings.</div>`;
    return;
  }

  jobList.innerHTML = `
    <article class="job-card">
      <header>
        <div>
          <h3>Access payment</h3>
          <p>${state.payment.date}</p>
        </div>
        <span class="pill">${state.payment.status}</span>
      </header>
      <p>Amount: Rs ${state.payment.amount}</p>
      <p>Reference: ${state.payment.reference}</p>
    </article>
  `;
}

function renderNav() {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === state.activeTab);
  });
}

function renderSync() {
  syncStatus.textContent = state.lastSync
    ? `Last sync: ${state.lastSync}`
    : "Ready to sync trusted jobs";
  syncMeta.textContent = `${state.settings.connectors.length} trusted sources · ${formatRefresh(state.settings.refresh)}`;

  upiInput.value = state.settings.upi;
  admobInput.value = state.settings.admob;
  refreshInput.value = state.settings.refresh;
  document.querySelectorAll("input[name='connector']").forEach((input) => {
    input.checked = state.settings.connectors.includes(input.value);
  });
}

function render() {
  renderAccess();
  renderSync();
  renderNav();
  renderJobs();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

function maskUpi(upi) {
  const [name, handle] = upi.split("@");
  if (!name || !handle) return "Saved";
  return `${name.slice(0, 2)}***@${handle}`;
}

function buildUpiLink() {
  if (!state.settings.upi) return "#";
  const params = new URLSearchParams({
    pa: state.settings.upi,
    pn: "Naukri Access",
    am: "100",
    cu: "INR",
    tn: "Job listing access"
  });
  return `upi://pay?${params.toString()}`;
}

function formatRefresh(refresh) {
  const labels = {
    hourly: "hourly auto updates",
    daily: "daily auto updates",
    manual: "manual sync"
  };
  return labels[refresh] || labels.hourly;
}

function syncTrustedJobs() {
  const enabled = state.settings.connectors;
  const incoming = trustedFeedJobs.filter((job) => enabled.includes(job.source));
  let added = 0;

  incoming.forEach((feedJob) => {
    const exists = state.jobs.some((job) => job.sourceId === feedJob.sourceId);
    if (!exists) {
      state.jobs.unshift({
        id: crypto.randomUUID(),
        ...feedJob
      });
      added += 1;
    }
  });

  state.lastSync = `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${added} new`;
  saveState();
  render();
}

function autoSyncTrustedJobs() {
  if (state.settings.refresh === "manual") return;
  syncTrustedJobs();
}

payButton.addEventListener("click", () => {
  paymentDialog.showModal();
});

verifyPayment.addEventListener("click", (event) => {
  event.preventDefault();
  setPaid();
  paymentDialog.close();
});

searchInput.addEventListener("input", renderJobs);
categoryFilter.addEventListener("change", renderJobs);
sourceFilter.addEventListener("change", renderJobs);
syncButton.addEventListener("click", syncTrustedJobs);

jobList.addEventListener("click", (event) => {
  const saveId = event.target.dataset.save;
  if (!saveId) return;

  if (state.savedJobs.includes(saveId)) {
    state.savedJobs = state.savedJobs.filter((id) => id !== saveId);
  } else {
    state.savedJobs.push(saveId);
  }

  saveState();
  renderJobs();
});

adminToggle.addEventListener("click", () => {
  adminPanel.hidden = !adminPanel.hidden;
  if (!adminPanel.hidden) {
    adminPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

jobForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(jobForm);
  const job = Object.fromEntries(data.entries());
  state.jobs.unshift({
    id: crypto.randomUUID(),
    source: "Admin",
    applyUrl: job.applyUrl || "https://example.com/apply",
    ...job
  });
  saveState();
  jobForm.reset();
  state.activeTab = "jobs";
  render();
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const connectors = [...document.querySelectorAll("input[name='connector']:checked")].map((input) => input.value);
  state.settings = {
    upi: upiInput.value.trim(),
    admob: admobInput.value.trim(),
    refresh: refreshInput.value,
    connectors
  };
  saveState();
  render();
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    state.activeTab = item.dataset.tab;
    saveState();
    render();
  });
});

render();
autoSyncTrustedJobs();
