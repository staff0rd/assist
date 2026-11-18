// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { SessionInfo } from "../../types";
import { NeedsYouCard } from "./NeedsYouCard";
import { OtherCard } from "./OtherCard";
import { WorkingCard } from "./WorkingCard";

afterEach(cleanup);

type CardProps = {
	session: SessionInfo;
	selected: boolean;
	onOpen: () => void;
};

const cards: [string, string, (p: CardProps) => ReactNode][] = [
	["needs-you", "waiting", (p) => <NeedsYouCard {...p} />],
	["working", "running", (p) => <WorkingCard {...p} />],
	["other", "done", (p) => <OtherCard {...p} />],
];

const linked = {
	kind: "backlog",
	itemId: 1791,
	startedAt: 0,
} as const;

function renderCard(
	card: (p: CardProps) => ReactNode,
	session: SessionInfo,
	onOpen = () => {},
) {
	render(
		<MemoryRouter>
			<ThemeProvider theme={createDesignTheme("dark")}>
				{card({ session, selected: false, onOpen })}
			</ThemeProvider>
		</MemoryRouter>,
	);
}

describe.each(cards)("%s card backlog chip", (_, status, card) => {
	it("shows the item chip linking to the item, before the repo label", () => {
		renderCard(
			card,
			makeSessionInfo({
				status: status as SessionInfo["status"],
				cwd: "/git/repo",
				activity: linked,
			}),
		);

		const chip = screen.getByRole("link", { name: "a1791" });
		expect(chip.getAttribute("href")).toBe(
			`/backlog/items/a1791?cwd=${encodeURIComponent("/git/repo")}`,
		);
		const repo = screen.getByTestId("card-repo");
		expect(
			chip.compareDocumentPosition(repo) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("shows no chip when the session has no linked item", () => {
		renderCard(
			card,
			makeSessionInfo({
				status: status as SessionInfo["status"],
				cwd: "/git/repo",
			}),
		);

		expect(screen.queryByRole("link")).toBeNull();
	});

	it("does not open the card when the chip is clicked", () => {
		const onOpen = vi.fn();
		renderCard(
			card,
			makeSessionInfo({
				status: status as SessionInfo["status"],
				activity: linked,
			}),
			onOpen,
		);

		fireEvent.click(screen.getByRole("link", { name: "a1791" }));

		expect(onOpen).not.toHaveBeenCalled();
	});
});
