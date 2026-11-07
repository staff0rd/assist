// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionGroupSection } from "./SessionGroupSection";
import { useInRepoGroupContext } from "../../../../../useInRepoGroupContext";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";

afterEach(cleanup);

function Probe() {
	return <div data-testid="probe">{String(useInRepoGroupContext())}</div>;
}

function renderSection(
	sessionIds = ["run", "review"],
	onDismiss: (id: string) => void = () => {},
) {
	render(
		<SessionGroupSection
			groupKey="host/org/assist"
			label="assist"
			sessions={sessionIds.map((id) => makeSessionInfo({ id }))}
			onDismiss={onDismiss}
		>
			<Probe />
		</SessionGroupSection>,
	);
}

const closeAllName = "Close all sessions in assist (Shift skips confirmation)";

function openCloseDialog() {
	fireEvent.click(screen.getByRole("button", { name: closeAllName }));
	return screen.getByRole("dialog");
}

function header() {
	const toggle = screen.getByText("assist").closest("[aria-expanded]");
	if (!toggle?.parentElement) throw new Error("group header not found");
	return toggle.parentElement;
}

describe("SessionGroupSection", () => {
	it("tells its cards they are named by the group header", () => {
		renderSection();

		expect(screen.getByTestId("probe").textContent).toBe("true");
		expect(screen.getByText("assist")).toBeTruthy();
	});

	it("counts the sessions beside the group name", () => {
		renderSection();

		expect(header().textContent).toContain("2");
	});

	it("sticks the group name while the group is in view", () => {
		renderSection();

		expect(getComputedStyle(header()).position).toBe("sticky");
	});

	it("asks before closing, naming the group and how many sessions close", () => {
		renderSection(["run", "review", "fix"]);

		const dialog = openCloseDialog();

		expect(dialog.textContent).toContain("all 3 sessions in assist");
	});

	it("dismisses every session in the group, nested children included, on confirm", () => {
		const onDismiss = vi.fn();
		renderSection(["run", "review", "fix"], onDismiss);

		const dialog = openCloseDialog();
		fireEvent.click(within(dialog).getByRole("button", { name: "Close 3" }));

		expect(onDismiss.mock.calls).toEqual([["run"], ["review"], ["fix"]]);
	});

	it("dismisses every session without a confirm on Shift-click", () => {
		const onDismiss = vi.fn();
		renderSection(["run", "review"], onDismiss);

		fireEvent.click(screen.getByRole("button", { name: closeAllName }), {
			shiftKey: true,
		});

		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onDismiss.mock.calls).toEqual([["run"], ["review"]]);
	});

	it("dismisses nothing when the close is cancelled", () => {
		const onDismiss = vi.fn();
		renderSection(["run", "review"], onDismiss);

		const dialog = openCloseDialog();
		fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

		expect(onDismiss).not.toHaveBeenCalled();
	});
});
