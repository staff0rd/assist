// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { renderWithTheme as render } from "../../../../../../test/renderWithTheme";
import { SessionCard } from "./SessionCard";
import { StarredSessionsProvider } from "../useStarredSessions";
import type { SessionInfo } from "../../types";

afterEach(() => {
	cleanup();
});

const session = makeSessionInfo({
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
});

function Stars({ children }: { children: ReactNode }) {
	return (
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			{children}
		</StarredSessionsProvider>
	);
}

function renderCard(loading: boolean) {
	render(
		<SessionCard
			session={session}
			active={false}
			loading={loading}
			onClick={() => {}}
			onDismiss={() => {}}
			onSetAutoApprove={() => {}}
			onSetAutoAdvance={() => {}}
		/>,
		{ wrapper: Stars },
	);
}

describe("SessionCard loading state", () => {
	it("shows a loading indicator and hides the status while uninitialized", () => {
		renderCard(true);
		expect(screen.getByText("Starting…")).toBeTruthy();
		expect(screen.getAllByRole("progressbar").length).toBe(1);
		expect(screen.queryByTitle("running")).toBeNull();
	});

	it("shows its own detail once initialized", () => {
		renderCard(false);
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
		expect(screen.getByText("my session")).toBeTruthy();
	});

	it("shows only the error status instead of staying at Starting…", () => {
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
				onSetAutoApprove={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);
		expect(screen.queryByText("Starting…")).toBeNull();
		expect(screen.getByTitle("error")).toBeTruthy();
		expect(screen.queryByText("the conversation cannot be resumed")).toBeNull();
	});
});

describe("SessionCard ripple", () => {
	function renderDefaultCard() {
		return render(
			<SessionCard
				session={session}
				active={false}
				loading={false}
				onClick={() => {}}
				onDismiss={() => {}}
				onSetAutoApprove={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);
	}

	async function cardRipple(container: HTMLElement) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		const card = container.firstChild as HTMLElement;
		const root = card.querySelector(":scope > .MuiTouchRipple-root");
		return root?.querySelector(".MuiTouchRipple-ripple") ?? null;
	}

	it("ripples the card when its body is pressed", async () => {
		const { container } = renderDefaultCard();
		fireEvent.mouseDown(screen.getByText("my session"));
		expect(await cardRipple(container)).not.toBeNull();
	});

	it("does not ripple the card when an action button is pressed", async () => {
		const { container } = renderDefaultCard();
		fireEvent.mouseDown(
			screen.getByTitle("Dismiss session 1 (Shift skips confirmation)"),
		);
		expect(await cardRipple(container)).toBeNull();
	});
});

describe("SessionCard dismiss confirmation", () => {
	it("does not select the card when confirming a running session's dismissal", () => {
		const onClick = vi.fn();
		const onDismiss = vi.fn();
		render(
			<SessionCard
				session={session}
				active={false}
				loading={false}
				onClick={onClick}
				onDismiss={onDismiss}
				onSetAutoApprove={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);

		fireEvent.click(
			screen.getByTitle("Dismiss session 1 (Shift skips confirmation)"),
		);
		fireEvent.click(screen.getByRole("button", { name: "End session" }));

		expect(onDismiss).toHaveBeenCalledTimes(1);
		expect(onClick).not.toHaveBeenCalled();
	});
});

describe("SessionCard transfer state", () => {
	function renderTransfer(transfer: SessionInfo["transfer"]) {
		return render(
			<SessionCard
				session={{ ...session, transfer }}
				active={false}
				loading={false}
				onClick={() => {}}
				onDismiss={() => {}}
				onSetAutoApprove={() => {}}
				onSetAutoAdvance={() => {}}
			/>,
			{ wrapper: Stars },
		);
	}

	it("shows the transfer icon and target in place of the status while in flight", () => {
		renderTransfer({ target: "mac-mini" });
		expect(screen.getByTestId("transfer-glyph-pending")).toBeTruthy();
		expect(
			screen.getByText("Transferring → mac-mini", { selector: "span" }),
		).toBeTruthy();
		expect(screen.queryByTitle("running")).toBeNull();
	});

	it("shows the queued target", () => {
		renderTransfer({ target: "mac-mini", queued: {} });
		expect(screen.getByTestId("transfer-glyph-queued")).toBeTruthy();
		expect(
			screen.getByText("Transfer to mac-mini queued", { selector: "span" }),
		).toBeTruthy();
	});

	it("shows Transfer failed when the transfer errored", () => {
		renderTransfer({ target: "mac-mini", error: "link mac-mini is down" });
		expect(screen.getByTestId("transfer-glyph-failed")).toBeTruthy();
		expect(
			screen.getByText("Transfer failed", { selector: "span" }),
		).toBeTruthy();
	});

	it("shows the status glyph when no transfer is set", () => {
		renderTransfer(undefined);
		expect(screen.queryByTestId(/transfer-glyph/)).toBeNull();
		expect(screen.getByTitle("running")).toBeTruthy();
	});
});
