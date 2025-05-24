const fs = require('fs');
const path = require('path');

function getFolderStructure(dirPath) {
  const stats = fs.statSync(dirPath);

  if (stats.isFile()) {
    return path.basename(dirPath);
  }

  const structure = {
    name: path.basename(dirPath),
    type: 'folder',
    children: []
  };

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const itemStats = fs.statSync(fullPath);

    if (itemStats.isDirectory()) {
      structure.children.push(getFolderStructure(fullPath));
    } else {
      structure.children.push({
        name: item,
        type: 'file'
      });
    }
  }

  return structure;
}

// Usage:
const rootDir = process.argv[2] || '.'; // Pass folder path as CLI arg, defaults to current dir
const structure = getFolderStructure(rootDir);

console.log(JSON.stringify(structure, null, 2));
