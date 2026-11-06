import { describe, expect, it } from "vitest";
import { promptSessionType } from "./promptSessionType";

describe("promptSessionType", () => {
	it("reads the type from a leading known slash command", () => {
		expect(promptSessionType("/bug raise a test bug")).toBe("bug");
		expect(promptSessionType("  /draft\nsomething")).toBe("draft");
		expect(promptSessionType("/refine a12")).toBe("refine");
		expect(promptSessionType("/next")).toBe("next");
		expect(promptSessionType("/review")).toBe("review");
		expect(promptSessionType("/update")).toBe("update");
	});

	it("maps review-pr-comments and fix-conflict to review", () => {
		expect(promptSessionType("/review-pr-comments")).toBe("review");
		expect(promptSessionType("/fix-conflict 12")).toBe("review");
	});

	it("ignores prompts not led by a known slash command", () => {
		expect(promptSessionType(undefined)).toBeUndefined();
		expect(promptSessionType("fix the /bug please")).toBeUndefined();
		expect(promptSessionType("/commit")).toBeUndefined();
		expect(promptSessionType("/bugfix now")).toBeUndefined();
		expect(promptSessionType("/home/me/file.ts")).toBeUndefined();
	});
});
