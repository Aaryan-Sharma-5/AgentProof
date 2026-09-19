const fs = require('fs');
const path = require('path');
function fixSpecificIssues(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      fixSpecificIssues(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix style fontVariationSettings
      content = content.replace(/''FILL' 1'/g, '\'\"FILL\" 1\'');
      
      // Fix JSON inside <pre>
      content = content.replace(/-d '\{"agent_id": "agent-0x94f", "task": "realtime_query"\}'/g, '-d \\\'{"agent_id": "agent-0x94f", "task": "realtime_query"}\\\'');
      content = content.replace(/\{"agent_id"/g, '{"{\\"agent_id\\""}'); // this is messy, let's just use string interpolation or React fragments

      // Best way to fix `{` inside JSX text is to replace `{` with `{"{"}` and `}` with `{"}"}` inside the pre block.
      // But we can just target the exact string:
      content = content.replace(/'{"agent_id": "agent-0x94f", "task": "realtime_query"}'/g, '{"\'{\\"agent_id\\": \\"agent-0x94f\\", \\"task\\": \\"realtime_query\\"}\'"}');

      // Fix `< /></circle>`
      content = content.replace(/< \/><\/(circle|path|rect|polygon|line|ellipse)>/g, '</$1>');
      content = content.replace(/<\/(circle|path|rect|polygon|line|ellipse)>/g, '');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}
fixSpecificIssues('d:/Projects/AgentProof/frontend/src/app');
console.log('Fixed specific issues');
