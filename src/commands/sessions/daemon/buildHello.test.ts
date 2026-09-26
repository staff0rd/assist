import { describe, expect, it, vi } from "vitest";
import {
	ASSIST_VERSION,
	buildHello,
	helloCompatible,
	helloMismatchKind,
	isHello,
	PROTOCOL_VERSION,
} from "./buildHello";

vi.mock("../shared/resolveNodeName", () => ({
	resolveNodeName: () => "pc-wsl",
}));

describe("buildHello", () => {
	it("keeps the frozen shape linked nodes of any version exchange", () => {
		expect(Object.keys(buildHello({ peer: true })).sort()).toEqual([
			"nodeName",
			"peer",
			"protocol",
			"type",
			"version",
		]);
	});

	it("carries the app version, protocol version and node name", () => {
		expect(buildHello()).toEqual({
			type: "hello",
			version: ASSIST_VERSION,
			protocol: PROTOCOL_VERSION,
			nodeName: "pc-wsl",
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
	it("accepts a peer matching on both protocol and version", () => {
		expect(
			helloCompatible({
				type: "hello",
				version: ASSIST_VERSION,
				protocol: PROTOCOL_VERSION,
			}),
		).toBe(true);
	});

	it("rejects a differing app version even when the protocol matches", () => {
		expect(
			helloCompatible({
				type: "hello",
				version: "9.9.9-different",
				protocol: PROTOCOL_VERSION,
			}),
		).toBe(false);
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

describe("helloMismatchKind", () => {
	it("names a version-only skew", () => {
		expect(
			helloMismatchKind({
				type: "hello",
				version: "0.0.0-old",
				protocol: PROTOCOL_VERSION,
			}),
		).toBe("version");
	});

	it("names a protocol skew", () => {
		expect(
			helloMismatchKind({
				type: "hello",
				version: "0.0.0-old",
				protocol: PROTOCOL_VERSION + 1,
			}),
		).toBe("protocol");
	});

	it("names a legacy peer's skew as a version skew", () => {
		expect(helloMismatchKind({ type: "hello", version: "0.0.0-old" })).toBe(
			"version",
		);
	});
});
