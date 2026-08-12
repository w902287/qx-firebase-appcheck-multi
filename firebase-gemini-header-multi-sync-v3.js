/* Quantumult X v3: Firebase Gemini Header multi-project sync. */
const ROUTES = {
  "dump-note-ai": { kind: "local", url: "http://127.0.0.1:8888/admin/appcheck", pref: "dump_note_appcheck_token" },
  "to-do-speak-ai": { kind: "hf", url: "https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck", pref: "todo_speak_appcheck_token" }
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
  if (!error) return "unknown callback error";
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
    $notify("Firebase App Check", "To-Do Speak 尚未配置 HF Token", "請沿用原模組的 firebase_gemini_hf_token");
    finish();
  } else {
    const headers = { "Content-Type": "application/json" };
    if (route.kind === "hf") headers.Authorization = "Bearer " + hfToken;
    $httpClient.put({ url: route.url, headers: headers, body: JSON.stringify({ token: token }), timeout: 10 },
      function(error, response, data) {
        const code = codeOf(response);
        if (code !== null && (code < 200 || code >= 300)) {
          $notify("Firebase App Check", project + " 同步失敗", "HTTP " + code);
        } else if (code !== null) {
          console.log("[Header Sync v3] " + project + " updated, HTTP " + code);
        } else if (error) {
          console.log("[Header Sync v3] callback without HTTP status: " + describe(error));
        } else {
          console.log("[Header Sync v3] " + project + " request accepted");
        }
        finish();
      }
    );
  }
}
