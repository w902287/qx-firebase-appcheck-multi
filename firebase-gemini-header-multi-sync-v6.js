/* Quantumult X v6: sync both Firebase projects to HF using native $task.fetch */
const HF_BASE = "https://w902287-firebase-gemini-proxy.hf.space";
const ROUTES = {
  "dump-note-ai": { label: "Dump Note → HF", url: HF_BASE + "/dump/admin/appcheck", pref: "dump_note_appcheck_token" },
  "to-do-speak-ai": { label: "To-Do Speak → HF", url: HF_BASE + "/admin/appcheck", pref: "todo_speak_appcheck_token" }
};
const HF_PREF_KEY = "firebase_gemini_hf_token";

const req = typeof $request !== "undefined" && $request ? $request : {};
const reqURL = req.url || "";
const reqHeaders = req.headers || {};

function finish() {
  if (typeof $done !== "undefined") {
    $done(req);
  }
}

function getHeader(name) {
  const key = Object.keys(reqHeaders).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(reqHeaders[key] || "").trim() : "";
}

function codeOf(response) {
  if (!response) return null;
  const raw = response.statusCode !== undefined ? response.statusCode : response.status;
  const match = String(raw === undefined ? "" : raw).match(/\d{3}/);
  return match ? parseInt(match[0], 10) : null;
}

const project = Object.keys(ROUTES).find(p => reqURL.indexOf("/projects/" + p + "/") >= 0);
const token = getHeader("X-Firebase-AppCheck");

if (!project || !token) {
  finish();
} else {
  const route = ROUTES[project];
  const hfToken = typeof $prefs !== "undefined" && $prefs ? String($prefs.valueForKey(HF_PREF_KEY) || "").trim() : "";

  if (typeof $prefs !== "undefined" && $prefs) {
    $prefs.setValueForKey(token, route.pref);
  }

  if (!hfToken.startsWith("hf_")) {
    if (typeof $notify !== "undefined") {
      $notify("Firebase App Check", "同步失敗｜" + route.label, "請在 QX 設置 firebase_gemini_hf_token");
    }
    finish();
  } else {
    const fetchOptions = {
      url: route.url,
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + hfToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: token }),
      timeout: 10
    };

    if (typeof $task !== "undefined" && $task && typeof $task.fetch === "function") {
      $task.fetch(fetchOptions).then(function(response) {
        const code = codeOf(response);
        if (code !== null && code >= 200 && code < 300) {
          console.log("[Header Sync v6] " + project + " updated, HTTP " + code);
          if (typeof $notify !== "undefined") {
            $notify("Firebase App Check", "同步成功｜" + route.label, "HTTP " + code);
          }
        } else {
          if (typeof $notify !== "undefined") {
            $notify("Firebase App Check", "同步失敗｜" + route.label, "HTTP " + (code || "Unknown"));
          }
        }
        finish();
      }, function(reason) {
        console.log("[Header Sync v6 Error] " + project + " " + JSON.stringify(reason));
        if (typeof $notify !== "undefined") {
          $notify("Firebase App Check", "同步失敗｜" + route.label, String((reason && (reason.error || reason.errMsg)) || reason));
        }
        finish();
      });
    } else if (typeof $httpClient !== "undefined" && $httpClient && typeof $httpClient.put === "function") {
      $httpClient.put(fetchOptions, function(error, response, data) {
        const code = codeOf(response);
        if (code !== null && code >= 200 && code < 300) {
          if (typeof $notify !== "undefined") $notify("Firebase App Check", "同步成功｜" + route.label, "HTTP " + code);
        } else {
          if (typeof $notify !== "undefined") $notify("Firebase App Check", "同步失敗｜" + route.label, "HTTP " + (code || "Error"));
        }
        finish();
      });
    } else {
      if (typeof $notify !== "undefined") {
        $notify("Firebase App Check", "同步失敗｜" + route.label, "未找到相容的 HTTP 元件");
      }
      finish();
    }
  }
}
