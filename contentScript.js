(() => {
  const DEBUG = false;
  const log = (...a) => DEBUG && console.log("[LinkedinHelperByFaizan]", ...a);

  function createBox() {
    let el = document.getElementById("linkedin-helper");
    if (el) return el;

    el = document.createElement("div");
    el.id = "linkedin-helper";
    el.innerHTML = `
      <div class="helper-box">
        <h4>LinkedIn Helper by Faizan</h4>
        <p><b>Applicants:</b> <span id="applicant-count">Loading...</span></p>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  function extractJobId() {
    const url = new URL(window.location.href);
    const pathMatch = url.pathname.match(/\/jobs\/view\/(\d+)/);
    if (pathMatch) return pathMatch[1];
    const currentJobId = url.searchParams.get("currentJobId");
    return currentJobId || null;
  }

async function fetchApplicants(jobId) {
  const el = document.getElementById("applicant-count");
  if (el) el.textContent = "Fetching...";

  try {
    const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-65&topN=1&topNRequestedFlavors=List(TOP_APPLICANT,IN_NETWORK,COMPANY_RECRUIT,SCHOOL_RECRUIT,HIDDEN_GEM,ACTIVELY_HIRING_COMPANY)`;

    const res = await fetch(apiUrl, {
      credentials: "include",
      headers: {
        "csrf-token": getCsrfToken(),
        "x-restli-protocol-version": "2.0.0"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Handle both cases: nested and top-level "applies"
    const applicants =
      data?.data?.applies ??
      data?.applies ??
      data?.elements?.[0]?.applies ??
      "N/A";

    el.textContent = applicants;
  } catch (err) {
    console.error("LinkedinHelperByFaizan: Fetch error", err);
    if (el) el.textContent = "Error";
  }
}


  // Helper: get CSRF token from LinkedIn cookies
  function getCsrfToken() {
    const match = document.cookie.match(/JSESSIONID="?(.*?)"?;/);
    return match ? match[1] : "";
  }

  function init() {
    const jobId = extractJobId();
    if (!jobId) return;
    createBox();
    fetchApplicants(jobId);
  }

  // Detect SPA navigation
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.href.includes("/jobs/")) init();
    }
  });
  observer.observe(document, { childList: true, subtree: true });

  window.addEventListener("load", init);
})();
