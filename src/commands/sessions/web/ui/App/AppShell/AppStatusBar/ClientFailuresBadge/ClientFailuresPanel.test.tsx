// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../../../../../../test/renderWithTheme";
import type { ClientFailure } from "../../../../../../shared/ClientFailure";
import {
	type RepoSelection,
	RepoSelectionContext,
} from "../../../../useRepoSelectionContext";
import { SessionLaunchContext } from "../../../../useSessionLaunchContext";
import { ClientFailuresPanel } from "./ClientFailuresPanel";

afterEach(cleanup);

const failure: ClientFailure = {
	at: "2026-10-31T01:02:03.000Z",
	method: "GET",
	path: "/api/git-status",
	base: "https://home.ts.net:3100",
	node: "mac",
	status: 504,
	error: "Gateway Timeout",
	durationMs: 20012,
};

function renderPanel(origins: Record<string, string>) {
	const launchAssist = vi.fn();
	const onLaunched = vi.fn();
	const selection: RepoSelection = {
		repos: Object.keys(origins),
		selectedCwd: "/git/selected",
		selectedNode: "mac",
		worktreeCwd: "/git/selected",
		setSelectedCwd: () => {},
		cloneOn: (cwd) => cwd,
		originOf: (cwd) => origins[cwd],
	};
	renderWithTheme(
		<RepoSelectionContext.Provider value={selection}>
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
				<ClientFailuresPanel
					failures={[failure]}
					onClear={() => {}}
					onLaunched={onLaunched}
				/>
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>,
	);
	return { launchAssist, onLaunched };
}

describe("ClientFailuresPanel bug button", () => {
	it("launches /bug in assist's clone with the failure as the prompt", () => {
		const { launchAssist, onLaunched } = renderPanel({
			"/git/selected": "github.com/someone/else",
			"/git/assist": "github.com/staff0rd/assist",
		});
		fireEvent.click(screen.getByRole("button", { name: "Report bug" }));

		expect(launchAssist).toHaveBeenCalledTimes(1);
		const [args, cwd, meta] = launchAssist.mock.calls[0];
		expect(args.slice(0, 2)).toEqual(["bug", "--once"]);
		expect(args[2]).toContain("Path: /api/git-status");
		expect(args[2]).toContain("Status: 504");
		expect(args[2]).toContain(`Page URL: ${globalThis.location.href}`);
		expect(cwd).toBe("/git/assist");
		expect(meta).toEqual({ node: "mac" });
		expect(onLaunched).toHaveBeenCalled();
	});

	it("disables the button when there is no local clone of assist", () => {
		const { launchAssist } = renderPanel({
			"/git/selected": "github.com/someone/else",
		});
		const button = screen.getByRole("button", { name: "Report bug" });
		expect((button as HTMLButtonElement).disabled).toBe(true);
		fireEvent.click(button);
		expect(launchAssist).not.toHaveBeenCalled();
	});
});
