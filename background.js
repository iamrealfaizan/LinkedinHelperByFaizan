chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes("/voyager/api/jobs/jobPostings/")) {
      chrome.tabs.sendMessage(details.tabId, { url: details.url });
    }
  },
  { urls: ["https://www.linkedin.com/voyager/api/jobs/jobPostings/*"] }
);
