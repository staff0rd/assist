import { describe, expect, it } from "vitest";
import { deriveHistoryFields } from "./deriveHistoryFields";

describe("deriveHistoryFields", () => {
	it("maps known command names to their session type", () => {
		expect(deriveHistoryFields("draft", "", "").sessionType).toBe("draft");
		expect(deriveHistoryFields("refine", "", "").sessionType).toBe("refine");
		expect(deriveHistoryFields("bug", "", "").sessionType).toBe("bug");
		expect(deriveHistoryFields("next", "", "").sessionType).toBe("next");
	});

	it("treats an unknown command or a bare prompt as 'prompt'", () => {
		expect(deriveHistoryFields("compact", "", "").sessionType).toBe("prompt");
		expect(deriveHistoryFields("", "", "fix the thing").sessionType).toBe(
			"prompt",
		);
	});

	it("returns no session type when there are no markers and no name", () => {
		expect(deriveHistoryFields("", "", "").sessionType).toBeUndefined();
	});

	it("extracts a leading numeric item id from command args", () => {
		expect(deriveHistoryFields("next", "223", "").itemId).toBe(223);
		expect(deriveHistoryFields("refine", "123 tweak wording", "").itemId).toBe(
			123,
		);
	});

	it("uses the remaining args text as the prompt", () => {
		expect(deriveHistoryFields("refine", "123 tweak wording", "").prompt).toBe(
			"tweak wording",
		);
		expect(deriveHistoryFields("draft", "add dark mode", "").prompt).toBe(
			"add dark mode",
		);
	});

	it("leaves itemId and prompt undefined when args are absent", () => {
		const fields = deriveHistoryFields("draft", "", "");
		expect(fields.itemId).toBeUndefined();
		expect(fields.prompt).toBeUndefined();
	});
});
