const fs = require('fs');
const html = fs.readFileSync('stitch_ui/stitch_agentproof_ai_economic_dashboard/agentproof_user_task_dashboard/code.html', 'utf8');
const match = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})<\/script>/);
if (match) {
  let configStr = match[1];
  let outStr = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  ${configStr.substring(1)};`;
  fs.writeFileSync('frontend/tailwind.config.js', outStr);
  console.log('Successfully extracted tailwind config');
} else {
  console.log('Regex match failed');
}
