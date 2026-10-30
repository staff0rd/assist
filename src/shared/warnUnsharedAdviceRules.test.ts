import { beforeEach, describe, expect, it, vi } from "vitest";
import { warnUnsharedAdviceRules } from "./warnUnsharedAdviceRules";

const rule = (title: string) => ({ title, text: `${title} text` });

describe("warnUnsharedAdviceRules", () => {
	let errors: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.restoreAllMocks();
		errors = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("warns once when ~/.assist.yml holds rules user (db) lacks", () => {
		const globalRaw = { advice: { rules: [rule("shared"), rule("local")] } };
		const userDb = { advice: { rules: [rule("shared")] } };

		warnUnsharedAdviceRules(globalRaw, userDb);
		warnUnsharedAdviceRules(globalRaw, userDb);

		expect(errors).toHaveBeenCalledTimes(1);
		const message = String(errors.mock.calls[0]?.[0]);
		expect(message).toContain("1 rule(s) not in user (db)");
		expect(message).toContain("assist config import-user");
	});

	it("stays quiet when every rule is already in user (db)", () => {
		warnUnsharedAdviceRules(
			{ advice: { rules: [rule("synced")] } },
			{ advice: { rules: [rule("synced")] } },
		);

		expect(errors).not.toHaveBeenCalled();
	});

	it("stays quiet before this node has cached user (db)", () => {
		warnUnsharedAdviceRules(
			{ advice: { rules: [rule("uncached")] } },
			undefined,
		);

		expect(errors).not.toHaveBeenCalled();
	});
});
