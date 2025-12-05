#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Patterns to detect potential secrets
const SECRET_PATTERNS = [
  // API keys with common prefixes
  { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: "Context7 API Key", pattern: /ctx7sk-[a-zA-Z0-9]{20,}/g },
  {
    name: "Stripe Publishable Key",
    pattern: /pk_(?:live|test)_[a-zA-Z0-9]{20,}/g,
  },
  { name: "Stripe Secret Key", pattern: /sk_(?:live|test)_[a-zA-Z0-9]{20,}/g },

  // AWS keys
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g },
  {
    name: "AWS Secret Key",
    pattern:
      /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/g,
  },

  // Generic secrets in assignments
  {
    name: "Generic API Key",
    pattern: /(?:api_key|apikey|api-key)\s*[=:]\s*['"]([^'"]{8,})['"]?/gi,
  },
  {
    name: "Generic Secret",
    pattern: /(?:secret|SECRET)\s*[=:]\s*['"]([^'"]{8,})['"]?/g,
  },
  {
    name: "Generic Password",
    pattern: /(?:password|PASSWORD|passwd)\s*[=:]\s*['"]([^'"]{8,})['"]?/g,
  },
  {
    name: "Generic Token",
    pattern: /(?:token|TOKEN)\s*[=:]\s*['"]([^'"]{16,})['"]?/g,
  },

  // Base64-encoded strings (potential secrets)
  { name: "Base64 Secret", pattern: /['"][A-Za-z0-9+/]{32,}={0,2}['"]/g },

  // Supabase keys
  {
    name: "Supabase Key",
    pattern: /eyJ[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{50,}\.[a-zA-Z0-9_-]{50,}/g,
  },
];

// Directories and files to ignore
const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".env",
  ".env.local",
  ".env.example",
  ".env.development",
  ".env.production",
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function maskSecret(secret) {
  if (secret.length <= 4) return "****";
  return secret.substring(0, 4) + "...";
}

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    console.error("Error getting staged files:", error.message);
    return [];
  }
}

function scanFileForSecrets(filePath) {
  const findings = [];

  if (shouldIgnoreFile(filePath)) {
    return findings;
  }

  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return findings;
  }

  let content;
  try {
    content = fs.readFileSync(fullPath, "utf-8");
  } catch (error) {
    return findings;
  }

  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    SECRET_PATTERNS.forEach(({ name, pattern }) => {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;

      let match;
      while ((match = pattern.exec(line)) !== null) {
        const secret = match[1] || match[0];

        // Skip if it looks like a placeholder or example
        if (
          secret.includes("your-") ||
          secret.includes("YOUR_") ||
          secret.includes("xxx") ||
          secret.includes("XXX") ||
          secret === "your-anon-key" ||
          secret === "your-service-role-key" ||
          /^[a-z-]+$/.test(secret) // Skip if all lowercase with dashes (likely placeholder)
        ) {
          continue;
        }

        findings.push({
          file: filePath,
          line: lineNumber,
          type: name,
          masked: maskSecret(secret),
        });
      }
    });
  });

  return findings;
}

function main() {
  console.log("🔍 Scanning staged files for potential secrets...\n");

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log("No staged files to scan.");
    process.exit(0);
  }

  const allFindings = [];

  stagedFiles.forEach((file) => {
    const findings = scanFileForSecrets(file);
    allFindings.push(...findings);
  });

  if (allFindings.length > 0) {
    console.log("⚠️  Potential secrets detected:\n");

    allFindings.forEach(({ file, line, type, masked }) => {
      console.log(`  ${file}:${line}`);
      console.log(`    Type: ${type}`);
      console.log(`    Value: ${masked}\n`);
    });

    console.log("❌ Commit blocked. Please remove secrets before committing.");
    console.log(
      "   If these are false positives, review and update the scanner patterns."
    );
    process.exit(1);
  }

  console.log(`✅ No secrets found in ${stagedFiles.length} staged file(s).`);
  process.exit(0);
}

main();
