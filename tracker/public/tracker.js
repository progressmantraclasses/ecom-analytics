/*!
 * CausalFunnel Analytics Tracker v1.0.0
 * Standalone UMD tracking script
 * (c) 2024 CausalFunnel
 */
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CausalTracker = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  var CF_SESSION_KEY = 'cf_session_id';
  var CF_SESSION_TS_KEY = 'cf_session_ts';
  var SESSION_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes
  var BATCH_FLUSH_INTERVAL_MS = 2000;
  var BATCH_MAX_SIZE = 10;
  var MAX_RETRIES = 3;
  var ENDPOINT = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('data-endpoint');
      if (src) return src;
    }
    return 'https://apis.codespirit.in/api/events';
  })();

  // ============================================================
  // UUID v4 GENERATOR
  // ============================================================
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ============================================================
  // SESSION MANAGEMENT
  // ============================================================
  function getOrCreateSession() {
    try {
      var stored = localStorage.getItem(CF_SESSION_KEY);
      var lastTs = parseInt(localStorage.getItem(CF_SESSION_TS_KEY) || '0', 10);
      var now = Date.now();

      if (stored && now - lastTs < SESSION_INACTIVITY_MS) {
        localStorage.setItem(CF_SESSION_TS_KEY, String(now));
        return stored;
      }

      // Create new session
      var newId = generateUUID();
      localStorage.setItem(CF_SESSION_KEY, newId);
      localStorage.setItem(CF_SESSION_TS_KEY, String(now));
      return newId;
    } catch (e) {
      return generateUUID();
    }
  }

  function refreshSessionTimer() {
    try {
      localStorage.setItem(CF_SESSION_TS_KEY, String(Date.now()));
    } catch (e) {
      // noop
    }
  }

  // ============================================================
  // EVENT QUEUE + BATCHING
  // ============================================================
  var eventQueue = [];
  var flushTimer = null;

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flushQueue();
    }, BATCH_FLUSH_INTERVAL_MS);
  }

  function flushQueue() {
    if (eventQueue.length === 0) return;
    var batch = eventQueue.splice(0, eventQueue.length);
    sendBatch(batch, 0);
  }

  // ============================================================
  // NETWORK — FETCH WITH RETRY + EXPONENTIAL BACKOFF
  // ============================================================
  function sendBatch(events, attempt) {
    try {
      var payload = JSON.stringify({ events: events });

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      })
        .then(function (res) {
          if (!res.ok && attempt < MAX_RETRIES) {
            scheduleRetry(events, attempt + 1);
          } else {
            notifyListeners(events);
          }
        })
        .catch(function () {
          if (attempt < MAX_RETRIES) {
            scheduleRetry(events, attempt + 1);
          }
        });
    } catch (e) {
      // Never throw — silently fail
    }
  }

  function scheduleRetry(events, attempt) {
    var delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
    setTimeout(function () {
      sendBatch(events, attempt);
    }, delay);
  }

  // ============================================================
  // EVENT LISTENERS (for live demo console)
  // ============================================================
  var eventListeners = [];

  function notifyListeners(events) {
    for (var i = 0; i < eventListeners.length; i++) {
      try {
        eventListeners[i](events);
      } catch (e) {
        // noop
      }
    }
  }

  // ============================================================
  // CORE TRACK FUNCTION
  // ============================================================
  function track(eventType, extraData) {
    try {
      var sessionId = getOrCreateSession();
      refreshSessionTimer();

      var payload = {
        session_id: sessionId,
        event_type: eventType,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      };

      if (extraData) {
        for (var key in extraData) {
          if (Object.prototype.hasOwnProperty.call(extraData, key)) {
            payload[key] = extraData[key];
          }
        }
      }

      eventQueue.push(payload);

      if (eventQueue.length >= BATCH_MAX_SIZE) {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flushTimer = null;
        }
        flushQueue();
      } else {
        scheduleFlush();
      }
    } catch (e) {
      // Never throw
    }
  }

  // ============================================================
  // AUTO-TRACKING
  // ============================================================

  // Auto-track page_view on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      track('page_view');
    });
  } else {
    // DOM already loaded
    track('page_view');
  }

  // Auto-track clicks via event delegation
  document.addEventListener('click', function (e) {
    try {
      var target = e.target;
      track('click', {
        x: e.clientX,
        y: e.clientY,
      });
    } catch (err) {
      // noop
    }
  }, true);

  // Flush on page unload
  window.addEventListener('beforeunload', function () {
    flushQueue();
  });

  // ============================================================
  // PUBLIC API
  // ============================================================
  return {
    track: track,
    getSessionId: function () {
      return getOrCreateSession();
    },
    onEvent: function (callback) {
      eventListeners.push(callback);
    },
    flush: flushQueue,
  };
}));
