import { describe, expect, it } from "vitest";
import { parseStepVerdict } from "./parseStepVerdict";

describe("parseStepVerdict", () => {
	it.each(["pass", "fail", "unsure"])("accepts %s with a note", (verdict) => {
		expect(parseStepVerdict({ verdict, note: " Saw the banner " })).toEqual({
			verdict,
			note: "Saw the banner",
		});
	});

	it("rejects an unknown verdict", () => {
		expect(() => parseStepVerdict({ verdict: "ok", note: "x" })).toThrow(
			"verdict (pass, fail or unsure)",
		);
	});

	it("rejects an empty note", () => {
		expect(() => parseStepVerdict({ verdict: "pass", note: "  " })).toThrow(
			"non-empty note",
		);
	});
});
