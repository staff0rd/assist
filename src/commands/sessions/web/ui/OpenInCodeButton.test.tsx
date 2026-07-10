// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionCard } from "./SessionCard";
import type { SessionInfo } from "./types";
import { StarredSessionsProvider } from "./useStarredSessions";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })),
	);
});

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
	cwd: "/home/me/repo",
};

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function renderCard(onClick: () => void) {
	render(
		<SessionCard
			session={session}
			active={false}
			loading={false}
			onClick={onClick}
			onDismiss={() => {}}
			onSetAutoRun={() => {}}
			onSetAutoAdvance={() => {}}
		/>,
		{ wrapper: Stars },
	);
}

describe("SessionCard VS Code button", () => {
	it("renders a VS Code button for a session with a cwd", () => {
		renderCard(() => {});
		expect(
			screen.getByRole("button", { name: "Open in VS Code" }),
		).toBeTruthy();
	});

	it("does not select the card when clicked", () => {
		const onClick = vi.fn();
		renderCard(onClick);
		fireEvent.click(screen.getByRole("button", { name: "Open in VS Code" }));
		expect(onClick).not.toHaveBeenCalled();
	});
});
