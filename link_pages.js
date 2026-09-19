const fs = require('fs');
const path = require('path');

const PAGES_DIR = 'd:/Projects/AgentProof/frontend/src/app';

function connectLinks(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      connectLinks(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Add Link import if not exists
      if (!content.includes('import Link from')) {
        content = content.replace("import React from 'react';", "import React from 'react';\nimport Link from 'next/link';");
      }

      // Convert <a> to <Link> globally but keeping classes
      // Wait, just changing href inside <a> is enough for now, but <Link href="..."> is better for SPA.
      // Next.js 13+ allows <Link className="...">...</Link> without <a> child.
      content = content.replace(/<a([^>]*?)href="#"([^>]*?)>([\s\S]*?)<\/a>/g, (match, p1, p2, inner) => {
        let newHref = '"#"'; // default
        const fullAttrs = (p1 + p2);
        if (fullAttrs.includes('data-path="tasks"')) newHref = '"/dashboard"';
        else if (fullAttrs.includes('data-path="marketplace"')) newHref = '"/marketplace"';
        else if (fullAttrs.includes('data-path="live-execution-monitor"')) newHref = '"/monitor"';
        else if (fullAttrs.includes('Create New Task')) newHref = '"/create-task"';
        else if (fullAttrs.includes('Connect Wallet')) newHref = '"/connect"';
        else if (fullAttrs.includes('List a Service')) newHref = '"/list-service"';
        else if (inner.includes('Get Started')) newHref = '"/dashboard"';
        else if (inner.includes('Dashboard')) newHref = '"/dashboard"';
        
        return `<Link${p1}href=${newHref}${p2}>${inner}</Link>`;
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

connectLinks(PAGES_DIR);
console.log('Linked pages successfully.');
