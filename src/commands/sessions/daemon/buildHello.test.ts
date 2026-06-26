import { describe, expect, it } from "vitest";
import {
	ASSIST_VERSION,
	buildHello,
	helloCompatible,
	isHello,
	PROTOCOL_VERSION,
} from "./buildHello";

describe("buildHello", () => {
	it("carries the app version and the protocol version", () => {
		expect(buildHello()).toEqual({
			type: "hello",
			version: ASSIST_VERSION,
			protocol: PROTOCOL_VERSION,
		});
	});
});

describe("isHello", () => {
	it("accepts a hello with a numeric protocol", () => {
		expect(isHello({ type: "hello", version: "1.0.0", protocol: 1 })).toBe(
			true,
		);
	});

	it("accepts a legacy hello with no protocol field", () => {
		expect(isHello({ type: "hello", version: "1.0.0" })).toBe(true);
	});

	it("rejects a hello whose protocol is not a number", () => {
		expect(isHello({ type: "hello", version: "1.0.0", protocol: "1" })).toBe(
			false,
		);
	});

	it("rejects non-hello messages", () => {
		expect(isHello({ type: "output", version: "1.0.0" })).toBe(false);
		expect(isHello({ type: "hello" })).toBe(false);
	});
});

describe("helloCompatible", () => {
	it("matches on protocol regardless of differing app versions", () => {
		expect(
			helloCompatible({
				type: "hello",
				version: "9.9.9-different",
				protocol: PROTOCOL_VERSION,
			}),
		).toBe(true);
	});

	it("rejects a genuinely different protocol", () => {
		expect(
			helloCompatible({
				type: "hello",
				version: ASSIST_VERSION,
				protocol: PROTOCOL_VERSION + 1,
			}),
		).toBe(false);
	});

	it("falls back to version equality for a legacy peer with no protocol", () => {
		expect(helloCompatible({ type: "hello", version: ASSIST_VERSION })).toBe(
			true,
		);
		expect(helloCompatible({ type: "hello", version: "0.0.0-old" })).toBe(
			false,
		);
	});
});
