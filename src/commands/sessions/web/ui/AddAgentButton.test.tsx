// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddAgentButton } from "./AddAgentButton";
import type { SessionInfo } from "./types";
import { SessionLaunchContext } from "./useSessionLaunchContext";

afterEach(cleanup);

const session: SessionInfo = {
	id: "3",
	name: "assist backlog run 5",
	commandType: "claude",
	status: "running",
	startedAt: 0,
	runningMs: 0,
	runningSince: null,
	cwd: "/git/repo-2",
	joinable: true,
};

function renderButton(
	launchAgentInStream: (...args: never[]) => void,
	overrides: Partial<SessionInfo> = {},
) {
	render(
		<SessionLaunchContext.Provider
			value={{
				launchAssist: () => {},
				launchAgentInStream: launchAgentInStream as unknown as (
					joinSessionId: string,
					prompt: string,
					cwd?: string,
				) => void,
				resumeSession: () => {},
				armUpdateReload: () => {},
			}}
		>
			<AddAgentButton session={{ ...session, ...overrides }} />
		</SessionLaunchContext.Provider>,
	);
}

describe("AddAgentButton", () => {
	it("spawns the prompt into the target stream and its workspace", () => {
		const launch = vi.fn();
		renderButton(launch);

		fireEvent.click(screen.getByLabelText("add agent"));
		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "also update the docs" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Start" }));

		expect(launch).toHaveBeenCalledWith(
			"3",
			"also update the docs",
			"/git/repo-2",
		);
	});

	it("spawns an agent with no prompt when Start is clicked while empty", () => {
		const launch = vi.fn();
		renderButton(launch);

		fireEvent.click(screen.getByLabelText("add agent"));
		fireEvent.click(screen.getByRole("button", { name: "Start" }));

		expect(launch).toHaveBeenCalledWith("3", "", "/git/repo-2");
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	it("spawns an agent with no prompt on Enter while empty", () => {
		const launch = vi.fn();
		renderButton(launch);

		fireEvent.click(screen.getByLabelText("add agent"));
		fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });

		expect(launch).toHaveBeenCalledWith("3", "", "/git/repo-2");
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	it("spawns into the workspace of an errored session", () => {
		const launch = vi.fn();
		renderButton(launch, { status: "error" });

		fireEvent.click(screen.getByLabelText("add agent"));
		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "pick up where it died" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Start" }));

		expect(launch).toHaveBeenCalledWith(
			"3",
			"pick up where it died",
			"/git/repo-2",
		);
	});

	it("withholds the button once the daemon refuses the join", () => {
		renderButton(vi.fn(), { status: "error", joinable: false });

		expect(screen.queryByLabelText("add agent")).toBeNull();
	});
});
