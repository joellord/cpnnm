const fs = require("fs");
const path = require("path");

const parentPath = process.argv[2];
const destinationPath = process.argv[3];
console.log(`📑  Analyzing folder ${parentPath}`);
let startParsingTs = (new Date()).getTime();
let allTheFiles = [];
let noNodeModules = [];
let createdFolders = [];

const readDir = (dirPath) => {
  try {
    let files = fs.readdirSync(dirPath, {withFileTypes: true});
    files.map(dirent => {
      if (dirent.isFile()) {
        const fullname = path.join(__dirname, dirPath, dirent.name);
        if (dirPath.indexOf("node_modules") === -1) noNodeModules.push(fullname);
        allTheFiles.push(fullname);
      } else if (dirent.isDirectory() && dirent.name.substr(0, 1) !== ".") {
        readDir(path.join(dirPath, dirent.name));
      }
    });
  } catch(e) {
    console.log("🛑  Error reading " + dirPath);
  }
}

function getIndicatorString(percent) {
  const NUMDOTS = 20;
  const percentagePerDot = parseInt(100 / NUMDOTS);
  let indicatorString = "";
  for (let i = 0; i < NUMDOTS; i++) {
    if (percent < percentagePerDot * i) indicatorString += ".";
    else indicatorString += "O";
  }
  return indicatorString;
}

function copyFile(sourceFile, parentPath, destinationPath) {
  let destinationFile = sourceFile.replace(path.join(__dirname, parentPath), "");
  let destination = path.join(__dirname, destinationPath, destinationFile);
  let destinationDirectory = destination.substr(0, destination.lastIndexOf("/"));
  try {
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, {recursive: true});
    }
    fs.copyFileSync(sourceFile, destination, (err) => {
      console.error("And error occurred while copying " + sourceFile);
    });
  } catch {
    console.log("🛑  Error copying " + sourceFile);

  }
}

readDir(parentPath);
let endParsingTS = (new Date()).getTime();
console.log(`✅  Done with the parsing - ${endParsingTS - startParsingTs} ms`);
console.log(`📊  Total files: ${allTheFiles.length}, Excluding node_modules and .folders: ${noNodeModules.length}`);
console.log(`✏  Starting write process into ${destinationPath}`);
process.stdout.write(`🏁  00%`);
let startCopyTS = (new Date()).getTime();
noNodeModules.map((file, index) => {
  copyFile(file, parentPath, destinationPath);
  let percentage = Math.round(index/noNodeModules.length * 100);
  percentage = (percentage < 10) ? "0" + percentage : percentage;
  if (percentage === 100) percentage = 99;
  process.stdout.write(`\b\b\b${percentage}%`)
});
process.stdout.write(`\b\b\b100%`);
process.stdout.write("\n");
let endCopyTS = (new Date()).getTime();
console.log(`\n🎉  File copy was successful. ${noNodeModules.length} files copied in ${endCopyTS - startCopyTS} ms\n`);