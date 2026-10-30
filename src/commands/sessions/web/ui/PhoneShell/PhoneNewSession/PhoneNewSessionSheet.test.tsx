// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { HistoricalSession } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneNewSessionSheet } from "./PhoneNewSessionSheet";

vi.mock(
	"../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode",
	() => ({
		useDefaultNewSessionMode: () => ({ mode: "prompt", pending: false }),
	}),
);
vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => ({
		exposeCodexActions: false,
		exposePiActions: false,
	}),
}));

afterEach(cleanup);

const origin = { origin: "github.com/x/assist" };
const history = [
	{ cwd: "/mac/assist", repoGroup: { ...origin, clone: "/mac/assist" } },
	{
		cwd: "/wsl/assist",
		node: "wsl",
		repoGroup: { ...origin, clone: "/wsl/assist" },
	},
] as HistoricalSession[];

function renderSheet() {
	const socket = {
		currentCwd: "/mac/assist",
		history,
		nodes: { local: "mac", links: [{ name: "wsl", state: "connected" }] },
		nodeSelection: { names: ["mac", "wsl"], visible: true },
		requestHistory: vi.fn(),
		createSession: vi.fn(),
		createDesignSession: vi.fn(),
		createHarnessSession: vi.fn(),
		createAssistSession: vi.fn(),
	} as unknown as SessionSocket;
	const onClose = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneNewSessionSheet open opens={1} onClose={onClose} socket={socket} />
		</ThemeProvider>,
	);
	return { socket, onClose };
}

describe("PhoneNewSessionSheet", () => {
	it("starts a draft on a linked node in that node's clone", () => {
		const { socket, onClose } = renderSheet();

		fireEvent.click(screen.getByRole("radio", { name: "Draft" }));
		fireEvent.click(screen.getByRole("radio", { name: /wsl/ }));
		fireEvent.change(screen.getByRole("textbox", { name: "Prompt" }), {
			target: { value: "Phone drafts" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Start draft" }));

		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["draft", "--once", "Phone drafts"],
			"/wsl/assist",
			{ node: "wsl" },
		);
		expect(onClose).toHaveBeenCalled();
	});
});
