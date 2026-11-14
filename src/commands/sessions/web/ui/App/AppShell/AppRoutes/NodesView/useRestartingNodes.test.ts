// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import { nodeRows } from "./nodeRows";
import { RESTART_GRACE_MS } from "./restartingNodes";
import { useRestartingNodes } from "./useRestartingNodes";

const win: LinkStatus = {
	name: "win",
	url: "http://win:3100",
	state: "disconnected",
};

function rowKinds(restarting: ReadonlySet<string>) {
	return nodeRows(
		{ local: "wsl", links: [win] },
		[],
		new Set(),
		"http://wsl:3100",
		restarting,
	).map((r) => r.status.kind);
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useRestartingNodes", () => {
	it("falls back to the real status once the grace period expires while still busy", () => {
		const notices = {
			busy: { win: "Restarting" },
			busySince: { win: Date.now() },
		};
		const { result } = renderHook(() => useRestartingNodes(notices));
		expect(rowKinds(result.current)).toEqual(["loading", "restarting"]);

		act(() => {
			vi.advanceTimersByTime(RESTART_GRACE_MS - 1);
		});
		expect(rowKinds(result.current)).toEqual(["loading", "restarting"]);

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(rowKinds(result.current)).toEqual(["loading", "disconnected"]);
	});
});
