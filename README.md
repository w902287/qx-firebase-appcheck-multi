# Firebase Gemini Header Multi Sync

Quantumult X 多專案 Firebase App Check Header 同步模組。

## 分流

- `dump-note-ai` → `http://127.0.0.1:8888/admin/appcheck`
- `to-do-speak-ai` → `https://w902287-firebase-gemini-proxy.hf.space/admin/appcheck`

## QX 使用

本 GitHub 倉庫設定為 **Private**。GitHub Private Raw 不允許 Quantumult X 匿名訂閱，所以 QX 請使用 8888 提供的本地模組網址：

```text
http://127.0.0.1:8888/qx/firebase-gemini-header-multi.snippet
```

請停用舊的單專案 `firebase-gemini-header-sync.snippet`，只啟用上述多專案模組。

## 檔案

- `firebase-gemini-header-multi.snippet`
- `firebase-gemini-header-multi-sync.js`

程式碼不包含 Firebase API Key、App Check JWT 或 HF Token。HF Token 仍由 Quantumult X `$prefs` 的 `firebase_gemini_hf_token` 讀取。
