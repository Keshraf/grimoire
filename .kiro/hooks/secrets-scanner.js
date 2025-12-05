#!/usr/bin/env node
/**
 * Git pre-commit hook to scan staged files for potential secrets
 * Exit code 1 = secrets found (block commit)
 * Exit code 0 = no secrets found (allow commit)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Folders to ignore
const IGNORED_FOLDERS = ["node_modules", ".git", "dist", "build"];

// File patterns to ignore
const IGNORED_FILES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
];

// Secret patterns to detect
const SECRET_PATTERNS = [
  { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: "Context7 API Key", pattern: /ctx7sk-[a-zA-Z0-9]{20,}/g },
  {
    name: "Stripe Publishable Key",
    pattern: /pk_(?:live|test)_[a-zA-Z0-9]{20,}/g,
  },
  { name: "Stripe Secret Key", pattern: /sk_(?:live|test)_[a-zA-Z0-9]{20,}/g },
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g },
  {
    name: "Generic API Key",
    pattern:
      /(?:api_key|apikey|api-key)\s*[=:]\s*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
  },
  {
    name: "Generic Secret",
    pattern:
      /(?:secret|password|passwd|pwd)\s*[=:]\s*['"]?([a-zA-Z0-9_\-]{8,})['"]?/gi,
  },
  {
    name: "Generic Token",
    pattern:
      /(?:token|auth_token|access_token)\s*[=:]\s*['"]?([a-zA-Z0-9_\-]{16,})['"]?/gi,
  },
  {
    name: "Base64 Encoded String",
    pattern: /['"][A-Za-z0-9+/]{32,}={0,2}['"]/g,
  },
  {
    name: "Private Key",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
  },
];

function maskSecret(secret) {
  if (secret.length <= 4) return "****";
  return secret.substring(0, 4) + "...";
}

function shouldIgnoreFile(filePath) {
  // Check if file is in ignored folder
  for (const folder of IGNORED_FOLDERS) {
    if (filePath.includes(`${folder}/`) || filePath.startsWith(`${folder}/`)) {
      return true;
    }
  }

  // Check if file matches ignored file patterns
  const fileName = path.basename(filePath);
  for (const ignoredFile of IGNORED_FILES) {
    if (fileName === ignoredFile || fileName.startsWith(".env")) {
      return true;
    }
  }

  return false;
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch (error) {
    console.error("Error getting staged files:", error.message);
    return [];
  }
}

function scanFileForSecrets(filePath) {
  const findings = [];

  if (!fs.existsSync(filePath)) {
    return findings;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    return findings;
  }

  const lines = content.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    for (const { name, pattern } of SECRET_PATTERNS) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      let match;

      while ((match = pattern.exec(line)) !== null) {
        // Get the actual secret value (either full match or captured group)
        const secret = match[1] || match[0];

        // Skip common false positives
        if (isLikelyFalsePositive(secret, line)) {
          continue;
        }

        findings.push({
          file: filePath,
          line: lineNum + 1,
          type: name,
          masked: maskSecret(secret),
        });
      }
    }
  }

  return findings;
}

function isLikelyFalsePositive(secret, line) {
  // Skip placeholder/example values
  const lowerSecret = secret.toLowerCase();
  const lowerLine = line.toLowerCase();

  const placeholders = [
    "your_",
    "example",
    "placeholder",
    "xxx",
    "test",
    "demo",
    "sample",
    "change_me",
    "replace",
    "insert",
    "<",
    ">",
    "${",
    "env.",
    "process.env",
  ];

  for (const placeholder of placeholders) {
    if (lowerSecret.includes(placeholder) || lowerLine.includes(placeholder)) {
      return true;
    }
  }

  // Skip if it looks like a variable reference
  if (secret.startsWith("$") || secret.startsWith("%")) {
    return true;
  }

  return false;
}

function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  const allFindings = [];

  for (const file of stagedFiles) {
    if (shouldIgnoreFile(file)) {
      continue;
    }

    const findings = scanFileForSecrets(file);
    allFindings.push(...findings);
  }

  if (allFindings.length > 0) {
    console.error("\n🚨 Potential secrets detected in staged files:\n");

    for (const finding of allFindings) {
      console.error(`  ${finding.file}:${finding.line}`);
      console.error(`    Type: ${finding.type}`);
      console.error(`    Value: ${finding.masked}\n`);
    }

    console.error("Commit blocked. Please remove secrets before committing.\n");
    process.exit(1);
  }

  process.exit(0);
}

main();
