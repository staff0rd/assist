import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFindSourceFiles = vi.fn();

vi.mock("./findSourceFiles", () => ({
	findSourceFiles: (...args: unknown[]) => mockFindSourceFiles(...args),
}));
vi.mock("./sloc", () => ({ sloc: vi.fn() }));
vi.mock("./cyclomatic", () => ({ cyclomatic: vi.fn() }));
vi.mock("./halstead", () => ({ halstead: vi.fn() }));
vi.mock("./maintainability", () => ({ maintainability: vi.fn() }));

import { analyze } from "./analyze";

const GUIDANCE = /extract functions and logic/i;

describe("analyze", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function output(): string {
		return logSpy.mock.calls
			.map((c: unknown[]) => String(c[0] ?? ""))
			.join("\n");
	}

	it("prints extraction-intent guidance for a single file", async () => {
		mockFindSourceFiles.mockReturnValue(["src/foo.ts"]);

		await analyze("src/foo.ts");

		expect(output()).toMatch(GUIDANCE);
		expect(output()).toMatch(/whitespace/i);
		expect(output()).toMatch(/comments/i);
	});

	it("does not print the guidance on the multi-file path", async () => {
		mockFindSourceFiles.mockReturnValue(["src/foo.ts", "src/bar.ts"]);

		await analyze("src/**");

		expect(output()).not.toMatch(GUIDANCE);
	});
});
