// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureGlobalErrors } from "./captureGlobalErrors";
import { markReported } from "./markReported";
import { clearClientFailures, getClientFailures } from "./recordClientFailure";

let release: () => void;

function rejection(reason: unknown): Event {
	const event = new Event("unhandledrejection");
	Object.assign(event, { reason });
	return event;
}

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response("{}")),
	);
	release = captureGlobalErrors();
});

afterEach(() => {
	release();
	clearClientFailures();
	vi.unstubAllGlobals();
});

describe("captureGlobalErrors", () => {
	it("records uncaught errors with their source", () => {
		globalThis.dispatchEvent(
			new ErrorEvent("error", {
				message: "boom",
				filename: "app.js",
				lineno: 3,
				colno: 7,
			}),
		);
		expect(getClientFailures()[0]).toMatchObject({
			kind: "error",
			error: "boom (app.js:3:7)",
		});
	});

	it("records unhandled rejections once", () => {
		const reason = new Error("nope");
		globalThis.dispatchEvent(rejection(reason));
		globalThis.dispatchEvent(rejection(reason));
		expect(getClientFailures()).toHaveLength(1);
		expect(getClientFailures()[0]).toMatchObject({
			kind: "rejection",
			error: "nope",
		});
	});

	it("skips rejections already reported by apiFetch", () => {
		const reason = new TypeError("Failed to fetch");
		markReported(reason);
		globalThis.dispatchEvent(rejection(reason));
		expect(getClientFailures()).toHaveLength(0);
	});
});
