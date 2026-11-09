import { describe, expect, it } from "vitest";
import { viewedLinkedNodes } from "./viewedLinkedNodes";

const nodes = { local: "pc-wsl", links: [] };

describe("viewedLinkedNodes", () => {
	it("names the active session's and picked machine's linked nodes once, never the local node", () => {
		expect(viewedLinkedNodes("pc-windows", { nodes, selected: "mac" })).toEqual(
			["pc-windows", "mac"],
		);
		expect(
			viewedLinkedNodes("pc-windows", { nodes, selected: "pc-windows" }),
		).toEqual(["pc-windows"]);
		expect(viewedLinkedNodes(undefined, { nodes, selected: "pc-wsl" })).toEqual(
			[],
		);
	});
});
