// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRestartedServerReload } from "./useRestartedServerReload";
import { tabRestartPending } from "./useWebserverRestart/tabRestartPending";

let reload: ReturnType<typeof vi.fn>;
let health: { version: string; startCommit: string };

beforeEach(() => {
	vi.useFakeTimers();
	reload = vi.fn();
	health = { version: "1.0.0", startCommit: "aaa" };
	tabRestartPending.set(false);
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({ ok: true, json: async () => health })),
	);
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { reload },
	});
});

async function bounce(rerender: (props: { reconnecting: boolean }) => void) {
	rerender({ reconnecting: true });
	rerender({ reconnecting: false });
	await act(async () => {
		await vi.advanceTimersByTimeAsync(2_000);
	});
}

function mount() {
	return renderHook(
		({ reconnecting }) => useRestartedServerReload(reconnecting),
		{ initialProps: { reconnecting: false } },
	);
}

describe("useRestartedServerReload", () => {
	it("reloads when the server comes back on a new start commit", async () => {
		const { rerender } = mount();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});
		health = { version: "1.0.0", startCommit: "bbb" };
		await bounce(rerender);
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("stays put when the server comes back unchanged, then reloads on a later change", async () => {
		const { rerender } = mount();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});
		await bounce(rerender);
		expect(reload).not.toHaveBeenCalled();
		health = { version: "1.1.0", startCommit: "aaa" };
		await bounce(rerender);
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("leaves a restart this tab started to its own reload", async () => {
		const { rerender } = mount();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});
		tabRestartPending.set(true);
		health = { version: "1.1.0", startCommit: "bbb" };
		await bounce(rerender);
		expect(reload).not.toHaveBeenCalled();
	});
});
