import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rename } from "./index";

const TSCONFIG = JSON.stringify({
	compilerOptions: { moduleResolution: "bundler", strict: true },
	include: ["src"],
});

describe("rename file", () => {
	let dir: string;
	let cwd: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "rename-test-"));
		cwd = process.cwd();
		process.chdir(dir);
		vi.spyOn(console, "log").mockImplementation(() => {});
		writeFileSync(join(dir, "tsconfig.json"), TSCONFIG);
		mkdirSync(join(dir, "src", "utils"), { recursive: true });
		writeFileSync(
			join(dir, "src", "utils", "helper.ts"),
			"export const x = 1;\nimport { y } from './sibling';\nexport { y };\n",
		);
		writeFileSync(
			join(dir, "src", "utils", "sibling.ts"),
			"export const y = 2;\n",
		);
		writeFileSync(
			join(dir, "src", "consumer.ts"),
			"import { x } from './utils/helper';\nexport const z = x;\n",
		);
	});

	afterEach(() => {
		process.chdir(cwd);
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("moves the file and updates importers and the moved file's own imports", async () => {
		await rename("src/utils/helper.ts", "src/lib/helper.ts", { apply: true });

		expect(existsSync(join(dir, "src", "utils", "helper.ts"))).toBe(false);
		expect(existsSync(join(dir, "src", "lib", "helper.ts"))).toBe(true);

		const consumer = readFileSync(join(dir, "src", "consumer.ts"), "utf8");
		expect(consumer).toContain("from './lib/helper'");

		const moved = readFileSync(join(dir, "src", "lib", "helper.ts"), "utf8");
		expect(moved).toContain("from '../utils/sibling'");
	});

	it("does not move the file in dry-run mode", async () => {
		await rename("src/utils/helper.ts", "src/lib/helper.ts", {});

		expect(existsSync(join(dir, "src", "utils", "helper.ts"))).toBe(true);
		expect(existsSync(join(dir, "src", "lib", "helper.ts"))).toBe(false);
		const consumer = readFileSync(join(dir, "src", "consumer.ts"), "utf8");
		expect(consumer).toContain("from './utils/helper'");
	});
});
