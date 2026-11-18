// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import type { SessionSocket } from "../../useSessionSocket";
import { DiffPanelsProvider } from "../useDiffPanels";
import { CardSessionView } from "./CardSessionView";

vi.mock("../SessionContent/SessionArea/SessionBody", () => ({
	SessionBody: () => <div data-testid="session-body" />,
}));

afterEach(cleanup);

describe("CardSessionView", () => {
	it("renders the session body without a session top bar", () => {
		const session = makeSessionInfo({ id: "s1", title: "Card title" });
		render(
			<MemoryRouter>
				<DiffPanelsProvider sessionIds={[]} onActivateSession={() => {}}>
					<CardSessionView
						session={session}
						socket={{ sessions: [session] } as unknown as SessionSocket}
					/>
				</DiffPanelsProvider>
			</MemoryRouter>,
		);

		expect(screen.getByTestId("session-body")).toBeTruthy();
		expect(screen.queryByTestId("session-top-bar")).toBeNull();
		expect(screen.queryByText("Card title")).toBeNull();
	});
});
