import { describe, expect, it } from "vitest";
import { nodeRuntimeMismatch } from "./nodeRuntimeMismatch";

const node = { version: "v22.21.1", path: "/usr/bin/node" };

describe("nodeRuntimeMismatch", () => {
	it("flags a daemon running another version than declared", () => {
		expect(nodeRuntimeMismatch(node, { spec: "24", version: "24.22.1" })).toBe(
			'daemon runs on node v22.21.1 but sessions.nodeVersion "24" resolves to v24.22.1',
		);
	});

	it("is silent when the versions match or nothing is declared", () => {
		expect(
			nodeRuntimeMismatch(node, { spec: "22", version: "22.21.1" }),
		).toBeUndefined();
		expect(nodeRuntimeMismatch(node, undefined)).toBeUndefined();
	});
});
