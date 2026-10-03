// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { makeBacklogItemSummary } from "../../../../../test/mothers/makeBacklogItemSummary";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import type { BacklogItemSummary } from "../types";
import { PhaseSessionLink } from "./PhaseSessionLink";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderLink(
	openSession?: SessionInfo,
	onSelectSession?: (id: string) => void,
	item: Partial<BacklogItemSummary> = {},
) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<PhaseSessionLink
				item={makeBacklogItemSummary({
					status: "in-progress",
					currentPhase: 3,
					totalPhases: 4,
					...item,
				})}
				openSession={openSession}
				onSelectSession={onSelectSession}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

function phaseLink() {
	return screen.getByText("phase 3 of 4");
}

function dotAnimation(el: HTMLElement) {
	const dot = el.querySelector("span") as HTMLElement;
	return getComputedStyle(dot).animation;
}

afterEach(cleanup);

describe("PhaseSessionLink", () => {
	it.each(["running", "waiting"] as const)(
		"renders a static dot for a %s session",
		(status) => {
			renderLink(makeSessionInfo({ status }));

			expect(dotAnimation(phaseLink())).toBe("");
		},
	);

	it("selects the session and navigates to /sessions on click", () => {
		const onSelectSession = vi.fn();
		renderLink(
			makeSessionInfo({ id: "s1", status: "running" }),
			onSelectSession,
		);

		fireEvent.click(phaseLink());

		expect(onSelectSession).toHaveBeenCalledWith("s1");
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("names the session status in the tooltip", () => {
		renderLink(makeSessionInfo({ status: "waiting" }));

		expect(phaseLink().getAttribute("title")).toBe("Open the waiting session");
	});

	it("reads as plain text with no session to open", () => {
		const onSelectSession = vi.fn();
		renderLink(undefined, onSelectSession);

		const link = phaseLink();
		expect(link.getAttribute("role")).toBeNull();

		fireEvent.click(link);

		expect(onSelectSession).not.toHaveBeenCalled();
		expect(screen.getByTestId("location").textContent).toBe("/backlog");
	});

	it("renders nothing for an item that is not in progress", () => {
		const { container } = renderLink(makeSessionInfo(), undefined, {
			status: "done",
		});

		expect(screen.queryByText(/^phase /)).toBeNull();
		expect(container.querySelector("[role='button']")).toBeNull();
	});

	it("renders nothing for an in-progress item with no current phase", () => {
		renderLink(makeSessionInfo(), undefined, { currentPhase: undefined });

		expect(screen.queryByText(/^phase /)).toBeNull();
	});
});
