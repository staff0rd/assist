import { afterEach, describe, expect, it, vi } from "vitest";
import { installAvailableUpdate } from "./installAvailableUpdate";
import { runBrowserRequest } from "./runBrowserRequest";

function stubRuntime(requestUpdateCheck?: () => Promise<unknown>) {
	const reload = vi.fn();
	vi.stubGlobal("browser", {
		runtime: {
			getManifest: () => ({ version: "1.0.0" }),
			requestUpdateCheck,
			reload,
		},
		tabs: { query: vi.fn(), sendMessage: vi.fn() },
	});
	return { reload, api: (globalThis as unknown as { browser: never }).browser };
}

describe("update op", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("replies with the available version and reloads after replying", async () => {
		vi.useFakeTimers();
		const { reload, api } = stubRuntime(async () => ({
			status: "update_available",
			version: "1.0.1",
		}));
		const reply = await runBrowserRequest({ op: "update" });
		expect(reply).toEqual({
			ok: true,
			result: { status: "update_available", available: "1.0.1" },
		});
		installAvailableUpdate(api, reply);
		expect(reload).not.toHaveBeenCalled();
		await vi.runAllTimersAsync();
		expect(reload).toHaveBeenCalledOnce();
	});

	it.each(["no_update", "throttled"])(
		"replies %s without reloading",
		async (status) => {
			vi.useFakeTimers();
			const { reload, api } = stubRuntime(async () => ({ status }));
			const reply = await runBrowserRequest({ op: "update" });
			expect(reply).toEqual({ ok: true, result: { status } });
			installAvailableUpdate(api, reply);
			await vi.runAllTimersAsync();
			expect(reload).not.toHaveBeenCalled();
		},
	);

	it("reports a failed update check", async () => {
		stubRuntime(async () => {
			throw new Error("network down");
		});
		await expect(runBrowserRequest({ op: "update" })).resolves.toEqual({
			ok: false,
			error: "update check failed: network down",
		});
	});

	it("reports a browser without requestUpdateCheck", async () => {
		stubRuntime();
		await expect(runBrowserRequest({ op: "update" })).resolves.toMatchObject({
			ok: false,
			error: expect.stringContaining("unavailable"),
		});
	});
});
