# Lex 抽查路徑｜gotcha v5 自製片（Ink plates）

生成日：2026-10-06～07（台北）  
標籤：**虛構情境** · UI 用語「自製紀錄風格短片」（非「真實影片素材」）  
版本：**v5** — 主畫面改為 Ink 手機紀實 plates＋Ken Burns／手持裁切；反對席 ~8s 合成音節悶語

## 檔案
| 路徑 | 說明 |
|------|------|
| `/workspace/game/gotcha/video/viral-cut.webm` | 誤導剪 ~18.3s（空席＋侵略性下標；**省略**反對席） |
| `/workspace/game/gotcha/video/viral-cut.mp4` | 同上 fallback |
| `/workspace/game/gotcha/video/raw-ish.webm` | 較完整軌 ~21.4s（含反對席 ~8s：椅子 plate 不同裁切＋音節悶語） |
| `/workspace/game/gotcha/video/raw-ish.mp4` | 同上 fallback |
| `/workspace/game/gotcha/art/plates/*.png` | Ink 插入鏡頭（影格來源） |
| `/workspace/game/gotcha/video/MANIFEST.json` | 段落／刀口 timecode |
| `/workspace/game/gotcha/video/CREDITS.md` | 生成說明（含 Ink plates 列） |
| `/workspace/game/gotcha/video/gen_clips_v5.py` | 可重跑 |

## 合規自檢（Pixel）
- [x] 無真實政治人物臉（走廊遠景背影難辨）
- [x] 無新聞台標／頻道 branding（「獨家流出」自製）
- [x] 無未授權音樂（合成噪音／音節悶語／槌聲）
- [x] 青石鎮橋案為虛構
- [x] 未使用外部 PD／CC 片源
- [x] 未自架受保護新聞／政論檔
- [x] about／UI 標「虛構情境」「自製紀錄風格短片」
- [x] plates：無路人臉特寫、無商標／真 App UI（Ink README 對齊）

請抽查兩軌內容、反對席聲床、CREDITS 用語即可。
