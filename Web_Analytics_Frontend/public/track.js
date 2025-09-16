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

    // Cookie consent management (per session)
    const CONSENT_KEY = `analytics_consent_session_${siteId}`;

    function hasConsentForSession() {
      return sessionStorage.getItem(CONSENT_KEY) === "true";
    }

    function setConsentForSession(granted) {
      sessionStorage.setItem(CONSENT_KEY, granted.toString());
      if (granted) {
        initializeTracking();
      }
    }

    function createConsentBanner() {
      // Check if banner already exists
      if (document.getElementById("analytics-consent-banner")) {
        return;
      }

      const banner = document.createElement("div");
      banner.id = "analytics-consent-banner";
      banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #2c3e50;
        color: white;
        padding: 16px 20px;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      `;

      banner.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div style="flex: 1; min-width: 300px;">
            <strong>🍪 Cookie Notice</strong><br>
            We use analytics cookies to understand how you interact with our website and improve your experience.
          </div>
          <div style="display: flex; gap: 12px; flex-shrink: 0;">
            <button id="consent-accept" style="
              background: #27ae60;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: background 0.2s;
            ">Accept</button>
            <button id="consent-decline" style="
              background: transparent;
              color: white;
              border: 1px solid #7f8c8d;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            ">Decline</button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      // Add hover effects
      const acceptBtn = banner.querySelector("#consent-accept");
      const declineBtn = banner.querySelector("#consent-decline");

      acceptBtn.addEventListener("mouseenter", () => {
        acceptBtn.style.background = "#229954";
      });
      acceptBtn.addEventListener("mouseleave", () => {
        acceptBtn.style.background = "#27ae60";
      });

      declineBtn.addEventListener("mouseenter", () => {
        declineBtn.style.background = "#7f8c8d";
        declineBtn.style.color = "white";
      });
      declineBtn.addEventListener("mouseleave", () => {
        declineBtn.style.background = "transparent";
        declineBtn.style.color = "white";
      });

      // Handle consent choices
      acceptBtn.addEventListener("click", () => {
        setConsentForSession(true);
        banner.remove();
      });

      declineBtn.addEventListener("click", () => {
        setConsentForSession(false);
        banner.remove();
      });
    }

    function initializeTracking() {
      // Generate or get persistent user ID (stored in localStorage for long-term tracking)
      const USER_ID_KEY = `analytics_user_${siteId}`;
      let userId = localStorage.getItem(USER_ID_KEY);
      let isNewUser = false;

      if (!userId) {
        // Generate new user ID (UUID-like format)
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        localStorage.setItem(USER_ID_KEY, userId);
        isNewUser = true;
        console.log("New user identified:", userId);
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

      // Handle user registration and session creation sequentially
      const handleUserAndSession = async () => {
        try {
          // Always try to register/update user (handles both new and returning users)
          let userExists = false;

          if (isNewUser) {
            // Try to create new user
            const userData = {
              siteId,
              userId,
              browser,
              os,
              userAgent
            };

            const userResponse = await fetch("https://web-analytics-agent.onrender.com/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData),
              keepalive: true,
            });

            if (userResponse.ok) {
              console.log("✅ User registered successfully");
              userExists = true;
            } else {
              console.warn("User registration failed:", await userResponse.text());
            }
          } else {
            // Try to update existing user
            const updateData = {
              siteId,
              userId,
              action: "update_last_seen"
            };

            const updateResponse = await fetch("https://web-analytics-agent.onrender.com/api/users", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData),
              keepalive: true,
            });

            if (updateResponse.ok) {
              console.log("✅ User last_seen updated");
              userExists = true;
            } else {
              console.warn("User update failed, trying to create new user...");

              // User doesn't exist in DB, create them
              const userData = {
                siteId,
                userId,
                browser,
                os,
                userAgent
              };

              const createResponse = await fetch("https://web-analytics-agent.onrender.com/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
                keepalive: true,
              });

              if (createResponse.ok) {
                console.log("✅ User created after failed update");
                userExists = true;
              } else {
                console.warn("Failed to create user after update failure:", await createResponse.text());
              }
            }
          }

          // Generate or get session ID
          let sessionId = sessionStorage.getItem("sessionId");
          if (!sessionId) {
            // Generate new session ID (UUID-like format)
            sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              const r = Math.random() * 16 | 0;
              const v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
            sessionStorage.setItem("sessionId", sessionId);

            // Start new session (now includes userId) - wait for user to be created first
            const sessionData = {
              siteId,
              sessionId,
              userId,
              browser,
              os,
              userAgent,
              action: "start"
            };

            const sessionResponse = await fetch("https://web-analytics-agent.onrender.com/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(sessionData),
              keepalive: true,
            });

            if (!sessionResponse.ok) {
              console.warn("Session start tracking failed:", await sessionResponse.text());
            } else {
              console.log("✅ New session started:", sessionId, "for user:", userId);
            }
          }
        } catch (err) {
          console.warn("Error in user/session handling:", err);
        }
      };

      // Execute user and session handling
      handleUserAndSession();

      // Page tracking functionality
      const trackPageView = async (url, title, referrer = null) => {
        try {
          const sessionId = sessionStorage.getItem("sessionId");
          if (!sessionId) {
            console.warn("No session ID available for page tracking");
            return;
          }

          const pageData = {
            siteId,
            sessionId,
            userId,
            url,
            title,
            referrer
          };

          const response = await fetch("https://web-analytics-agent.onrender.com/api/page-views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pageData),
            keepalive: true,
          });

          if (response.ok) {
            console.log("✅ Page view tracked:", url);
          } else {
            console.warn("Page view tracking failed:", await response.text());
          }
        } catch (err) {
          console.warn("Error tracking page view:", err);
        }
      };

      // Get current page info
      const getCurrentPageInfo = () => {
        const fullUrl = window.location.href;
        const hash = window.location.hash;

        // Determine page title based on hash
        let pageTitle = document.title;
        if (hash) {
          const hashValue = hash.substring(1); // Remove the # symbol
          if (hashValue) {
            // Capitalize first letter and replace hyphens/underscores with spaces
            pageTitle = hashValue.charAt(0).toUpperCase() + hashValue.slice(1).replace(/[-_]/g, ' ');
          } else {
            pageTitle = "Home Page";
          }
        } else {
          pageTitle = "Home Page";
        }

        return {
          url: fullUrl,
          title: pageTitle
        };
      };

      // Track initial page view
      const trackInitialPage = () => {
        const pageInfo = getCurrentPageInfo();
        const referrer = document.referrer || null;
        trackPageView(pageInfo.url, pageInfo.title, referrer);
      };

      // Track page changes (for SPA navigation)
      const setupPageChangeTracking = () => {
        let currentUrl = window.location.href;

        // Track hash changes
        window.addEventListener("hashchange", () => {
          const newUrl = window.location.href;
          if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            const pageInfo = getCurrentPageInfo();
            trackPageView(pageInfo.url, pageInfo.title);
          }
        });

        // Track programmatic navigation (pushState/replaceState)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
          originalPushState.apply(this, args);
          setTimeout(() => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
              currentUrl = newUrl;
              const pageInfo = getCurrentPageInfo();
              trackPageView(pageInfo.url, pageInfo.title);
            }
          }, 0);
        };

        history.replaceState = function (...args) {
          originalReplaceState.apply(this, args);
          setTimeout(() => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
              currentUrl = newUrl;
              const pageInfo = getCurrentPageInfo();
              trackPageView(pageInfo.url, pageInfo.title);
            }
          }, 0);
        };

        // Track back/forward navigation
        window.addEventListener("popstate", () => {
          setTimeout(() => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
              currentUrl = newUrl;
              const pageInfo = getCurrentPageInfo();
              trackPageView(pageInfo.url, pageInfo.title);
            }
          }, 0);
        });
      };

      // Click tracking functionality
      const trackClickEvent = async (element, x, y) => {
        try {
          const sessionId = sessionStorage.getItem("sessionId");
          if (!sessionId) {
            console.warn("No session ID available for click tracking");
            return;
          }

          // Get current page info for page_id lookup
          const pageInfo = getCurrentPageInfo();

          // Generate CSS selector for the clicked element
          const elementSelector = generateCSSSelector(element);

          // Get visible text content
          const elementText = getElementText(element);

          const clickData = {
            siteId,
            sessionId,
            userId,
            url: pageInfo.url,
            elementSelector,
            elementText,
            xCoord: x,
            yCoord: y
          };

          const response = await fetch("https://web-analytics-agent.onrender.com/api/click-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clickData),
            keepalive: true,
          });

          if (response.ok) {
            console.log("✅ Click event tracked:", elementSelector);
          } else {
            console.warn("Click event tracking failed:", await response.text());
          }
        } catch (err) {
          console.warn("Error tracking click event:", err);
        }
      };

      // Generate CSS selector for an element
      const generateCSSSelector = (element) => {
        if (!element || element === document) return "document";

        // If element has an ID, use it
        if (element.id) {
          return `#${element.id}`;
        }

        // Build selector path
        const path = [];
        let current = element;

        while (current && current !== document.body) {
          let selector = current.tagName.toLowerCase();

          // Add class names if available
          if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\s+/).filter(cls => cls.length > 0);
            if (classes.length > 0) {
              selector += '.' + classes.join('.');
            }
          }

          // Add nth-child if there are siblings with same tag
          const siblings = Array.from(current.parentNode?.children || []);
          const sameTagSiblings = siblings.filter(sibling =>
            sibling.tagName === current.tagName
          );

          if (sameTagSiblings.length > 1) {
            const index = sameTagSiblings.indexOf(current) + 1;
            selector += `:nth-child(${index})`;
          }

          path.unshift(selector);
          current = current.parentNode;
        }

        return path.join(' > ');
      };

      // Get meaningful text content from element
      const getElementText = (element) => {
        if (!element) return null;

        // For input elements, get placeholder or value
        if (element.tagName === 'INPUT') {
          return element.placeholder || element.value || element.type;
        }

        // For buttons, get text content
        if (element.tagName === 'BUTTON') {
          return element.textContent?.trim() || element.innerText?.trim();
        }

        // For links, get text content
        if (element.tagName === 'A') {
          return element.textContent?.trim() || element.innerText?.trim() || element.href;
        }

        // For images, get alt text
        if (element.tagName === 'IMG') {
          return element.alt || element.src;
        }

        // For other elements, get text content (limited to 100 chars)
        const text = element.textContent?.trim() || element.innerText?.trim();
        return text ? text.substring(0, 100) : null;
      };

      // Setup click event listeners
      const setupClickTracking = () => {
        // Track all clicks on the document
        document.addEventListener('click', (event) => {
          // Get click coordinates relative to viewport
          const x = event.clientX;
          const y = event.clientY;

          // Track the click
          trackClickEvent(event.target, x, y);
        }, true); // Use capture phase to catch all clicks

        console.log("✅ Click tracking initialized");
      };

      // Initialize page tracking after a short delay to ensure session is created
      setTimeout(() => {
        trackInitialPage();
        setupPageChangeTracking();
        setupClickTracking();
      }, 1000);

      // Session ending with multiple strategies
      let sessionEnded = false;

      const endSession = () => {
        if (sessionEnded) return; // Prevent multiple calls
        sessionEnded = true;

        const currentTime = Date.now();
        const sessionStart = parseInt(sessionStorage.getItem("sessionStart"), 10);
        const finalDuration = Math.floor((currentTime - sessionStart) / 1000);

        const endData = {
          siteId,
          sessionId: sessionStorage.getItem("sessionId"),
          userId,
          sessionDuration: finalDuration,
          action: "end"
        };

        console.log("🔄 Ending session:", endData);

        // Strategy 1: sendBeacon (most reliable for page unload)
        if (navigator.sendBeacon) {
          const success = navigator.sendBeacon(
            "https://web-analytics-agent.onrender.com/api/sessions",
            JSON.stringify(endData)
          );
          if (success) {
            console.log("✅ Session ended via sendBeacon");
            return;
          }
        }

        // Strategy 2: fetch with keepalive (fallback)
        fetch("https://web-analytics-agent.onrender.com/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(endData),
          keepalive: true,
        }).then(() => {
          console.log("✅ Session ended via fetch");
        }).catch((err) => {
          console.warn("❌ Session end tracking failed:", err);
        });
      };

      // Strategy 3: Periodic session updates (backup)
      const updateSessionPeriodically = () => {
        if (sessionEnded) return;

        const currentTime = Date.now();
        const sessionStart = parseInt(sessionStorage.getItem("sessionStart"), 10);
        const currentDuration = Math.floor((currentTime - sessionStart) / 1000);

        // Update session duration every 30 seconds
        const updateData = {
          siteId,
          sessionId: sessionStorage.getItem("sessionId"),
          userId,
          sessionDuration: currentDuration,
          action: "update"
        };

        fetch("https://web-analytics-agent.onrender.com/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
          keepalive: true,
        }).catch((err) => {
          console.warn("Session update failed:", err);
        });
      };

      // Update session every 30 seconds as backup
      const sessionUpdateInterval = setInterval(updateSessionPeriodically, 30000);

      // Handle tab visibility changes
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          endSessionWithCleanup();
        }
      });

      // Handle page focus loss (additional safety)
      window.addEventListener("blur", () => {
        setTimeout(() => {
          if (document.visibilityState === "hidden") {
            endSessionWithCleanup();
          }
        }, 1000);
      });

      // Wrap endSession to include cleanup
      const originalEndSession = endSession;
      const endSessionWithCleanup = () => {
        clearInterval(sessionUpdateInterval);
        originalEndSession();
      };

      // Multiple event listeners for different scenarios
      window.addEventListener("beforeunload", endSessionWithCleanup);
      window.addEventListener("unload", endSessionWithCleanup);
      window.addEventListener("pagehide", endSessionWithCleanup);
    }

    // Check consent status for this session
    if (!hasConsentForSession()) {
      // No consent for this session - show banner
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createConsentBanner);
      } else {
        createConsentBanner();
      }
      return; // Don't initialize tracking yet
    }

    // User has given consent for this session, initialize tracking
    initializeTracking();

  } catch (error) {
    console.error("Error in tracking script:", error);
  }
})();
