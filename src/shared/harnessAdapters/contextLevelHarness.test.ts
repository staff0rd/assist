import { describe, expect, it } from "vitest";
import { contextLevel } from "./contextLevel";

describe("contextLevel per harness", () => {
	it("applies Claude's thresholds when no harness is given", () => {
		expect(contextLevel(25)).toBe(contextLevel(25, "claude"));
	});

	it("gives Codex's larger-window sessions later thresholds", () => {
		expect(contextLevel(30, "codex")).toBe("dim");
		expect(contextLevel(50, "codex")).toBe("yellow");
		expect(contextLevel(75, "codex")).toBe("red");
	});
});
