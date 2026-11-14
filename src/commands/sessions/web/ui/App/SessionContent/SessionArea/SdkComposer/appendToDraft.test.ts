import { describe, expect, it } from "vitest";
import { appendToDraft } from "./appendToDraft";

describe("appendToDraft", () => {
	it("uses the text alone when the draft is empty", () => {
		expect(appendToDraft("", "queued")).toBe("queued");
	});

	it("treats a whitespace-only draft as empty", () => {
		expect(appendToDraft("  \n ", "queued")).toBe("queued");
	});

	it("puts the text below an existing draft after a blank line", () => {
		expect(appendToDraft("draft", "queued")).toBe("draft\n\nqueued");
	});

	it("trims trailing whitespace from the draft before the blank line", () => {
		expect(appendToDraft("draft  \n\n\n", "queued")).toBe("draft\n\nqueued");
	});
});
