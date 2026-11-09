// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearClientFailures,
	getClientFailures,
} from "../../../../../clientFailures/recordClientFailure";
import { parseWsFrame } from "./parseWsFrame";

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

describe("parseWsFrame", () => {
	it("parses a complete JSON frame", () => {
		expect(parseWsFrame('{"type":"history","sessions":[]}')).toEqual({
			type: "history",
			sessions: [],
		});
	});

	it("skips a truncated frame without throwing and records it once", () => {
		const truncated = '{"type":"history","sessions":[{"id":"abc';
		expect(() => parseWsFrame(truncated)).not.toThrow();
		expect(getClientFailures()).toHaveLength(1);
		expect(getClientFailures()[0]).toMatchObject({ kind: "caught" });
		expect(getClientFailures()[0].error).toContain("malformed /ws frame");
	});

	it("skips frames that are not JSON objects", () => {
		expect(parseWsFrame("42")).toBeNull();
		expect(getClientFailures()).toHaveLength(0);
	});
});
