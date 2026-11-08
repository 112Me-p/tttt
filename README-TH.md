# IN STILLNESS, WE MOVE — Interactive Scroll Story

เว็บเดโม HTML / CSS / JavaScript ที่สร้างจากภาพ 6 ภาพและโลโก้ที่แนบมา มี Scroll-Driven Transitions, Vector Line Drawing, Color Morphing, Breathing Logo, Mouse Reaction และ Gallery โดยไม่ใช้ JavaScript library เพิ่มเติม

## เปิดใช้งาน

1. เปิด `index.html` ด้วย Chrome, Safari หรือ Edge เพื่อชมเดโมทันที (อินเทอร์เน็ตใช้สำหรับโหลดฟอนต์ Google Fonts เท่านั้น มีฟอนต์ fallback หากออฟไลน์)
2. อัปโหลด **ทุกไฟล์รวมถึงโฟลเดอร์ assets** ไปยัง GitHub Repository (ที่ระดับ root)
3. ไปที่ Repository → **Settings → Pages → Build and deployment → Deploy from a branch** แล้วเลือก `main` + `/(root)` และ Save
4. URL ที่ได้จะมีรูปแบบ `https://USERNAME.github.io/REPOSITORY/`

## ภาพและโลโก้

| ภาพที่ส่งมา | ไฟล์ในโฟลเดอร์ assets |
|---|---|
| โยคะในห้อง | `01-yoga-window.webp` |
| รับแสงแดดริมทะเลสาบ | `02-sunlight.webp` |
| Close-up ผิวและแนวกราม | `03-skin-detail.webp` |
| Close-up สรีระและแขน | `04-body-detail.webp` |
| กลุ่มโยคะริมทะเล | `05-beach-practice.webp` |
| Close-up ใบหน้า | `06-face-detail.webp` |
| โลโก้ต้นฉบับ | `logo-original.png`, `logo.svg` (vector trace) |

**โลโก้เวกเตอร์:** `logo.svg` สร้างจากรูปทรงโลโก้ที่ให้มา โดยรักษารูปทรงโดยรวมไว้ ภายใน `index.html` มีเวกเตอร์แบบ inline SVG เพื่อให้สามารถ animate เส้นวาดตามการ scroll ได้โดยตรง

## ปรับแต่ง

- **ข้อความและลำดับภาพ:** แก้ใน `index.html` ในแต่ละ `.story-scene`
- **สีโลโก้ตามภาพ:** แก้ตัวเลข RGB ของ `palette` ใน `script.js`
- **ความยาวการ scroll:** ปรับ `.story { height:660svh }` ใน `styles.css` (มือถือ 630svh)
- **ตำแหน่งครอปภาพ:** ปรับ `--focus` ใน `<article class="story-scene">` และ CSS ใน `@media(max-width:760px)`
- **เส้นเวกเตอร์:** แก้เส้น `<path id="flow-1">`, `flow-2`, `flow-3` ใน `index.html`
- **คำบนหน้าเว็บ:** ข้อความเป็นตัวอย่างเชิงครีเอทีฟ ไม่ใช่ข้อมูลแบรนด์ที่ยืนยันแล้ว สามารถแทนด้วยเนื้อหาจริงได้

## รองรับ

- Desktop / Tablet / Mobile, Mouse/Touch Scroll, GitHub Pages แบบ static
- ปุ่ม **MOTION ON/OFF** และระบบ `prefers-reduced-motion`
- Navigation, Chapters click-to-scroll, กดกลับไปจุดเริ่มต้น
- ภาพ WebP ที่บีบอัดเพื่อให้โหลดไว

ไฟล์นี้ **ไม่มีการเชื่อม API**, ไม่ได้ส่งข้อมูลผู้ใช้ออกไป และไม่ต้องใช้ backend
