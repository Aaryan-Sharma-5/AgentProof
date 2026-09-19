const fs = require('fs');
const path = require('path');

const STITCH_DIR = 'd:/Projects/AgentProof/stitch_ui/stitch_agentproof_ai_economic_dashboard';
const PAGES_DIR = 'd:/Projects/AgentProof/frontend/src/app';

// Ensure frontend/src/app exists
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

function htmlToJsx(html) {
  let jsx = html;
  
  // Replace class= with className=
  jsx = jsx.replace(/class=/g, 'className=');
  // Replace for= with htmlFor=
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  
  // Replace SVG attributes
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
  jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
  jsx = jsx.replace(/clip-path=/g, 'clipPath=');
  
  // Fix inline styles - just a basic fix for known ones or wipe them
  // A robust inline style converter is hard, but Stitch rarely uses inline styles
  // other than style="width: 50%" or similar. Let's see if we can convert simple ones.
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    const styleObj = p1.split(';').filter(s => s.trim()).reduce((acc, s) => {
      let [key, val] = s.split(':');
      if(key && val) {
        key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        acc.push(`${key}: '${val.trim()}'`);
      }
      return acc;
    }, []);
    return `style={{${styleObj.join(', ')}}}`;
  });

  // Self closing tags (img, input, br, hr)
  jsx = jsx.replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/g, '<$1$2 />');
  
  // Replace href="#" with href="#"
  // We'll replace <a> with <Link> manually later or just leave <a> for now.

  return jsx;
}

const dirs = fs.readdirSync(STITCH_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Map stitch names to routes
const routeMap = {
  'agentproof_autonomous_economic_protocol': 'landing',
  'agentproof_connect_wallet_select_role': 'connect',
  'agentproof_create_task_wizard': 'create-task',
  'agentproof_list_a_service_api': 'list-service',
  'agentproof_live_task_execution_monitor': 'monitor',
  'agentproof_service_marketplace': 'marketplace',
  'agentproof_user_task_dashboard': 'dashboard',
  'agentproof_autonomous_ai_agent_economic_layer': 'economic-layer',
  'agentproof_protocol': 'protocol',
  'agentproof_logo': 'logo',
  'autonomous_hospitality': 'hospitality',
  'professional_friendly_portrait_avatar_of_a_modern_crypto_tech_founder_neutral': 'avatar'
};

for (const dir of dirs) {
  const codePath = path.join(STITCH_DIR, dir, 'code.html');
  if (fs.existsSync(codePath)) {
    const html = fs.readFileSync(codePath, 'utf8');
    
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    
    // Remove script tags at the end of body if any
    bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
    
    const jsxContent = htmlToJsx(bodyContent);
    
    const routeName = routeMap[dir] || dir;
    const targetDir = path.join(PAGES_DIR, routeName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const componentName = routeName.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    
    const pageCode = `
import React from 'react';

export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;
    fs.writeFileSync(path.join(targetDir, 'page.jsx'), pageCode);
    console.log(`Converted ${dir} to route /${routeName}`);
  }
}
