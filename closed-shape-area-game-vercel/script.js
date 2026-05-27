const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const targetText = document.getElementById("targetText");
const resultText = document.getElementById("resultText");

const calculateBtn = document.getElementById("calculateBtn");
const clearBtn = document.getElementById("clearBtn");
const newTargetBtn = document.getElementById("newTargetBtn");

const X_MAX = 10;
const Y_MAX = 10;

const canvasW = canvas.width;
const canvasH = canvas.height;
const left = 70;
const topMargin = 35;
const right = 35;
const bottom = 65;
const graphW = canvasW - left - right;
const graphH = canvasH - topMargin - bottom;

let targetArea = randomTarget();
let points = [];
let isDrawing = false;
let shapeCalculated = false;

function randomTarget() {
  return Math.floor(Math.random() * 71) + 15;
}

function updateTargetText() {
  targetText.textContent = `Target area: ${targetArea} square units`;
}

function toCanvas(x, y) {
  const px = left + (x / X_MAX) * graphW;
  const py = topMargin + graphH - (y / Y_MAX) * graphH;
  return { px, py };
}

function toMath(px, py) {
  const clampedX = Math.max(left, Math.min(left + graphW, px));
  const clampedY = Math.max(topMargin, Math.min(topMargin + graphH, py));

  const x = ((clampedX - left) / graphW) * X_MAX;
  const y = ((topMargin + graphH - clampedY) / graphH) * Y_MAX;

  return { x, y };
}

function insideGraph(px, py) {
  return (
    px >= left &&
    px <= left + graphW &&
    py >= topMargin &&
    py <= topMargin + graphH
  );
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvasW, canvasH);
}

function drawGrid() {
  ctx.save();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.strokeRect(left, topMargin, graphW, graphH);

  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#111827";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= X_MAX; i++) {
    const { px } = toCanvas(i, 0);

    ctx.beginPath();
    ctx.moveTo(px, topMargin);
    ctx.lineTo(px, topMargin + graphH);
    ctx.stroke();

    ctx.fillText(String(i), px, topMargin + graphH + 20);
  }

  ctx.textAlign = "right";
  for (let j = 0; j <= Y_MAX; j++) {
    const { py } = toCanvas(0, j);

    ctx.beginPath();
    ctx.moveTo(left, py);
    ctx.lineTo(left + graphW, py);
    ctx.stroke();

    ctx.fillText(String(j), left - 14, py);
  }

  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("x", left + graphW / 2, canvasH - 20);

  ctx.save();
  ctx.translate(25, topMargin + graphH / 2);
  ctx.fillText("y", 0, 0);
  ctx.restore();

  ctx.restore();
}

function redrawAll() {
  clearCanvas();
  drawClosedShapeFill();
  drawGrid();
  drawDrawing();
  updateTargetText();
}

function drawDrawing() {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(points[0].px, points[0].py);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].px, points[i].py);
  }

  ctx.stroke();

  if (shapeCalculated && points.length >= 3) {
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].px, points[points.length - 1].py);
    ctx.lineTo(points[0].px, points[0].py);
    ctx.stroke();
  }

  ctx.restore();
}

function drawClosedShapeFill() {
  if (!shapeCalculated || points.length < 3) return;

  ctx.save();
  ctx.fillStyle = "#bdeeff";

  ctx.beginPath();
  ctx.moveTo(points[0].px, points[0].py);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].px, points[i].py);
  }

  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  let clientX;
  let clientY;

  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    px: (clientX - rect.left) * scaleX,
    py: (clientY - rect.top) * scaleY
  };
}

function startDraw(event) {
  event.preventDefault();

  const { px, py } = getCanvasPoint(event);
  if (!insideGraph(px, py)) return;

  if (shapeCalculated) {
    clearDrawing();
  }

  isDrawing = true;
  points.push({ px, py });
  redrawAll();
}

function draw(event) {
  if (!isDrawing) return;
  event.preventDefault();

  const { px, py } = getCanvasPoint(event);
  if (!insideGraph(px, py)) return;

  const lastPoint = points[points.length - 1];
  const dx = px - lastPoint.px;
  const dy = py - lastPoint.py;

  // Avoid recording too many points when the mouse/finger barely moves.
  if (dx * dx + dy * dy < 9) return;

  points.push({ px, py });
  redrawAll();
}

function endDraw(event) {
  event.preventDefault();
  isDrawing = false;
}

function estimateClosedArea() {
  if (points.length < 3) return null;

  const mathPoints = points.map((point) => toMath(point.px, point.py));

  let total = 0;

  for (let i = 0; i < mathPoints.length; i++) {
    const p1 = mathPoints[i];
    const p2 = mathPoints[(i + 1) % mathPoints.length];

    total += p1.x * p2.y - p2.x * p1.y;
  }

  return Math.abs(total) / 2;
}

function calculateArea() {
  const area = estimateClosedArea();

  resultText.className = "result";

  if (area === null) {
    resultText.textContent = "Draw a bigger closed shape first.";
    resultText.classList.add("bad");
    return;
  }

  shapeCalculated = true;
  redrawAll();

  const error = Math.abs(area - targetArea);
  const score = Math.max(0, Math.round(100 * (1 - error / targetArea)));

  if (score >= 80) {
    resultText.classList.add("good");
  } else if (score >= 50) {
    resultText.classList.add("medium");
  } else {
    resultText.classList.add("bad");
  }

  resultText.textContent =
    `Your Area ≈ ${area.toFixed(2)}\n` +
    `Target = ${targetArea}    Error = ${error.toFixed(2)}    Score = ${score}/100`;
}

function clearDrawing() {
  points = [];
  isDrawing = false;
  shapeCalculated = false;

  resultText.className = "result";
  resultText.textContent = "Drawing cleared. Draw one closed shape again.";

  redrawAll();
}

function newTarget() {
  targetArea = randomTarget();
  clearDrawing();

  resultText.className = "result";
  resultText.textContent = "New target generated. Draw a new closed shape.";
  updateTargetText();
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", endDraw);

canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", endDraw, { passive: false });

calculateBtn.addEventListener("click", calculateArea);
clearBtn.addEventListener("click", clearDrawing);
newTargetBtn.addEventListener("click", newTarget);

redrawAll();
