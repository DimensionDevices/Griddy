// FIGlet font base
const fontBase = "https://raw.githubusercontent.com/DimensionDevices/Griddy/refs/heads/main/fonts/";

// ---------- constants ----------
const CELL_H = 18;
let CELL_W = 9.6;

// ---------- measure ----------
function measureCell() {
  const probe = document.createElement("span");
  probe.style.fontFamily = '"SF Mono", "Consolas", "Menlo", monospace';
  probe.style.fontSize = "13px";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "pre";
  probe.textContent = "MMMMMMMMMM";
  document.body.appendChild(probe);
  const w = probe.getBoundingClientRect().width / 10;
  document.body.removeChild(probe);
  return w;
}
CELL_W = measureCell();
document.documentElement.style.setProperty("--cell-w", CELL_W + "px");
document.documentElement.style.setProperty("--cell-h", CELL_H + "px");

// ---------- DOM refs ----------
const canvasWrap = document.getElementById("canvas-wrap");
const canvasInner = document.getElementById("canvas-inner");
const charLayer = document.getElementById("char-layer");
const colorLayer = document.getElementById("color-layer");
const hitLayer = document.getElementById("hit-layer");
const selBox = document.getElementById("selection-box");
const textInput = document.getElementById("text-input");
const gridSvg = document.getElementById("grid-svg-bg");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const copySelBtn = document.getElementById("copy-sel-btn");
const deleteSelBtn = document.getElementById("delete-sel-btn");
const pasteBtn = document.getElementById("paste-btn");
const clearBtn = document.getElementById("clear-btn");
const newBtn = document.getElementById("new-btn");
const exportBtn = document.getElementById("export-btn");
const copyHtmlBtn = document.getElementById("copy-html-btn");
const copyTextBtn = document.getElementById("copy-text-btn");

// Help / Shortcuts modal
const helpModalOverlay = document.getElementById("help-modal-overlay");
const helpModalTitle = document.getElementById("help-modal-title");
const helpPanelAbout = document.getElementById("help-panel-about");
const helpPanelShortcuts = document.getElementById("help-panel-shortcuts");
const helpCloseBtn = document.getElementById("help-close-btn");
const footerHelpLink = document.getElementById("footer-help-link");
const footerShortcutsLink = document.getElementById("footer-shortcuts-link");

const fillSelect = document.getElementById("fillchar-select");
const elbowToggleWrap = document.getElementById("elbow-toggle-wrap");
const elbowToggle = document.getElementById("elbow-toggle");
const statusEl = document.getElementById("status");
const handles = Array.from(document.querySelectorAll(".handle"));
const drawColorInput = document.getElementById("draw-color");

// Figlet modal
const modalOverlay = document.getElementById("figlet-modal-overlay");
const figletTextInput = document.getElementById("figlet-text-input");
const fontPreviewGrid = document.getElementById("font-preview-grid");
const figletPreview = document.getElementById("figlet-preview");
const figletCancelBtn = document.getElementById("figlet-cancel-btn");
const figletInsertBtn = document.getElementById("figlet-insert-btn");
const figletGradientToggle = document.getElementById("figlet-gradient-toggle");
const figletGradientOptions = document.getElementById("figlet-gradient-options");
const figletGradientDirection = document.getElementById("figlet-gradient-direction");
const figletGradientMode = document.getElementById("figlet-gradient-mode");
const figletGradientStart = document.getElementById("figlet-gradient-start");
const figletGradientMid = document.getElementById("figlet-gradient-mid");
const figletGradientEnd = document.getElementById("figlet-gradient-end");
const figletGradient16Note = document.getElementById("figlet-gradient-16-note");
const fontStatus = document.getElementById("font-status");
const fontCategoryTabs = document.getElementById("font-category-tabs");

// NEW image import elements
const imageImportBtn = document.getElementById("image-import-btn");
const imageModalOverlay = document.getElementById("image-modal-overlay");
const imageFileInput = document.getElementById("image-file-input");
const imagePreviewCanvas = document.getElementById("image-preview-canvas");
const imgWidthSlider = document.getElementById("img-width-slider");
const imgHeightSlider = document.getElementById("img-height-slider");
const imgWidthLabel = document.getElementById("img-width-label");
const imgHeightLabel = document.getElementById("img-height-label");
const imgCharsetSelect = document.getElementById("img-charset-select");
const imgContrastSlider = document.getElementById("img-contrast-slider");
const imgContrastLabel = document.getElementById("img-contrast-label");
const imgGammaSlider = document.getElementById("img-gamma-slider");
const imgGammaLabel = document.getElementById("img-gamma-label");
const imgEdgesToggle = document.getElementById("img-edges-toggle");
const imgDitherToggle = document.getElementById("img-dither-toggle");
const imgInvertToggle = document.getElementById("img-invert-toggle");
const imageAsciiPreview = document.getElementById("image-ascii-preview");
const imageCancelBtn = document.getElementById("image-cancel-btn");
const imageInsertBtn = document.getElementById("image-insert-btn");

// NEW canvas size modal elements
const sizeModalOverlay = document.getElementById("size-modal-overlay");
const sizeModalWarning = document.getElementById("size-modal-warning");
const sizeModeFull = document.getElementById("size-mode-full");
const sizeModeCustom = document.getElementById("size-mode-custom");
const sizeCustomFields = document.getElementById("size-custom-fields");
const sizeColsSlider = document.getElementById("size-cols-slider");
const sizeRowsSlider = document.getElementById("size-rows-slider");
const sizeColsLabel = document.getElementById("size-cols-label");
const sizeRowsLabel = document.getElementById("size-rows-label");
const sizeCancelBtn = document.getElementById("size-cancel-btn");
const sizeConfirmBtn = document.getElementById("size-confirm-btn");

// state
let shapes = [];
let colorMap = {};
let history = [];
let future = [];
let tool = "select";
let dragStart = null;
let hoverCell = null;
let previewShapes = null;
let selectedShapeIdx = null;
let activeHandle = null;
let resizeOrigin = null;
let fillChar = "#";
let textState = null;
let altHeld = false;
let clipboard = null;
let selectedFontName = null;
let selectedFontCategory = "All";
let COLS = 60, ROWS = 35;
let fixedCanvasSize = false; // true once user picks a custom size, disables auto-resize-to-window

// Image import state
let importedImageData = null;

let cachedCharGrid = [];
let cachedColorGrid = [];
let renderCacheValid = false;

// ---------- helpers ----------
function computeDims() {
  const w = canvasWrap.clientWidth;
  const h = canvasWrap.clientHeight;
  return {
    cols: Math.max(20, Math.floor(w / CELL_W)),
    rows: Math.max(15, Math.floor(h / CELL_H))
  };
}

function setInnerSize() {
  canvasInner.style.width = (COLS * CELL_W) + "px";
  canvasInner.style.height = (ROWS * CELL_H) + "px";
  charLayer.style.width = (COLS * CELL_W) + "px";
  colorLayer.style.width = (COLS * CELL_W) + "px";
  hitLayer.style.width = (COLS * CELL_W) + "px";
  hitLayer.style.height = (ROWS * CELL_H) + "px";
  gridSvg.setAttribute("width", COLS * CELL_W);
  gridSvg.setAttribute("height", ROWS * CELL_H);
  buildGridBg();
  renderCacheValid = false;
}

function buildGridBg() {
  let s = "";
  for (let i = 0; i <= COLS; i++) s += `<line x1="${i*CELL_W}" y1="0" x2="${i*CELL_W}" y2="${ROWS*CELL_H}" stroke="#ffffff" stroke-width="0.5"/>`;
  for (let i = 0; i <= ROWS; i++) s += `<line x1="0" y1="${i*CELL_H}" x2="${COLS*CELL_W}" y2="${i*CELL_H}" stroke="#ffffff" stroke-width="0.5"/>`;
  gridSvg.innerHTML = s;
}

function key(x,y){ return x+','+y; }

// ---- gradient helpers ----
function hexToRgb(hex) {
  const m = hex.replace('#','');
  const n = m.length === 3
    ? m.split('').map(c => c+c).join('')
    : m;
  const v = parseInt(n, 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function rgbToHex({r,g,b}) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2,'0');
  return '#' + c(r) + c(g) + c(b);
}
// t in [0,1]; three-stop gradient (start -> mid -> end)
function gradientColorAt(t, startHex, midHex, endHex) {
  t = Math.max(0, Math.min(1, t));
  const start = hexToRgb(startHex), mid = hexToRgb(midHex), end = hexToRgb(endHex);
  let a, b, localT;
  if (t <= 0.5) { a = start; b = mid; localT = t / 0.5; }
  else { a = mid; b = end; localT = (t - 0.5) / 0.5; }
  return rgbToHex({
    r: a.r + (b.r - a.r) * localT,
    g: a.g + (b.g - a.g) * localT,
    b: a.b + (b.b - a.b) * localT
  });
}

// ---- 16-color ("retro") gradient ----
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hslToRgb({ h, s, l }) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}
// A plain nearest-neighbor snap against the 16 classic ANSI colors, or a
// naive per-channel push toward 0/255, both break down when the smooth
// gradient passes through a desaturated midpoint (e.g. red -> yellow ->
// blue dips through gray at the crossover) - the result reads as a stray
// white/gray band instead of a color. Working in HSL avoids that: hue is
// preserved exactly from the source gradient, and only saturation/lightness
// are pushed toward bold, readable "retro terminal" values.
function buildRetro16Palette(startHex, midHex, endHex) {
  const STEPS = 16;
  const palette = [];
  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1);
    const hsl = rgbToHsl(hexToRgb(gradientColorAt(t, startHex, midHex, endHex)));
    hsl.s = Math.min(1, hsl.s * 0.3 + 0.7);       // push toward fully saturated
    hsl.l = 0.32 + Math.min(1, hsl.l) * 0.36;     // clamp lightness to a bold, legible band
    palette.push(rgbToHex(hslToRgb(hsl)));
  }
  return palette;
}
// t in [0,1] indexes directly into the 16-step palette (no distance search
// needed since the palette was built in gradient order already).
function gradientColorAt16(t, startHex, midHex, endHex, palette) {
  palette = palette || buildRetro16Palette(startHex, midHex, endHex);
  const idx = Math.max(0, Math.min(palette.length - 1, Math.round(t * (palette.length - 1))));
  return palette[idx];
}

// 4x4 Bayer ordered-dither matrix (values 0-15), used to scatter pixels
// between two adjacent palette bands near a color-stop boundary instead of
// a hard cut - gives a textured, dithered transition typical of retro/
// limited-palette graphics rather than flat stripes.
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];
function gradientColorAt16Dithered(t, startHex, midHex, endHex, col, row, palette) {
  palette = palette || buildRetro16Palette(startHex, midHex, endHex);
  const n = palette.length;
  // Position within the palette as a continuous index, so we can dither
  // between the two nearest bands based on the fractional part.
  const pos = Math.max(0, Math.min(n - 1, t * (n - 1)));
  const lo = Math.floor(pos);
  const hi = Math.min(n - 1, lo + 1);
  const frac = pos - lo;
  const threshold = (BAYER_4X4[row % 4][col % 4] + 0.5) / 16;
  return frac > threshold ? palette[hi] : palette[lo];
}

function setColor(x,y,hex){
  if (!hex) {
    delete colorMap[key(x,y)];
  } else {
    colorMap[key(x,y)] = hex;
  }
  renderCacheValid = false;
}

function getColor(x,y){
  return colorMap[key(x,y)] || null;
}

function currentGrid() {
  const g = renderShapesToGrid(previewShapes || shapes, COLS, ROWS);
  return g;
}

function renderShapesToGrid(shapeList, cols, rows) {
  const g = Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "));
  shapeList.forEach(s => stampShape(g, s));
  return g;
}

function stampShape(g, s) {
  if (s.type === "box") stampBox(g, s.x0, s.y0, s.x1, s.y1);
  else if (s.type === "circle") stampCircle(g, s.x0, s.y0, s.x1, s.y1);
  else if (s.type === "line") stampLine(g, s.x0, s.y0, s.x1, s.y1, false, s.elbow);
  else if (s.type === "arrow") stampLine(g, s.x0, s.y0, s.x1, s.y1, true, s.elbow);
  else if (s.type === "text") stampText(g, s.x0, s.y0, s.value);
  else if (s.type === "figlet") stampFiglet(g, s);
  else if (s.type === "freeform") s.cells.forEach(([x, y, ch]) => setCh(g, x, y, ch));
}

function setCh(g, x, y, ch) {
  if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = ch;
}

function stampText(g, x0, y0, value) {
  for (let i = 0; i < value.length; i++) setCh(g, x0 + i, y0, value[i]);
}

function stampFiglet(g, s) {
  const lines = s.rendered.split("\n");
  for (let r = 0; r < lines.length; r++) {
    const row = lines[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== " ") setCh(g, s.x0 + c, s.y0 + r, row[c]);
    }
  }
}

function stampBox(g, x0, y0, x1, y1) {
  const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
  if (minX === maxX || minY === maxY) return;
  for (let x = minX + 1; x < maxX; x++) { setCh(g, x, minY, "─"); setCh(g, x, maxY, "─"); }
  for (let y = minY + 1; y < maxY; y++) { setCh(g, minX, y, "│"); setCh(g, maxX, y, "│"); }
  setCh(g, minX, minY, "┌"); setCh(g, maxX, minY, "┐");
  setCh(g, minX, maxY, "└"); setCh(g, maxX, maxY, "┘");
}

function stampCircle(g, x0, y0, x1, y1) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rx = Math.max(Math.abs(x1 - x0) / 2, 1);
  const ry = Math.max(Math.abs(y1 - y0) / 2, 1);
  const steps = 240;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = Math.round(cx + rx * Math.cos(t));
    const y = Math.round(cy + ry * Math.sin(t));
    const dx = Math.cos(t), dy = Math.sin(t);
    let ch;
    if (Math.abs(dx) > Math.abs(dy) * 1.6) ch = "│";
    else if (Math.abs(dy) > Math.abs(dx) * 1.6) ch = "─";
    else ch = (Math.sign(dx) === Math.sign(dy)) ? "\\" : "/";
    setCh(g, x, y, ch);
  }
}

function stampLine(g, x0, y0, x1, y1, arrow, elbow) {
  if (!elbow || x0 === x1 || y0 === y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    if (horizontal) {
      const y = y0;
      const step = dx >= 0 ? 1 : -1;
      for (let x = x0; x !== x1; x += step) setCh(g, x, y, "─");
      setCh(g, x1, y, arrow ? (dx >= 0 ? "▶" : "◀") : "─");
    } else {
      const x = x0;
      const step = dy >= 0 ? 1 : -1;
      for (let y = y0; y !== y1; y += step) setCh(g, x, y, "│");
      setCh(g, x, y1, arrow ? (dy >= 0 ? "▼" : "▲") : "│");
    }
    return;
  }
  const cornerX = x1, cornerY = y0;
  const hxStep = cornerX >= x0 ? 1 : -1;
  for (let x = x0; x !== cornerX; x += hxStep) setCh(g, x, y0, "─");
  if (y0 !== y1) {
    setCh(g, cornerX, cornerY, "┼");
    const vyStep = y1 >= cornerY ? 1 : -1;
    for (let y = cornerY; y !== y1; y += vyStep) setCh(g, cornerX, y, "│");
    setCh(g, cornerX, y1, arrow ? (y1 >= cornerY ? "▼" : "▲") : "│");
  } else if (cornerX === x0) {
    setCh(g, x1, y1, arrow ? "▶" : "─");
  }
}

function floodFill(baseGrid, x, y, fillChar) {
  const g = baseGrid.map(row => row.slice());
  const target = g[y][x];
  if (target === fillChar || target !== " ") return null;
  const stack = [[x, y]];
  const seen = new Set();
  const cells = [];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const k = key(cx,cy);
    if (seen.has(k)) continue;
    if (cx < 0 || cx >= g[0].length || cy < 0 || cy >= g.length) continue;
    if (g[cy][cx] !== target) continue;
    seen.add(k);
    g[cy][cx] = fillChar;
    cells.push([cx, cy, fillChar]);
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
  }
  return cells;
}

function shapeBounds(s) {
  if (s.type === "text") return { minX: s.x0, minY: s.y0, maxX: s.x0 + s.value.length, maxY: s.y0 };
  if (s.type === "figlet") {
    const lines = s.rendered.split("\n");
    const w = Math.max(...lines.map(l => l.length), 1);
    return { minX: s.x0, maxX: s.x0 + w - 1, minY: s.y0, maxY: s.y0 + lines.length - 1 };
  }
  if (s.type === "freeform") {
    const xs = s.cells.map(c => c[0]), ys = s.cells.map(c => c[1]);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }
  return { minX: Math.min(s.x0,s.x1), maxX: Math.max(s.x0,s.x1), minY: Math.min(s.y0,s.y1), maxY: Math.max(s.y0,s.y1) };
}

// Collect the colorMap entries that fall within a shape's footprint, as offsets
// relative to the shape's origin (bounds minX/minY for most types; each freeform cell itself).
function collectShapeColorCells(s) {
  const cells = [];
  if (s.type === "freeform") {
    s.cells.forEach(([cx, cy]) => {
      const hex = getColor(cx, cy);
      if (hex) cells.push({ dx: cx, dy: cy, hex });
    });
    return cells;
  }
  const b = shapeBounds(s);
  for (let yy = b.minY; yy <= b.maxY; yy++) {
    for (let xx = b.minX; xx <= b.maxX; xx++) {
      const hex = getColor(xx, yy);
      if (hex) cells.push({ dx: xx - b.minX, dy: yy - b.minY, hex });
    }
  }
  return cells;
}

function cellFromEvent(e) {
  const rect = hitLayer.getBoundingClientRect();
  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;
  const x = Math.floor(relX / CELL_W);
  const y = Math.floor(relY / CELL_H);
  return { x: Math.max(0, Math.min(COLS-1, x)), y: Math.max(0, Math.min(ROWS-1, y)) };
}

function findShapeAt(x,y){
  for (let i = shapes.length-1; i>=0; i--) {
    const s = shapes[i];
    const b = shapeBounds(s);
    if (s.type === "box" || s.type === "circle") {
      const onBorder = (x === b.minX || x === b.maxX || y === b.minY || y === b.maxY);
      if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY && onBorder) return i;
    } else if (s.type === "line" || s.type === "arrow") {
      if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) return i;
    } else {
      if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) return i;
    }
  }
  return null;
}

function currentElbow() { return elbowToggle.checked && !altHeld; }

// ---------- rendering ----------
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildRenderCache() {
  const g = currentGrid();
  const rows = g.length;
  const cols = g[0].length;
  cachedCharGrid = new Array(rows);
  cachedColorGrid = new Array(rows);
  for (let y = 0; y < rows; y++) {
    let charLine = '';
    let colorLine = '';
    for (let x = 0; x < cols; x++) {
      const ch = g[y][x] || ' ';
      charLine += ch;
      const col = getColor(x, y);
      if (col) {
        colorLine += `<span style="color:${col}">${escapeHtml(ch)}</span>`;
      } else {
        colorLine += escapeHtml(ch);
      }
    }
    cachedCharGrid[y] = charLine;
    cachedColorGrid[y] = colorLine;
  }
  renderCacheValid = true;
}

function render() {
  if (!renderCacheValid) buildRenderCache();
  let charHtml = '';
  for (let y = 0; y < cachedCharGrid.length; y++) {
    charHtml += `<div class="row">${escapeHtml(cachedCharGrid[y])}</div>`;
  }
  charLayer.innerHTML = charHtml;
  let colorHtml = '';
  for (let y = 0; y < cachedColorGrid.length; y++) {
    colorHtml += `<div class="row">${cachedColorGrid[y]}</div>`;
  }
  colorLayer.innerHTML = colorHtml;

  hitLayer.className = "";
  if (tool === "text") hitLayer.classList.add("text-tool");
  else if (tool === "select") hitLayer.classList.add("select-tool");
  else if (tool === "freehand") hitLayer.classList.add("freehand-tool");
  else if (tool === "paint") hitLayer.classList.add("paint-tool");

  document.querySelectorAll("#toolbar button[data-tool]").forEach(b => {
    b.classList.toggle("active", b.dataset.tool === tool);
  });
  undoBtn.disabled = history.length === 0;
  redoBtn.disabled = future.length === 0;

  const shape = (selectedShapeIdx !== null) ? shapes[selectedShapeIdx] : null;
  const showSelBtns = tool === "select" && shape;
  copySelBtn.style.display = showSelBtns ? "inline-block" : "none";
  deleteSelBtn.style.display = showSelBtns ? "inline-block" : "none";
  pasteBtn.style.display = clipboard ? "inline-block" : "none";

  renderSelectionUI(shape);
  fillSelect.style.display = tool === "fill" ? "inline-block" : "none";
  elbowToggleWrap.style.display = (tool === "line" || tool === "arrow") ? "flex" : "none";
  statusEl.textContent = COLS + " x " + ROWS + " cells" + (shape ? "  ·  " + shape.type + " selected" : "");
}

function renderSelectionUI(shape) {
  if (!shape || tool !== "select") {
    selBox.style.display = "none";
    handles.forEach(h => h.style.display = "none");
    return;
  }
  const b = shapeBounds(shape);
  const left = b.minX * CELL_W, top = b.minY * CELL_H;
  const w = (b.maxX - b.minX + 1) * CELL_W, h = (b.maxY - b.minY + 1) * CELL_H;
  selBox.style.display = "block";
  selBox.style.left = left + "px";
  selBox.style.top = top + "px";
  selBox.style.width = w + "px";
  selBox.style.height = h + "px";

  const isLinelike = shape.type === "line" || shape.type === "arrow";
  const positions = {
    nw: [left, top], n: [left + w/2, top], ne: [left + w, top],
    e: [left + w, top + h/2], se: [left + w, top + h], s: [left + w/2, top + h],
    sw: [left, top + h], w: [left, top + h/2],
    move: [left + w/2, top + h/2]
  };
  handles.forEach(hEl => {
    const key = hEl.dataset.handle;
    if (shape.type === "text" || shape.type === "freeform" || shape.type === "figlet") {
      hEl.style.display = (key === "move") ? "block" : "none";
    } else if (isLinelike) {
      hEl.style.display = (key === "nw" || key === "se" || key === "move") ? "block" : "none";
    } else {
      hEl.style.display = "block";
    }
    const p = positions[key];
    if (p) { hEl.style.left = p[0] + "px"; hEl.style.top = p[1] + "px"; }
  });
  if (isLinelike) {
    const nwH = handles.find(h => h.dataset.handle === "nw");
    const seH = handles.find(h => h.dataset.handle === "se");
    if (nwH) { nwH.style.left = (shape.x0 * CELL_W) + "px"; nwH.style.top = (shape.y0 * CELL_H) + "px"; }
    if (seH) { seH.style.left = (shape.x1 * CELL_W) + "px"; seH.style.top = (shape.y1 * CELL_H) + "px"; }
  }
}

function invalidateCache() { renderCacheValid = false; }

// ---------- history ----------
function pushHistory() {
  history.push(JSON.parse(JSON.stringify({ shapes, colorMap })));
  if (history.length > 50) history.shift();
  future = [];
  invalidateCache();
}

function commitShapes(newShapes) {
  pushHistory();
  shapes = newShapes;
  previewShapes = null;
  invalidateCache();
  render();
  scheduleAutosave();
}

function undo() {
  if (history.length === 0) return;
  future.unshift(JSON.parse(JSON.stringify({ shapes, colorMap })));
  const state = history.pop();
  shapes = state.shapes;
  colorMap = state.colorMap;
  selectedShapeIdx = null;
  invalidateCache();
  render();
  scheduleAutosave();
}
function redo() {
  if (future.length === 0) return;
  history.push(JSON.parse(JSON.stringify({ shapes, colorMap })));
  const state = future.shift();
  shapes = state.shapes;
  colorMap = state.colorMap;
  selectedShapeIdx = null;
  invalidateCache();
  render();
  scheduleAutosave();
}

// ---------- freehand / paint ----------
function freehandPaint(x,y) {
  const char = fillChar;
  const color = drawColorInput.value;
  pushHistory();
  const cell = [x, y, char];
  shapes.push({ type: "freeform", cells: [cell] });
  setColor(x,y,color);
  invalidateCache();
  render();
  scheduleAutosave();
}

function paintColor(x,y) {
  const color = drawColorInput.value;
  const currentColor = getColor(x,y);
  if (currentColor === color) return;
  pushHistory();
  setColor(x,y,color);
  invalidateCache();
  render();
  scheduleAutosave();
}

// ---------- text input ----------
function openTextInput(x,y, existingIdx) {
  textState = { x, y, editIdx: existingIdx !== undefined ? existingIdx : null };
  textInput.value = existingIdx !== undefined && existingIdx !== null ? shapes[existingIdx].value : "";
  textInput.style.display = "block";
  textInput.style.left = (x * CELL_W) + "px";
  textInput.style.top = (y * CELL_H) + "px";
  requestAnimationFrame(() => textInput.focus());
}

function commitTextInput() {
  if (!textState) return;
  const value = textInput.value;
  textInput.style.display = "none";
  const st = textState;
  textState = null;
  if (!value) return;
  pushHistory();
  if (st.editIdx !== null) {
    shapes[st.editIdx] = { type: "text", x0: st.x, y0: st.y, value };
  } else {
    shapes.push({ type: "text", x0: st.x, y0: st.y, value });
  }
  invalidateCache();
  render();
  scheduleAutosave();
}

// ---------- figlet (unchanged) ----------
const FONT_CACHE = {};
function parseFlf(raw) {
  const lines = raw.split("\n");
  const header = lines[0];
  const m = header.match(/^flf2.(.) (\d+) (\d+) (\d+) (-?\d+) (\d+)/);
  if (!m) throw new Error("Invalid FIGfont");
  const hardblank = m[1];
  const height = parseInt(m[2], 10);
  const numCommentLines = parseInt(m[6], 10);
  let idx = 1 + numCommentLines;
  const chars = {};
  const order = [];
  for (let c = 32; c <= 126; c++) order.push(c);
  order.forEach(code => {
    const rows = [];
    for (let r = 0; r < height; r++) {
      let line = lines[idx++] || "";
      line = line.replace(/@+$/, "");
      line = line.split(hardblank).join(" ");
      rows.push(line);
    }
    chars[String.fromCharCode(code)] = rows;
  });
  return { hardblank, height, chars };
}

async function loadFont(name) {
  if (FONT_CACHE[name]) return FONT_CACHE[name];
  try {
    const response = await fetch(`${fontBase}${name}.flf`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.text();
    const font = parseFlf(raw);
    FONT_CACHE[name] = font;
    return font;
  } catch (err) {
    throw new Error(`Failed to load font "${name}": ${err.message}`);
  }
}

function renderFiglet(text, font) {
  const rows = new Array(font.height).fill("");
  for (let i = 0; i < text.length; i++) {
    const ch = font.chars[text[i]] || font.chars[" "];
    for (let r = 0; r < font.height; r++) rows[r] += (ch[r] || "");
  }
  return rows.join("\n");
}

const COMMON_FONTS=["3-d","3x5","5lineoblique","acrobatic","alligator","alligator2","alphabet","avatar","banner","banner3","banner3-D","banner4","barbwire","basic","bell","big","bigchief","binary","block","bubble","bulbhead","calgphy2","caligraphy","catwalk","chunky","coinstak","colossal","computer","contessa","contrast","cosmic","cosmike","cricket","cursive","cyberlarge","cybermedium","cybersmall","diamond","digital","doh","doom","dotmatrix","drpepper","eftichess","eftifont","eftipiti","eftirobot","eftitalic","eftiwall","eftiwater","epic","fender","fourtops","fuzzy","goofy","gothic","graffiti","hollywood","invita","isometric1","isometric2","isometric3","isometric4","italic","ivrit","jazmine","jerusalem","katakana","kban","larry3d","lcd","lean","letters","linux","lockergnome","madrid","marquee","maxfour","mike","mini","mirror","mnemonic","morse","moscow","nancyj","nancyj-fancy","nancyj-underlined","nipples","ntgreek","o8","ogre","pawp","peaks","pebbles","pepper","poison","puffy","pyramid","relief","relief2","rev","roman","rot13","rounded","rowancap","rozzo","runic","runyc","sblood","script","serifcap","shadow","short","slant","slide","slscript","small","smisome1","smkeyboard","smscript","smshadow","smslant","smtengwar","speed","stampatello","standard","starwars","stellar","stop","straight","tanja","tengwar","term","thick","thin","threepoint","ticks","ticksslant","tinker-toy","tombstone","trek","tsalagi","twopoint","univers","usaflag","wavy","weird"];

// Category groupings for the 147-font list, so users can filter instead of
// scrolling through everything. Each font appears in exactly one category;
// fonts not explicitly listed fall back to "Other".
const FONT_CATEGORIES = {
  "Classic / Block": ["standard","big","block","banner","banner3","banner3-D","banner4","bulbhead","doh","colossal","larry3d","univers","contrast","straight","bigchief","fender","chunky"],
  "Small / Compact": ["small","mini","3x5","short","term","thin","thick","straight","o8","binary","twopoint","threepoint","ticks","ticksslant"],
  "3D / Isometric": ["3-d","isometric1","isometric2","isometric3","isometric4","smisome1","larry3d","cosmike","cyberlarge","cybermedium","cybersmall","relief","relief2","graffiti"],
  "Shadow / Outline": ["shadow","smshadow","rev","doom","epic","invita","nancyj","nancyj-fancy","nancyj-underlined","rounded","rozzo","contessa"],
  "Script / Cursive": ["script","smscript","slscript","cursive","caligraphy","stampatello","mirror","slant","smslant","italic","eftitalic"],
  "Bubble / Puffy": ["bubble","puffy","fuzzy","goofy","pebbles","nipples","weird","wavy","catwalk"],
  "Sci-Fi / Digital": ["digital","lcd","dotmatrix","cosmic","starwars","trek","speed","drpepper","stellar","morse","binary"],
  "Retro / Novelty": ["hollywood","marquee","banner","barbwire","poison","sblood","tombstone","runic","tsalagi","katakana","ivrit","ntgreek","jerusalem","jazmine","madrid","moscow"],
  "Handwriting / Tech": ["eftichess","eftifont","eftipiti","eftirobot","eftiwall","eftiwater","letters","alphabet","mnemonic","kban","lockergnome","lean","mike","avatar","pawp","peaks","gothic","tanja","tengwar","smtengwar","smkeyboard","acrobatic","alligator","alligator2","bell","calgphy2","coinstak","computer","cricket","diamond","fourtops","maxfour","ogre","pyramid","roman","rot13","rowancap","runyc","serifcap","stop","tinker-toy","usaflag","5lineoblique"]
};
// Reverse-lookup map: font name -> category name (built once).
const FONT_TO_CATEGORY = {};
Object.entries(FONT_CATEGORIES).forEach(([cat, names]) => {
  names.forEach(n => { FONT_TO_CATEGORY[n] = cat; });
});
function categoryOf(fontName) { return FONT_TO_CATEGORY[fontName] || "Other"; }

// Cache of which fonts actually exist on the server, so we only pay the
// network cost of checking 147 .flf files once per page load rather than
// on every keystroke in the figlet text input.
let availableFontsCache = null;
let availableFontsPromise = null;

// Checks all COMMON_FONTS in parallel (bounded by CONCURRENCY) and reports
// progress via onProgress(done, total) so the UI can render a progress bar
// instead of the previous silent, fully-sequential loop.
async function detectAvailableFonts(onProgress) {
  if (availableFontsCache) {
    onProgress(COMMON_FONTS.length, COMMON_FONTS.length);
    return availableFontsCache;
  }
  if (availableFontsPromise) return availableFontsPromise;

  const CONCURRENCY = 12;
  const total = COMMON_FONTS.length;
  let done = 0;
  const available = [];

  availableFontsPromise = (async () => {
    let cursor = 0;
    async function worker() {
      while (cursor < COMMON_FONTS.length) {
        const name = COMMON_FONTS[cursor++];
        try {
          const response = await fetch(`${fontBase}${name}.flf`, { method: "HEAD" });
          if (response.ok) available.push(name);
        } catch (e) {
          // ignore - treated as unavailable
        }
        done++;
        onProgress(done, total);
      }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, worker);
    await Promise.all(workers);
    // Preserve original COMMON_FONTS ordering regardless of completion order
    available.sort((a, b) => COMMON_FONTS.indexOf(a) - COMMON_FONTS.indexOf(b));
    availableFontsCache = available;
    return available;
  })();

  return availableFontsPromise;
}

function renderFontLoadProgress(grid, done, total) {
  let bar = grid.querySelector('.font-load-progress');
  if (!bar) {
    grid.innerHTML = '';
    bar = document.createElement('div');
    bar.className = 'font-load-progress';
    bar.innerHTML = `
      <div class="progress-label"></div>
      <div class="font-load-progress-track"><div class="font-load-progress-fill"></div></div>
    `;
    grid.appendChild(bar);
  }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  bar.querySelector('.progress-label').textContent = `Checking fonts… ${done}/${total}`;
  bar.querySelector('.font-load-progress-fill').style.width = pct + '%';
}

async function buildFontPreviewGrid() {
  const grid = fontPreviewGrid;
  const text = figletTextInput.value || ' ';

  // If we already know which fonts are available, just re-render previews
  // with the new text - no need to re-check the network on every keystroke.
  if (availableFontsCache) {
    await renderFontPreviewItems(availableFontsCache, text);
    return;
  }

  grid.innerHTML = '';
  grid.classList.add('loading');
  fontStatus.textContent = `Checking ${COMMON_FONTS.length} fonts…`;
  fontStatus.className = "font-status";

  const available = await detectAvailableFonts((done, total) => {
    renderFontLoadProgress(grid, done, total);
  });

  grid.classList.remove('loading');
  if (available.length === 0) {
    grid.innerHTML = `<div class="no-fonts">⚠️ No .flf fonts found. Add some.</div>`;
    fontStatus.textContent = "⚠️ No .flf fonts found. Add some.";
    fontStatus.className = "font-status error";
    return;
  }
  fontStatus.textContent = `✅ ${available.length} font(s) found`;
  fontStatus.className = "font-status success";

  await renderFontPreviewItems(available, text);
}

// Builds the row of category filter tabs above the font grid. Selecting a
// tab re-renders the grid filtered to that category (or "All").
function buildFontCategoryTabs(available) {
  const tabsEl = fontCategoryTabs;
  tabsEl.innerHTML = '';

  // Only show categories that actually have at least one available font.
  const presentCats = new Set(available.map(categoryOf));
  const orderedCats = ["All", ...Object.keys(FONT_CATEGORIES).filter(c => presentCats.has(c)), ...(presentCats.has("Other") ? ["Other"] : [])];

  orderedCats.forEach(cat => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'font-category-tab';
    const count = cat === "All" ? available.length : available.filter(n => categoryOf(n) === cat).length;
    tab.textContent = `${cat} (${count})`;
    if (cat === selectedFontCategory) tab.classList.add('active');
    tab.addEventListener('click', () => {
      selectedFontCategory = cat;
      renderFontPreviewItems(available, figletTextInput.value || ' ');
    });
    tabsEl.appendChild(tab);
  });
}

async function renderFontPreviewItems(available, text) {
  const grid = fontPreviewGrid;
  grid.innerHTML = '';

  buildFontCategoryTabs(available);
  fontCategoryTabs.querySelectorAll('.font-category-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.startsWith(selectedFontCategory + ' ('));
  });

  const filtered = selectedFontCategory === "All"
    ? available
    : available.filter(n => categoryOf(n) === selectedFontCategory);

  // Group by category so headings appear even in "All" view, making the
  // 147-font list easier to scan while scrolling.
  const groups = {};
  filtered.forEach(name => {
    const cat = categoryOf(name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(name);
  });
  const groupOrder = selectedFontCategory === "All"
    ? [...Object.keys(FONT_CATEGORIES), "Other"].filter(c => groups[c])
    : [selectedFontCategory];

  for (const cat of groupOrder) {
    const names = groups[cat];
    if (!names || names.length === 0) continue;

    if (selectedFontCategory === "All") {
      const heading = document.createElement('div');
      heading.className = 'font-category-heading';
      heading.textContent = `${cat} · ${names.length}`;
      grid.appendChild(heading);
    }

    for (const name of names) {
      const item = document.createElement('div');
      item.className = 'font-preview-item';
      item.dataset.font = name;
      try {
        const font = await loadFont(name);
        const rendered = renderFiglet(text, font);
        const lines = rendered.split('\n');
        const previewText = lines.slice(0, 10).join('\n') || ' ';
        item.textContent = previewText;
        const nameSpan = document.createElement('span');
        nameSpan.className = 'font-name';
        nameSpan.textContent = name;
        item.appendChild(nameSpan);
        if (name === selectedFontName) item.classList.add('selected');
        item.addEventListener('click', () => {
          grid.querySelectorAll('.font-preview-item').forEach(el => el.classList.remove('selected'));
          item.classList.add('selected');
          selectedFontName = name;
          updateFigletPreview();
        });
        grid.appendChild(item);
      } catch (err) {}
    }
  }

  if (!selectedFontName) {
    const first = grid.querySelector('.font-preview-item');
    if (first) {
      first.classList.add('selected');
      selectedFontName = first.dataset.font;
      updateFigletPreview();
    }
  }
}

async function updateFigletPreview() {
  const text = figletTextInput.value || ' ';
  const fontName = selectedFontName;
  if (!fontName) {
    figletPreview.textContent = 'Select a font from the grid';
    return;
  }
  try {
    const font = await loadFont(fontName);
    const rendered = renderFiglet(text, font);
    figletPreview.textContent = rendered;
    fontStatus.textContent = `✅ Loaded "${fontName}"`;
    fontStatus.className = "font-status success";
  } catch(err) {
    figletPreview.textContent = `❌ Error: ${err.message}`;
    fontStatus.textContent = `❌ ${err.message}`;
    fontStatus.className = "font-status error";
  }
}

function openFigletModal() {
  modalOverlay.style.display = "flex";
  figletTextInput.value = "FIGlet";
  selectedFontName = null;
  selectedFontCategory = "All";
  figletGradientOptions.style.display = figletGradientToggle.checked ? "flex" : "none";
  figletGradient16Note.classList.toggle("hidden", figletGradientMode.value !== "16color");
  buildFontPreviewGrid();
  figletTextInput.focus();
}

function closeFigletModal() { modalOverlay.style.display = "none"; }

async function insertFiglet() {
  const text = figletTextInput.value;
  if (!text) return;
  const fontName = selectedFontName;
  if (!fontName) {
    fontStatus.textContent = "⚠️ Please select a font from the grid";
    fontStatus.className = "font-status error";
    return;
  }
  try {
    const font = await loadFont(fontName);
    const rendered = renderFiglet(text, font);
    const lines = rendered.split("\n");
    const w = Math.max(...lines.map(l => l.length), 1);
    const h = lines.length;
    let x=0,y=0;
    if (hoverCell) { x = Math.min(hoverCell.x, COLS-w); y = Math.min(hoverCell.y, ROWS-h); }
    x = Math.max(0,x); y = Math.max(0,y);
    pushHistory();
    shapes.push({ type: "figlet", x0:x, y0:y, value:text, font:fontName, rendered });

    const useGradient = figletGradientToggle.checked;
    if (useGradient) {
      const dir = figletGradientDirection.value; // "horizontal" | "vertical"
      const mode = figletGradientMode.value; // "smooth" | "16color"
      const startHex = figletGradientStart.value;
      const midHex = figletGradientMid.value;
      const endHex = figletGradientEnd.value;
      const denomW = Math.max(1, w - 1);
      const denomH = Math.max(1, h - 1);
      // Build the 16-color palette once per insert rather than per cell.
      const palette16 = mode === "16color" ? buildRetro16Palette(startHex, midHex, endHex) : null;
      for (let r=0; r<lines.length; r++) {
        const row = lines[r];
        for (let c=0; c<row.length; c++) {
          if (row[c] !== " ") {
            const t = dir === "vertical" ? (r / denomH) : (c / denomW);
            // Dither using absolute canvas coordinates (x+c, y+r) so the
            // Bayer pattern is stable and consistent across the whole shape.
            const color = mode === "16color"
              ? gradientColorAt16Dithered(t, startHex, midHex, endHex, x+c, y+r, palette16)
              : gradientColorAt(t, startHex, midHex, endHex);
            setColor(x+c, y+r, color);
          }
        }
      }
    } else {
      const color = drawColorInput.value;
      for (let r=0; r<lines.length; r++) {
        const row = lines[r];
        for (let c=0; c<row.length; c++) {
          if (row[c] !== " ") setColor(x+c, y+r, color);
        }
      }
    }
    closeFigletModal();
    invalidateCache();
    render();
    scheduleAutosave();
  } catch(err) {
    fontStatus.textContent = `❌ ${err.message}`;
    fontStatus.className = "font-status error";
  }
}

// ---------- canvas size modal (New / startup) ----------
function updateSizeModalFieldsVisibility() {
  sizeCustomFields.classList.toggle("hidden", !sizeModeCustom.checked);
}

// isNewAction: true when opened via the "New" button (shows a discard
// warning + Cancel button); false for the initial startup prompt (no
// existing drawing to discard, so no warning/Cancel).
function openSizeModal(isNewAction) {
  sizeModalWarning.classList.toggle("hidden", !isNewAction);
  sizeCancelBtn.classList.toggle("hidden", !isNewAction);
  sizeModalOverlay.dataset.isNewAction = isNewAction ? "1" : "0";

  // Pre-fill custom fields with the current canvas size for convenience.
  sizeColsSlider.value = COLS;
  sizeRowsSlider.value = ROWS;
  sizeColsLabel.textContent = COLS;
  sizeRowsLabel.textContent = ROWS;
  sizeModeFull.checked = true;
  updateSizeModalFieldsVisibility();

  sizeModalOverlay.style.display = "flex";
}
function closeSizeModal() { sizeModalOverlay.style.display = "none"; }

function confirmSizeModal() {
  const isNewAction = sizeModalOverlay.dataset.isNewAction === "1";

  if (isNewAction) {
    pushHistory();
    shapes = [];
    colorMap = {};
    selectedShapeIdx = null;
  }

  if (sizeModeCustom.checked) {
    COLS = parseInt(sizeColsSlider.value, 10);
    ROWS = parseInt(sizeRowsSlider.value, 10);
    fixedCanvasSize = true;
  } else {
    const dims = computeDims();
    COLS = dims.cols; ROWS = dims.rows;
    fixedCanvasSize = false;
  }

  setInnerSize();
  invalidateCache();
  render();
  if (isNewAction) scheduleAutosave();
  closeSizeModal();
}

// ---------- save/load ----------
const STORAGE_KEY = "ascii-flow-color-v1";
function saveToStorage(silent) {
  try {
    const payload = { shapes, colorMap, cols: COLS, rows: ROWS, fixedCanvasSize, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (!silent) flashStatus("Saved");
  } catch(e) { if(!silent) flashStatus("Save failed"); }
}
function loadFromStorage(silent) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { if(!silent) flashStatus("Nothing saved"); return false; }
    const payload = JSON.parse(raw);
    pushHistory();
    shapes = payload.shapes || [];
    colorMap = payload.colorMap || {};
    selectedShapeIdx = null;
    if (payload.fixedCanvasSize && payload.cols && payload.rows) {
      fixedCanvasSize = true;
      COLS = payload.cols;
      ROWS = payload.rows;
      setInnerSize();
    }
    invalidateCache();
    render();
    if(!silent) flashStatus("Loaded");
    return true;
  } catch(e) { if(!silent) flashStatus("Load failed"); return false; }
}
function flashStatus(msg) {
  const orig = statusEl.textContent;
  statusEl.textContent = msg;
  setTimeout(() => { statusEl.textContent = orig; }, 1200);
}
let autosaveTimer = null;
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => saveToStorage(true), 800);
}

// ---------- export ----------
function exportAscii() {
  const g = currentGrid();
  let result = "";
  for (let y=0; y<g.length; y++) {
    let line = "";
    for (let x=0; x<g[0].length; x++) {
      const ch = g[y][x] || " ";
      const col = getColor(x,y);
      if (col) {
        const r = parseInt(col.slice(1,3),16);
        const gv = parseInt(col.slice(3,5),16);
        const b = parseInt(col.slice(5,7),16);
        line += `\x1b[38;2;${r};${gv};${b}m${ch}\x1b[0m`;
      } else {
        line += ch;
      }
    }
    result += line + "\n";
  }
  return result;
}

function exportPlainText() {
  const g = currentGrid();
  return g.map(row => row.join('')).join('\n');
}

function exportHtml() {
  const g = currentGrid();
  let html = '<pre style="font-family:monospace;line-height:1.2;background:#1e1f22;color:#e6e6e6;padding:8px;">';
  for (let y=0; y<g.length; y++) {
    for (let x=0; x<g[0].length; x++) {
      const ch = g[y][x] || " ";
      const col = getColor(x,y);
      if (col) {
        html += `<span style="color:${col}">${escapeHtml(ch)}</span>`;
      } else {
        html += `<span style="color:#ffffff">${escapeHtml(ch)}</span>`;
      }
    }
    html += '\n';
  }
  html += '</pre>';
  return html;
}

// ---------- IMAGE IMPORT ----------

// Draws the source image into an offscreen canvas at a supersampled resolution
// (a multiple of the target char grid) so downscaling can properly average
// pixels instead of relying on the browser's scaled drawImage, which throws
// away fine detail.
function sampleImageGrid(imageEl, cols, rows) {
  // Character cells are ~9x18 (taller than wide), so oversample proportionally
  // more vertically to keep the averaging window roughly square in "screen" terms.
  const SS = 4; // supersample factor per axis
  const sw = cols * SS, sh = rows * SS * 2; // *2 corrects for the ~1:2 cell aspect
  const off = document.createElement('canvas');
  off.width = sw; off.height = sh;
  const octx = off.getContext('2d', { willReadFrequently: true });
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(imageEl, 0, 0, sw, sh);
  const src = octx.getImageData(0, 0, sw, sh).data;

  // Area-average each cell's block of supersampled pixels down to one value.
  const gray = new Float32Array(cols * rows);
  const rC = new Float32Array(cols * rows);
  const gC = new Float32Array(cols * rows);
  const bC = new Float32Array(cols * rows);
  const blockW = SS, blockH = SS * 2;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let rs=0, gs=0, bs=0, n=0;
      const x0 = cx*blockW, y0 = cy*blockH;
      for (let yy = 0; yy < blockH; yy++) {
        for (let xx = 0; xx < blockW; xx++) {
          const idx = ((y0+yy) * sw + (x0+xx)) * 4;
          rs += src[idx]; gs += src[idx+1]; bs += src[idx+2];
          n++;
        }
      }
      const r = rs/n, g = gs/n, b = bs/n;
      const i = cy*cols+cx;
      rC[i]=r; gC[i]=g; bC[i]=b;
      gray[i] = 0.299*r + 0.587*g + 0.114*b;
    }
  }
  return { gray, r: rC, g: gC, b: bC, cols, rows };
}

// Sobel edge magnitude + direction, used to swap in directional characters
// (| / \ -) along strong edges, which reads as much more "detailed" than
// flat density shading alone.
function computeEdges(gray, cols, rows) {
  const mag = new Float32Array(cols * rows);
  const dir = new Float32Array(cols * rows); // radians
  const at = (x,y) => gray[Math.min(rows-1,Math.max(0,y))*cols + Math.min(cols-1,Math.max(0,x))];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const gx = (at(x+1,y-1)+2*at(x+1,y)+at(x+1,y+1)) - (at(x-1,y-1)+2*at(x-1,y)+at(x-1,y+1));
      const gy = (at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1)) - (at(x-1,y-1)+2*at(x,y-1)+at(x+1,y-1));
      mag[y*cols+x] = Math.sqrt(gx*gx + gy*gy);
      dir[y*cols+x] = Math.atan2(gy, gx);
    }
  }
  return { mag, dir };
}

function edgeChar(angle) {
  // Normalize to [0, PI) since edges are symmetric
  let a = angle % Math.PI;
  if (a < 0) a += Math.PI;
  const deg = a * 180 / Math.PI;
  if (deg < 22.5 || deg >= 157.5) return '|';   // gradient horizontal -> edge vertical
  if (deg < 67.5) return '/';
  if (deg < 112.5) return '-';                   // gradient vertical -> edge horizontal
  return '\\';
}

function imageToAscii(imageEl, width, height, charsetStr, opts) {
  opts = opts || {};
  const contrast = opts.contrast != null ? opts.contrast : 0.35; // 0..1
  const gamma = opts.gamma != null ? opts.gamma : 1.0;
  const useEdges = !!opts.edges;
  const useDither = !!opts.dither;
  const invert = !!opts.invert;

  const chars = charsetStr.split('');
  const { gray, r, g, b, cols, rows } = sampleImageGrid(imageEl, width, height);
  const n = cols * rows;

  // Auto histogram stretch: find 2nd/98th percentile so outliers don't
  // compress the usable tonal range, then apply user contrast + gamma.
  const sorted = Array.from(gray).sort((a,c) => a-c);
  const lo = sorted[Math.floor(n * 0.02)];
  const hi = sorted[Math.ceil(n * 0.98) - 1] || 255;
  const range = Math.max(1, hi - lo);

  const tone = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = (gray[i] - lo) / range; // 0..1 stretched
    v = Math.max(0, Math.min(1, v));
    // contrast: push away from mid-gray
    v = (v - 0.5) * (1 + contrast * 1.5) + 0.5;
    v = Math.max(0, Math.min(1, v));
    // gamma tone curve
    v = Math.pow(v, gamma);
    if (invert) v = 1 - v;
    tone[i] = v;
  }

  let edges = null;
  if (useEdges) {
    edges = computeEdges(gray, cols, rows);
  }
  // Threshold for "this cell is a strong edge" - relative to the image's own
  // edge-strength distribution so it adapts per-image.
  let edgeThreshold = Infinity;
  if (useEdges) {
    const mags = Array.from(edges.mag).sort((a,c) => a-c);
    edgeThreshold = mags[Math.floor(mags.length * 0.85)] || Infinity;
  }

  const ascii = [];
  const colorMapLocal = {};
  const last = chars.length - 1;

  for (let y = 0; y < rows; y++) {
    let row = '';
    for (let x = 0; x < cols; x++) {
      const i = y*cols+x;
      let v = tone[i];
      if (useDither) {
        // Floyd–Steinberg style error diffusion across the quantization
        // steps of the charset, smoothing out visible banding in gradients.
        const steps = last;
        const scaled = v * steps;
        const q = Math.round(scaled);
        const err = (scaled - q) / steps;
        if (x + 1 < cols) tone[i+1] += err * 7/16;
        if (y + 1 < rows) {
          if (x > 0) tone[i - 1 + cols] += err * 3/16;
          tone[i + cols] += err * 5/16;
          if (x + 1 < cols) tone[i + 1 + cols] += err * 1/16;
        }
        v = Math.max(0, Math.min(1, q / steps));
      }

      let ch;
      if (useEdges && edges.mag[i] >= edgeThreshold && v > 0.03) {
        ch = edgeChar(edges.dir[i]);
      } else {
        const charIdx = Math.round(v * last);
        ch = chars[Math.min(last, Math.max(0, charIdx))];
      }
      row += ch;
      const hex = '#' + [r[i],g[i],b[i]].map(c => Math.round(c).toString(16).padStart(2,'0')).join('');
      colorMapLocal[x+','+y] = hex;
    }
    ascii.push(row);
  }
  return { ascii, colorMap: colorMapLocal };
}

function updateImagePreview() {
  const file = imageFileInput.files[0];
  if (!file) {
    imageAsciiPreview.textContent = 'No image loaded.';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const w = parseInt(imgWidthSlider.value, 10);
      const h = parseInt(imgHeightSlider.value, 10);
      const charset = imgCharsetSelect.value;
      const contrast = parseInt(imgContrastSlider.value, 10) / 100;
      const gamma = parseInt(imgGammaSlider.value, 10) / 100;
      const opts = {
        contrast,
        gamma,
        edges: imgEdgesToggle.checked,
        dither: imgDitherToggle.checked,
        invert: imgInvertToggle.checked
      };
      const result = imageToAscii(img, w, h, charset, opts);
      importedImageData = result;
      // preview canvas
      const ctx = imagePreviewCanvas.getContext('2d');
      ctx.clearRect(0, 0, imagePreviewCanvas.width, imagePreviewCanvas.height);
      ctx.drawImage(img, 0, 0, imagePreviewCanvas.width, imagePreviewCanvas.height);
      // ASCII preview
      const previewLines = result.ascii.slice(0, 20).join('\n');
      imageAsciiPreview.textContent = previewLines + (result.ascii.length > 20 ? '\n…' : '');
      // update labels
      imgWidthLabel.textContent = w;
      imgHeightLabel.textContent = h;
      imgContrastLabel.textContent = imgContrastSlider.value;
      imgGammaLabel.textContent = gamma.toFixed(2);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function openImageModal() {
  imageModalOverlay.style.display = 'flex';
  imageFileInput.value = '';
  imageAsciiPreview.textContent = 'Select an image file.';
  importedImageData = null;
  imagePreviewCanvas.getContext('2d').clearRect(0, 0, imagePreviewCanvas.width, imagePreviewCanvas.height);
}

function closeImageModal() {
  imageModalOverlay.style.display = 'none';
}

function insertImageAscii() {
  if (!importedImageData || !hoverCell) {
    flashStatus('No image data or cursor position');
    return;
  }
  const { ascii, colorMap: imgColors } = importedImageData;
  const h = ascii.length;
  const w = ascii[0].length;
  let x = hoverCell.x;
  let y = hoverCell.y;
  // clamp to fit
  x = Math.min(x, COLS - w);
  y = Math.min(y, ROWS - h);
  x = Math.max(0, x);
  y = Math.max(0, y);

  pushHistory();
  // build freeform cells
  const cells = [];
  const colorUpdates = {};
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const ch = ascii[row][col];
      if (ch && ch !== ' ') {
        const cx = x + col, cy = y + row;
        cells.push([cx, cy, ch]);
        const key = cx+','+cy;
        const hex = imgColors[col+','+row] || '#ffffff';
        colorUpdates[key] = hex;
      }
    }
  }
  shapes.push({ type: 'freeform', cells });
  for (const [k, hex] of Object.entries(colorUpdates)) {
    const [cx, cy] = k.split(',').map(Number);
    setColor(cx, cy, hex);
  }
  invalidateCache();
  render();
  scheduleAutosave();
  closeImageModal();
  flashStatus(`Image inserted (${w}×${h})`);
}

// ---------- events ----------
function initEvents() {
  handles.forEach(hEl => {
    hEl.addEventListener("pointerdown", (e) => {
      if (tool !== "select" || selectedShapeIdx === null) return;
      e.stopPropagation(); e.preventDefault();
      if (hEl.setPointerCapture && e.pointerId != null) {
        try { hEl.setPointerCapture(e.pointerId); } catch(err) {}
      }
      const { x, y } = cellFromEvent(e);
      activeHandle = hEl.dataset.handle;
      const origShape = shapes[selectedShapeIdx];
      resizeOrigin = { x, y, shape: JSON.parse(JSON.stringify(origShape)) };
      if (activeHandle === "move") {
        // Snapshot the paint under this shape (as offsets) and remove it from the
        // colorMap now; it will be re-applied at the shifted position on every move.
        resizeOrigin.colorCells = collectShapeColorCells(origShape);
        resizeOrigin.colorOrigin = origShape.type === "freeform"
          ? { x: 0, y: 0 }
          : { x: shapeBounds(origShape).minX, y: shapeBounds(origShape).minY };
        resizeOrigin.colorCells.forEach(c => {
          const ox = origShape.type === "freeform" ? c.dx : resizeOrigin.colorOrigin.x + c.dx;
          const oy = origShape.type === "freeform" ? c.dy : resizeOrigin.colorOrigin.y + c.dy;
          delete colorMap[key(ox, oy)];
        });
      }
      dragStart = { x, y };
    });
  });

  hitLayer.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const { x, y } = cellFromEvent(e);
    if (tool === "text") { openTextInput(x,y); return; }
    if (tool === "fill") {
      const g = currentGrid();
      const cells = floodFill(g, x, y, fillChar);
      if (cells) {
        pushHistory();
        shapes.push({ type: "freeform", cells });
        const color = drawColorInput.value;
        cells.forEach(([cx, cy]) => setColor(cx, cy, color));
        invalidateCache();
        render();
        scheduleAutosave();
      }
      return;
    }
    if (tool === "select") {
      const idx = findShapeAt(x,y);
      selectedShapeIdx = idx;
      activeHandle = null;
      render();
      return;
    }
    if (tool === "erase") {
      pushHistory();
      const xx = x, yy = y;
      if (xx >= 0 && xx < COLS && yy >= 0 && yy < ROWS) {
        delete colorMap[key(xx, yy)];
        shapes.push({ type: "freeform", cells: [[xx, yy, " "]] });
      }
      invalidateCache();
      render();
      scheduleAutosave();
      return;
    }
    if (tool === "freehand") {
      freehandPaint(x,y);
      dragStart = { x, y };
      return;
    }
    if (tool === "paint") {
      paintColor(x,y);
      dragStart = { x, y };
      return;
    }
    if (tool === "figlet") { openFigletModal(); return; }
    dragStart = { x, y };
  });

  window.addEventListener("pointermove", (e) => {
    const { x, y } = cellFromEvent(e);
    hoverCell = { x, y };
    if (!dragStart) return;
    if (e.cancelable) e.preventDefault();

    if (tool === "freehand") {
      freehandPaint(x,y);
      return;
    }
    if (tool === "paint") {
      paintColor(x,y);
      return;
    }
    if (tool === "select" && selectedShapeIdx !== null && activeHandle) {
      const orig = resizeOrigin.shape;
      const s = shapes[selectedShapeIdx];
      const dx = x - resizeOrigin.x, dy = y - resizeOrigin.y;
      const isLinelike = s.type === "line" || s.type === "arrow";
      if (isLinelike) {
        if (activeHandle === "nw") { s.x0 = orig.x0 + dx; s.y0 = orig.y0 + dy; }
        else if (activeHandle === "se") { s.x1 = orig.x1 + dx; s.y1 = orig.y1 + dy; }
        else if (activeHandle === "move") { s.x0 = orig.x0 + dx; s.y0 = orig.y0 + dy; s.x1 = orig.x1 + dx; s.y1 = orig.y1 + dy; }
      } else if (s.type === "text" || s.type === "figlet") {
        if (activeHandle === "move") { s.x0 = orig.x0 + dx; s.y0 = orig.y0 + dy; }
      } else if (s.type === "freeform") {
        if (activeHandle === "move") { s.cells = orig.cells.map(([cx, cy, ch]) => [cx + dx, cy + dy, ch]); }
      } else {
        let { x0: ox0, y0: oy0, x1: ox1, y1: oy1 } = orig;
        let minX = Math.min(ox0,ox1), maxX = Math.max(ox0,ox1), minY = Math.min(oy0,oy1), maxY = Math.max(oy0,oy1);
        if (activeHandle.includes("n")) minY = minY + dy;
        if (activeHandle.includes("s")) maxY = maxY + dy;
        if (activeHandle.includes("w")) minX = minX + dx;
        if (activeHandle.includes("e")) maxX = maxX + dx;
        if (activeHandle === "move") { minX = minX + dx; maxX = maxX + dx; minY = minY + dy; maxY = maxY + dy; }
        s.x0 = minX; s.y0 = minY; s.x1 = maxX; s.y1 = maxY;
      }
      if (activeHandle === "move" && resizeOrigin.colorCells && resizeOrigin.colorCells.length) {
        // Clear wherever this drag last painted, then paint at the new offset.
        if (resizeOrigin.lastPaintedKeys) {
          resizeOrigin.lastPaintedKeys.forEach(k => delete colorMap[k]);
        }
        const newKeys = [];
        resizeOrigin.colorCells.forEach(c => {
          const nx = resizeOrigin.colorOrigin.x + c.dx + dx;
          const ny = resizeOrigin.colorOrigin.y + c.dy + dy;
          if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
            colorMap[key(nx, ny)] = c.hex;
            newKeys.push(key(nx, ny));
          }
        });
        resizeOrigin.lastPaintedKeys = newKeys;
      }
      previewShapes = shapes;
      invalidateCache();
      render();
      return;
    }

    if (tool === "box") previewShapes = [...shapes, { type:"box", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y }];
    else if (tool === "circle") previewShapes = [...shapes, { type:"circle", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y }];
    else if (tool === "line") previewShapes = [...shapes, { type:"line", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y, elbow: currentElbow() }];
    else if (tool === "arrow") previewShapes = [...shapes, { type:"arrow", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y, elbow: currentElbow() }];
    else return;
    invalidateCache();
    render();
  });

  window.addEventListener("pointerup", (e) => {
    if (!dragStart) return;
    const { x, y } = cellFromEvent(e);

    if (tool === "select" && activeHandle) {
      history.push(JSON.parse(JSON.stringify({ shapes, colorMap })));
      if (history.length > 50) history.shift();
      future = [];
      previewShapes = null;
      activeHandle = null;
      resizeOrigin = null;
      dragStart = null;
      invalidateCache();
      render();
      scheduleAutosave();
      return;
    }

    if (tool === "box") commitShapes([...shapes, { type:"box", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y }]);
    else if (tool === "circle") commitShapes([...shapes, { type:"circle", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y }]);
    else if (tool === "line") commitShapes([...shapes, { type:"line", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y, elbow: currentElbow() }]);
    else if (tool === "arrow") commitShapes([...shapes, { type:"arrow", x0: dragStart.x, y0: dragStart.y, x1: x, y1: y, elbow: currentElbow() }]);
    else if (tool === "freehand") { /* already committed */ }
    else if (tool === "paint") { /* already committed */ }
    else if (tool === "erase") { /* already committed */ }

    dragStart = null;
    previewShapes = null;
    render();
  });

  window.addEventListener("pointercancel", () => {
    dragStart = null;
    previewShapes = null;
    activeHandle = null;
    resizeOrigin = null;
    render();
  });

  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commitTextInput();
    else if (e.key === "Escape") { textInput.style.display = "none"; textState = null; }
    e.stopPropagation();
  });
  textInput.addEventListener("blur", commitTextInput);
  textInput.addEventListener("pointerdown", (e) => e.stopPropagation());

  document.querySelectorAll("#toolbar button[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => {
      tool = btn.dataset.tool;
      if (tool !== "select") selectedShapeIdx = null;
      render();
    });
  });

  fillSelect.addEventListener("change", (e) => { fillChar = e.target.value; });
  elbowToggle.addEventListener("change", render);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Alt") altHeld = true;
    if (textInput.style.display === "block") return;

    // Don't hijack keys while typing into any text field, or while a modal is open
    // (except Escape, which should still close the modal).
    const activeTag = document.activeElement && document.activeElement.tagName;
    const isTypingField = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
    const modalOpen = helpModalOverlay.style.display === "flex"
      || modalOverlay.style.display === "flex"
      || imageModalOverlay.style.display === "flex";

    if (e.key === "Escape") {
      if (helpModalOverlay.style.display === "flex") { closeHelpModal(); return; }
      if (modalOverlay.style.display === "flex") { closeFigletModal(); return; }
      if (imageModalOverlay.style.display === "flex") { closeImageModal(); return; }
      if (tool === "select" && selectedShapeIdx !== null) {
        selectedShapeIdx = null;
        render();
      }
      return;
    }

    if (isTypingField || modalOpen) return;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault(); if (e.shiftKey) redo(); else undo();
      return;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
      e.preventDefault(); redo();
      return;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault(); saveToStorage(false);
      return;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
      if (tool === "select" && selectedShapeIdx !== null) {
        e.preventDefault();
        clipboard = JSON.parse(JSON.stringify(shapes[selectedShapeIdx]));
        render();
      }
      return;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
      if (clipboard && hoverCell) {
        e.preventDefault();
        pasteBtn.click();
      }
      return;
    } else if ((e.key === "Delete" || e.key === "Backspace") && tool === "select" && selectedShapeIdx !== null) {
      e.preventDefault();
      pushHistory();
      shapes.splice(selectedShapeIdx, 1);
      selectedShapeIdx = null;
      invalidateCache();
      render();
      scheduleAutosave();
      return;
    }

    // Single-letter tool shortcuts (no modifier held)
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      const toolKeyMap = {
        v: "select", b: "box", l: "line", a: "arrow", c: "circle",
        t: "text", g: "figlet", f: "fill", h: "freehand", p: "paint", e: "erase"
      };
      const mapped = toolKeyMap[e.key.toLowerCase()];
      if (mapped) {
        e.preventDefault();
        tool = mapped;
        if (tool !== "select") selectedShapeIdx = null;
        if (tool === "figlet") { openFigletModal(); tool = "select"; }
        render();
      }
    }
  });
  window.addEventListener("keyup", (e) => { if (e.key === "Alt") altHeld = false; });

  function openHelpModal(showShortcuts) {
    helpModalTitle.textContent = showShortcuts ? "Keyboard Shortcuts" : "Help";
    helpPanelAbout.style.display = showShortcuts ? "none" : "block";
    helpPanelShortcuts.style.display = showShortcuts ? "block" : "none";
    helpModalOverlay.style.display = "flex";
  }
  function closeHelpModal() { helpModalOverlay.style.display = "none"; }

  footerHelpLink.addEventListener("click", (e) => { e.preventDefault(); openHelpModal(false); });
  footerShortcutsLink.addEventListener("click", (e) => { e.preventDefault(); openHelpModal(true); });
  helpCloseBtn.addEventListener("click", closeHelpModal);
  helpModalOverlay.addEventListener("click", (e) => { if (e.target === helpModalOverlay) closeHelpModal(); });

  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);

  copySelBtn.addEventListener("click", () => {
    if (selectedShapeIdx === null) return;
    clipboard = JSON.parse(JSON.stringify(shapes[selectedShapeIdx]));
    render();
  });
  deleteSelBtn.addEventListener("click", () => {
    if (selectedShapeIdx === null) return;
    pushHistory();
    shapes.splice(selectedShapeIdx, 1);
    selectedShapeIdx = null;
    invalidateCache();
    render();
    scheduleAutosave();
  });
  pasteBtn.addEventListener("click", () => {
    if (!clipboard || !hoverCell) return;
    pushHistory();
    const s = JSON.parse(JSON.stringify(clipboard));
    if (s.type === "freeform") {
      const b = shapeBounds(s);
      const dx = hoverCell.x - b.minX, dy = hoverCell.y - b.minY;
      s.cells = s.cells.map(([cx, cy, ch]) => [cx + dx, cy + dy, ch]);
    } else {
      const w = s.x1 - s.x0, h = s.y1 - s.y0;
      s.x0 = hoverCell.x; s.y0 = hoverCell.y; s.x1 = hoverCell.x + w; s.y1 = hoverCell.y + h;
    }
    shapes.push(s);
    invalidateCache();
    render();
    scheduleAutosave();
  });

  clearBtn.addEventListener("click", () => {
    pushHistory();
    shapes = [];
    colorMap = {};
    selectedShapeIdx = null;
    invalidateCache();
    render();
    scheduleAutosave();
  });

  exportBtn.addEventListener("click", async () => {
    const text = exportAscii();
    try {
      await navigator.clipboard.writeText(text);
      const orig = exportBtn.textContent;
      exportBtn.textContent = "Copied!";
      setTimeout(() => { exportBtn.textContent = orig; }, 1200);
    } catch(err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  });

  copyHtmlBtn.addEventListener("click", async () => {
    const html = exportHtml();
    try {
      await navigator.clipboard.writeText(html);
      const orig = copyHtmlBtn.textContent;
      copyHtmlBtn.textContent = "Copied!";
      setTimeout(() => { copyHtmlBtn.textContent = orig; }, 1200);
    } catch(err) {
      const ta = document.createElement("textarea");
      ta.value = html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  });

  copyTextBtn.addEventListener("click", async () => {
    const text = exportPlainText();
    try {
      await navigator.clipboard.writeText(text);
      const orig = copyTextBtn.textContent;
      copyTextBtn.textContent = "Copied!";
      setTimeout(() => { copyTextBtn.textContent = orig; }, 1200);
    } catch(err) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  });

  document.getElementById("save-btn").addEventListener("click", () => saveToStorage(false));
  document.getElementById("load-btn").addEventListener("click", () => loadFromStorage(false));

  // Figlet events
  figletGradientToggle.addEventListener("change", () => {
    figletGradientOptions.style.display = figletGradientToggle.checked ? "flex" : "none";
  });
  figletGradientMode.addEventListener("change", () => {
    figletGradient16Note.classList.toggle("hidden", figletGradientMode.value !== "16color");
  });
  figletTextInput.addEventListener("input", () => { buildFontPreviewGrid(); });
  figletCancelBtn.addEventListener("click", closeFigletModal);
  figletInsertBtn.addEventListener("click", insertFiglet);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeFigletModal(); });
  figletTextInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); insertFiglet(); }
    if (e.key === "Escape") closeFigletModal();
  });

  // ---- IMAGE IMPORT EVENTS ----
  imageImportBtn.addEventListener("click", openImageModal);
  imageCancelBtn.addEventListener("click", closeImageModal);
  imageModalOverlay.addEventListener("click", (e) => { if (e.target === imageModalOverlay) closeImageModal(); });

  imageFileInput.addEventListener("change", updateImagePreview);
  imgWidthSlider.addEventListener("input", updateImagePreview);
  imgHeightSlider.addEventListener("input", updateImagePreview);
  imgCharsetSelect.addEventListener("change", updateImagePreview);
  imgContrastSlider.addEventListener("input", updateImagePreview);
  imgGammaSlider.addEventListener("input", updateImagePreview);
  imgEdgesToggle.addEventListener("change", updateImagePreview);
  imgDitherToggle.addEventListener("change", updateImagePreview);
  imgInvertToggle.addEventListener("change", updateImagePreview);

  imageInsertBtn.addEventListener("click", insertImageAscii);

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (fixedCanvasSize) return; // custom size chosen - don't auto-resize to window
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const dims = computeDims();
      if (dims.cols === COLS && dims.rows === ROWS) return;
      COLS = dims.cols; ROWS = dims.rows;
      setInnerSize();
      invalidateCache();
      render();
    }, 150);
  });

  // ---- NEW: canvas size modal (startup + "New" button) ----
  newBtn.addEventListener("click", () => openSizeModal(true));
  sizeModeFull.addEventListener("change", updateSizeModalFieldsVisibility);
  sizeModeCustom.addEventListener("change", updateSizeModalFieldsVisibility);
  sizeColsSlider.addEventListener("input", () => { sizeColsLabel.textContent = sizeColsSlider.value; });
  sizeRowsSlider.addEventListener("input", () => { sizeRowsLabel.textContent = sizeRowsSlider.value; });
  sizeCancelBtn.addEventListener("click", closeSizeModal);
  sizeConfirmBtn.addEventListener("click", confirmSizeModal);
  sizeModalOverlay.addEventListener("click", (e) => { if (e.target === sizeModalOverlay && !sizeCancelBtn.classList.contains("hidden")) closeSizeModal(); });
}

// ---------- init ----------
const footerYearEl = document.getElementById("footer-year");
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
document.querySelectorAll("#app-footer a").forEach(a => {
  a.addEventListener("click", (e) => e.preventDefault());
});

const dims = computeDims();
COLS = dims.cols; ROWS = dims.rows;
setInnerSize();
const hadSavedWork = loadFromStorage(true);
initEvents();
render();

// Prompt for canvas size on a fresh start (nothing to restore). If there's
// existing autosaved work, skip the prompt so returning users land straight
// on their drawing - the canvas already defaults to fitting the window.
if (!hadSavedWork) {
  openSizeModal(false);
}