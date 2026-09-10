// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import type { BacklogItemSummary } from "../types";
import { PhaseSessionLink } from "./PhaseSessionLink";

const base: BacklogItemSummary = {
	id: 984,
	type: "story",
	name: "Login flow",
	status: "in-progress",
	starred: false,
	incompleteSubtasks: 0,
	currentPhase: 3,
	totalPhases: 4,
};

function session(status: SessionInfo["status"]): SessionInfo {
	return {
		id: "s1",
		name: "session",
		commandType: "claude",
		status,
		startedAt: 0,
	};
}

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
				item={{ ...base, ...item }}
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

function isPulsing(el: HTMLElement) {
	const dot = el.querySelector("span") as HTMLElement;
	return getComputedStyle(dot).animation.includes("1.6s");
}

afterEach(cleanup);

describe("PhaseSessionLink", () => {
	it("pulses when the open session is running", () => {
		renderLink(session("running"));

		expect(isPulsing(phaseLink())).toBe(true);
	});

	it("stays still when the session is merely open", () => {
		renderLink(session("waiting"));

		expect(isPulsing(phaseLink())).toBe(false);
	});

	it("selects the session and navigates to /sessions on click", () => {
		const onSelectSession = vi.fn();
		renderLink(session("running"), onSelectSession);

		fireEvent.click(phaseLink());

		expect(onSelectSession).toHaveBeenCalledWith("s1");
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("names the session status in the tooltip", () => {
		renderLink(session("waiting"));

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
		const { container } = renderLink(session("running"), undefined, {
			status: "done",
		});

		expect(screen.queryByText(/^phase /)).toBeNull();
		expect(container.querySelector("[role='button']")).toBeNull();
	});

	it("renders nothing for an in-progress item with no current phase", () => {
		renderLink(session("running"), undefined, { currentPhase: undefined });

		expect(screen.queryByText(/^phase /)).toBeNull();
	});
});
