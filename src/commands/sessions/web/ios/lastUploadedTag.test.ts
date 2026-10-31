import { describe, expect, it } from "vitest";
import { lastUploadedTag } from "./lastUploadedTag";

const job = (name: string, conclusion: string | null) => ({ name, conclusion });

describe("lastUploadedTag", () => {
	it("is undefined when no run has uploaded", () => {
		expect(lastUploadedTag([], () => [])).toBeUndefined();
		expect(
			lastUploadedTag([3, 2], () => [
				job("gate", "success"),
				job("TestFlight v1.0.0", "skipped"),
			]),
		).toBeUndefined();
	});

	it("skips a failed upload and uses the last successful one", () => {
		const jobs: Record<number, ReturnType<typeof job>[]> = {
			3: [job("gate", "success"), job("TestFlight v1.2.0", "failure")],
			2: [job("gate", "success"), job("TestFlight v1.1.0", "success")],
			1: [job("gate", "success"), job("TestFlight v1.0.0", "success")],
		};
		expect(lastUploadedTag([3, 2, 1], (id) => jobs[id])).toBe("v1.1.0");
	});

	it("ignores the in-progress upload of the current run", () => {
		expect(
			lastUploadedTag([2, 1], (id) =>
				id === 2
					? [job("TestFlight v1.1.0", null)]
					: [job("TestFlight v1.0.0", "success")],
			),
		).toBe("v1.0.0");
	});
});
