import { describe, expect, it } from "vitest";
import type { VttCue } from "../../../types";
import { deduplicateCues } from "./index";

function cue(
	overrides: Partial<VttCue> & { text: string; startMs: number },
): VttCue {
	return {
		endMs: overrides.startMs + 1000,
		speaker: "Alice",
		...overrides,
	};
}

describe("deduplicateCues", () => {
	describe("when given an empty array", () => {
		it("should return an empty array", () => {
			const result = deduplicateCues([]);

			expect(result).toEqual([]);
		});
	});

	describe("when cues are out of order", () => {
		it("should sort by startMs", () => {
			const cues = [
				cue({ text: "Second", startMs: 5000, endMs: 6000 }),
				cue({ text: "First", startMs: 1000, endMs: 2000 }),
			];

			const result = deduplicateCues(cues);

			expect(result[0].text).toBe("First");
			expect(result[1].text).toBe("Second");
		});
	});

	describe("when overlapping cues share a speaker", () => {
		it("should merge them into one cue", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0, endMs: 1500 }),
				cue({ text: "Hello world", startMs: 1000, endMs: 2500 }),
			];

			const result = deduplicateCues(cues);

			expect(result).toHaveLength(1);
		});

		it("should use the latest endMs", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0, endMs: 1500 }),
				cue({ text: "world", startMs: 1000, endMs: 3000 }),
			];

			const result = deduplicateCues(cues);

			expect(result[0].endMs).toBe(3000);
		});
	});

	describe("when cues have different speakers", () => {
		it("should not merge them", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0, endMs: 1500, speaker: "Alice" }),
				cue({ text: "World", startMs: 1000, endMs: 2500, speaker: "Bob" }),
			];

			const result = deduplicateCues(cues);

			expect(result).toHaveLength(2);
		});
	});

	describe("when cues are far apart", () => {
		it("should not merge them", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0, endMs: 1000 }),
				cue({ text: "World", startMs: 5000, endMs: 6000 }),
			];

			const result = deduplicateCues(cues);

			expect(result).toHaveLength(2);
		});
	});

	describe("when cues have word overlap", () => {
		it("should deduplicate the overlapping words", () => {
			const cues = [
				cue({ text: "the quick brown", startMs: 0, endMs: 2000 }),
				cue({ text: "quick brown fox", startMs: 1500, endMs: 3000 }),
			];

			const result = deduplicateCues(cues);

			expect(result).toHaveLength(1);
			expect(result[0].text).toContain("fox");
		});
	});
});
