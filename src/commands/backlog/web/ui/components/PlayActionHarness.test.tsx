// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
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

function renderPlay(launchAssist: () => void) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<LiveSessionsContext.Provider value={[]}>
				<SessionLaunchContext.Provider
					value={{
						launchAssist,
						launchAgentInStream: () => {},
						resumeSession: () => {},
						armUpdateReload: () => {},
					}}
				>
					<PlayAction itemId={775} />
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

	it("offers no dropdown when no other harness is available", async () => {
		mockHarness({});
		renderPlay(vi.fn());

		await screen.findByRole("button", { name: "Build" });
		expect(
			screen.queryByRole("button", { name: "Build with a different harness" }),
		).toBeNull();
	});
});
