import { describe, expect, it } from "vitest";
import type { VttCue } from "../../../../types";
import { removeSubstringDuplicates } from "./removeSubstringDuplicates";

function cue(
	overrides: Partial<VttCue> & { text: string; startMs: number },
): VttCue {
	return {
		endMs: overrides.startMs + 1000,
		speaker: "Alice",
		...overrides,
	};
}

describe("removeSubstringDuplicates", () => {
	describe("when there are no duplicates", () => {
		it("should return all cues unchanged", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0 }),
				cue({ text: "World", startMs: 2000 }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(2);
		});
	});

	describe("when a later cue is a substring of an earlier cue", () => {
		it("should remove the shorter cue", () => {
			const cues = [
				cue({ text: "Hello world", startMs: 0, endMs: 2000 }),
				cue({ text: "Hello", startMs: 1000, endMs: 2000 }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Hello world");
		});
	});

	describe("when an earlier cue is a substring of a later cue", () => {
		it("should remove the shorter cue", () => {
			const cues = [
				cue({ text: "Hello", startMs: 0, endMs: 2000 }),
				cue({ text: "Hello world", startMs: 1000, endMs: 3000 }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Hello world");
		});
	});

	describe("when cues have different speakers", () => {
		it("should not remove duplicates across speakers", () => {
			const cues = [
				cue({ text: "Hello world", startMs: 0, endMs: 2000, speaker: "Alice" }),
				cue({ text: "Hello", startMs: 1000, endMs: 2000, speaker: "Bob" }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(2);
		});
	});

	describe("when cues are far apart in time", () => {
		it("should not remove duplicates beyond the 10s window", () => {
			const cues = [
				cue({ text: "Hello world", startMs: 0, endMs: 1000 }),
				cue({ text: "Hello", startMs: 20000, endMs: 21000 }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(2);
		});
	});

	describe("when given an empty array", () => {
		it("should return an empty array", () => {
			const result = removeSubstringDuplicates([]);

			expect(result).toEqual([]);
		});
	});

	describe("when comparison is case-insensitive", () => {
		it("should treat different cases as duplicates", () => {
			const cues = [
				cue({ text: "HELLO WORLD", startMs: 0, endMs: 2000 }),
				cue({ text: "hello", startMs: 1000, endMs: 2000 }),
			];

			const result = removeSubstringDuplicates(cues);

			expect(result).toHaveLength(1);
		});
	});
});
