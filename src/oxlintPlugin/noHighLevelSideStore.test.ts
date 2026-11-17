import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const fixtures: Record<string, string> = {
	"pane/HighLevelReviewPane/usesLocalStorage.ts": `export function f() {
	return localStorage.getItem("progress");
}
`,
	"pane/HighLevelReviewPane/usesSessionStorage.ts": `export function f() {
	return window.sessionStorage.getItem("progress");
}
`,
	"pane/HighLevelReviewPane/usesPersisted.ts": `import { loadPersisted, savePersisted } from "../../loadPersisted";
export function f() {
	savePersisted("k", loadPersisted("k"));
}
`,
	"pane/HighLevelReviewPane/clean.ts": `export function f(progress: unknown) {
	return JSON.stringify(progress);
}
`,
	"pane/HighLevelReviewPane.tsx": `export function HighLevelReviewPane() {
	return localStorage.length;
}
`,
	"elsewhere/usesLocalStorage.ts": `export function f() {
	return localStorage.getItem("sidebar");
}
`,
	"elsewhere/writesProgressDir.ts": `import { join } from "node:path";
export const path = join("store", "high-level-progress", "repo.json");
`,
	"elsewhere/writesDraft.ts": `export function draftPath(head: string) {
	return \`reviews/\${head}.draft.json\`;
}
`,
	"elsewhere/importsInternal.ts": `import { highLevelProgressPath } from "../store/highLevelProgressPath";
export const path = highLevelProgressPath;
`,
	"store/highLevelProgressPath.ts": `export const dir = "high-level-progress";
export const draft = ".draft.json";
`,
	"store/imports.ts": `import { highLevelProgressPath } from "./highLevelProgressPath";
export const path = highLevelProgressPath;
`,
};

const hitsByFile = new Map<string, number>();

const hits = (file: string): number => hitsByFile.get(file) ?? 0;

beforeAll(() => {
	const dir = mkdtempSync(join(tmpdir(), "no-high-level-side-store-"));
	try {
		for (const [name, content] of Object.entries(fixtures)) {
			mkdirSync(dirname(join(dir, name)), { recursive: true });
			writeFileSync(join(dir, name), content);
		}
		const config = join(dir, ".oxlintrc.json");
		writeFileSync(
			config,
			JSON.stringify({
				jsPlugins: [resolve("oxlint-rules/noHighLevelSideStore.ts")],
				categories: { correctness: "off" },
				rules: {
					"high-level-review/no-side-store": [
						"error",
						{ paneDirs: ["pane/HighLevelReviewPane"], storeDirs: ["store"] },
					],
				},
			}),
		);
		let stdout: string;
		try {
			stdout = execFileSync(
				resolve("node_modules/.bin/oxlint"),
				["--config", config, "--format", "json", dir],
				{ encoding: "utf8" },
			);
		} catch (error) {
			stdout = (error as { stdout: string }).stdout;
		}
		const parsed = JSON.parse(stdout) as {
			diagnostics: { code: string; filename: string }[];
		};
		for (const diagnostic of parsed.diagnostics) {
			if (diagnostic.code !== "high-level-review(no-side-store)") continue;
			const file = relative(dir, resolve(dir, diagnostic.filename));
			hitsByFile.set(file, hits(file) + 1);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 30_000);

describe("high-level-review/no-side-store", () => {
	it.each([
		"pane/HighLevelReviewPane/usesLocalStorage.ts",
		"pane/HighLevelReviewPane/usesSessionStorage.ts",
		"pane/HighLevelReviewPane.tsx",
	])("fires on browser storage in the pane: %s", (file) => {
		expect(hits(file)).toBe(1);
	});

	it("fires on the persisted-storage helpers the pane uses", () => {
		expect(hits("pane/HighLevelReviewPane/usesPersisted.ts")).toBeGreaterThan(
			1,
		);
	});

	it("leaves pane code without a side store alone", () => {
		expect(hits("pane/HighLevelReviewPane/clean.ts")).toBe(0);
	});

	it("leaves browser storage outside the pane alone", () => {
		expect(hits("elsewhere/usesLocalStorage.ts")).toBe(0);
	});

	it.each([
		"elsewhere/writesProgressDir.ts",
		"elsewhere/writesDraft.ts",
		"elsewhere/importsInternal.ts",
	])("fires on progress written outside the store module: %s", (file) => {
		expect(hits(file)).toBe(1);
	});

	it("allows the store module its own paths and internals", () => {
		expect(hits("store/highLevelProgressPath.ts")).toBe(0);
		expect(hits("store/imports.ts")).toBe(0);
	});
});
