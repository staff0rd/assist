import { describe, expect, it } from "vitest";
import { adviceRulesOf } from "./adviceRulesOf";

describe("adviceRulesOf", () => {
	it("returns the well-formed advice.rules entries", () => {
		expect(
			adviceRulesOf({
				advice: { rules: [{ title: "A", text: "a" }, "junk", { title: 1 }] },
			}),
		).toEqual([{ title: "A", text: "a" }]);
	});

	it("returns no rules when advice.rules is missing", () => {
		expect(adviceRulesOf({})).toEqual([]);
	});
});
