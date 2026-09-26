import { describe, expect, it } from "vitest";
import { defaultNodeName } from "./resolveNodeName";

describe("defaultNodeName", () => {
	it("uses the short lowercased hostname", () => {
		expect(defaultNodeName("Stafford-Mac.local", "macos")).toBe("stafford-mac");
	});

	it("suffixes -wsl under WSL", () => {
		expect(defaultNodeName("PC", "wsl")).toBe("pc-wsl");
	});

	it("leaves native Windows unsuffixed", () => {
		expect(defaultNodeName("PC", "windows")).toBe("pc");
	});
});
