# 先騙你一次｜美術資產（Ink）

路徑：`/workspace/game/gotcha/art/`  
風格：夜間剪接室 · 中性色 · **不用政黨色表達對錯** · **無真人肖像**

## 本批（優先：房間＋三角色）

| 檔案 | 說明 |
|------|------|
| `room-bg.svg` | 800×500 全景底圖，對齊現有 `viewBox`；左 A 監看／右 B 待命／桌面時間軸／門縫光 |
| `chars/follower-{idle,eager,caught}.svg` | 跟風仔（手機＋熱搜感） |
| `chars/lazy-{idle,smug,caught}.svg` | 懶人包控（耳機、半眼） |
| `chars/extreme-{idle,smug,caught}.svg` | 極端派（銳利瀏海、緊嘴） |
| `chars/{slug}.svg` | 各角色 idle 別名 |

替換：把 `room-bg.svg` 內容替進 `edit-suite-v1.html` 的 `.room-bg`，或 `<image href="art/room-bg.svg">`。

## 第二批（UI＋分鏡）

| 檔案 | 說明 |
|------|------|
| `ui/celebrate-frame.svg` | 「你答對了！」慶祝框（陷阱用） |
| `ui/rewind-cut.svg` | rewind 刀口標記 |
| `ui/stamp-omit.svg` | 中招·省略 |
| `ui/stamp-order.svg` | 中招·順序 |
| `ui/stamp-av-guide.svg` | 中招·音畫引導 |
| `storyboard/a1–a4` / `b1–b4` | 青石鎮橋案分鏡，見 `storyboard/README.md` |

## plates／插入鏡頭（手機紀實）

見 `plates/README.md`。五張 1920×1080 PNG：椅子列、木槌桌面、走廊剪影、橋欄夜拍、螢幕光斑。
