const fs = require('fs');
const path = require('path');

const colorTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'color-tokens.json'), 'utf-8'));
const designTokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'design-tokens.json'), 'utf-8'));

let css = ':root {\n';

// Color roles only (no primitive colors exposed to UI)
for (const [key, value] of Object.entries(colorTokens.color)) {
  css += `  --color-${key}: ${value.$value};\n`;
}

// Typography
for (const [key, value] of Object.entries(designTokens.typography)) {
  let val = value.$value;
  if (value.$type === 'fontFamily' && /\s/.test(val) && !/^['"]/.test(val)) {
    val = `'${val}'`;
  }
  css += `  --${key}: ${val};\n`;
}

// Spacing
if (designTokens.spacing) {
  for (const [key, value] of Object.entries(designTokens.spacing)) {
    css += `  --${key}: ${value.$value};\n`;
  }
}

// Border radius
if (designTokens.borderRadius) {
  for (const [key, value] of Object.entries(designTokens.borderRadius)) {
    css += `  --${key}: ${value.$value};\n`;
  }
}

// Shadows
if (designTokens.shadow) {
  for (const [key, value] of Object.entries(designTokens.shadow)) {
    css += `  --${key}: ${value.$value};\n`;
  }
}

// Borders
if (designTokens.border) {
  for (const [key, value] of Object.entries(designTokens.border)) {
    css += `  --${key}: ${value.$value};\n`;
  }
}

// Icon sizes
if (designTokens.iconSize) {
  for (const [key, value] of Object.entries(designTokens.iconSize)) {
    css += `  --${key}: ${value.$value};\n`;
  }
}

css += '}\n';

const outPath = path.join(__dirname, 'tokens.css');
fs.writeFileSync(outPath, css);
console.log(`Generated ${outPath}`);
