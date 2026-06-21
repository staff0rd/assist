import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	formatDuration,
	type MeasureRecord,
	printMeasureTable,
} from "./printMeasureTable";

describe("formatDuration", () => {
	describe("when under a second", () => {
		it("renders milliseconds", () => {
			expect(formatDuration(850)).toBe("850ms");
		});
	});

	describe("when a second or more", () => {
		it("renders seconds to one decimal", () => {
			expect(formatDuration(2500)).toBe("2.5s");
		});
	});
});

describe("printMeasureTable", () => {
	let logs: string[];
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logs = [];
		logSpy = vi.spyOn(console, "log").mockImplementation((...args) => {
			logs.push(args.join(" "));
		});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	const records: MeasureRecord[] = [
		{ script: "lint", code: 0, durationMs: 500 },
		{ script: "typecheck", code: 0, durationMs: 3000 },
		{ script: "test", code: 1, durationMs: 1500 },
	];

	it("orders rows slowest duration first", () => {
		printMeasureTable(records, 3200);

		const commandLines = logs.filter((l) =>
			/typecheck|\btest\b|\blint\b/.test(l),
		);
		const order = commandLines.map((l) => l.match(/typecheck|test|lint/)?.[0]);
		expect(order).toEqual(["typecheck", "test", "lint"]);
	});

	it("marks passing commands with a check", () => {
		printMeasureTable(records, 3200);

		const lintLine = logs.find((l) => l.includes("lint"));
		expect(lintLine).toContain("✓");
	});

	it("marks failing commands with a cross", () => {
		printMeasureTable(records, 3200);

		const testLine = logs.find((l) => /\btest\b/.test(l));
		expect(testLine).toContain("✗");
	});

	it("prints a wall-clock total row", () => {
		printMeasureTable(records, 3200);

		const totalLine = logs.find((l) => l.includes("TOTAL"));
		expect(totalLine).toContain("3.2s");
	});
});
