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
        <div id="applicant-count">
          <p><b>Applicants:</b> Loading...</p>
        </div>
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
  const el = document.getElementById("linkedin-helper");
  if (!el) createBox();

  const applicantsEl = document.getElementById("applicant-count");
  if (applicantsEl) applicantsEl.textContent = "Fetching...";

  try {
    const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-65`;
    const res = await fetch(apiUrl, {
      credentials: "include",
      headers: {
        "csrf-token": getCsrfToken(),
        "x-restli-protocol-version": "2.0.0"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Extract values safely
    const payload = data?.data ?? data;

    const applicants =
      payload?.applies ??
      payload?.appliesCount ??
      payload?.elements?.[0]?.applies ??
      "N/A";

    const views =
      payload?.views ??
      payload?.elements?.[0]?.views ??
      "N/A";

    // Find company info (multiple shapes in responses)
    const included = data?.included ?? payload?.included ?? [];
    // company object may live under companyDetails.companyResolutionResult
    let companyObj =
      payload?.companyDetails?.companyResolutionResult ||
      payload?.companyDetails?.['com.linkedin.voyager.deco.jobs.web.shared.WebJobPostingCompany']?.companyResolutionResult ||
      // or in the included array as a Company
      included.find(item => {
        if (!item) return false;
        const t = item.$type || "";
        return t.includes("voyaGer.organization.Company") || t.includes("Company") || item?.name;
      }) || null;

    // followers may be in an included FollowingInfo entry
    const followingInfo = included.find(i => (i?.$type || "").includes("FollowingInfo")) || companyObj?.followingInfo || null;

    const companySize = companyObj?.staffCount ??
      (companyObj?.staffCountRange ? `${companyObj.staffCountRange.start || "?"} - ${companyObj.staffCountRange.end || "?"}` : "N/A");

    const followers = followingInfo?.followerCount ?? "N/A";

    const industry = (companyObj?.industries && companyObj.industries.length)
      ? companyObj.industries.join(", ")
      : (companyObj?.formattedIndustries && companyObj.formattedIndustries.length)
        ? companyObj.formattedIndustries.join(", ")
        : "N/A";

    const tech = (companyObj?.specialities && companyObj.specialities.length)
      ? companyObj.specialities.join(", ")
      : "N/A";
    
    // Update UI (add company details below applicants & views)
    applicantsEl.innerHTML = `
      <p><b>Applicants:</b> ${applicants}</p>
      <p><b>Views:</b> ${views}</p>
      <hr style="margin:6px 0;border:none;border-top:1px solid rgba(255,255,255,0.08)"/>
      <p><b>Company size:</b> ${companySize}</p>
      <p><b>Followers:</b> ${followers}</p>
      <p><b>Industry:</b> ${industry}</p>
    `;
  } catch (err) {
    console.error("LinkedinHelperByFaizan: Fetch error", err);
    if (applicantsEl) applicantsEl.textContent = "Error";
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
