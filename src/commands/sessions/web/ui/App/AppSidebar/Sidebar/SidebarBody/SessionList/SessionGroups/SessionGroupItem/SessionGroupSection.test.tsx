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
import { TopBarLayoutContext } from "../../../../../../useTopBarLayoutContext";

afterEach(cleanup);

function Probe() {
	return <div data-testid="probe">{String(useInRepoGroupContext())}</div>;
}

function renderSection(
	topBar: boolean,
	sessionIds = ["run", "review"],
	onDismiss: (id: string) => void = () => {},
) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<SessionGroupSection
				label="assist"
				sessionIds={sessionIds}
				onDismiss={onDismiss}
			>
				<Probe />
			</SessionGroupSection>
		</TopBarLayoutContext.Provider>,
	);
}

function openCloseDialog() {
	fireEvent.click(
		screen.getByRole("button", { name: "Close all sessions in assist" }),
	);
	return screen.getByRole("dialog");
}

function header() {
	const label = screen.getByText("assist");
	if (!label.parentElement) throw new Error("group header not found");
	return label.parentElement;
}

describe("SessionGroupSection", () => {
	it("tells its cards they are named by the group header", () => {
		renderSection(true);

		expect(screen.getByTestId("probe").textContent).toBe("true");
		expect(screen.getByText("assist")).toBeTruthy();
	});

	it("counts the sessions beside the group name", () => {
		renderSection(true);

		expect(header().textContent).toContain("2");
	});

	it("sticks the group name while the group is in view", () => {
		renderSection(true);

		expect(getComputedStyle(header()).position).toBe("sticky");
	});

	it("leaves the header static in the default layout", () => {
		renderSection(false);

		expect(getComputedStyle(header()).position).not.toBe("sticky");
	});

	it("asks before closing, naming the group and how many sessions close", () => {
		renderSection(false, ["run", "review", "fix"]);

		const dialog = openCloseDialog();

		expect(dialog.textContent).toContain("all 3 sessions in assist");
	});

	it("dismisses every session in the group, nested children included, on confirm", () => {
		const onDismiss = vi.fn();
		renderSection(false, ["run", "review", "fix"], onDismiss);

		const dialog = openCloseDialog();
		fireEvent.click(within(dialog).getByRole("button", { name: "Close 3" }));

		expect(onDismiss.mock.calls).toEqual([["run"], ["review"], ["fix"]]);
	});

	it("dismisses nothing when the close is cancelled", () => {
		const onDismiss = vi.fn();
		renderSection(false, ["run", "review"], onDismiss);

		const dialog = openCloseDialog();
		fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

		expect(onDismiss).not.toHaveBeenCalled();
	});
});
