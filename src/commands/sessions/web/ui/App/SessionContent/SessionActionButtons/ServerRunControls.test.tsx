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
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { createRunAction } from "../../../createSessionAction";
import { ServerActionsContext } from "../../useServerActionsContext";
import { useServerRuns } from "../../useServerRuns";
import { ServerRunControls } from "./ServerRunControls";

vi.mock("../../useServerRuns", () => ({ useServerRuns: vi.fn() }));

afterEach(cleanup);

const servingSession = makeSessionInfo({
	id: "daemon-1",
	name: "web",
	commandType: "run",
	runName: "web",
	server: true,
	cwd: "/repo",
	status: "running",
});

function renderControls(runNames: string[]) {
	vi.mocked(useServerRuns).mockReturnValue(runNames.map((name) => ({ name })));
	const send = vi.fn();
	const onStart = vi.fn(createRunAction(send));
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
	return { send, onStart, onCardActivate };
}

const createRun = (runName: string, replace?: boolean) => ({
	type: "create-run",
	runName,
	cwd: "/repo",
	replace,
	launchedFrom: "daemon-1",
	node: undefined,
});

describe("ServerRunControls", () => {
	it("keeps the Start button for a live served run and shows no Stop button", () => {
		renderControls(["web"]);

		expect(screen.getByTitle(/^Start web/)).toBeTruthy();
		expect(screen.queryByTitle("Stop server")).toBeNull();
	});

	it("shows one Start button per run for two runs", () => {
		renderControls(["web", "api"]);

		expect(screen.getByTitle(/^Start web/)).toBeTruthy();
		expect(screen.getByTitle(/^Start api/)).toBeTruthy();
		expect(screen.queryByRole("button", { name: "server" })).toBeNull();
	});

	it("mentions shift+click replacing a running server in the Start tooltip", () => {
		renderControls(["web"]);

		expect(
			screen.getByTitle(
				/shift\+click replaces a running server without asking/,
			),
		).toBeTruthy();
	});

	it("sends create-run without replace on a plain Start click", () => {
		const { send } = renderControls(["web"]);

		fireEvent.click(screen.getByTitle(/^Start web/));

		expect(send).toHaveBeenCalledWith(createRun("web"));
	});

	it("sends create-run with replace on a shift+click of Start", () => {
		const { send } = renderControls(["web"]);

		fireEvent.click(screen.getByTitle(/^Start web/), { shiftKey: true });

		expect(send).toHaveBeenCalledWith(createRun("web", true));
	});

	it("collapses three or more runs into a dropdown that starts the chosen run", async () => {
		const { onStart, send, onCardActivate } = renderControls([
			"web",
			"api",
			"docs",
		]);

		expect(screen.queryByTitle(/^Start web/)).toBeNull();
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
		expect(send).toHaveBeenCalledWith(createRun("docs"));
		await waitFor(() => expect(screen.queryByText("docs")).toBeNull());
		expect(onCardActivate).not.toHaveBeenCalled();
	});

	it("sends create-run with replace on a shift+click of a dropdown run", () => {
		const { send } = renderControls(["web", "api", "docs"]);

		fireEvent.click(screen.getByRole("button", { name: "server" }));
		fireEvent.click(screen.getByText("api"), { shiftKey: true });

		expect(send).toHaveBeenCalledWith(createRun("api", true));
	});
});
