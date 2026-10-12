# 先騙你一次（保留程式，Pages 已下線）

這個資料夾留著《先騙你一次》夜間剪接室的程式與素材，不再當成網站發布。

- `index.html`：原本倉庫根目錄的入口頁
- `gotcha/`：原本的 `gotcha/`（頁面、圖、音效、影片）

GitHub Pages 從 `main` 根目錄建置。根目錄 `_config.yml` 的 `exclude` 含有 `archive`，而且根目錄沒有 `.nojekyll`，所以 Jekyll 不會把這裡拷進網站。請不要把 `.nojekyll` 加回根目錄，否則 Pages 會原樣公開整個倉庫，這包遊戲會再次上線。

現在的網站入口是 [`alivelog-room/`](../../alivelog-room/)。
