import { describe, expect, it, vi } from "vitest";
import { finaliseReviewerSpinner } from "./finaliseReviewerSpinner";
import type { SpinnerHandle } from "./MultiSpinner";

function makeSpinner(): SpinnerHandle & {
	succeedMock: ReturnType<typeof vi.fn>;
	failMock: ReturnType<typeof vi.fn>;
} {
	const succeedMock = vi.fn();
	const failMock = vi.fn();
	return {
		text: "",
		succeed: succeedMock,
		fail: failMock,
		succeedMock,
		failMock,
	};
}

describe("finaliseReviewerSpinner", () => {
	it("reports success with elapsed seconds", () => {
		const spinner = makeSpinner();
		finaliseReviewerSpinner(spinner, "codex", 0, 12345);
		expect(spinner.succeedMock).toHaveBeenCalledWith("codex — done in 12s");
	});

	it("reports failure with exit code when stderr is empty", () => {
		const spinner = makeSpinner();
		finaliseReviewerSpinner(spinner, "codex", 127, 500, "");
		expect(spinner.failMock).toHaveBeenCalledWith(
			"codex — failed in 1s (exit 127)",
		);
	});

	it("appends first stderr line as inline summary", () => {
		const spinner = makeSpinner();
		finaliseReviewerSpinner(
			spinner,
			"codex",
			127,
			0,
			"command not found: codex\nmore detail",
		);
		expect(spinner.failMock).toHaveBeenCalledWith(
			"codex — failed in 0s (exit 127): command not found: codex",
		);
	});

	it("truncates long stderr summaries with ellipsis", () => {
		const spinner = makeSpinner();
		const long = "x".repeat(200);
		finaliseReviewerSpinner(spinner, "codex", 1, 5000, long);
		const arg = spinner.failMock.mock.calls[0][0] as string;
		expect(arg.endsWith("…")).toBe(true);
		expect(arg.length).toBeLessThanOrEqual(
			"codex — failed in 5s (exit 1): ".length + 80,
		);
	});

	it("skips blank stderr lines when summarising", () => {
		const spinner = makeSpinner();
		finaliseReviewerSpinner(spinner, "codex", 1, 5000, "\n\n  \nreal error");
		expect(spinner.failMock).toHaveBeenCalledWith(
			"codex — failed in 5s (exit 1): real error",
		);
	});
});
