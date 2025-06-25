#!/usr/bin/env node

/**
 * Documentation Link Validator
 * 
 * This script validates that all internal links in the documentation
 * point to existing files and sections.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Extract markdown links from content
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return links;
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Validate a single file's links
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const links = extractLinks(content);
  const errors = [];
  
  console.log(`\n📄 Validating ${fileName}...`);
  
  for (const link of links) {
    // Skip external links
    if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
      continue;
    }
    
    // Skip anchor-only links
    if (link.url.startsWith('#')) {
      continue;
    }
    
    // Resolve relative paths
    let targetPath;
    if (link.url.startsWith('../')) {
      targetPath = path.resolve(path.dirname(filePath), link.url);
    } else if (link.url.startsWith('docs/')) {
      // Handle docs/ links from root files
      targetPath = path.resolve(ROOT_DIR, link.url);
    } else {
      targetPath = path.resolve(path.dirname(filePath), link.url);
    }
    
    // Remove anchor from path
    const [pathOnly] = targetPath.split('#');
    
    if (!fileExists(pathOnly)) {
      errors.push(`❌ Line ${link.line}: Broken link "${link.url}" -> "${pathOnly}"`);
    } else {
      console.log(`✅ ${link.text} -> ${link.url}`);
    }
  }
  
  return errors;
}

/**
 * Main validation function
 */
function validateDocumentation() {
  console.log('🔍 Validating Natsuki Quest Documentation Links...\n');
  
  // Get all markdown files
  const files = [
    path.join(ROOT_DIR, 'README.md'),
    path.join(ROOT_DIR, 'CONTRIBUTING.md'),
    ...fs.readdirSync(DOCS_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(DOCS_DIR, file))
  ];
  
  let totalErrors = 0;
  
  for (const file of files) {
    if (fileExists(file)) {
      const errors = validateFile(file);
      totalErrors += errors.length;
      
      if (errors.length > 0) {
        console.log(`\n❌ ${path.basename(file)} has ${errors.length} broken links:`);
        errors.forEach(error => console.log(`  ${error}`));
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (totalErrors === 0) {
    console.log('🎉 All documentation links are valid!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${totalErrors} broken links total.`);
    process.exit(1);
  }
}

// Run validation
validateDocumentation();