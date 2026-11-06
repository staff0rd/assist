// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiNodeContext } from "../../../../sessions/web/ui/useApiNode";
import {
	RepoSelectionContext,
	type RepoSelection,
} from "../../../../sessions/web/ui/useRepoSelectionContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";

const updateItemStatus = vi.fn();
vi.mock("../api", () => ({
	updateItemStatus: (...args: unknown[]) => updateItemStatus(...args),
}));

import { PlayAction } from "./PlayAction";

const repoSelection: RepoSelection = {
	repos: [],
	selectedCwd: "/repo",
	worktreeCwd: "",
	setSelectedCwd: () => {},
	cloneOn: (cwd) => cwd,
	originOf: () => undefined,
};

function LocationProbe() {
	return <span data-testid="location">{useLocation().pathname}</span>;
}

function renderCompact({
	launchAssist = vi.fn(),
	onClosed = vi.fn(() => Promise.resolve()),
	onCardClick = vi.fn(),
} = {}) {
	render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<RepoSelectionContext.Provider value={repoSelection}>
				<ApiNodeContext.Provider value="peer">
					<SessionLaunchContext.Provider
						value={{
							launchAssist,
							launchAgentInStream: () => {},
							resumeSession: () => {},
							armUpdateReload: () => {},
							activateSession: () => {},
							sendInput: () => {},
						}}
					>
						<LocationProbe />
						<div onClick={onCardClick}>
							<PlayAction
								itemId={775}
								compact={{ currentPhase: 2, totalPhases: 3, onClosed }}
							/>
						</div>
					</SessionLaunchContext.Provider>
				</ApiNodeContext.Provider>
			</RepoSelectionContext.Provider>
		</MemoryRouter>,
	);
	return { launchAssist, onClosed, onCardClick };
}

function openMarkDone(option = "Mark done") {
	fireEvent.click(screen.getByRole("button", { name: "More actions" }));
	fireEvent.click(screen.getByRole("menuitem", { name: option }));
}

beforeEach(() => {
	updateItemStatus.mockReset();
});
afterEach(cleanup);

describe("compact play split button", () => {
	it("still launches a build from the play segment without opening the card", () => {
		const { launchAssist, onCardClick } = renderCompact();

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775"],
			"/repo",
		);
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("separates the ellipsis from a green play button", () => {
		renderCompact();

		const build = screen.getByRole("button", { name: "Build" });
		const more = screen.getByRole("button", { name: "More actions" });
		expect(build.closest(".MuiButtonGroup-root")).toBeNull();
		expect(build.className).toContain("MuiButton-contained");
		expect(build.className).toContain("MuiButton-colorSuccess");
		expect(more.className).toContain("MuiIconButton-root");
		expect(more.className).not.toContain("Success");
		expect(more.querySelector('[data-testid="MoreVertIcon"]')).toBeTruthy();
	});

	it("offers Refine, then Mark done and Won't do in the dropdown", () => {
		renderCompact();

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));

		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Refine", "Mark done", "Won't do"]);
		expect(screen.getByRole("separator")).toBeTruthy();
	});

	it("launches a refine session in the repo and node without opening the card", () => {
		const { launchAssist, onCardClick } = renderCompact();

		openMarkDone("Refine");

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "a775"],
			"/repo",
			{ node: "peer" },
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("keeps the ellipsis enabled once a build has launched", () => {
		const { onCardClick } = renderCompact();

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		const build = screen.getByRole("button", { name: "Build" });
		expect((build as HTMLButtonElement).disabled).toBe(true);
		const more = screen.getByRole("button", { name: "More actions" });
		expect((more as HTMLButtonElement).disabled).toBe(false);
		fireEvent.click(more);
		expect(screen.getAllByRole("menuitem")).toHaveLength(3);
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("marks the item won't do after confirming", async () => {
		updateItemStatus.mockResolvedValue({});
		const { onClosed } = renderCompact();

		openMarkDone("Won't do");
		const dialog = screen.getByRole("dialog");
		expect(dialog.textContent).toContain("Mark a775 won't do");
		expect(dialog.textContent).toContain(
			"2 of 3 phases completed. Mark this backlog item as won't do?",
		);
		fireEvent.click(screen.getByRole("button", { name: "Won't do" }));

		await waitFor(() => expect(onClosed).toHaveBeenCalled());
		expect(updateItemStatus).toHaveBeenCalledWith(
			775,
			"wontdo",
			"/repo",
			"peer",
		);
	});

	it("sends one update when confirm is double-clicked", async () => {
		updateItemStatus.mockReturnValue(new Promise(() => {}));
		renderCompact();

		openMarkDone();
		const confirm = screen.getByRole("button", { name: "Mark done" });
		act(() => {
			confirm.click();
			confirm.click();
		});

		await waitFor(() =>
			expect((confirm as HTMLButtonElement).disabled).toBe(true),
		);
		expect(updateItemStatus).toHaveBeenCalledTimes(1);
	});

	it("confirms with the phase count before marking done", () => {
		const { onCardClick } = renderCompact();

		openMarkDone();

		const dialog = screen.getByRole("dialog");
		expect(dialog.textContent).toContain("Mark a775 done");
		expect(dialog.textContent).toContain(
			"2 of 3 phases completed. Mark this backlog item as done?",
		);
		expect(screen.getByRole("button", { name: "Mark done" })).toBeTruthy();
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("leaves the item alone when cancelled", async () => {
		const { onClosed, onCardClick } = renderCompact();

		openMarkDone();
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(updateItemStatus).not.toHaveBeenCalled();
		expect(onClosed).not.toHaveBeenCalled();
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("marks the item done in the repo and node, then reloads", async () => {
		updateItemStatus.mockResolvedValue({});
		const { onClosed, onCardClick } = renderCompact();

		openMarkDone();
		fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

		await waitFor(() => expect(onClosed).toHaveBeenCalled());
		expect(updateItemStatus).toHaveBeenCalledWith(775, "done", "/repo", "peer");
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(onCardClick).not.toHaveBeenCalled();
	});

	it.each([
		["Mark done", "done"],
		["Won't do", "wontdo"],
	])(
		"shift-clicking %s closes the item without confirming",
		async (option, status) => {
			updateItemStatus.mockResolvedValue({});
			const { onClosed, onCardClick } = renderCompact();

			fireEvent.click(screen.getByRole("button", { name: "More actions" }));
			fireEvent.click(screen.getByRole("menuitem", { name: option }), {
				shiftKey: true,
			});

			expect(screen.queryByRole("dialog")).toBeNull();
			await waitFor(() => expect(onClosed).toHaveBeenCalled());
			expect(updateItemStatus).toHaveBeenCalledWith(
				775,
				status,
				"/repo",
				"peer",
			);
			await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
			expect(onCardClick).not.toHaveBeenCalled();
		},
	);

	it.each([
		["Mark done", "done"],
		["Won't do", "wontdo"],
	])(
		"Shift+Enter on %s closes the item without confirming",
		async (option, status) => {
			updateItemStatus.mockResolvedValue({});
			const { onClosed } = renderCompact();

			fireEvent.click(screen.getByRole("button", { name: "More actions" }));
			fireEvent.keyDown(screen.getByRole("menuitem", { name: option }), {
				key: "Enter",
				shiftKey: true,
			});

			await waitFor(() => expect(onClosed).toHaveBeenCalled());
			expect(screen.queryByRole("dialog")).toBeNull();
			expect(updateItemStatus).toHaveBeenCalledTimes(1);
			expect(updateItemStatus).toHaveBeenCalledWith(
				775,
				status,
				"/repo",
				"peer",
			);
		},
	);

	it("hints that Shift skips confirmation on both close options", () => {
		renderCompact();

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));

		for (const option of ["Mark done", "Won't do"])
			expect(screen.getByRole("menuitem", { name: option }).title).toBe(
				`${option} (Shift skips confirmation)`,
			);
	});

	it("shows an error when a shift-click close fails", async () => {
		updateItemStatus.mockRejectedValue(new Error("boom"));
		const { onClosed } = renderCompact();

		fireEvent.click(screen.getByRole("button", { name: "More actions" }));
		fireEvent.click(screen.getByRole("menuitem", { name: "Won't do" }), {
			shiftKey: true,
		});

		expect(
			await screen.findByText("Failed to mark item a775 as won't do"),
		).toBeTruthy();
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onClosed).not.toHaveBeenCalled();
	});

	it("shows an error and keeps the dialog usable when the update fails", async () => {
		updateItemStatus.mockRejectedValue(new Error("boom"));
		const { onClosed } = renderCompact();

		openMarkDone();
		fireEvent.click(screen.getByRole("button", { name: "Mark done" }));

		expect(
			await screen.findByText("Failed to mark item a775 as done"),
		).toBeTruthy();
		const confirm = screen.getByRole("button", { name: "Mark done" });
		expect((confirm as HTMLButtonElement).disabled).toBe(false);
		expect(onClosed).not.toHaveBeenCalled();
	});
});
