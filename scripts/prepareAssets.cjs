// Copies ./assets/** -> ./public/assets/** for Netlify/static hosting
const fs = require("fs");
const path = require("path");

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e);
    const d = path.join(dst, e);
    const st = fs.lstatSync(s);
    if (st.isSymbolicLink()) {
      // Resolve symlink target and copy contents
      const target = fs.realpathSync(s);
      const targetStat = fs.statSync(target);
      if (targetStat.isDirectory()) copyDir(target, d);
      else fs.copyFileSync(target, d);
    } else if (st.isDirectory()) {
      copyDir(s, d);
    } else if (st.isFile()) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

// Remove existing symlink/directory if it exists
const publicAssetsPath = path.join(process.cwd(), "public", "assets");
if (fs.existsSync(publicAssetsPath)) {
  fs.rmSync(publicAssetsPath, { recursive: true, force: true });
}

// Heraldry (and any other generated assets)
copyDir(path.join(process.cwd(), "assets"), publicAssetsPath);
console.log("Copied ./assets -> ./public/assets");
