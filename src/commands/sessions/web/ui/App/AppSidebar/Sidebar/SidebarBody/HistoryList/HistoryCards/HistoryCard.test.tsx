// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HistoryCard } from "./HistoryCard";
import type { HistoricalSession } from "../../../../../../types";

afterEach(() => {
	cleanup();
});

const session: HistoricalSession = {
	sessionId: "abcdef12-3456",
	name: "my session",
	project: "assist",
	cwd: "/tmp/assist",
	timestamp: new Date(0).toISOString(),
};

describe("HistoryCard ripple", () => {
	function renderCard() {
		return render(
			<HistoryCard session={session} onView={() => {}} onResume={() => {}} />,
		);
	}

	async function cardRipple(container: HTMLElement) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		const card = container.firstChild as HTMLElement;
		const root = card.querySelector(":scope > .MuiTouchRipple-root");
		return root?.querySelector(".MuiTouchRipple-ripple") ?? null;
	}

	it("ripples the card when its body is pressed", async () => {
		const { container } = renderCard();
		fireEvent.mouseDown(screen.getByText("my session"));
		expect(await cardRipple(container)).not.toBeNull();
	});

	it("does not ripple the card when resume is pressed", async () => {
		const { container } = renderCard();
		fireEvent.mouseDown(screen.getByTitle("Resume"));
		expect(await cardRipple(container)).toBeNull();
	});

	it("does not ripple the card when the session id is pressed", async () => {
		const { container } = renderCard();
		fireEvent.mouseDown(screen.getByText("abcdef12"));
		expect(await cardRipple(container)).toBeNull();
	});
});

describe("HistoryCard title", () => {
	it("shows the kept title above the prompt", () => {
		render(
			<HistoryCard
				session={{ ...session, prompt: "fix the build", title: "Build fix" }}
				onView={() => {}}
				onResume={() => {}}
			/>,
		);

		const title = screen.getByText("Build fix");
		const prompt = screen.getByText("fix the build");
		expect(
			title.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("keeps the prompt as the headline when no title was kept", () => {
		render(
			<HistoryCard session={session} onView={() => {}} onResume={() => {}} />,
		);

		expect(screen.getByText("my session").className).toContain("body2");
	});
});

describe("HistoryCard harness", () => {
	function renderCard(harness?: HistoricalSession["harness"]) {
		return render(
			<HistoryCard
				session={{ ...session, harness }}
				onView={() => {}}
				onResume={() => {}}
			/>,
		);
	}

	it("badges a non-claude session", () => {
		renderCard("codex");

		expect(screen.getByText("codex")).toBeDefined();
	});

	it("badges nothing for a claude session", () => {
		renderCard();

		expect(screen.queryByText("Claude")).toBeNull();
	});
});

describe("HistoryCard relative time", () => {
	it("shows when the session was last active", () => {
		render(
			<HistoryCard
				session={{
					...session,
					lastActivity: new Date(Date.now() - 5 * 60_000).toISOString(),
				}}
				onView={() => {}}
				onResume={() => {}}
			/>,
		);
		expect(screen.getByText("5m ago")).toBeTruthy();
	});
});
