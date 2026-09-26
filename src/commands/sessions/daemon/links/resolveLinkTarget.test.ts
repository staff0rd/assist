import { describe, expect, it } from "vitest";
import { resolveLinkTarget } from "./resolveLinkTarget";

const linked = (node: string) => node === "pc-windows";

describe("resolveLinkTarget", () => {
	it("routes a namespaced session id to its node", () => {
		expect(
			resolveLinkTarget(
				{ type: "input", sessionId: "pc-windows:3" },
				"pc-wsl",
				linked,
			),
		).toEqual({ kind: "link", node: "pc-windows" });
	});

	it("keeps a bare session id local even when a node is named", () => {
		expect(
			resolveLinkTarget(
				{ type: "create", launchedFrom: "4", node: "pc-windows" },
				"pc-wsl",
				linked,
			),
		).toEqual({ kind: "local" });
	});

	it("routes a launch by its node, treating this node's own name as local", () => {
		expect(
			resolveLinkTarget(
				{ type: "create", node: "pc-windows" },
				"pc-wsl",
				linked,
			),
		).toEqual({ kind: "link", node: "pc-windows" });
		expect(
			resolveLinkTarget({ type: "create", node: "pc-wsl" }, "pc-wsl", linked),
		).toEqual({ kind: "local" });
	});

	it("routes a resume by node since its session id is a transcript id", () => {
		expect(
			resolveLinkTarget(
				{ type: "resume", sessionId: "abc", node: "pc-windows" },
				"pc-wsl",
				linked,
			),
		).toEqual({ kind: "link", node: "pc-windows" });
	});

	it("flags a node with no link", () => {
		expect(
			resolveLinkTarget({ type: "create", node: "mac" }, "pc-wsl", linked),
		).toEqual({ kind: "unknown", node: "mac" });
	});
});
