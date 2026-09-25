// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemStatusCounts } from "../../gitStatus";
import { GitStatusCounts } from "./GitStatusCounts";
import type { DiffPanel } from "./toggleDiffPanel";
import { DiffPanelsProvider, useDiffPanels } from "./useDiffPanels";
import { useGitStatusCounts } from "./GitStatusCounts/useGitStatusCounts";

vi.mock("./GitStatusCounts/useGitStatusCounts", () => ({
	useGitStatusCounts: vi.fn(),
}));

const useGitStatusCountsMock = vi.mocked(useGitStatusCounts);

afterEach(cleanup);

function PanelProbe() {
	const panel = useDiffPanels().panelFor("card-1");
	return (
		<div data-testid="panel">{panel ? JSON.stringify(panel) : "none"}</div>
	);
}

function openedPanel(): DiffPanel | null {
	const text = screen.getByTestId("panel").textContent ?? "";
	return text === "none" ? null : (JSON.parse(text) as DiffPanel);
}

function renderCounts(
	counts: ItemStatusCounts | null,
	onActivateSession: (id: string) => void = () => {},
): void {
	useGitStatusCountsMock.mockReturnValue(counts);
	render(
		<MemoryRouter>
			<DiffPanelsProvider
				sessionIds={["card-1"]}
				onActivateSession={onActivateSession}
			>
				<GitStatusCounts
					panelSessionId="card-1"
					cwd="/repo"
					sessionId="sess-1"
				/>
				<PanelProbe />
			</DiffPanelsProvider>
		</MemoryRouter>,
	);
}

function controls(): string[] {
	return screen
		.queryAllByRole("button")
		.map((button) => button.textContent ?? "");
}

describe("GitStatusCounts", () => {
	it("shows the item counts with the uncommitted subset in brackets", () => {
		renderCounts({
			new: ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts"],
			modified: ["f.ts", "g.ts", "h.ts", "i.ts", "j.ts"],
			deleted: ["k.ts"],
			uncommitted: { new: ["e.ts"], modified: ["j.ts"], deleted: [] },
			hasCommits: true,
		});

		expect(controls()).toEqual(["+5~5-1", "(+1~1)"]);
	});

	it("shows only the unbracketed counts when the tree is clean", () => {
		renderCounts({
			new: ["a.ts"],
			modified: [],
			deleted: [],
			uncommitted: { new: [], modified: [], deleted: [] },
			hasCommits: true,
		});

		expect(controls()).toEqual(["+1"]);
	});

	it("shows a single unbracketed group when the item has no commits", () => {
		renderCounts({ new: [], modified: ["a.ts"], deleted: [] });

		expect(controls()).toEqual(["~1"]);
	});

	it("renders nothing when there is nothing to show", () => {
		renderCounts({
			new: [],
			modified: [],
			deleted: [],
			uncommitted: { new: [], modified: [], deleted: [] },
			hasCommits: true,
		});

		expect(controls()).toEqual([]);
	});

	it("renders nothing before the first poll answers", () => {
		renderCounts(null);

		expect(controls()).toEqual([]);
	});
});

describe("GitStatusCounts diff panel", () => {
	const bothScopes: ItemStatusCounts = {
		new: ["a.ts"],
		modified: [],
		deleted: [],
		uncommitted: { new: ["a.ts"], modified: [], deleted: [] },
		hasCommits: true,
	};

	it("opens the session's diff panel on the clicked scope", () => {
		renderCounts(bothScopes);

		fireEvent.click(screen.getByRole("button", { name: "+1" }));

		expect(openedPanel()).toEqual({
			cwd: "/repo",
			claudeSessionId: "sess-1",
			scope: "all",
			mode: "half",
		});
	});

	it("activates the session the counts belong to", () => {
		const onActivateSession = vi.fn();
		renderCounts(bothScopes, onActivateSession);

		fireEvent.click(screen.getByRole("button", { name: "+1" }));

		expect(onActivateSession).toHaveBeenCalledWith("card-1");
	});

	it("switches the open panel to the other scope", () => {
		renderCounts(bothScopes);

		fireEvent.click(screen.getByRole("button", { name: "+1" }));
		fireEvent.click(screen.getByRole("button", { name: "(+1)" }));

		expect(openedPanel()?.scope).toBe("uncommitted");
	});

	it("closes the panel when the same counts are clicked again", () => {
		renderCounts(bothScopes);

		fireEvent.click(screen.getByRole("button", { name: "+1" }));
		fireEvent.click(screen.getByRole("button", { name: "+1" }));

		expect(openedPanel()).toBeNull();
	});
});
