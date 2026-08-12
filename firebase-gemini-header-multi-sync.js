/* Quantumult X: sync X-Firebase-AppCheck from Gemini request headers by project. */
const ROUTES = {
  "dump-note-ai": { kind: "local", url: "http://127.0.0.1:8888/admin/appcheck", pref: "dump_note_appcheck_token" },
  "to-do-speak-ai": { kind: "hf", url: "https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck", pref: "todo_speak_appcheck_token" }
};
const HF_PREF_KEY = "firebase_gemini_hf_token";
const requestURL = ($request && $request.url) || "";
const headers = ($request && $request.headers) || {};
function header(name) {
  const key = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key] || "").trim() : "";
}
function done() { $done($request); }
const project = Object.keys(ROUTES).find(p => requestURL.indexOf("/projects/" + p + "/") >= 0);
const token = header("X-Firebase-AppCheck");
if (!project || !token) done();
else {
  const route = ROUTES[project];
  $prefs.setValueForKey(token, route.pref);
  const hfToken = String($prefs.valueForKey(HF_PREF_KEY) || "").trim();
  if (route.kind === "hf" && !hfToken.startsWith("hf_")) {
    $notify("Firebase App Check", "To-Do Speak 尚未配置 HF Token", "Token 已暫存於 Quantumult X"); done();
  } else {
    const outHeaders = { "Content-Type": "application/json" };
    if (route.kind === "hf") outHeaders.Authorization = "Bearer " + hfToken;
    $task.fetch({
      url: route.url,
      method: "PUT",
      headers: outHeaders,
      body: JSON.stringify({ token: token }),
      timeout: 8
    }).then(r => {
      const code = Number(r.statusCode || r.status || 0);
      if (code < 200 || code >= 300) throw new Error("HTTP " + code);
      console.log("[Gemini Header Sync] " + project + " updated"); done();
    }).catch(e => {
      $notify("Firebase App Check", project + " 同步失敗", String(e)); done();
    });
  }
}
