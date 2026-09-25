// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionGroupSection } from "./SessionGroupSection";
import { useInRepoGroupContext } from "./useInRepoGroupContext";
import { TopBarLayoutContext } from "../../../../../../../../useTopBarLayoutContext";

afterEach(cleanup);

function Probe() {
	return <div data-testid="probe">{String(useInRepoGroupContext())}</div>;
}

function renderSection(topBar: boolean) {
	render(
		<TopBarLayoutContext.Provider value={topBar}>
			<SessionGroupSection label="assist" count={2}>
				<Probe />
			</SessionGroupSection>
		</TopBarLayoutContext.Provider>,
	);
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
});
