// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../../test/mothers/makeSessionInfo";
import { RepoSelectionContext } from "../../../../../../useRepoSelectionContext";
import { StopCardActivation } from "../../../../../../StopCardActivation";
import { CardAssistButtons } from "./CardAssistButtons";

afterEach(cleanup);

const ASSIST = "/git/assist";

function renderCard({
	origin = "github.com/staff0rd/assist",
	node,
}: { origin?: string; node?: string } = {}) {
	const onCardClick = vi.fn();
	const router = createMemoryRouter(
		[
			{
				path: "*",
				element: (
					<RepoSelectionContext.Provider
						value={{
							repos: ["/git/alpha", ASSIST],
							selectedCwd: "/git/alpha",
							worktreeCwd: "/git/alpha",
							setSelectedCwd: vi.fn(),
							cloneOn: (cwd) => cwd,
							originOf: (cwd) => (cwd === ASSIST ? origin : undefined),
						}}
					>
						<div onClick={onCardClick}>
							<StopCardActivation>
								<CardAssistButtons
									session={makeSessionInfo({ id: "38", node })}
								/>
							</StopCardActivation>
						</div>
					</RepoSelectionContext.Provider>
				),
			},
		],
		{ initialEntries: ["/sessions"] },
	);
	render(<RouterProvider router={router} />);
	return Object.assign(router, { onCardClick });
}

function holdChord(keys = { ctrlKey: true, altKey: true, shiftKey: true }) {
	act(() => {
		globalThis.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Shift", ...keys }),
		);
	});
}

const draftButton = () => screen.queryByLabelText("Draft in assist");
const bugButton = () => screen.queryByLabelText("Bug in assist");

describe("CardAssistButtons", () => {
	it("shows both buttons only while Ctrl+Alt+Shift is held", () => {
		renderCard();
		expect(draftButton()).toBeNull();

		holdChord({ ctrlKey: true, altKey: false, shiftKey: true });
		expect(draftButton()).toBeNull();

		holdChord();
		expect(draftButton()?.getAttribute("title")).toBe(
			"Draft in assist from session 38",
		);
		expect(bugButton()?.getAttribute("title")).toBe(
			"Bug in assist from session 38",
		);

		act(() => {
			globalThis.dispatchEvent(
				new KeyboardEvent("keyup", { ctrlKey: true, shiftKey: true }),
			);
		});
		expect(draftButton()).toBeNull();
	});

	it("hides the buttons when the window loses focus", () => {
		renderCard();
		holdChord();
		act(() => {
			globalThis.dispatchEvent(new Event("blur"));
		});
		expect(draftButton()).toBeNull();
	});

	it("hides the buttons without an assist clone", () => {
		renderCard({ origin: "github.com/someone/else" });
		holdChord();
		expect(draftButton()).toBeNull();
		expect(bugButton()).toBeNull();
	});

	it.each([
		["Draft in assist", "draft"],
		["Bug in assist", "bug"],
	])("%s requests a %s session against the assist clone", (label, mode) => {
		const router = renderCard();
		holdChord();

		fireEvent.click(screen.getByLabelText(label));

		const params = new URLSearchParams(router.state.location.search);
		expect(params.get("new")).toBe("From session 38");
		expect(params.get("newCwd")).toBe(ASSIST);
		expect(params.get("newMode")).toBe(mode);
		expect(router.onCardClick).not.toHaveBeenCalled();
	});
});
