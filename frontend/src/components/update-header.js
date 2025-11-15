// Temporary script to update header
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'EnhancedHeader.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add Wifi to imports if not already there
if (!content.includes('Wifi')) {
  content = content.replace(
    /(Users,\s+Menu,)/,
    'Users,\n  Wifi,\n  Menu,'
  );
}

// Add WebSocket navigation item
const navigationPattern = /(\s+\/\/ Team - Only for managers and admins[\s\S]*?\[\{ id: "team".*?\}\],\s*\))/;
const replacement = `$1
    // WebSocket Streaming - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "websocket", label: "WebSocket Streaming", icon: Wifi }] : []),`;

if (!content.includes('id: "websocket"')) {
  content = content.replace(navigationPattern, replacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ EnhancedHeader.jsx updated with WebSocket navigation');
