import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const fixtures: Record<string, string> = {
	"wrongname.ts": "export const right = 1;\n",
	"café.ts": "export const value = 1;\n",
	"fetchData.ts": "export const fetchData = 1;\n",
	"Shape.ts": "export interface Shape {\n\tx: number;\n}\n",
	"Widget.ts": "export class Widget {\n\tpublic draw(): void {}\n}\n",
	"greet.ts":
		'export function greet(name: string): string {\n\treturn "hi " + name;\n}\n',
};

let codesByFile: Map<string, Set<string>>;

const codesFor = (file: string): Set<string> =>
	codesByFile.get(file) ?? new Set();

beforeAll(() => {
	const dir = mkdtempSync(join(tmpdir(), "oxlint-rules-"));
	try {
		for (const [name, content] of Object.entries(fixtures)) {
			writeFileSync(join(dir, name), content);
		}
		const bin = resolve("node_modules/.bin/oxlint");
		const config = resolve(".oxlintrc.json");
		let stdout: string;
		try {
			stdout = execFileSync(
				bin,
				[
					"--config",
					config,
					"--format",
					"json",
					"--disable-nested-config",
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
			const file = basename(diagnostic.filename);
			const codes = codesByFile.get(file) ?? new Set<string>();
			codes.add(diagnostic.code);
			codesByFile.set(file, codes);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 30_000);

afterAll(() => {
	codesByFile = new Map();
});

describe("when a filename does not match any export", () => {
	it("fires local/filename-convention", () => {
		expect(codesFor("wrongname.ts").has("local(filename-convention)")).toBe(
			true,
		);
	});
});

describe("when a filename contains non-ascii characters", () => {
	it("fires local/filename-convention", () => {
		expect(codesFor("café.ts").has("local(filename-convention)")).toBe(true);
	});
});

describe("when a filename matches a named export", () => {
	it("does not fire local/filename-convention for a const export", () => {
		expect(codesFor("fetchData.ts").has("local(filename-convention)")).toBe(
			false,
		);
	});

	it("does not fire local/filename-convention for a type export", () => {
		expect(codesFor("Shape.ts").has("local(filename-convention)")).toBe(false);
	});

	it("does not fire local/filename-convention for a class export", () => {
		expect(codesFor("Widget.ts").has("local(filename-convention)")).toBe(false);
	});

	it("does not fire local/filename-convention for a function export", () => {
		expect(codesFor("greet.ts").has("local(filename-convention)")).toBe(false);
	});
});

describe("when a type is declared with interface", () => {
	it("fires typescript/consistent-type-definitions", () => {
		expect(
			codesFor("Shape.ts").has("typescript(consistent-type-definitions)"),
		).toBe(true);
	});
});

describe("when a class member has an explicit public modifier", () => {
	it("fires typescript/explicit-member-accessibility", () => {
		expect(
			codesFor("Widget.ts").has("typescript(explicit-member-accessibility)"),
		).toBe(true);
	});
});

describe("when strings are joined with concatenation", () => {
	it("fires prefer-template", () => {
		expect(codesFor("greet.ts").has("eslint(prefer-template)")).toBe(true);
	});
});
