/* Quantumult X v4: Firebase Gemini Header multi-project sync with success notifications. */
const ROUTES = {
  "dump-note-ai": { kind: "local", label: "Dump Note → 8888", url: "http://127.0.0.1:8888/admin/appcheck", pref: "dump_note_appcheck_token" },
  "to-do-speak-ai": { kind: "hf", label: "To-Do Speak → HF", url: "https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck", pref: "todo_speak_appcheck_token" }
};
const HF_PREF_KEY = "firebase_gemini_hf_token";
const req = $request || {};
const reqURL = req.url || "";
const reqHeaders = req.headers || {};
function finish() { $done(req); }
function getHeader(name) {
  const key = Object.keys(reqHeaders).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(reqHeaders[key] || "").trim() : "";
}
function codeOf(response) {
  const raw = response && (response.statusCode !== undefined ? response.statusCode : response.status);
  const match = String(raw === undefined ? "" : raw).match(/\d{3}/);
  return match ? parseInt(match[0], 10) : null;
}
function describe(error) {
  if (!error) return "無 HTTP 狀態";
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch (_) { return String(error); }
}
const project = Object.keys(ROUTES).find(p => reqURL.indexOf("/projects/" + p + "/") >= 0);
const token = getHeader("X-Firebase-AppCheck");
if (!project || !token) finish();
else {
  const route = ROUTES[project];
  $prefs.setValueForKey(token, route.pref);
  const hfToken = String($prefs.valueForKey(HF_PREF_KEY) || "").trim();
  if (route.kind === "hf" && !hfToken.startsWith("hf_")) {
    $notify("Firebase App Check", "同步失敗｜" + route.label, "尚未配置 firebase_gemini_hf_token");
    finish();
  } else {
    const headers = { "Content-Type": "application/json" };
    if (route.kind === "hf") headers.Authorization = "Bearer " + hfToken;
    $httpClient.put({ url: route.url, headers: headers, body: JSON.stringify({ token: token }), timeout: 10 },
      function(error, response, data) {
        const code = codeOf(response);
        if (code !== null && code >= 200 && code < 300) {
          console.log("[Header Sync v4] " + project + " updated, HTTP " + code);
          $notify("Firebase App Check", "同步成功｜" + route.label, "HTTP " + code);
        } else if (code !== null) {
          console.log("[Header Sync v4] " + project + " failed, HTTP " + code);
          $notify("Firebase App Check", "同步失敗｜" + route.label, "HTTP " + code);
        } else {
          const detail = describe(error);
          console.log("[Header Sync v4] no HTTP status: " + detail);
          $notify("Firebase App Check", "同步狀態不明｜" + route.label, detail);
        }
        finish();
      }
    );
  }
}
