#!/usr/bin/env node
/* eslint-env node */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const REDUNDANT_PATTERNS = [
  // Japanese patterns
  { pattern: /\/\/\s*(成功|失敗|エラー)\s*$/m, description: 'Success/failure comments' },
  { pattern: /\/\/\s*(.+)を(取得|設定|削除|追加|更新)(\s*する)?\s*$/m, description: 'Action description comments' },
  { pattern: /\/\/\s*画像を読み込む\s*$/m, description: 'Image loading comment' },
  { pattern: /\/\/\s*ファイルを読み込む\s*$/m, description: 'File loading comment' },
  
  // English patterns
  { pattern: /\/\/\s*(Get|Set|Add|Remove|Delete|Update|Check|Load)\s+\w+\s*$/m, description: 'Basic action comments' },
  { pattern: /\/\/\s*(Success|Failed?|Error)\s*$/m, description: 'Status comments' },
  { pattern: /\/\/\s*Add\s+(text|remaining\s+text|element)\s*(before|after)?\s*\w*\s*$/m, description: 'Text manipulation comments' },
  { pattern: /\/\/\s*Check\s+if\s+.*\s*$/m, description: 'Conditional check comments' },
  { pattern: /\/\/\s*Get\s+the\s+\w+\s*$/m, description: 'Get variable comments' },
  { pattern: /\/\/\s*Create\s+(a\s+)?\w+\s*$/m, description: 'Object creation comments' },
  { pattern: /\/\/\s*Return\s+\w+\s*$/m, description: 'Return statement comments' },
  { pattern: /\/\/\s*Call\s+\w+\s*$/m, description: 'Function call comments' },
  
  // Variable assignment patterns
  { pattern: /\/\/\s*\w+\s*(=|:)\s*\w+\s*$/m, description: 'Variable assignment comments' },
  
  // Common redundant phrases
  { pattern: /\/\/\s*(Initialize|Setup|Configure)\s+\w+\s*$/m, description: 'Initialization comments' },
  { pattern: /\/\/\s*(Handle|Process)\s+\w+\s*$/m, description: 'Handler comments' }
];

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'build') {
          traverse(fullPath);
        }
      } else if (extensions.includes(extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function checkFileForRedundantComments(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip if line doesn't contain a comment
      if (!trimmedLine.includes('//')) return;
      
      // Extract the comment part
      const commentMatch = trimmedLine.match(/\/\/(.*)$/);
      if (!commentMatch) return;
      
      const comment = commentMatch[1].trim();
      
      // Skip empty comments or comments with meaningful content
      if (!comment || comment.length < 3) return;
      
      // Check against redundant patterns
      for (const { pattern, description } of REDUNDANT_PATTERNS) {
        if (pattern.test(`//${comment}`)) {
          issues.push({
            line: index + 1,
            comment: comment,
            pattern: description,
            fullLine: line
          });
          break;
        }
      }
    });
    
    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  const srcDir = join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  console.log('🔍 Checking for redundant comments...\n');
  
  for (const file of files) {
    const issues = checkFileForRedundantComments(file);
    
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;
      
      const relativePath = file.replace(process.cwd() + '/', '');
      console.log(`📁 ${relativePath}:`);
      
      issues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.comment}`);
        console.log(`    Pattern: ${issue.pattern}`);
        console.log(`    Code: ${issue.fullLine.trim()}`);
        console.log('');
      });
    }
  }
  
  if (totalIssues === 0) {
    console.log('✅ No redundant comments found!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalIssues} redundant comments in ${filesWithIssues} files.`);
    console.log('\n💡 Consider removing these comments as they don\'t add value beyond what the code already shows.');
    process.exit(1);
  }
}

main();