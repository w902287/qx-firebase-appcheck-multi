# Firebase Gemini Header Multi Sync

Quantumult X 多專案 Firebase App Check Header 同步模組。

## 分流

- `dump-note-ai` → `https://w902287-firebase-gemini-proxy.hf.space/dump/admin/appcheck`
- `to-do-speak-ai` → `https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck`

## QX 使用

公開模組網址（v5，本地 8888 已停用，兩專案均同步 HF）：

```text
https://raw.githubusercontent.com/w902287/qx-firebase-appcheck-multi/main/firebase-gemini-header-multi-v5.snippet
```

請停用舊的單專案 `firebase-gemini-header-sync.snippet`，只啟用上述多專案模組。模組會從同一個公開倉庫載入同步腳本。

## 檔案

- `firebase-gemini-header-multi-v5.snippet`
- `firebase-gemini-header-multi-sync-v5.js`

程式碼不包含 Firebase API Key、App Check JWT 或 HF Token。HF Token 仍由 Quantumult X `$prefs` 的 `firebase_gemini_hf_token` 讀取。
