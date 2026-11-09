import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const fixtures: Record<string, string> = {
	"equalsBranch.ts": `export function f(harness: string) {
	if (harness === "codex") return 1;
	return 0;
}
`,
	"reversedBranch.ts": `export function f(harness: string) {
	return "pi" !== harness;
}
`,
	"switchBranch.ts": `export function f(harness: string) {
	switch (harness) {
		case "claude":
			return 1;
		case "pi":
			return 2;
		default:
			return 0;
	}
}
`,
	"sessionType.ts": `export function f(session: { commandType: string }, commandType: string) {
	if (session.commandType === "claude") return 1;
	switch (commandType) {
		case "claude":
			return 2;
	}
	return commandType === "claude" ? 3 : 0;
}
`,
	"otherLiteral.ts": `export function f(kind: string) {
	return kind === "claude-code" || kind === "assist";
}
`,
	"allowedBranch.ts": `export function f(harness: string) {
	return harness === "claude";
}
`,
	"adapters/insideAdapter.ts": `export function f(harness: string) {
	return harness === "codex";
}
`,
};

const hitsByFile = new Map<string, number>();

const hits = (file: string): number => hitsByFile.get(file) ?? 0;

beforeAll(() => {
	const dir = mkdtempSync(join(tmpdir(), "no-harness-branches-"));
	try {
		for (const [name, content] of Object.entries(fixtures)) {
			mkdirSync(dirname(join(dir, name)), { recursive: true });
			writeFileSync(join(dir, name), content);
		}
		const config = join(dir, ".oxlintrc.json");
		writeFileSync(
			config,
			JSON.stringify({
				jsPlugins: [resolve("oxlint-rules/noHarnessBranches.ts")],
				categories: { correctness: "off" },
				rules: {
					"harness/no-harness-branches": [
						"error",
						{
							adapterDirs: ["adapters"],
							allow: { "allowedBranch.ts": "pre-existing" },
						},
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
			if (diagnostic.code !== "harness(no-harness-branches)") continue;
			const file = relative(dir, resolve(dir, diagnostic.filename));
			hitsByFile.set(file, hits(file) + 1);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 30_000);

describe("harness/no-harness-branches", () => {
	it("fires on an equality branch against a harness name", () => {
		expect(hits("equalsBranch.ts")).toBe(1);
	});

	it("fires when the harness literal is on the left", () => {
		expect(hits("reversedBranch.ts")).toBe(1);
	});

	it("fires on each harness case in a switch", () => {
		expect(hits("switchBranch.ts")).toBe(2);
	});

	it.each([
		"sessionType.ts",
		"otherLiteral.ts",
		"allowedBranch.ts",
		"adapters/insideAdapter.ts",
	])("allows %s", (file) => {
		expect(hits(file)).toBe(0);
	});
});
