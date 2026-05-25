import { MdocsManager } from '../mdocs';
import * as fs from 'fs';
import * as path from 'path';

const testDir = path.join(__dirname, 'test-mdocs');

beforeEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
});

afterEach(() => {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
});

test('init creates directory structure', () => {
  const manager = new MdocsManager(testDir);
  manager.init();

  expect(fs.existsSync(path.join(testDir, 'initiatives'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'wiki'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'initiatives', 'INDEX.md'))).toBe(true);
  expect(fs.existsSync(path.join(testDir, 'wiki', 'INDEX.md'))).toBe(true);
});
