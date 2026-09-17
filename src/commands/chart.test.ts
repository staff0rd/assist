import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReadStdinLines = vi.fn();
const mockRenderLineChart = vi.fn();

vi.mock("./chart/readStdinLines", () => ({
	readStdinLines: () => mockReadStdinLines(),
}));

vi.mock("../lib/renderLineChart", () => ({
	renderLineChart: (options: unknown) => mockRenderLineChart(options),
}));

import { chart } from "./chart";

describe("chart", () => {
	let logged: string[];
	let errored: string[];

	beforeEach(() => {
		vi.clearAllMocks();
		logged = [];
		errored = [];
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(message);
		});
		vi.spyOn(console, "error").mockImplementation((message: string) => {
			errored.push(message);
		});
		vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`process.exit(${code})`);
		}) as never);
	});

	it("should chart the points in the order given", async () => {
		mockReadStdinLines.mockResolvedValue(["b,2", "a,1", "c,3"]);

		await chart({ title: "Fist of five" });

		expect(mockRenderLineChart).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Fist of five",
				label: "Fist of five",
				seriesTitle: "Fist of five",
				labels: ["b", "a", "c"],
				values: [2, 1, 3],
			}),
		);
	});

	it("should chart without a title", async () => {
		mockReadStdinLines.mockResolvedValue(["a,1", "b,2"]);

		await chart({});

		expect(mockRenderLineChart).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Chart", labels: ["a", "b"] }),
		);
	});

	it("should skip blank lines", async () => {
		mockReadStdinLines.mockResolvedValue(["", "a,1", "   ", "b,2", ""]);

		await chart({});

		expect(mockRenderLineChart).toHaveBeenCalledWith(
			expect.objectContaining({ labels: ["a", "b"], values: [1, 2] }),
		);
	});

	it("should not chart a single point", async () => {
		mockReadStdinLines.mockResolvedValue(["a,1"]);

		await chart({});

		expect(logged).toEqual(["Not enough data points to chart."]);
		expect(mockRenderLineChart).not.toHaveBeenCalled();
	});

	it("should not chart empty input", async () => {
		mockReadStdinLines.mockResolvedValue(["", "  "]);

		await chart({});

		expect(logged).toEqual(["Not enough data points to chart."]);
		expect(mockRenderLineChart).not.toHaveBeenCalled();
	});

	it("should exit non-zero naming the line when a value is not numeric", async () => {
		mockReadStdinLines.mockResolvedValue(["a,1", "2026-08-20 avg=3.60"]);

		await expect(chart({})).rejects.toThrow("process.exit(1)");

		expect(errored).toEqual([
			'Value "avg=3.60" is not numeric, on line: 2026-08-20 avg=3.60',
		]);
		expect(mockRenderLineChart).not.toHaveBeenCalled();
	});

	it("should exit non-zero naming the line when a line has no value", async () => {
		mockReadStdinLines.mockResolvedValue(["a,1", "2026-08-20"]);

		await expect(chart({})).rejects.toThrow("process.exit(1)");

		expect(errored).toEqual(["Expected a label and a value, got: 2026-08-20"]);
		expect(mockRenderLineChart).not.toHaveBeenCalled();
	});
});
