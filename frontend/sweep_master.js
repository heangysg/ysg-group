const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

const replacements = [
  // Old Sweep 1 Replacements
  { regex: /\bborder-2 border-slate-900\b/g, replacement: "border border-slate-200" },
  { regex: /\bshadow-hard\b/g, replacement: "shadow-sm" },
  { regex: /\bshadow-hard-primary\b/g, replacement: "shadow-md shadow-primary/20" },
  { regex: /\bshadow-hard-white\b/g, replacement: "shadow-sm" },
  { regex: /\bborder-b-\[4px\] border-slate-900\b/g, replacement: "border-b border-slate-200" },
  { regex: /\bborder-t-\[4px\] border-slate-900\b/g, replacement: "border-t border-slate-200" },
  { regex: /\bborder-l-\[4px\] border-slate-900\b/g, replacement: "border-l border-slate-200" },
  { regex: /\bborder-r-\[4px\] border-slate-900\b/g, replacement: "border-r border-slate-200" },
  { regex: /\brounded-none\b/g, replacement: "rounded-xl" },
  
  // New Sweep 2 Replacements (Typography)
  { regex: /\buppercase tracking-widest\b/g, replacement: "font-medium" },
  { regex: /\buppercase tracking-\[0\.2em\]\b/g, replacement: "font-medium" },
  { regex: /\buppercase tracking-tight\b/g, replacement: "font-medium" },
  { regex: /\btracking-widest uppercase\b/g, replacement: "font-medium" },
  { regex: /\btracking-widest\b/g, replacement: "" },
  
  // New Sweep 2 Replacements (Remaining Borders)
  { regex: /\bborder-b-2 border-slate-900\b/g, replacement: "border-b border-slate-200" },
  { regex: /\bborder-t-2 border-slate-900\b/g, replacement: "border-t border-slate-200" },
  { regex: /\bborder-l-2 border-slate-900\b/g, replacement: "border-l border-slate-200" },
  { regex: /\bborder-r-2 border-slate-900\b/g, replacement: "border-r border-slate-200" },
  { regex: /\bborder-2 border-transparent hover:border-slate-900\b/g, replacement: "border border-transparent hover:border-slate-200" },
  { regex: /\bborder-slate-900\b/g, replacement: "border-slate-200" },
  { regex: /\bborder-slate-800\b/g, replacement: "border-slate-200" },
  
  // New Sweep 2 Replacements (Remaining Shadows)
  { regex: /\bshadow-hard-lg\b/g, replacement: "shadow-md" },
  { regex: /\bshadow-hard-sm\b/g, replacement: "shadow-sm" },
  { regex: /\bshadow-hard-red\b/g, replacement: "shadow-md shadow-red-500/20" },
  { regex: /\bshadow-\[4px_4px_0px_#primary\]\b/g, replacement: "shadow-md" },
  { regex: /\bshadow-\[2px_2px_0px_#0f172a\]\b/g, replacement: "shadow-sm" },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      // DO NOT replace spaces/newlines like the last script did!
      // (content = content.replace(/\s+/g, ' ') was the culprit)

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log("Starting master anti-brutalism sweep...");
directories.forEach(processDirectory);
console.log("Sweep complete!");
