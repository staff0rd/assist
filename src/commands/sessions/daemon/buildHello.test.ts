import { describe, expect, it, vi } from "vitest";
import {
	ASSIST_VERSION,
	buildHello,
	describeProtocolGap,
	isHello,
	MIN_PROTOCOL_VERSION,
	negotiateProtocol,
	PROTOCOL_VERSION,
} from "./buildHello";

vi.mock("../shared/resolveNodeName", () => ({
	resolveNodeName: () => "pc-wsl",
}));

describe("buildHello", () => {
	it("keeps the fields older nodes read and adds the minimum protocol", () => {
		expect(Object.keys(buildHello({ peer: true })).sort()).toEqual([
			"minProtocol",
			"nodeName",
			"peer",
			"protocol",
			"type",
			"version",
		]);
	});

	it("carries the app version, protocol range and node name", () => {
		expect(buildHello()).toEqual({
			type: "hello",
			version: ASSIST_VERSION,
			protocol: PROTOCOL_VERSION,
			minProtocol: MIN_PROTOCOL_VERSION,
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

	it("accepts a legacy hello with no protocol", () => {
		expect(isHello({ type: "hello", version: "1.0.0" })).toBe(true);
	});

	it("rejects a non-numeric protocol", () => {
		expect(isHello({ type: "hello", version: "1.0.0", protocol: "1" })).toBe(
			false,
		);
	});

	it("rejects other message types and a missing version", () => {
		expect(isHello({ type: "output", version: "1.0.0" })).toBe(false);
		expect(isHello({ type: "hello" })).toBe(false);
	});
});

function hello(protocol?: number, minProtocol?: number) {
	return { type: "hello" as const, version: "9.9.9", protocol, minProtocol };
}

describe("negotiateProtocol", () => {
	it("ignores the app version", () => {
		expect(negotiateProtocol(hello(PROTOCOL_VERSION))).toBe(PROTOCOL_VERSION);
	});

	it("picks the highest protocol both ranges share", () => {
		expect(
			negotiateProtocol(hello(PROTOCOL_VERSION + 5, MIN_PROTOCOL_VERSION)),
		).toBe(PROTOCOL_VERSION);
		expect(
			negotiateProtocol(hello(MIN_PROTOCOL_VERSION, MIN_PROTOCOL_VERSION)),
		).toBe(MIN_PROTOCOL_VERSION);
	});

	it("treats a peer without a minimum as supporting only its protocol", () => {
		expect(negotiateProtocol(hello(MIN_PROTOCOL_VERSION))).toBe(
			MIN_PROTOCOL_VERSION,
		);
		expect(negotiateProtocol(hello(PROTOCOL_VERSION + 1))).toBeUndefined();
	});

	it("refuses only when the ranges don't overlap", () => {
		expect(
			negotiateProtocol(hello(PROTOCOL_VERSION + 2, PROTOCOL_VERSION + 1)),
		).toBeUndefined();
		expect(
			negotiateProtocol(
				hello(MIN_PROTOCOL_VERSION - 1, MIN_PROTOCOL_VERSION - 1),
			),
		).toBeUndefined();
	});

	it("refuses a legacy peer with no protocol", () => {
		expect(negotiateProtocol(hello())).toBeUndefined();
	});
});

describe("describeProtocolGap", () => {
	it("names the peer as behind when its range is below this node's", () => {
		expect(describeProtocolGap("pc-windows", hello(0, 0))).toContain(
			"update pc-windows",
		);
	});

	it("names this node as behind when the peer's range is above", () => {
		expect(
			describeProtocolGap(
				"pc-windows",
				hello(PROTOCOL_VERSION + 2, PROTOCOL_VERSION + 1),
			),
		).toContain("update this node");
	});
});
