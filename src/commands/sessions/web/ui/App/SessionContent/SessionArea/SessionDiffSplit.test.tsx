// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionDiffSplit } from "./SessionDiffSplit";
import { DiffPanelsProvider, useDiffPanels } from "../../useDiffPanels";

vi.mock("../../DiffContent", () => ({
	DiffContent: ({
		cwd,
		mode,
		onToggleMode,
		onClose,
	}: {
		cwd: string;
		mode?: string;
		onToggleMode?: () => void;
		onClose?: () => void;
	}) => {
		const [note, setNote] = useState("");
		return (
			<div data-testid="diff" data-cwd={cwd} data-mode={mode}>
				<button type="button" onClick={onToggleMode}>
					toggle mode
				</button>
				<button type="button" onClick={onClose}>
					close diff
				</button>
				<input
					aria-label="note"
					value={note}
					onChange={(event) => setNote(event.target.value)}
				/>
			</div>
		);
	},
}));

afterEach(cleanup);

const cwds: Record<string, string> = { "card-1": "/one", "card-2": "/two" };

function OpenPanelButton({ sessionId }: { sessionId: string }) {
	const { togglePanel } = useDiffPanels();
	return (
		<button
			type="button"
			onClick={() =>
				togglePanel(sessionId, { cwd: cwds[sessionId] ?? "", scope: "all" })
			}
		>
			open {sessionId}
		</button>
	);
}

function Harness({ liveIds }: { liveIds: string[] }) {
	const [activeId, setActiveId] = useState("card-1");
	return (
		<DiffPanelsProvider sessionIds={liveIds} onActivateSession={() => {}}>
			<OpenPanelButton sessionId="card-1" />
			<OpenPanelButton sessionId="card-2" />
			<button
				type="button"
				onClick={() => setActiveId(activeId === "card-1" ? "card-2" : "card-1")}
			>
				switch
			</button>
			<SessionDiffSplit sessionId={activeId} sessions={[]} sendInput={() => {}}>
				<div data-testid="terminal" />
			</SessionDiffSplit>
		</DiffPanelsProvider>
	);
}

function harness(liveIds: string[]): ReactElement {
	return (
		<MemoryRouter>
			<Harness liveIds={liveIds} />
		</MemoryRouter>
	);
}

function renderSplit(liveIds: string[] = ["card-1", "card-2"]) {
	return render(harness(liveIds));
}

function terminalColumn(): HTMLElement {
	const column = screen.getByTestId("terminal").parentElement;
	if (column === null) throw new Error("terminal has no column");
	return column;
}

function widthOf(el: HTMLElement): string {
	return globalThis.getComputedStyle(el).width;
}

function displayOf(el: HTMLElement): string {
	return globalThis.getComputedStyle(el).display;
}

function diffColumn(): HTMLElement {
	const column = screen.getByTestId("diff").parentElement;
	if (column === null) throw new Error("diff has no column");
	return column;
}

function noteInput(): HTMLInputElement {
	return screen.getByLabelText("note") as HTMLInputElement;
}

function clickButton(name: string) {
	fireEvent.click(screen.getByRole("button", { name }));
}

function openPanel(sessionId = "card-1") {
	clickButton(`open ${sessionId}`);
}

function toggleMode() {
	clickButton("toggle mode");
}

function switchSession() {
	clickButton("switch");
}

describe("SessionDiffSplit", () => {
	it("gives the terminal the whole area while no panel is open", () => {
		renderSplit();

		expect(widthOf(terminalColumn())).toBe("100%");
		expect(screen.queryByTestId("diff")).toBeNull();
	});

	it("splits the area evenly in half mode", () => {
		renderSplit();
		openPanel();

		expect(widthOf(terminalColumn())).toBe("50%");
		expect(displayOf(terminalColumn())).toBe("flex");
		expect(widthOf(diffColumn())).toBe("50%");
	});

	it("collapses the terminal and fills the area in full mode", () => {
		renderSplit();
		openPanel();

		toggleMode();

		expect(displayOf(terminalColumn())).toBe("none");
		expect(widthOf(diffColumn())).toBe("100%");
	});

	it("returns to the even split when full mode is turned off", () => {
		renderSplit();
		openPanel();

		toggleMode();
		toggleMode();

		expect(displayOf(terminalColumn())).toBe("flex");
		expect(widthOf(terminalColumn())).toBe("50%");
	});

	it("restores the terminal to full width when the panel closes", () => {
		renderSplit();
		openPanel();

		clickButton("close diff");

		expect(widthOf(terminalColumn())).toBe("100%");
		expect(screen.queryByTestId("diff")).toBeNull();
	});
});

describe("SessionDiffSplit session switching", () => {
	it("shows only the active session's panel", () => {
		renderSplit();
		openPanel("card-2");

		expect(screen.queryByTestId("diff")).toBeNull();

		switchSession();

		expect(screen.getByTestId("diff").dataset.cwd).toBe("/two");
	});

	it("restores the remembered mode when the session becomes active again", () => {
		renderSplit();
		openPanel("card-1");
		toggleMode();

		switchSession();
		switchSession();

		expect(screen.getByTestId("diff").dataset.mode).toBe("full");
		expect(displayOf(terminalColumn())).toBe("none");
	});

	it("keeps a closed panel closed after switching away and back", () => {
		renderSplit();
		openPanel("card-1");
		clickButton("close diff");

		switchSession();
		switchSession();

		expect(screen.queryByTestId("diff")).toBeNull();
	});

	it("swaps in the newly active session's diff body", () => {
		renderSplit();
		openPanel("card-1");
		openPanel("card-2");
		fireEvent.change(noteInput(), { target: { value: "typed" } });

		switchSession();

		expect(screen.getByTestId("diff").dataset.cwd).toBe("/two");
		expect(noteInput().value).toBe("");
	});

	it("drops the panel of a session that is no longer present", () => {
		const { rerender } = renderSplit();
		openPanel("card-1");
		openPanel("card-2");

		rerender(harness(["card-2"]));

		expect(screen.queryByTestId("diff")).toBeNull();

		switchSession();

		expect(screen.getByTestId("diff").dataset.cwd).toBe("/two");
	});
});
