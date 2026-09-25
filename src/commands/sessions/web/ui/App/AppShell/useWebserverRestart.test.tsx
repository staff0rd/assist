// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebserverRestart } from "./useWebserverRestart";

const { postRestart } = vi.hoisted(() => ({
	postRestart: vi.fn<(target: string) => Promise<{ ok: boolean }>>(),
}));

vi.mock("./postRestart", () => ({ postRestart }));

let reload: ReturnType<typeof vi.fn>;
let probe: ReturnType<typeof vi.fn>;

beforeEach(() => {
	vi.useFakeTimers();
	reload = vi.fn();
	probe = vi.fn(async () => ({ ok: true }));
	postRestart.mockReset();
	postRestart.mockResolvedValue({ ok: true });
	vi.stubGlobal("fetch", probe);
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		value: { reload },
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

type Props = { target: "daemon" | "webserver" | "both"; reconnecting: boolean };

function render(initial: Props) {
	return renderHook(
		({ target, reconnecting }: Props) =>
			useWebserverRestart(target, reconnecting),
		{ initialProps: initial },
	);
}

async function settle(ms = 0) {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
}

describe("useWebserverRestart", () => {
	it("posts the restart for the requested target", async () => {
		const { result } = render({ target: "both", reconnecting: false });

		await act(() => result.current.restart());

		expect(postRestart).toHaveBeenCalledWith("both");
	});

	it("reloads once the server answers again after a disconnect", async () => {
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		expect(reload).not.toHaveBeenCalled();

		rerender({ target: "both", reconnecting: false });
		await settle(1_000);

		expect(probe).toHaveBeenCalledWith("/api/session-layout", {
			cache: "no-store",
		});
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("does not reload when the server answers once then stops answering", async () => {
		probe.mockResolvedValueOnce({ ok: true });
		probe.mockRejectedValue(new Error("connection refused"));
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		rerender({ target: "both", reconnecting: false });
		await settle(2_000);

		expect(reload).not.toHaveBeenCalled();

		probe.mockResolvedValue({ ok: true });
		await settle(1_000);

		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("defers the reload while the server is still restarting", async () => {
		probe.mockRejectedValue(new Error("connection refused"));
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		rerender({ target: "both", reconnecting: false });
		await settle(1_000);

		expect(probe.mock.calls.length).toBeGreaterThan(1);
		expect(reload).not.toHaveBeenCalled();

		probe.mockResolvedValue({ ok: true });
		await settle(1_000);

		expect(reload).toHaveBeenCalledTimes(1);
	});

	it("defers the reload while the server answers with an error status", async () => {
		probe.mockResolvedValue({ ok: false });
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		rerender({ target: "both", reconnecting: false });
		await settle(1_000);

		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload without a restart request", async () => {
		const { rerender } = render({ target: "both", reconnecting: true });

		rerender({ target: "both", reconnecting: false });
		await settle();

		expect(reload).not.toHaveBeenCalled();
	});

	it("errors and does not reload when the server never comes back", async () => {
		probe.mockRejectedValue(new Error("connection refused"));
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		rerender({ target: "both", reconnecting: false });
		await settle(15_000);

		expect(result.current.error).toBe("Web server did not come back");
		expect(result.current.pending).toBe(false);
		expect(reload).not.toHaveBeenCalled();
	});

	it("does not reload after the timeout, even once the server answers", async () => {
		probe.mockRejectedValue(new Error("connection refused"));
		const { result, rerender } = render({
			target: "both",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "both", reconnecting: true });
		rerender({ target: "both", reconnecting: false });
		await settle(15_000);

		probe.mockResolvedValue({ ok: true });
		await settle(1_000);

		expect(reload).not.toHaveBeenCalled();
	});

	it("errors when the restart request is rejected", async () => {
		postRestart.mockResolvedValue({ ok: false });
		const { result } = render({ target: "webserver", reconnecting: false });

		await act(() => result.current.restart());

		expect(result.current.error).toBe("Failed to restart web server");
		expect(result.current.pending).toBe(false);
	});

	it("does not poll the server after a failed restart request", async () => {
		postRestart.mockRejectedValue(new Error("boom"));
		const { result, rerender } = render({
			target: "webserver",
			reconnecting: false,
		});

		await act(() => result.current.restart());
		rerender({ target: "webserver", reconnecting: true });
		rerender({ target: "webserver", reconnecting: false });
		await settle(1_000);

		expect(probe).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();
	});

	it("clears the error", async () => {
		postRestart.mockRejectedValue(new Error("boom"));
		const { result } = render({ target: "webserver", reconnecting: false });

		await act(() => result.current.restart());
		act(() => result.current.clearError());

		expect(result.current.error).toBeNull();
	});
});
