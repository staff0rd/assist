import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveAutopilotStatus } from "./resolveAutopilotStatus";

const mockFetch = vi.fn();

vi.mock("./fetchAutopilotStatus", () => ({
	fetchAutopilotStatus: (...args: unknown[]) => mockFetch(...args),
}));

const status = (over: object) => ({
	status: { cwd: "/wsl/st", node: "mac", scheduledHere: false, ...over },
	items: [],
});

describe("resolveAutopilotStatus", () => {
	beforeEach(() => mockFetch.mockReset());

	it("keeps the viewing node's status when it runs the schedule", async () => {
		mockFetch.mockResolvedValue(status({ scheduledHere: true }));
		const resolved = await resolveAutopilotStatus(
			{ cwd: "/mac/st" },
			"mac",
			() => undefined,
		);
		expect(resolved.target).toEqual({ cwd: "/mac/st" });
		expect(resolved.via).toBeUndefined();
	});

	it("reads and targets the scheduling node's clone from another node", async () => {
		mockFetch
			.mockResolvedValueOnce(status({}))
			.mockResolvedValueOnce(status({ cwd: "/mac/st", scheduledHere: true }));
		const resolved = await resolveAutopilotStatus(
			{ cwd: "/wsl/st" },
			"wsl",
			(_cwd, node) => (node === "mac" ? "/mac/st" : undefined),
		);
		expect(mockFetch).toHaveBeenLastCalledWith("/mac/st", "mac");
		expect(resolved.target).toEqual({ cwd: "/mac/st", node: "mac" });
		expect(resolved.via).toBe("mac");
		expect(resolved.status?.scheduledHere).toBe(true);
	});

	it("says why it shows this node's copy when the scheduler has no clone", async () => {
		mockFetch.mockResolvedValue(status({}));
		const resolved = await resolveAutopilotStatus(
			{ cwd: "/wsl/st" },
			"wsl",
			() => undefined,
		);
		expect(resolved.error).toBe(
			"Autopilot for this repo runs on mac; showing this node's copy because this repo has no known clone on mac.",
		);
	});
});
