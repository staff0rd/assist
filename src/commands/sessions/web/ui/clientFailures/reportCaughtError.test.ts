// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markReported } from "./markReported";
import { clearClientFailures, getClientFailures } from "./recordClientFailure";
import { reportCaughtError } from "./reportCaughtError";

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response("{}")),
	);
});

afterEach(() => {
	clearClientFailures();
	vi.unstubAllGlobals();
});

describe("reportCaughtError", () => {
	it("records the error with its context once", () => {
		const error = new SyntaxError("Unexpected token <");
		reportCaughtError(error, "inbox refresh");
		reportCaughtError(error, "inbox refresh");
		expect(getClientFailures()).toHaveLength(1);
		expect(getClientFailures()[0]).toMatchObject({
			kind: "caught",
			method: "CAUGHT",
			error: "inbox refresh: Unexpected token <",
		});
	});

	it("skips errors apiFetch already recorded", () => {
		const error = new TypeError("Failed to fetch");
		markReported(error);
		reportCaughtError(error, "inbox refresh");
		expect(getClientFailures()).toHaveLength(0);
	});
});
