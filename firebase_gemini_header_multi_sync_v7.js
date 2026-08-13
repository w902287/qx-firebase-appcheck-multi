/* Firebase Gemini Request Header App Check Multi Sync (QX v7 - Zero Config) */
const HF_BASE = "https://w902287-firebase-gemini-proxy.hf.space";
const PREF_KEY = "firebase_gemini_hf_token";

const ROUTES = {
    "dump-note-ai": { label: "Dump Note", url: `${HF_BASE}/dump/admin/appcheck` },
    "to-do-speak-ai": { label: "To-Do Speak", url: `${HF_BASE}/admin/appcheck` }
};

const done = () => $done($request);

const reqURL = typeof $request !== "undefined" && $request ? ($request.url || "") : "";
const headers = typeof $request !== "undefined" && $request ? ($request.headers || {}) : {};

const headerKey = Object.keys(headers).find(k => k.toLowerCase() === "x-firebase-appcheck");
const token = headerKey ? headers[headerKey] : null;

const project = Object.keys(ROUTES).find(p => reqURL.includes(`/projects/${p}/`));

if (!project || !token) {
    done();
} else {
    const HF_TOKEN = (typeof $prefs !== "undefined" && $prefs ? $prefs.valueForKey(PREF_KEY) || "" : "").trim();
    const route = ROUTES[project];

    const outHeaders = { "Content-Type": "application/json" };
    if (HF_TOKEN.startsWith("hf_")) {
        outHeaders["Authorization"] = `Bearer ${HF_TOKEN}`;
    }

    $task.fetch({
        url: route.url,
        method: "PUT",
        headers: outHeaders,
        body: JSON.stringify({ token })
    }).then(response => {
        const code = response.statusCode || response.status;
        if (code < 200 || code >= 300) {
            if (typeof $notify !== "undefined") $notify("Firebase App Check", `同步失敗｜${route.label}`, `HTTP ${code}`);
        } else {
            if (typeof $notify !== "undefined") $notify("Firebase App Check", `同步成功｜${route.label}`, "Token 已更新至 HF Proxy");
        }
        done();
    }).catch(error => {
        if (typeof $notify !== "undefined") $notify("Firebase App Check", `同步失敗｜${route.label}`, `${error.name || 'Error'}: ${error.message || String(error)}`);
        done();
    });
}
