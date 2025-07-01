import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component first
const TestApp: React.FC = () => {
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Will's Attic - Test</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
};

try {
  console.log('Starting app initialization...');
  
  // Get the root element
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }
  
  console.log('Root element found, creating React root...');
  
  // Create root and render app
  const root = createRoot(container);
  root.render(<TestApp />);
  
  console.log('App rendered successfully!');
} catch (error) {
  console.error('Error initializing app:', error);
  
  // Fallback HTML content
  const container = document.getElementById('root');
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Error Loading App</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Check the browser console for more details.</p>
      </div>
    `;
  }
}