import fs from 'fs';
import path from 'path';

const files = [
  'MainDashboard',
  'SalesPipelineView',
  'SingleAgentDetailPage',
  'AgentBuilderCanvas',
  'OnboardingSetupWizard'
];

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function cssToObj(css) {
  const obj = {};
  css.split(';').forEach(rule => {
    if (!rule.trim()) return;
    let [key, val] = rule.split(/:(.+)/);
    if (key && val) {
      obj[kebabToCamel(key.trim())] = val.trim();
    }
  });
  return JSON.stringify(obj);
}

files.forEach(name => {
  const htmlPath = path.join('tmp/stitch', `${name}.html`);
  if (!fs.existsSync(htmlPath)) return;
  
  let content = fs.readFileSync(htmlPath, 'utf-8');
  
  // Extract body
  const bodyMatch = content.match(/<body([^>]*)>([\s\S]*?)<\/body>/);
  if (!bodyMatch) return;
  
  let bodyAttrs = bodyMatch[1];
  let innerHtml = bodyMatch[2];
  
  // Convert body to div
  let jsx = `<div${bodyAttrs}>\n${innerHtml}\n</div>`;
  
  // class to className
  jsx = jsx.replace(/ class=/g, ' className=');
  // for to htmlFor
  jsx = jsx.replace(/ for=/g, ' htmlFor=');
  // tabindex to tabIndex
  jsx = jsx.replace(/ tabindex=/g, ' tabIndex=');
  
  // self closing tags
  jsx = jsx.replace(/<(img|input|br|hr)([^>]*?)(?:\/)?>/g, (m, tag, attrs) => {
    if (attrs.endsWith('/')) return m; // already closed
    // Ensure no nested > in attrs, but should be fine for simple AI output
    return `<${tag}${attrs} />`;
  });
  
  // html comments to JSX comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
  
  // convert style="..."
  jsx = jsx.replace(/ style="([^"]*)"/g, (m, styles) => {
    return ` style={${cssToObj(styles)}}`;
  });
  jsx = jsx.replace(/ style='([^']*)'/g, (m, styles) => {
    return ` style={${cssToObj(styles)}}`;
  });
  
  let componentCode = `import React from 'react';

export default function ${name}() {
  return (
    ${jsx}
  );
}
`;

  fs.writeFileSync(`apps/web/components/${name}.tsx`, componentCode);
  console.log(`Created ${name}.tsx`);
});
