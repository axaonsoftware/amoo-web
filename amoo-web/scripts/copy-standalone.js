const fs = require("fs");
const path = require("path");

const root = process.cwd();

const staticSource = path.join(root, ".next", "static");
const staticDestination = path.join(
  root,
  ".next",
  "standalone",
  ".next",
  "static"
);

fs.cpSync(staticSource, staticDestination, { recursive: true });

const publicSource = path.join(root, "public");
const publicDestination = path.join(root, ".next", "standalone", "public");

if (fs.existsSync(publicSource)) {
  fs.cpSync(publicSource, publicDestination, { recursive: true });
}

console.log("Standalone deployment files copied successfully.");