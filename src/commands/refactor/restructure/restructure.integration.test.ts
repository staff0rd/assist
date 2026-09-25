import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { restructure } from "../restructure";
import {
	IMPORT_CALL,
	writeRestructureFixture,
} from "./writeRestructureFixture";

function snapshot(dir: string): Record<string, string> {
	const files = readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter((e) => e.isFile())
		.map((e) => join(e.parentPath, e.name));
	return Object.fromEntries(
		files.sort().map((f) => [relative(dir, f), readFileSync(f, "utf8")]),
	);
}

function typeErrors(dir: string): string[] {
	const configPath = join(dir, "tsconfig.json");
	const config = ts.readConfigFile(configPath, ts.sys.readFile).config;
	const parsed = ts.parseJsonConfigFileContent(config, ts.sys, dir);
	const program = ts.createProgram(parsed.fileNames, parsed.options);
	return ts
		.getPreEmitDiagnostics(program)
		.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("restructure", () => {
	let dir: string;
	let cwd: string;
	let output: string[];

	beforeEach(() => {
		dir = realpathSync(mkdtempSync(join(tmpdir(), "restructure-test-")));
		cwd = process.cwd();
		process.chdir(dir);
		output = [];
		vi.spyOn(console, "log").mockImplementation((line: string) => {
			output.push(String(line));
		});
		vi.spyOn(process, "exit").mockImplementation((code) => {
			throw new Error(`exit ${code}`);
		});
		writeRestructureFixture(dir);
	});

	afterEach(() => {
		process.chdir(cwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("applies the plan, keeps the tree type-checking and is idempotent", async () => {
		await restructure("src", { apply: true });

		const after = snapshot(join(dir, "src"));
		expect(Object.keys(after)).toEqual([
			"app.ts",
			"app/lazy.ts",
			"app/util.ts",
			"app/widget.test.ts",
			"app/widget.ts",
			"app/widget/widgetPart.ts",
			"orphan.ts",
			"partTypes.ts",
		]);
		expect(after["app.ts"]).toContain(`${IMPORT_CALL}("./app/lazy")`);
		expect(after["app/widget.test.ts"]).toContain(
			'vi.mock("./widget/widgetPart")',
		);
		expect(after["app/widget/widgetPart.ts"]).toContain(
			'from "../../partTypes"',
		);
		expect(after["orphan.ts"]).toContain(`${IMPORT_CALL}("./partTypes")`);
		expect(existsSync(join(dir, "src", "nested"))).toBe(false);
		expect(typeErrors(dir)).toEqual([]);

		await restructure("src", { check: true });

		await restructure("src", { apply: true });
		expect(snapshot(join(dir, "src"))).toEqual(after);
	});

	it("check exits non-zero and lists drifting files", async () => {
		await expect(restructure("src", { check: true })).rejects.toThrow("exit 1");
		expect(output).toContain("  src/widget.ts → src/app/widget.ts");
		expect(existsSync(join(dir, "src", "widget.ts"))).toBe(true);
	});

	it("lifts modules named in restructure.pin into their root's folder", async () => {
		writeFileSync(
			join(dir, "assist.yml"),
			'restructure:\n  pin: ["widgetPart"]\n',
		);

		await restructure("src", { apply: true });

		expect(existsSync(join(dir, "src/app/widgetPart.ts"))).toBe(true);
		expect(typeErrors(dir)).toEqual([]);
		const after = snapshot(join(dir, "src"));
		await restructure("src", { apply: true });
		expect(snapshot(join(dir, "src"))).toEqual(after);
	});

	it("never moves files matched by restructure.ignore", async () => {
		writeFileSync(
			join(dir, "assist.yml"),
			'restructure:\n  ignore: ["src/util.ts"]\n',
		);

		await restructure("src", { apply: true });

		expect(existsSync(join(dir, "src", "util.ts"))).toBe(true);
		expect(readFileSync(join(dir, "src/app/widget.ts"), "utf8")).toContain(
			'from "../util"',
		);
		expect(typeErrors(dir)).toEqual([]);
	});
});
