// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	USER_ACTIVITY_THROTTLE_MS,
	useReportUserActivity,
} from "./useReportUserActivity";

function setVisibility(state: DocumentVisibilityState) {
	Object.defineProperty(document, "visibilityState", {
		configurable: true,
		get: () => state,
	});
}

afterEach(() => {
	vi.useRealTimers();
	setVisibility("visible");
});

describe("useReportUserActivity", () => {
	it("sends at most one user-activity per throttle window", () => {
		vi.useFakeTimers();
		const send = vi.fn();
		renderHook(() => useReportUserActivity(send));
		document.dispatchEvent(new Event("keydown"));
		document.dispatchEvent(new Event("pointermove"));
		document.dispatchEvent(new Event("wheel"));
		expect(send).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledWith({ type: "user-activity" });
		vi.advanceTimersByTime(USER_ACTIVITY_THROTTLE_MS);
		document.dispatchEvent(new Event("touchstart"));
		expect(send).toHaveBeenCalledTimes(2);
	});

	it("names the linked nodes the tab is viewing", () => {
		const send = vi.fn();
		const { rerender } = renderHook(
			({ nodes }) => useReportUserActivity(send, nodes),
			{ initialProps: { nodes: ["pc-windows"] } },
		);
		document.dispatchEvent(new Event("pointerdown"));
		expect(send).toHaveBeenCalledWith({
			type: "user-activity",
			nodes: ["pc-windows"],
		});
		rerender({ nodes: [] });
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("sends nothing while the tab is hidden or idle", () => {
		const send = vi.fn();
		const { unmount } = renderHook(() => useReportUserActivity(send));
		expect(send).not.toHaveBeenCalled();
		setVisibility("hidden");
		document.dispatchEvent(new Event("pointerdown"));
		expect(send).not.toHaveBeenCalled();
		unmount();
		setVisibility("visible");
		document.dispatchEvent(new Event("pointerdown"));
		expect(send).not.toHaveBeenCalled();
	});
});
