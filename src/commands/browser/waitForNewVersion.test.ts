import { describe, expect, it, vi } from "vitest";
import { waitForNewVersion } from "./waitForNewVersion";

function clock() {
	let time = 0;
	return {
		now: () => time,
		wait: async (ms: number) => {
			time += ms;
		},
	};
}

describe("waitForNewVersion", () => {
	it("returns the first connected version that differs from the old one", async () => {
		const connectedVersion = vi
			.fn()
			.mockResolvedValueOnce("1.0.0")
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce("1.0.1");
		await expect(
			waitForNewVersion("http://x", "1.0.0", { ...clock(), connectedVersion }),
		).resolves.toBe("1.0.1");
		expect(connectedVersion).toHaveBeenCalledTimes(3);
	});

	it("gives up after the timeout", async () => {
		const connectedVersion = vi.fn().mockResolvedValue("1.0.0");
		await expect(
			waitForNewVersion("http://x", "1.0.0", {
				...clock(),
				connectedVersion,
				timeoutMs: 10_000,
				pollMs: 2_000,
			}),
		).resolves.toBeUndefined();
		expect(connectedVersion).toHaveBeenCalledTimes(5);
	});
});
