/* Quantumult X v2: sync Gemini X-Firebase-AppCheck by Firebase project. */
const ROUTES = {
  "dump-note-ai": { kind: "local", url: "http://127.0.0.1:8888/admin/appcheck", pref: "dump_note_appcheck_token" },
  "to-do-speak-ai": { kind: "hf", url: "https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck", pref: "todo_speak_appcheck_token" }
};
const HF_PREF_KEY = "firebase_gemini_hf_token";
const requestURL = ($request && $request.url) || "";
const requestHeaders = ($request && $request.headers) || {};
let closed = false;
function done() { if (!closed) { closed = true; $done({}); } }
function header(name) {
  const key = Object.keys(requestHeaders).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(requestHeaders[key] || "").trim() : "";
}
function responseCode(r) {
  const raw = r && (r.statusCode !== undefined ? r.statusCode : r.status);
  const match = String(raw === undefined ? "" : raw).match(/\d{3}/);
  return match ? parseInt(match[0], 10) : null;
}
const project = Object.keys(ROUTES).find(p => requestURL.indexOf("/projects/" + p + "/") >= 0);
const token = header("X-Firebase-AppCheck");
if (!project || !token) done();
else {
  const route = ROUTES[project];
  $prefs.setValueForKey(token, route.pref);
  const hfToken = String($prefs.valueForKey(HF_PREF_KEY) || "").trim();
  if (route.kind === "hf" && !hfToken.startsWith("hf_")) {
    $notify("Firebase App Check", "To-Do Speak 尚未配置 HF Token", "請沿用原模組設定的 firebase_gemini_hf_token");
    done();
  } else {
    const outHeaders = { "Content-Type": "application/json" };
    if (route.kind === "hf") outHeaders.Authorization = "Bearer " + hfToken;
    $task.fetch({
      url: route.url,
      method: "PUT",
      headers: outHeaders,
      body: JSON.stringify({ token: token }),
      timeout: 10
    }).then(function(r) {
      const code = responseCode(r);
      if (code !== null && (code < 200 || code >= 300)) {
        $notify("Firebase App Check", project + " 同步失敗", "HTTP " + code);
      } else {
        console.log("[Gemini Header Sync v2] " + project + " updated, HTTP " + (code === null ? "accepted" : code));
      }
      done();
    }, function(e) {
      $notify("Firebase App Check", project + " 同步失敗", String(e));
      done();
    });
  }
}
