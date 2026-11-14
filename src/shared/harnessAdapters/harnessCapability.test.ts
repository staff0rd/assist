import { describe, expect, it } from "vitest";
import type { HarnessKind } from "../harnesses";
import { harnessCapability } from "./harnessCapability";

describe("harnessCapability", () => {
	it("resolves a known harness's declaration", () => {
		expect(harnessCapability("claude", "slashCommands.suggest").supported).toBe(
			true,
		);
	});

	it("reports an unknown harness kind as unsupported instead of throwing", () => {
		const status = harnessCapability(
			"future-harness" as HarnessKind,
			"slashCommands.suggest",
		);
		expect(status.supported).toBe(false);
		if (!status.supported) expect(status.reason).toContain("future-harness");
	});
});
