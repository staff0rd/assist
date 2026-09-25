import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { previewRuleCiter } from "./previewRuleCiter";

const rule = {
	code: "R2",
	text: "Name the decision",
	source: "refinement/CLAUDE.md",
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("previewRuleCiter", () => {
	it("pastes the quote and the cited rule, then submits", () => {
		const sendInput = vi.fn();

		previewRuleCiter(
			"daemon-1",
			sendInput,
			"the option is best",
			vi.fn(),
		)?.(rule);

		const [, pasted] = sendInput.mock.calls[0] as [string, string];
		expect(pasted).toContain("the option is best");
		expect(pasted).toContain("R2");
		expect(pasted).toContain("Name the decision");
		expect(pasted).toContain("Rectify the quoted text");
		vi.runAllTimers();
		expect(sendInput).toHaveBeenLastCalledWith("daemon-1", "\r");
	});

	it("closes the popover once the citation is sent", () => {
		const onSent = vi.fn();

		previewRuleCiter("daemon-1", vi.fn(), "quoted", onSent)?.(rule);

		expect(onSent).toHaveBeenCalledTimes(1);
	});

	it("offers no citation without a session to send to", () => {
		expect(previewRuleCiter(undefined, vi.fn(), "quoted", vi.fn())).toBe(
			undefined,
		);
		expect(previewRuleCiter("daemon-1", undefined, "quoted", vi.fn())).toBe(
			undefined,
		);
	});
});
