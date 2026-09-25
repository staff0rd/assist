import { describe, expect, it, vi } from "vitest";
import { handleLimits } from "./handleLimits";
import type { WsDispatch } from "../../../WsDispatch";

const rateLimits = { seven_day: { used_percentage: 5, resets_at: 1 } };

function dispatch() {
	return {
		setRateLimits: vi.fn(),
		setHarnessRateLimits: vi.fn(),
	} as unknown as WsDispatch & {
		setRateLimits: ReturnType<typeof vi.fn>;
		setHarnessRateLimits: ReturnType<typeof vi.fn>;
	};
}

describe("handleLimits", () => {
	it("treats an untagged limits message as Claude's", () => {
		const d = dispatch();
		handleLimits({ type: "limits", rateLimits }, d);
		expect(d.setRateLimits).toHaveBeenCalledWith(rateLimits);
		expect(d.setHarnessRateLimits).not.toHaveBeenCalled();
	});

	it("stores a harness-tagged message under that harness", () => {
		const d = dispatch();
		handleLimits({ type: "limits", harness: "codex", rateLimits }, d);
		expect(d.setHarnessRateLimits).toHaveBeenCalledWith("codex", rateLimits);
		expect(d.setRateLimits).not.toHaveBeenCalled();
	});
});
