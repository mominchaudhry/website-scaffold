#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from "fs";
import { resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createInterface } from "readline";
import { parseArgs } from "util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const OLD_SCOPE = "scaffold";
const OLD_NAME = "website-scaffold";

const { values: flags, positionals } = parseArgs({
  options: {
    scope: { type: "string", short: "s" },
    yes: { type: "boolean", short: "y", default: false },
    "skip-install": { type: "boolean", default: false },
    "skip-git": { type: "boolean", default: false },
  },
  allowPositionals: true,
  strict: false,
});

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n  Project Setup\n");

  const dirName = basename(root);
  const suggested = dirName !== OLD_NAME ? toKebab(dirName) : "";

  let projectName;
  if (positionals[0]) {
    projectName = toKebab(positionals[0]);
  } else {
    const raw = await ask(
      `Project name (kebab-case)${suggested ? ` [${suggested}]` : ""}: `
    );
    projectName = toKebab(raw.trim()) || suggested;
  }

  if (!projectName) {
    console.error("Error: project name is required.");
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(projectName)) {
    console.error(
      "Error: project name must be kebab-case (e.g. 'my-site', 'acme-web')."
    );
    process.exit(1);
  }

  let npmScope;
  if (flags.scope) {
    npmScope = flags.scope.replace(/^@/, "");
  } else if (flags.yes) {
    npmScope = projectName;
  } else {
    const scope = await ask(`npm scope (without @) [${projectName}]: `);
    npmScope = (scope.trim() || projectName).replace(/^@/, "");
  }

  if (!flags.yes) {
    console.log(`\nWill rename @${OLD_SCOPE}/* -> @${npmScope}/*`);
    console.log(`Will rename ${OLD_NAME} -> ${projectName}\n`);

    const confirm = await ask("Proceed? [Y/n] ");
    if (confirm.trim().toLowerCase() === "n") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  rl.close();

  console.log("");

  rewriteJson(resolve(root, "package.json"), (pkg) => {
    pkg.name = projectName;
    pkg.scripts = mapValues(pkg.scripts, (v) =>
      v.replaceAll(`@${OLD_SCOPE}/`, `@${npmScope}/`)
    );
  });

  rewriteJson(resolve(root, "apps/web/package.json"), (pkg) => {
    pkg.name = `@${npmScope}/web`;
    pkg.dependencies = mapKeys(pkg.dependencies, (k) =>
      k.replace(`@${OLD_SCOPE}/`, `@${npmScope}/`)
    );
  });

  rewriteJson(resolve(root, "apps/cms/package.json"), (pkg) => {
    pkg.name = `@${npmScope}/cms`;
  });

  rewriteJson(resolve(root, "packages/contracts/package.json"), (pkg) => {
    pkg.name = `@${npmScope}/contracts`;
  });

  replaceInFile(
    resolve(root, "tsconfig.base.json"),
    `@${OLD_SCOPE}/contracts`,
    `@${npmScope}/contracts`
  );
  replaceInFile(
    resolve(root, "apps/web/tsconfig.json"),
    `@${OLD_SCOPE}/contracts`,
    `@${npmScope}/contracts`
  );
  replaceInFile(
    resolve(root, "apps/web/next.config.mjs"),
    `@${OLD_SCOPE}/contracts`,
    `@${npmScope}/contracts`
  );

  replaceInFile(
    resolve(root, ".github/workflows/ci.yml"),
    `@${OLD_SCOPE}/`,
    `@${npmScope}/`
  );

  replaceInFile(
    resolve(root, "docker-compose.selfhost.yml"),
    OLD_NAME,
    projectName
  );

  replaceInFile(
    resolve(root, "apps/cms/src/admin/app.js"),
    `${OLD_NAME}.`,
    `${projectName}.`
  );

  replaceInFile(
    resolve(root, "scripts/new-section.mjs"),
    `@${OLD_SCOPE}/contracts`,
    `@${npmScope}/contracts`
  );

  const srcDirs = [
    "apps/web/lib",
    "apps/web/components",
    "apps/web/app",
    "apps/web/tests",
  ];
  for (const dir of srcDirs) {
    const absDir = resolve(root, dir);
    if (!existsSync(absDir)) continue;
    for (const f of findFiles(absDir, [".ts", ".tsx"])) {
      replaceInFile(f, `@${OLD_SCOPE}/contracts`, `@${npmScope}/contracts`);
    }
  }

  if (!flags["skip-git"] && existsSync(resolve(root, ".git"))) {
    console.log("  Reinitializing git...");
    rmSync(resolve(root, ".git"), { recursive: true, force: true });
    execSync("git init", { cwd: root, stdio: "ignore" });
    execSync("git add -A", { cwd: root, stdio: "ignore" });
    execSync('git commit -m "Initial commit"', {
      cwd: root,
      stdio: "ignore",
    });
    console.log('  Created fresh git repo with "Initial commit"');
  }

  if (!flags["skip-install"]) {
    console.log("\n  Installing dependencies...");
    try {
      execSync("pnpm install", { cwd: root, stdio: "inherit" });
    } catch {
      console.log(
        "  Warning: pnpm install failed. Run it manually after fixing any issues."
      );
    }
  }

  console.log(`\n  Project "${projectName}" is ready!\n`);
  console.log("Next steps:");
  console.log("  pnpm dev:local    # Start the full local dev environment");
  console.log("");
}

function rewriteJson(filePath, mutate) {
  const pkg = JSON.parse(readFileSync(filePath, "utf8"));
  mutate(pkg);
  writeFileSync(filePath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`  Updated ${rel(filePath)}`);
}

function replaceInFile(filePath, search, replacement) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  if (!content.includes(search)) return;
  writeFileSync(filePath, content.replaceAll(search, replacement));
  console.log(`  Updated ${rel(filePath)}`);
}

function findFiles(dir, exts) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      results.push(...findFiles(full, exts));
    } else if (entry.isFile() && exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function mapValues(obj, fn) {
  if (!obj) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}

function mapKeys(obj, fn) {
  if (!obj) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [fn(k), v]));
}

function toKebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function rel(p) {
  return p.replace(root + "/", "");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
