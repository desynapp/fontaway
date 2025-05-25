// generate-desyn-icon.js
// Node.js script to emit a 4-color “D” icon SVG with a true inner hole.

const fs = require('fs');

function generateDesynIcon(opts) {
  const {
    width,
    height,
    barWidth,
    rLeft,
    rRightX,
    rRightY,
    rInnerLeft,
    rInnerRightX,
    rInnerRightY,
  } = opts;

  // Outer D (clockwise)
  const outerPath = [
    `M0,${rLeft}`,
    `A${rLeft},${rLeft} 0 0 1 ${rLeft},0`,
    `L${width - rRightX},0`,
    `A${rRightX},${rRightY} 0 0 1 ${width},${rRightY}`,
    `L${width},${height - rRightY}`,
    `A${rRightX},${rRightY} 0 0 1 ${width - rRightX},${height}`,
    `L${rLeft},${height}`,
    `A${rLeft},${rLeft} 0 0 1 0,${height - rLeft}`,
    'Z'
  ].join(' ');

  // Inner cut-out (counter-clockwise)
  const innerPath = [
    `M${barWidth},${rInnerLeft}`,
    `A${rInnerLeft},${rInnerLeft} 0 0 1 ${barWidth + rInnerLeft},0`,
    `L${width - barWidth - rInnerRightX},0`,
    `A${rInnerRightX},${rInnerRightY} 0 0 0 ${width - barWidth},${rInnerRightY}`,
    `L${width - barWidth},${height - rInnerRightY}`,
    `A${rInnerRightX},${rInnerRightY} 0 0 0 ${width - barWidth - rInnerRightX},${height}`,
    `L${barWidth + rInnerLeft},${height}`,
    `A${rInnerLeft},${rInnerLeft} 0 0 0 ${barWidth},${height - rInnerLeft}`,
    'Z'
  ].join(' ');

  const midX = width / 2;
  const midY = height / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">

  <defs>
    <mask id="maskD" maskUnits="userSpaceOnUse">
      <!-- Outer shape white = show -->
      <path d="${outerPath}" fill="white"/>
      <!-- Inner hole black = hide -->
      <path d="${innerPath}" fill="black"/>
    </mask>
  </defs>

  <!-- Four quadrants, masked to the D -->
  <g mask="url(#maskD)">
    <rect x="0"      y="0"      width="${midX}" height="${midY}" fill="#6E5BFF"/>
    <rect x="${midX}" y="0"      width="${midX}" height="${midY}" fill="#3BA1FF"/>
    <rect x="0"      y="${midY}" width="${midX}" height="${midY}" fill="#00C859"/>
    <rect x="${midX}" y="${midY}" width="${midX}" height="${midY}" fill="#FF3B30"/>
  </g>

</svg>`;
}

// === Tweak these to match your screenshot exactly ===
const opts = {
  width:           160,
  height:          200,
  barWidth:         50,
  rLeft:            50,
  rRightX:         150,
  rRightY:         100,
  rInnerLeft:       30,
  rInnerRightX:     70,
  rInnerRightY:     70,
};

const svg = generateDesynIcon(opts);
fs.writeFileSync('desyn-icon.svg', svg, 'utf8');
console.log('✔ desyn-icon.svg generated with inner hole.');
