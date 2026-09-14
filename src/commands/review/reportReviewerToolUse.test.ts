import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpinnerHandle } from "./MultiSpinner";
import { reportReviewerToolUse } from "./reportReviewerToolUse";

function makeSpinner(): SpinnerHandle {
	return { text: "", succeed: vi.fn(), fail: vi.fn() };
}

const USE = { tool: "shell", summary: 'rg "pickProgramSourceId"' };

describe("reportReviewerToolUse", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("names the model in the spinner text when one is in use", () => {
		const spinner = makeSpinner();

		reportReviewerToolUse("codex", USE, spinner, "azure/gpt-5.6-sol");

		expect(spinner.text).toBe(
			'codex (azure/gpt-5.6-sol) — shell: rg "pickProgramSourceId"',
		);
	});

	it("leaves the spinner text bare when there is no model", () => {
		const spinner = makeSpinner();

		reportReviewerToolUse("codex", USE, spinner);

		expect(spinner.text).toBe('codex — shell: rg "pickProgramSourceId"');
	});

	it("names the model in the console prefix when one is in use", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		reportReviewerToolUse("codex", USE, undefined, "azure/gpt-5.6-sol");

		expect(log).toHaveBeenCalledWith(
			'[codex (azure/gpt-5.6-sol)] shell: rg "pickProgramSourceId"',
		);
	});

	it("leaves the console prefix bare when there is no model", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		reportReviewerToolUse("codex", USE, undefined);

		expect(log).toHaveBeenCalledWith('[codex] shell: rg "pickProgramSourceId"');
	});

	it("omits the summary separator when the summary is empty", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		reportReviewerToolUse(
			"codex",
			{ tool: "shell", summary: "" },
			undefined,
			"m",
		);

		expect(log).toHaveBeenCalledWith("[codex (m)] shell");
	});
});
