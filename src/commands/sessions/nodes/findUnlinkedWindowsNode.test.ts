import { describe, expect, it, vi } from "vitest";
import { findUnlinkedWindowsNode } from "./findUnlinkedWindowsNode";

describe("findUnlinkedWindowsNode", () => {
	it("prints the link command for a Windows node answering on its port", async () => {
		const health = vi.fn(async () => ({ nodeName: "pc-windows" }));
		expect(await findUnlinkedWindowsNode(health, "wsl")).toEqual({
			nodeName: "pc-windows",
			url: "http://127.0.0.1:3101",
			command: "assist sessions nodes link pc-windows http://127.0.0.1:3101",
		});
	});

	it("finds nothing when no Windows node answers", async () => {
		const health = vi.fn(async () => Promise.reject(new Error("refused")));
		expect(await findUnlinkedWindowsNode(health, "wsl")).toBeUndefined();
	});

	it("does not probe off WSL", async () => {
		const health = vi.fn();
		expect(await findUnlinkedWindowsNode(health, "macos")).toBeUndefined();
		expect(health).not.toHaveBeenCalled();
	});
});
