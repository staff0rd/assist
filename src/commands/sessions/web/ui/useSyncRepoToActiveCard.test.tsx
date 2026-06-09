// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HistoricalSession, SessionInfo } from "./types";
import { useSyncRepoToActiveCard } from "./useSyncRepoToActiveCard";

const sessions: SessionInfo[] = [
	{
		id: "live-1",
		name: "live",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd: "/repos/live",
	},
	{
		id: "live-no-cwd",
		name: "no cwd",
		commandType: "claude",
		status: "running",
		startedAt: 0,
	},
];

const history: HistoricalSession[] = [
	{
		sessionId: "hist-1",
		name: "old",
		project: "proj",
		cwd: "/repos/hist",
		timestamp: "2026-01-01",
	},
];

function renderSync(
	setSelectedCwd: (cwd: string) => void,
	activeId: string | null,
) {
	return renderHook(
		({ id }) => useSyncRepoToActiveCard(id, sessions, history, setSelectedCwd),
		{ initialProps: { id: activeId } },
	);
}

describe("useSyncRepoToActiveCard", () => {
	it("sets the selector to a clicked live card's cwd", () => {
		const setSelectedCwd = vi.fn();
		const { rerender } = renderSync(setSelectedCwd, null);
		expect(setSelectedCwd).not.toHaveBeenCalled();

		rerender({ id: "live-1" });

		expect(setSelectedCwd).toHaveBeenCalledWith("/repos/live");
	});

	it("sets the selector to a clicked history card's cwd", () => {
		const setSelectedCwd = vi.fn();
		const { rerender } = renderSync(setSelectedCwd, null);

		rerender({ id: "hist-1" });

		expect(setSelectedCwd).toHaveBeenCalledWith("/repos/hist");
	});

	it("leaves the selection unchanged for a card with no cwd", () => {
		const setSelectedCwd = vi.fn();
		const { rerender } = renderSync(setSelectedCwd, "live-1");
		expect(setSelectedCwd).toHaveBeenCalledWith("/repos/live");
		setSelectedCwd.mockClear();

		rerender({ id: "live-no-cwd" });

		expect(setSelectedCwd).not.toHaveBeenCalled();
	});

	it("does not re-assert the cwd when the active card is unchanged", () => {
		const setSelectedCwd = vi.fn();
		const { rerender } = renderSync(setSelectedCwd, "live-1");
		expect(setSelectedCwd).toHaveBeenCalledTimes(1);

		rerender({ id: "live-1" });

		expect(setSelectedCwd).toHaveBeenCalledTimes(1);
	});
});
