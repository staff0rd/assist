// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../../../designSystem/createDesignTheme";
import { NodeSelectionContext } from "../../../../../../useNodeSelectionContext";
import { SessionLaunchContext } from "../../../../../../useSessionLaunchContext";
import { TranscriptNodeContext } from "../../useTranscriptNodeContext";
import { TextRow } from "./TextRow";

afterEach(cleanup);

function renderRow(
	text: string,
	activateSession = vi.fn(),
	transcriptNode?: string,
) {
	const launch = {
		launchAssist: vi.fn(),
		launchAgentInStream: vi.fn(),
		resumeSession: vi.fn(),
		armUpdateReload: vi.fn(),
		activateSession,
		sendInput: vi.fn(),
	};
	return render(
		<MemoryRouter>
			<ThemeProvider theme={createDesignTheme("dark")}>
				<NodeSelectionContext.Provider
					value={{
						nodes: { local: "wsl", links: [] },
						names: ["wsl"],
						visible: false,
						selected: "wsl",
						select: vi.fn(),
					}}
				>
					<TranscriptNodeContext.Provider value={transcriptNode}>
						<SessionLaunchContext.Provider value={launch}>
							<TextRow role="user" text={text} term="" />
						</SessionLaunchContext.Provider>
					</TranscriptNodeContext.Provider>
				</NodeSelectionContext.Provider>
			</ThemeProvider>
		</MemoryRouter>,
	).container;
}

describe("TextRow session messages", () => {
	it("labels a tagged message with its sender and shows only the body", () => {
		const container = renderRow(
			'<session-message from="2" agent="yoke-2-e6">run hash -r</session-message>',
		);
		expect(container.textContent).toContain("From session 2");
		expect(container.textContent).toContain("yoke-2-e6");
		expect(container.textContent).toContain("run hash -r");
		expect(container.textContent).not.toContain("session-message");
		expect(container.textContent).not.toContain("User");
	});

	it("opens the sending session's card from the label", () => {
		const activateSession = vi.fn();
		renderRow(
			'<session-message from="2">hi</session-message>',
			activateSession,
		);
		fireEvent.click(screen.getByRole("button", { name: "session 2" }));
		expect(activateSession).toHaveBeenCalledWith("2");
	});

	it("opens a linked node's session card for a node-qualified sender", () => {
		const activateSession = vi.fn();
		const container = renderRow(
			'<session-message from="mac:85" agent="assist-1-7a">hi</session-message>',
			activateSession,
		);
		expect(container.textContent).toContain("From session mac:85");
		expect(container.textContent).toContain("assist-1-7a");
		fireEvent.click(screen.getByRole("button", { name: "session mac:85" }));
		expect(activateSession).toHaveBeenCalledWith("mac:85");
	});

	it("qualifies a bare sender in a linked node's transcript", () => {
		const activateSession = vi.fn();
		renderRow(
			'<session-message from="3">hi</session-message>',
			activateSession,
			"win",
		);
		fireEvent.click(screen.getByRole("button", { name: "session win:3" }));
		expect(activateSession).toHaveBeenCalledWith("win:3");
	});

	it("keeps an untagged message as a User row", () => {
		const container = renderRow("plain prompt");
		expect(container.textContent).toContain("User");
		expect(container.textContent).not.toContain("From session");
	});
});
