import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const fixtures: Record<string, string> = {
	"interpolated.ts": `import { execSync } from "node:child_process";
export const run = (ref: string) => execSync(\`git log \${ref}\`);
`,
	"singleQuoted.ts": `import { execSync } from "node:child_process";
export const run = () => execSync("git stash list --format='%H %gs'");
`,
	"doubleQuoted.ts": `import { execSync } from "node:child_process";
export const run = () => execSync('npm pkg set scripts.start="node dist/index.js"');
`,
	"quotedTemplate.ts": `import { execSync } from "node:child_process";
export const run = () => execSync(\`git log --format='%H'\`);
`,
	"memberCall.ts": `import childProcess from "node:child_process";
export const run = (ref: string) => childProcess.execSync(\`git show \${ref}\`);
`,
	"fixedLiteral.ts": `import { execSync } from "node:child_process";
export const run = () => execSync("git fetch");
`,
	"plainTemplate.ts": `import { execSync } from "node:child_process";
export const run = () => execSync(\`git fetch --prune\`);
`,
	"piped.ts": `import { execSync } from "node:child_process";
export const run = (ref: string) => execSync(\`git log \${ref} | head -1\`);
`,
	"chained.ts": `import { execSync } from "node:child_process";
export const run = () => execSync("git add -A && git commit -m 'wip'");
`,
	"variableCommand.ts": `import { execSync } from "node:child_process";
export const run = (command: string) => execSync(command);
`,
	"execFile.ts": `import { execFileSync } from "node:child_process";
export const run = (ref: string) => execFileSync("git", ["log", ref, "--format='%H'"]);
`,
	"exempt.ts": `import { execSync } from "node:child_process";
export const run = (ref: string) => execSync(\`git log \${ref}\`);
`,
};

let codesByFile: Map<string, number>;

const hits = (file: string): number => codesByFile.get(file) ?? 0;

beforeAll(() => {
	const dir = mkdtempSync(join(tmpdir(), "prefer-exec-file-sync-"));
	try {
		for (const [name, content] of Object.entries(fixtures)) {
			writeFileSync(join(dir, name), content);
		}
		const config = join(dir, ".oxlintrc.json");
		writeFileSync(
			config,
			JSON.stringify({
				jsPlugins: [resolve("oxlint-rules/preferExecFileSync.ts")],
				categories: { correctness: "off" },
				rules: {
					"child-process/prefer-exec-file-sync": [
						"error",
						{ allow: { "exempt.ts": "pending conversion" } },
					],
				},
			}),
		);
		let stdout: string;
		try {
			stdout = execFileSync(
				process.execPath,
				[
					resolve("node_modules/oxlint/bin/oxlint"),
					"--config",
					config,
					"--format",
					"json",
					dir,
				],
				{ encoding: "utf8" },
			);
		} catch (error) {
			stdout = (error as { stdout: string }).stdout;
		}
		const parsed = JSON.parse(stdout) as {
			diagnostics: { code: string; filename: string }[];
		};
		codesByFile = new Map();
		for (const diagnostic of parsed.diagnostics) {
			if (diagnostic.code !== "child-process(prefer-exec-file-sync)") continue;
			const file = basename(diagnostic.filename);
			codesByFile.set(file, hits(file) + 1);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 30_000);

afterAll(() => {
	codesByFile = new Map();
});

describe("child-process/prefer-exec-file-sync", () => {
	it.each([
		"interpolated.ts",
		"singleQuoted.ts",
		"doubleQuoted.ts",
		"quotedTemplate.ts",
		"memberCall.ts",
	])("flags %s", (file) => {
		expect(hits(file)).toBe(1);
	});

	it.each([
		"fixedLiteral.ts",
		"plainTemplate.ts",
		"piped.ts",
		"chained.ts",
		"variableCommand.ts",
		"execFile.ts",
		"exempt.ts",
	])("allows %s", (file) => {
		expect(hits(file)).toBe(0);
	});
});
