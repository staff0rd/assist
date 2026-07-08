import { afterEach, describe, expect, it } from "vitest";
import { resolveSessionItemId } from "./resolveSessionItemId";

const ENV = "ASSIST_BACKLOG_ITEM_ID";

afterEach(() => {
	delete process.env[ENV];
});

describe("resolveSessionItemId", () => {
	it("returns null when the env var is unset", () => {
		expect(resolveSessionItemId()).toBeNull();
	});

	it("returns the parsed id when set to a positive integer", () => {
		process.env[ENV] = "611";
		expect(resolveSessionItemId()).toBe(611);
	});

	it("returns null for a non-numeric value", () => {
		process.env[ENV] = "not-a-number";
		expect(resolveSessionItemId()).toBeNull();
	});

	it("returns null for a non-positive id", () => {
		process.env[ENV] = "0";
		expect(resolveSessionItemId()).toBeNull();
	});
});
