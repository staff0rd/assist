import { describe, expect, it } from "vitest";
import { validateCommentText } from "./validateCommentText";

describe("validateCommentText", () => {
	it("accepts a short single-line comment", () => {
		const result = validateCommentText("guards against the off-by-one here");
		expect(result).toEqual({
			ok: true,
			text: "guards against the off-by-one here",
		});
	});

	it("strips a leading // prefix from the body", () => {
		const result = validateCommentText("// already prefixed");
		expect(result).toEqual({ ok: true, text: "already prefixed" });
	});

	it("rejects block comment syntax", () => {
		const result = validateCommentText("/* not allowed */");
		expect(result.ok).toBe(false);
	});

	it("rejects a closing block-comment marker", () => {
		const result = validateCommentText("trailing */");
		expect(result.ok).toBe(false);
	});

	it("rejects multi-line text", () => {
		const result = validateCommentText("line one\nline two");
		expect(result.ok).toBe(false);
	});

	it("rejects text over the 50-char cap", () => {
		const result = validateCommentText("x".repeat(51));
		expect(result.ok).toBe(false);
	});

	it("accepts text exactly at the 50-char cap", () => {
		const result = validateCommentText("x".repeat(50));
		expect(result.ok).toBe(true);
	});
});
