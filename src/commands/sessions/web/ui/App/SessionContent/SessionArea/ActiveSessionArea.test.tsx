// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../types";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import {
	ActiveSessionArea,
	type ActiveSessionAreaProps,
} from "./ActiveSessionArea";

vi.mock("./SessionAreaTopBar", () => ({ SessionAreaTopBar: () => null }));
vi.mock("./SessionDiffSplit", () => ({
	SessionDiffSplit: ({ children }: { children: unknown }) => children,
}));
vi.mock("./SessionTerminalColumn", () => ({
	SessionTerminalColumn: () => <div data-testid="terminal-column" />,
}));

afterEach(cleanup);

function renderArea(session: SessionInfo) {
	const props = {
		sessions: [session],
		activeId: session.id,
	} as unknown as ActiveSessionAreaProps;
	render(<ActiveSessionArea {...props} />);
}

describe("ActiveSessionArea", () => {
	it("renders the terminal column when no transfer is in flight", () => {
		renderArea(makeSessionInfo());
		expect(screen.getByTestId("terminal-column")).toBeTruthy();
		expect(screen.queryByTestId("transfer-panel")).toBeNull();
	});

	it("replaces the terminal with the transfer panel while in flight", () => {
		renderArea(
			makeSessionInfo({
				node: "wsl",
				cwd: "/git/assist",
				transfer: { target: "mac", stage: "launching" },
			}),
		);
		expect(screen.queryByTestId("terminal-column")).toBeNull();
		expect(screen.getByTestId("transfer-source").textContent).toBe("wsl");
		expect(screen.getByTestId("transfer-target").textContent).toBe("mac");
		expect(screen.getByText("/git/assist")).toBeTruthy();
		expect(
			screen.getByText("Snapshot worktree").getAttribute("data-step-state"),
		).toBe("done");
		expect(
			screen.getByText("Launch on mac").getAttribute("data-step-state"),
		).toBe("now");
	});

	it("keeps the terminal live for a queued transfer", () => {
		renderArea(makeSessionInfo({ transfer: { target: "mac", queued: {} } }));
		expect(screen.getByTestId("terminal-column")).toBeTruthy();
	});
});
