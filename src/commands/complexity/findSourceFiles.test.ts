import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { findSourceFiles } from "./findSourceFiles";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "findSourceFiles-"));
}

describe("findSourceFiles", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({
			complexity: { ignore: ["**/*test.ts*"] },
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("when a CLI ignore glob is supplied", () => {
		it("applies both the config glob and the CLI glob additively", () => {
			const root = makeTempDir();
			mkdirSync(join(root, "generated"));
			writeFileSync(join(root, "index.ts"), "");
			writeFileSync(join(root, "index.test.ts"), "");
			writeFileSync(join(root, "generated", "types.ts"), "");

			const files = findSourceFiles(root, root, ["**/generated/**"]);

			expect(files).toEqual([join(root, "index.ts")]);
		});
	});

	describe("when no CLI ignore glob is supplied", () => {
		it("only applies the config glob, leaving other behaviour unchanged", () => {
			const root = makeTempDir();
			mkdirSync(join(root, "generated"));
			writeFileSync(join(root, "index.ts"), "");
			writeFileSync(join(root, "index.test.ts"), "");
			writeFileSync(join(root, "generated", "types.ts"), "");

			const files = findSourceFiles(root, root);

			expect(files.sort()).toEqual(
				[join(root, "index.ts"), join(root, "generated", "types.ts")].sort(),
			);
		});
	});
});
