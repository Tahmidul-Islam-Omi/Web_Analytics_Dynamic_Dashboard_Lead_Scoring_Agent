(function () {
  try {
    // Get site ID from script tag - this must match the database site_id
    const scriptTag = document.currentScript;
    const siteId = scriptTag?.getAttribute("data-site-id");

    // Validate site ID exists
    if (!siteId) {
      console.error("❌ Analytics Error: Invalid or missing data-site-id attribute");
      return;
    }

    // Get session start time (first page load in this tab)
    if (!sessionStorage.getItem("sessionStart")) {
      sessionStorage.setItem("sessionStart", Date.now());
    }
    const sessionStart = parseInt(sessionStorage.getItem("sessionStart"), 10);

    // Calculate session duration so far (in seconds)
    const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);

    // Detect browser and OS
    const userAgent = navigator.userAgent;
    let browser = "Unknown";
    let os = "Unknown";

    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
      browser = "Chrome";
    } else if (userAgent.indexOf("Firefox") > -1) {
      browser = "Firefox";
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      browser = "Safari";
    } else if (userAgent.indexOf("Edg") > -1) {
      browser = "Edge";
    }

    if (userAgent.indexOf("Win") > -1) {
      os = "Windows";
    } else if (userAgent.indexOf("Mac") > -1) {
      os = "MacOS";
    } else if (userAgent.indexOf("Linux") > -1) {
      os = "Linux";
    } else if (/Android/i.test(userAgent)) {
      os = "Android";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      os = "iOS";
    }

    // Prepare tracking data
    const data = {
      siteId,
      url: window.location.href,
      pageViews: 1, // Always send 1, backend increments
      referrer: document.referrer,
      userAgent,
      browser,
      os,
      sessionStart: new Date(sessionStart).toISOString(),
      sessionDuration, // in seconds
      timestamp: new Date().toISOString(),
    };

    // Send to backend
    fetch("http://127.0.0.1:8000/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch((err) => {
      console.warn("Tracking request failed:", err);
    });

    // Debug log
    console.log("Page visit tracked:", data);
  } catch (error) {
    console.error("Error in tracking script:", error);
  }
})();
