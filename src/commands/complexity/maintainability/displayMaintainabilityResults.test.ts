import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { displayMaintainabilityResults } from "./displayMaintainabilityResults";
import type { ResultEntry } from "./ResultEntry";

function entry(
	file: string,
	minMaintainability: number,
	override?: number,
): ResultEntry {
	return {
		file,
		avgMaintainability: minMaintainability,
		minMaintainability,
		override,
	};
}

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
			displayMaintainabilityResults([entry("a.ts", 40)], 60);

			expect(exitSpy).toHaveBeenCalledWith(1);
			expect(output()).toContain("a.ts");
		});
	});

	describe("when an overridden file passes its own lower threshold", () => {
		it("should not fail even though it is below the global threshold", () => {
			displayMaintainabilityResults([entry("gnarly.ts", 50, 45)], 60);

			expect(exitSpy).not.toHaveBeenCalled();
			expect(output()).toContain("All files pass");
		});

		it("should surface the passing file with its override annotation", () => {
			displayMaintainabilityResults([entry("gnarly.ts", 52.1, 45)], 60);

			const out = output();
			expect(out).toContain("gnarly.ts");
			expect(out).toContain("min: 52.1");
			expect(out).toContain("override: 45");
		});
	});

	describe("when an overridden file fails its own higher threshold", () => {
		it("should fail even though it passes the global threshold", () => {
			displayMaintainabilityResults([entry("strict.ts", 70, 80)], 60);

			expect(exitSpy).toHaveBeenCalledWith(1);
			expect(output()).toContain("strict.ts");
			expect(output()).toContain("override: 80");
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

	describe("when there is no global threshold and no overrides", () => {
		it("should list all files without failing", () => {
			displayMaintainabilityResults(
				[entry("a.ts", 40), entry("b.ts", 90)],
				undefined,
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
			);

			expect(exitSpy).toHaveBeenCalledWith(1);
			const out = output();
			expect(out).toContain("a.ts");
			expect(out).toContain("override: 50");
		});
	});
});
