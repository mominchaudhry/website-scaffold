#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const kebab = process.argv[2];
if (!kebab) {
  console.log("Usage: pnpm new:section <kebab-case-name>");
  console.log("Example: pnpm new:section testimonial");
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(kebab)) {
  console.error("Error: section name must be kebab-case (e.g. 'testimonial', 'logo-cloud')");
  process.exit(1);
}

const pascal = kebab
  .split("-")
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join("");
const uid = `sections.${kebab}`;
const collectionName = `components_sections_${kebab.replace(/-/g, "_")}s`;

console.log(`\nScaffolding section: ${kebab} (${pascal})\n`);

// --- 1. Strapi component schema ---
const schemaPath = resolve(root, `apps/cms/src/components/sections/${kebab}.json`);
if (existsSync(schemaPath)) {
  console.error(`Error: ${schemaPath} already exists`);
  process.exit(1);
}
const schema = {
  collectionName,
  info: { displayName: pascal },
  options: {},
  attributes: {
    heading: { type: "string", required: true },
    body: { type: "text" },
    showInHeader: { type: "boolean", default: false },
    navLabel: { type: "string" },
    anchorId: { type: "string" },
    alignment: { type: "enumeration", enum: ["left", "center", "right"], default: "left" },
    maxWidth: { type: "enumeration", enum: ["sm", "md", "lg", "full"], default: "lg" },
    spacing: { type: "enumeration", enum: ["compact", "normal", "large"], default: "normal" },
  },
};
writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + "\n");
console.log(`  Created ${rel(schemaPath)}`);

// --- 2. Register in page dynamic zone ---
const pageSchemaPath = resolve(root, "apps/cms/src/api/page/content-types/page/schema.json");
const pageSchema = JSON.parse(readFileSync(pageSchemaPath, "utf8"));
if (!pageSchema.attributes.sections.components.includes(uid)) {
  pageSchema.attributes.sections.components.push(uid);
  writeFileSync(pageSchemaPath, JSON.stringify(pageSchema, null, 2) + "\n");
  console.log(`  Updated page dynamic zone`);
}

// --- 3. TypeScript interface in contracts ---
const siteTsPath = resolve(root, "packages/contracts/src/site.ts");
let siteTs = readFileSync(siteTsPath, "utf8");
if (!siteTs.includes(`${pascal}Section`)) {
  const iface = `\nexport interface ${pascal}Section extends SectionBase {\n  __component: "${uid}";\n  heading: string;\n  body?: string | null;\n}\n`;
  siteTs = siteTs.replace(
    /^(export type Section\s*=)/m,
    `${iface}\n$1`
  );
  siteTs = siteTs.replace(
    /^(export type Section\s*=\s*\n)/m,
    `$1  | ${pascal}Section\n`
  );
  writeFileSync(siteTsPath, siteTs);
  console.log(`  Updated contracts/src/site.ts`);
}

// --- 4. Zod schema in contracts ---
const sectionsTsPath = resolve(root, "packages/contracts/src/sections.ts");
let sectionsTs = readFileSync(sectionsTsPath, "utf8");
if (!sectionsTs.includes(`"${uid}"`)) {
  const camel = kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const zodSchema = `\nexport const ${camel}SectionSchema = sectionBaseSchema.extend({\n  __component: z.literal("${uid}"),\n  heading: z.string().min(1),\n  body: z.string().optional().nullable(),\n});\n`;
  sectionsTs = sectionsTs.replace(
    /^(export const sectionSchema)/m,
    `${zodSchema}\n$1`
  );
  sectionsTs = sectionsTs.replace(
    /(gallerySectionSchema,\n\])/,
    `gallerySectionSchema,\n  ${camel}SectionSchema,\n]`
  );
  writeFileSync(sectionsTsPath, sectionsTs);
  console.log(`  Updated contracts/src/sections.ts`);
}

// --- 5. Populate map in strapi.ts ---
const strapiTsPath = resolve(root, "apps/web/lib/strapi.ts");
let strapiTs = readFileSync(strapiTsPath, "utf8");
if (!strapiTs.includes(`"${uid}"`)) {
  // Insert before the closing of the "on" object (the `    },\n  },\n};` pattern)
  strapiTs = strapiTs.replace(
    /(\n    },\n  },\n};)/,
    `\n      "${uid}": {\n        populate: "*",\n      },$1`
  );
  writeFileSync(strapiTsPath, strapiTs);
  console.log(`  Updated populate map in strapi.ts`);
}

// --- 6. React component ---
const compPath = resolve(root, `apps/web/components/sections/${pascal}Section.tsx`);
const compCode = `import type { ${pascal}Section } from "@scaffold/contracts";
import { sectionClassName, sectionContainerClassName } from "@/lib/presentation";

interface ${pascal}SectionProps {
  section: ${pascal}Section;
  anchorId: string;
}

export function ${pascal}SectionBlock({ section, anchorId }: ${pascal}SectionProps) {
  return (
    <section id={anchorId} className={sectionClassName(section)}>
      <div className={sectionContainerClassName(section)}>
        <div className="section-head">
          {section.navLabel ? (
            <p className="section-kicker">
              <span>{section.navLabel}</span>
            </p>
          ) : null}
          <h2 className="section-title">{section.heading}</h2>
        </div>
        {section.body ? <p>{section.body}</p> : null}
        {/* TODO: Add section-specific content here */}
      </div>
    </section>
  );
}
`;
writeFileSync(compPath, compCode);
console.log(`  Created ${rel(compPath)}`);

// --- 7. Wire into SectionRenderer ---
const rendererPath = resolve(root, "apps/web/components/SectionRenderer.tsx");
let renderer = readFileSync(rendererPath, "utf8");
if (!renderer.includes(uid)) {
  const importLine = `import { ${pascal}SectionBlock } from "./sections/${pascal}Section";`;
  renderer = renderer.replace(
    /(import { RichTextSectionBlock }[^\n]*\n)/,
    `$1${importLine}\n`
  );
  const caseBlock = `          case "${uid}":\n            return <${pascal}SectionBlock key={key} section={section as Section & { __component: "${uid}" }} anchorId={anchorId} />;`;
  renderer = renderer.replace(
    /(\s*default:\s*\n)/,
    `${caseBlock}\n$1`
  );
  writeFileSync(rendererPath, renderer);
  console.log(`  Updated SectionRenderer.tsx`);
}

console.log(`\nDone! Scaffolded section '${kebab}' with heading + body fields.\n`);
console.log("Next steps:");
console.log(`  1. Edit the Strapi schema to add your section-specific fields`);
console.log(`  2. Update the TypeScript interface in contracts/src/site.ts to match`);
console.log(`  3. Update the Zod schema in contracts/src/sections.ts to match`);
console.log(`  4. If you added nested items/media/relations, add normalization in strapi.ts`);
console.log(`  5. Build out the React component at ${rel(compPath)}`);
console.log(`  6. Run 'pnpm typecheck' to verify\n`);

function rel(p) {
  return p.replace(root + "/", "");
}
