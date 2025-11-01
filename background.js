chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fetchApplicants" && request.jobId) {
    try {
      const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${request.jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebFullJobPosting-65`;
      const res = await fetch(apiUrl, { credentials: "include" });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const applicants = data?.data?.applies ?? "N/A";
      sendResponse({ applicants });
    } catch (err) {
      console.error("LinkedinHelperByFaizan: Fetch error", err);
      sendResponse({ applicants: "Error" });
    }
  }
  return true;
});
