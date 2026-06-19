// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { InProgressChip } from "./InProgressChip";

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

function renderChip(
	openSession: SessionInfo | undefined,
	onSelectSession?: (id: string) => void,
) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<InProgressChip
				openSession={openSession}
				onSelectSession={onSelectSession}
			/>
			<LocationProbe />
		</MemoryRouter>,
	);
}

function chipRoot() {
	return screen
		.getByText("in progress")
		.closest(".MuiChip-root") as HTMLElement;
}

function isAnimated(el: HTMLElement) {
	return getComputedStyle(el).animation.includes("0.5s");
}

afterEach(cleanup);

describe("InProgressChip", () => {
	describe("when the open session is running", () => {
		it("animates the chip", () => {
			renderChip(session("running"));

			expect(isAnimated(chipRoot())).toBe(true);
		});

		it("navigates to the session on click", () => {
			const onSelectSession = vi.fn();
			renderChip(session("running"), onSelectSession);

			fireEvent.click(chipRoot());

			expect(onSelectSession).toHaveBeenCalledWith("s1");
			expect(screen.getByTestId("location").textContent).toBe("/sessions");
		});
	});

	describe("when the open session is waiting", () => {
		it("renders a static chip", () => {
			renderChip(session("waiting"));

			expect(isAnimated(chipRoot())).toBe(false);
		});

		it("navigates to the session on click", () => {
			const onSelectSession = vi.fn();
			renderChip(session("waiting"), onSelectSession);

			fireEvent.click(chipRoot());

			expect(onSelectSession).toHaveBeenCalledWith("s1");
			expect(screen.getByTestId("location").textContent).toBe("/sessions");
		});
	});

	describe("when the open session is in error", () => {
		it("renders a static chip", () => {
			renderChip(session("error"));

			expect(isAnimated(chipRoot())).toBe(false);
		});

		it("navigates to the session on click", () => {
			const onSelectSession = vi.fn();
			renderChip(session("error"), onSelectSession);

			fireEvent.click(chipRoot());

			expect(onSelectSession).toHaveBeenCalledWith("s1");
			expect(screen.getByTestId("location").textContent).toBe("/sessions");
		});
	});

	describe("when there is no open session", () => {
		it("renders a static chip", () => {
			renderChip(undefined);

			expect(isAnimated(chipRoot())).toBe(false);
		});

		it("does not navigate on click", () => {
			const onSelectSession = vi.fn();
			renderChip(undefined, onSelectSession);

			fireEvent.click(chipRoot());

			expect(onSelectSession).not.toHaveBeenCalled();
			expect(screen.getByTestId("location").textContent).toBe("/backlog");
		});
	});
});
