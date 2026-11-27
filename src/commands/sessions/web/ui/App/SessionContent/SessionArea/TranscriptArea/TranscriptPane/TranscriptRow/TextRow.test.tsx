// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../../../designSystem/createDesignTheme";
import { SessionLaunchContext } from "../../../../../../useSessionLaunchContext";
import { TextRow } from "./TextRow";

afterEach(cleanup);

function renderRow(text: string, activateSession = vi.fn()) {
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
				<SessionLaunchContext.Provider value={launch}>
					<TextRow role="user" text={text} term="" />
				</SessionLaunchContext.Provider>
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

	it("keeps an untagged message as a User row", () => {
		const container = renderRow("plain prompt");
		expect(container.textContent).toContain("User");
		expect(container.textContent).not.toContain("From session");
	});
});
