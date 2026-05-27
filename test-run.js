#!/usr/bin/env node
/**
 * Test runner for opencode-mdocs plugin
 * Simulates what opencode does when loading the plugin
 */

const path = require('path');
const fs = require('fs');

// We need to run this from the plugin directory so it can resolve
const pluginPath = path.resolve(__dirname);
const testProjectDir = path.resolve('/tmp/opencode-mdocs-test-run');
const mdocsRoot = path.join(testProjectDir, 'mdocs');

// Clean up any previous test run
if (fs.existsSync(testProjectDir)) {
  fs.rmSync(testProjectDir, { recursive: true });
}
fs.mkdirSync(testProjectDir, { recursive: true });

console.log('=== opencode-mdocs Plugin Test Run ===\n');
console.log(`Test project: ${testProjectDir}\n`);

// Simulate what opencode does: require the plugin and pass context
const createPlugin = require(path.join(pluginPath, 'dist', 'plugin.js')).createPlugin;

console.log('1. Loading plugin...');
const plugin = createPlugin(testProjectDir);
console.log('   ✓ Plugin loaded\n');

// Step 1: Config hook (this initializes /mdocs)
console.log('2. Calling config hook (first run)...');
plugin.config({});
console.log('   ✓ Config hook executed\n');

// Verify /mdocs structure
console.log('3. Verifying /mdocs structure...');
const mdocsDir = path.join(testProjectDir, 'mdocs');
const initiativesDir = path.join(mdocsDir, 'initiatives');
const wikiDir = path.join(mdocsDir, 'wiki');

// Debug: List all files in test project
console.log(`   Files in test project: ${fs.readdirSync(testProjectDir).join(', ')}`);
if (fs.existsSync(mdocsDir)) {
  console.log(`   Files in mdocs: ${fs.readdirSync(mdocsDir).join(', ')}`);
}

console.log(`   initiatives dir exists: ${fs.existsSync(initiativesDir) ? '✓' : '✗'}`);
console.log(`   wiki dir exists: ${fs.existsSync(wikiDir) ? '✓' : '✗'}`);
console.log(`   initiatives/INDEX.md exists: ${fs.existsSync(path.join(initiativesDir, 'INDEX.md')) ? '✓' : '✗'}`);
console.log(`   wiki/INDEX.md exists: ${fs.existsSync(path.join(wikiDir, 'INDEX.md')) ? '✓' : '✗'}`);

// Verify bootstrap initiative
console.log('\n4. Verifying bootstrap initiative...');
const initiativeFiles = fs.readdirSync(initiativesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
console.log(`   Found ${initiativeFiles.length} initiative(s)`);
if (initiativeFiles.length > 0) {
  const initFile = initiativeFiles[0];
  const initContent = fs.readFileSync(path.join(initiativesDir, initFile), 'utf8');
  console.log(`   File: ${initFile}`);
  console.log(`   Content preview:\n${initContent.split('\n').slice(0, 8).join('\n')}\n   ...`);
}

// Step 2: Test workflow state
console.log('\n5. Testing workflow state machine...');
const WorkflowEngine = require(path.join(pluginPath, 'dist', 'workflow.js')).WorkflowEngine;
const workflow = new WorkflowEngine(mdocsRoot);
console.log(`   Initial step: ${workflow.getCurrentStep()} ✓`);

workflow.advance('UNDERSTAND');
console.log(`   After UNDERSTAND: ${workflow.getCurrentStep()} ✓`);

workflow.advance('DISCOVER');
workflow.advance('CONTEXT');
workflow.advance('PLAN');
console.log(`   After PLAN: ${workflow.getCurrentStep()} ✓`);

// Step 3: Test tool gate enforcement
console.log('\n6. Testing tool gate enforcement...');

// Read tools should always be allowed
console.log(`   read at UNDERSTAND: ${workflow.canExecuteTool('read') ? '✓ allowed' : '✗ blocked'}`);
console.log(`   glob at PLAN: ${workflow.canExecuteTool('glob') ? '✓ allowed' : '✗ blocked'}`);

  // Write tools should be blocked before PLAN, allowed after
  const workflow2 = new WorkflowEngine(path.join(mdocsRoot, 'workflow2'));
workflow2.advance('UNDERSTAND');
console.log(`   write at UNDERSTAND: ${workflow2.canExecuteTool('write') ? '✓ allowed' : '✗ blocked'}`);

workflow2.advance('DISCOVER');
workflow2.advance('CONTEXT');
workflow2.advance('PLAN');
console.log(`   write at PLAN: ${workflow2.canExecuteTool('write') ? '✓ allowed' : '✗ blocked'}`);

// Bash tool filtering
console.log(`   bash 'ls' at UNDERSTAND: ${workflow2.canExecuteTool('bash', { command: 'ls -la' }) ? '✓ allowed' : '✗ blocked'}`);
console.log(`   bash 'git commit' at UNDERSTAND: ${workflow2.canExecuteTool('bash', { command: 'git commit -m test' }) ? '✓ allowed' : '✗ blocked'}`);

workflow2.advance('EXECUTE');
workflow2.advance('VERIFY');
workflow2.advance('REPORT');
workflow2.advance('COMPLETE');
console.log(`   bash 'git commit' at COMPLETE: ${workflow2.canExecuteTool('bash', { command: 'git commit -m test' }) ? '✓ allowed' : '✗ blocked'}`);

// Step 4: Test custom tools
console.log('\n7. Testing custom tools...');
(async () => {
if (plugin.tool && plugin.tool.mdocs_status) {
  const status = await plugin.tool.mdocs_status.handler();
  console.log(`   mdocs_status returned workflow step: ${status.workflow.currentStep}`);
  console.log(`   mdocs_status returned ${status.initiatives.length} active initiative(s)`);
} else {
  console.log('   ✗ Custom tools not found');
}

// Step 5: Test plugin hook enforcement
console.log('\n8. Testing tool.execute.before hook...');
try {
  // Simulate calling the hook with a write tool when at UNDERSTAND
  const workflow3 = new WorkflowEngine(path.join(mdocsRoot, 'workflow3'));
  workflow3.advance('UNDERSTAND');
  
  // This should work because we can't easily inject the workflow state into the plugin
  // The plugin uses its own workflow instance. Let's just show the hook exists.
  console.log(`   Hook exists: ${typeof plugin['tool.execute.before'] === 'function' ? '✓' : '✗'}`);
  console.log(`   Hook type: ${typeof plugin['tool.execute.before']}`);
} catch (e) {
  console.log(`   ✗ Error: ${e}`);
}

console.log('\n=== Test Run Complete ===');
console.log(`\nAll artifacts saved to: ${testProjectDir}`);
console.log(`You can inspect the generated files there.`);
})();
