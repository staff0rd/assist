// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionCard } from "./SessionCard";
import type { SessionInfo } from "./types";

afterEach(() => {
	cleanup();
});

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

function renderCard(loading: boolean) {
	render(
		<SessionCard
			session={session}
			active={false}
			loading={loading}
			onClick={() => {}}
			onDismiss={() => {}}
			onSetAutoRun={() => {}}
			onSetAutoAdvance={() => {}}
		/>,
	);
}

describe("SessionCard loading state", () => {
	it("shows a loading indicator and hides the status while uninitialized", () => {
		renderCard(true);
		expect(screen.getByText("Starting…")).toBeTruthy();
		expect(screen.queryByText(/● running/)).toBeNull();
	});

	it("shows its own detail once initialized", () => {
		renderCard(false);
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.getByText(/● running/)).toBeTruthy();
		expect(screen.getByText("my session")).toBeTruthy();
	});

	it("shows an error state with its reason instead of staying at Starting…", () => {
		render(
			<SessionCard
				session={{
					...session,
					status: "error",
					restored: false,
					error: "the conversation cannot be resumed",
				}}
				active={false}
				loading={false}
				onClick={() => {}}
				onDismiss={() => {}}
				onSetAutoRun={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
		);
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.getByText(/● error/)).toBeTruthy();
		expect(screen.getByText("the conversation cannot be resumed")).toBeTruthy();
	});
});
