(function () {
    try {
      // Get the script tag that loaded this script to read the data-site-id attribute
      const scriptTag = document.currentScript;
      const siteId = scriptTag?.getAttribute("data-site-id") || "default-site";
  
      // Prepare tracking data
      const data = {
        siteId,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
  
      // Send data to backend tracking API (hardcoded for local testing)
      fetch("http://127.0.0.1:8000/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      }).catch((err) => {
        // You can log error here if you want
        console.warn("Tracking request failed:", err);
      });
  
      // Log to console for debug
      console.log("Page visit tracked:", data);
    } catch (error) {
      console.error("Error in tracking script:", error);
    }
  })();
  