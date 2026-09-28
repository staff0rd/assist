// @vitest-environment jsdom
import ButtonBase from "@mui/material/ButtonBase";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../types";
import { ServerActionsContext } from "../useServerActionsContext";
import { useServerRuns } from "../useServerRuns";
import { ServerRunControls } from "./ServerRunControls";

vi.mock("../useServerRuns", () => ({ useServerRuns: vi.fn() }));

afterEach(cleanup);

const servingSession = {
	id: "daemon-1",
	name: "web",
	commandType: "run",
	runName: "web",
	server: true,
	cwd: "/repo",
	startedAt: 0,
	status: "running",
} as SessionInfo;

function renderControls(runNames: string[]) {
	vi.mocked(useServerRuns).mockReturnValue(runNames.map((name) => ({ name })));
	const onStart = vi.fn();
	const onCardActivate = vi.fn();
	render(
		<ServerActionsContext.Provider
			value={{ onStart, onStop: vi.fn(), onDiscard: vi.fn() }}
		>
			<ButtonBase
				component="div"
				aria-label="session card"
				onClick={onCardActivate}
				onMouseDown={onCardActivate}
			>
				<ServerRunControls session={servingSession} />
			</ButtonBase>
		</ServerActionsContext.Provider>,
	);
	return { onStart, onCardActivate };
}

describe("ServerRunControls", () => {
	it("keeps the Start button for a live served run and shows no Stop button", () => {
		renderControls(["web"]);

		expect(screen.getByTitle("Start web")).toBeTruthy();
		expect(screen.queryByTitle("Stop server")).toBeNull();
	});

	it("shows one Start button per run for two runs", () => {
		renderControls(["web", "api"]);

		expect(screen.getByTitle("Start web")).toBeTruthy();
		expect(screen.getByTitle("Start api")).toBeTruthy();
		expect(screen.queryByRole("button", { name: "server" })).toBeNull();
	});

	it("collapses three or more runs into a dropdown that starts the chosen run", async () => {
		const { onStart, onCardActivate } = renderControls(["web", "api", "docs"]);

		expect(screen.queryByTitle("Start web")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "server" }));
		expect(screen.getByText("web")).toBeTruthy();
		expect(screen.getByText("api")).toBeTruthy();
		fireEvent.click(screen.getByText("docs"));

		expect(onStart).toHaveBeenCalledWith(
			"docs",
			"/repo",
			undefined,
			"daemon-1",
		);
		await waitFor(() => expect(screen.queryByText("docs")).toBeNull());
		expect(onCardActivate).not.toHaveBeenCalled();
	});
});
