import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { previewRuleAdder } from "./previewRuleAdder";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("previewRuleAdder", () => {
	it("pastes the add-rule command with the quote and note, then submits", () => {
		const sendInput = vi.fn();

		previewRuleAdder(
			"daemon-1",
			sendInput,
			"the option is best",
			vi.fn(),
		)?.("name the decision");

		const [, pasted] = sendInput.mock.calls[0] as [string, string];
		expect(pasted).toContain("/add-rule");
		expect(pasted).toContain("the option is best");
		expect(pasted).toContain("name the decision");
		vi.runAllTimers();
		expect(sendInput).toHaveBeenLastCalledWith("daemon-1", "\r");
	});

	it("closes the popover once the command is sent", () => {
		const onSent = vi.fn();

		previewRuleAdder("daemon-1", vi.fn(), "quoted", onSent)?.("a rule");

		expect(onSent).toHaveBeenCalledTimes(1);
	});

	it("offers no add-rule button without a session to send to", () => {
		expect(previewRuleAdder(undefined, vi.fn(), "quoted", vi.fn())).toBe(
			undefined,
		);
		expect(previewRuleAdder("daemon-1", undefined, "quoted", vi.fn())).toBe(
			undefined,
		);
	});
});
