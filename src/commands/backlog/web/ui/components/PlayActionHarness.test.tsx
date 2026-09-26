// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { LiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { PlayAction } from "./PlayAction";

function mockHarness(capabilities: {
	exposeCodexActions?: boolean;
	exposePiActions?: boolean;
}) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ json: () => Promise.resolve(capabilities) }),
	);
}

function renderPlay(
	launchAssist: () => void,
	compact = false,
	sessions: SessionInfo[] = [],
) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<LiveSessionsContext.Provider value={sessions}>
				<SessionLaunchContext.Provider
					value={{
						launchAssist,
						launchAgentInStream: () => {},
						resumeSession: () => {},
						armUpdateReload: () => {},
					}}
				>
					<PlayAction itemId={775} compact={compact} />
				</SessionLaunchContext.Provider>
			</LiveSessionsContext.Provider>
		</MemoryRouter>,
	);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("PlayAction harness dropdown", () => {
	it("builds the item under Codex from the dropdown", async () => {
		mockHarness({ exposeCodexActions: true });
		const launchAssist = vi.fn();
		renderPlay(launchAssist);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Build with a different harness",
			}),
		);
		fireEvent.click(screen.getByRole("menuitem", { name: "with Codex" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775", "--harness", "codex"],
			undefined,
		);
	});

	it("joins the dropdown to Build and disables both while a run is live", async () => {
		mockHarness({ exposeCodexActions: true });
		renderPlay(vi.fn(), false, [
			{
				id: "4",
				name: "assist backlog run a775",
				commandType: "assist",
				startedAt: 1,
				status: "running",
				assistArgs: ["backlog", "run", "a775"],
			},
		]);

		const dropdown = await screen.findByRole("button", {
			name: "Build with a different harness",
		});
		const build = screen.getByRole("button", { name: "Build" });
		expect(dropdown.closest(".MuiButtonGroup-root")).toBe(
			build.closest(".MuiButtonGroup-root"),
		);
		expect(build.hasAttribute("disabled")).toBe(true);
		expect(dropdown.hasAttribute("disabled")).toBe(true);
	});

	it("offers no dropdown when no other harness is available", async () => {
		mockHarness({});
		renderPlay(vi.fn());

		await screen.findByRole("button", { name: "Build" });
		expect(
			screen.queryByRole("button", { name: "Build with a different harness" }),
		).toBeNull();
	});

	it("offers no dropdown on the compact variant even when Codex is exposed", async () => {
		mockHarness({ exposeCodexActions: true });
		renderPlay(vi.fn(), true);

		await screen.findByRole("button", { name: "Build" });
		await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
		expect(
			screen.queryByRole("button", { name: "Build with a different harness" }),
		).toBeNull();
	});
});
