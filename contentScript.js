(() => {
  "use strict";
  const DEBUG = false;
  const log = (...a) => DEBUG && console.log("[LinkedinHelperByFaizan]", ...a);

  function createDisplay() {
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
    const match = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
    return match ? match[1] : null;
  }

  async function fetchApplicantCount(jobId) {
    const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}`;
    const countEl = document.getElementById("applicant-count");
    if (!countEl) return;

    try {
      const res = await fetch(apiUrl, { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();

      const applies = data?.data?.applies ?? "N/A";
      countEl.textContent = applies;
      log("Applicant count:", applies);
    } catch (err) {
      console.error("LinkedinHelperByFaizan error:", err);
      countEl.textContent = "Error";
    }
  }

  function init() {
    createDisplay();
    const jobId = extractJobId();
    if (jobId) {
      fetchApplicantCount(jobId);
    } else {
      const el = document.getElementById("applicant-count");
      if (el) el.textContent = "No job ID found";
    }
  }

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.pathname.includes("/jobs/view/")) {
        init();
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });

  window.addEventListener("load", init);
})();
