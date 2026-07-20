import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { displayMaintainabilityResults } from "./displayMaintainabilityResults";
import type { MaintainabilityGitState } from "./getMaintainabilityGitState";
import type { ResultEntry } from "./ResultEntry";

function entry(
	file: string,
	minMaintainability: number,
	override?: number,
	largestFunction = "bigFn",
): ResultEntry {
	return {
		file,
		avgMaintainability: minMaintainability,
		minMaintainability,
		override,
		largestFunction,
	};
}

const cleanGit: MaintainabilityGitState = {
	shrunkFiles: new Set(),
	newFileCreated: false,
};

describe("displayMaintainabilityResults", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function output(): string {
		return [...logSpy.mock.calls, ...errorSpy.mock.calls]
			.map((c) => String(c[0]))
			.join("\n");
	}

	describe("when a file is below the global threshold", () => {
		it("should fail and exit", () => {
			displayMaintainabilityResults([entry("a.ts", 40)], 60, cleanGit);

			expect(exitSpy).toHaveBeenCalledWith(1);
			expect(output()).toContain("a.ts");
		});
	});

	describe("when an overridden file passes its own lower threshold", () => {
		it("should not fail even though it is below the global threshold", () => {
			displayMaintainabilityResults([entry("gnarly.ts", 50, 45)], 60, cleanGit);

			expect(exitSpy).not.toHaveBeenCalled();
			expect(output()).toContain("All files pass");
		});

		it("should surface the passing file with its override annotation", () => {
			displayMaintainabilityResults(
				[entry("gnarly.ts", 52.1, 45)],
				60,
				cleanGit,
			);

			const out = output();
			expect(out).toContain("gnarly.ts");
			expect(out).toContain("min: 52.1");
			expect(out).toContain("override: 45");
		});
	});

	describe("when an overridden file fails its own higher threshold", () => {
		it("should fail even though it passes the global threshold", () => {
			displayMaintainabilityResults([entry("strict.ts", 70, 80)], 60, cleanGit);

			expect(exitSpy).toHaveBeenCalledWith(1);
			expect(output()).toContain("strict.ts");
		});
	});

	describe("when files mix overridden and non-overridden entries", () => {
		it("should judge each against its effective threshold", () => {
			displayMaintainabilityResults(
				[
					entry("pass-global.ts", 65),
					entry("fail-global.ts", 55),
					entry("pass-override.ts", 50, 45),
					entry("fail-override.ts", 40, 45),
				],
				60,
				cleanGit,
			);

			expect(exitSpy).toHaveBeenCalledWith(1);
			const out = output();
			expect(out).toContain("fail-global.ts");
			expect(out).toContain("fail-override.ts");
			expect(out).not.toContain("pass-global.ts");
			expect(out).toContain("pass-override.ts");
			expect(out).toContain("2 file(s) below threshold");
		});
	});

	describe("failure output", () => {
		it("should not print the scoring formula or per-function numbers", () => {
			displayMaintainabilityResults([entry("a.ts", 40)], 60, cleanGit);

			const out = output();
			expect(out).not.toContain("171");
			expect(out).not.toContain("HalsteadVolume");
			expect(out).not.toContain("min: 40");
			expect(out).not.toContain("avg:");
		});

		it("should name the largest function as the extraction candidate", () => {
			displayMaintainabilityResults(
				[entry("src/foo/bar.ts", 40, undefined, "doEverything")],
				60,
				cleanGit,
			);

			const out = output();
			expect(out).toContain("doEverything");
			expect(out).toContain("assist refactor extract");
			expect(out).toContain("extract a responsibility to a new file");
		});
	});

	describe("cheat rejection", () => {
		it("should reject a failing file that shrank with no new file created", () => {
			displayMaintainabilityResults([entry("a.ts", 40)], 60, {
				shrunkFiles: new Set([path.resolve("a.ts")]),
				newFileCreated: false,
			});

			expect(exitSpy).toHaveBeenCalledWith(1);
			expect(output()).toContain("shrank existing lines");
		});

		it("should not report the cheat when a new file was created", () => {
			displayMaintainabilityResults([entry("a.ts", 40)], 60, {
				shrunkFiles: new Set([path.resolve("a.ts")]),
				newFileCreated: true,
			});

			expect(output()).not.toContain("shrank existing lines");
		});

		it("should not report the cheat when the file did not shrink", () => {
			displayMaintainabilityResults([entry("a.ts", 40)], 60, cleanGit);

			expect(output()).not.toContain("shrank existing lines");
		});
	});

	describe("when there is no global threshold and no overrides", () => {
		it("should list all files without failing", () => {
			displayMaintainabilityResults(
				[entry("a.ts", 40), entry("b.ts", 90)],
				undefined,
				cleanGit,
			);

			expect(exitSpy).not.toHaveBeenCalled();
			const out = output();
			expect(out).toContain("a.ts");
			expect(out).toContain("b.ts");
		});
	});

	describe("when there is no global threshold but a file declares an override", () => {
		it("should gate that file against its override", () => {
			displayMaintainabilityResults(
				[entry("a.ts", 30, 50), entry("b.ts", 90)],
				undefined,
				cleanGit,
			);

			expect(exitSpy).toHaveBeenCalledWith(1);
			const out = output();
			expect(out).toContain("a.ts");
		});
	});
});
