// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { selectPreviewText } from "../../../../../../../test/selectPreviewText";
import type { SessionInfo } from "../../../types";
import { CheckPane } from "./CheckPane";

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({ rules: [] }),
		})),
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	localStorage.clear();
});

const liveSession = makeSessionInfo({
	id: "daemon-1",
	name: "check-42",
	commandType: "claude",
	status: "running",
});

const preview: PrPreview = {
	requestId: "r1",
	title: "PIN shows on the Mac",
	body: JSON.stringify({
		title: "PIN shows on the Mac",
		before: ["Restart both daemons"],
		steps: ["Run `assist docs unlock`", "The PIN appears on the Mac"],
		changed: "The docs PIN goes to the controlling node.",
	}),
	prNumber: null,
	kind: "check",
};

function pane() {
	const onDecision = vi.fn();
	render(<CheckPane preview={preview} onDecision={onDecision} />);
	return onDecision;
}

describe("CheckPane", () => {
	it("shows the title, before chips, numbered steps and a Check chip", () => {
		pane();

		expect(screen.getAllByText("PIN shows on the Mac")).not.toHaveLength(0);
		expect(screen.getByText("Check")).toBeTruthy();
		expect(screen.getByText("Restart both daemons")).toBeTruthy();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
		expect(screen.getByText("assist docs unlock").tagName).toBe("CODE");
	});

	it("renders links and inline markdown in steps, changed and before chips", () => {
		render(
			<CheckPane
				preview={{
					...preview,
					body: JSON.stringify({
						title: "Links",
						before: ["Start [the app](https://example.com/start)"],
						steps: [
							"Open http://localhost:4173/ and check **each** page",
							"See _the_ [docs](https://example.com/docs)",
						],
						changed: "Moved to https://example.com/changed",
					}),
				}}
				onDecision={vi.fn()}
			/>,
		);

		const hrefs = screen
			.getAllByRole("link", { hidden: true })
			.map((link) => [link.getAttribute("href"), link.getAttribute("target")]);
		expect(hrefs).toEqual(
			expect.arrayContaining([
				["https://example.com/start", "_blank"],
				["http://localhost:4173/", "_blank"],
				["https://example.com/docs", "_blank"],
				["https://example.com/changed", "_blank"],
			]),
		);
		expect(screen.getByText("each").tagName).toBe("STRONG");
		expect(screen.getByText("the").tagName).toBe("EM");
	});

	it("sends works in one tap without a note", () => {
		const onDecision = pane();

		fireEvent.click(screen.getByRole("button", { name: "Works" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ answers: { result: "works" } }),
		);
	});

	it("sends doesn't work with the trimmed note", () => {
		const onDecision = pane();

		fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
			target: { value: "  PIN showed on work-wsl \n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Doesn't work" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				answers: { result: "doesn't work", note: "PIN showed on work-wsl" },
			}),
		);
	});

	it("rejects when dismissed", () => {
		const onDecision = pane();

		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.not.objectContaining({ answers: expect.anything() }),
		);
	});

	it("sends the typed note with a dismissal", () => {
		const onDecision = pane();

		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "  No Mac to hand " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ answers: { note: "No Mac to hand" } }),
		);
	});

	it("sends a question about a step to the live session and keeps the check open", async () => {
		const onDecision = vi.fn();
		const sendInput = vi.fn();
		render(
			<CheckPane
				preview={preview}
				session={liveSession}
				sendInput={sendInput}
				onDecision={onDecision}
			/>,
		);

		selectPreviewText(document.body, "PIN appears");
		fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
			target: { value: "which Mac?" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Send to agent" }));

		const data = sendInput.mock.calls.map(([, chunk]) => chunk).join("");
		expect(sendInput.mock.calls[0]?.[0]).toBe("daemon-1");
		expect(data).toContain(
			'Pending manual check "PIN shows on the Mac", step:2',
		);
		expect(data).toContain("PIN appears");
		expect(data).toContain("which Mac?");
		expect(onDecision).not.toHaveBeenCalled();
		expect(await screen.findByText("Question sent to check-42")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Works" }));
		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({ answers: { result: "works" } }),
		);
	});

	it("shows the unavailable reason when the session is not live", async () => {
		const sendInput = vi.fn();
		render(
			<CheckPane
				preview={preview}
				session={{ ...liveSession, status: "stopped" } as SessionInfo}
				sendInput={sendInput}
				onDecision={vi.fn()}
			/>,
		);

		selectPreviewText(document.body, "PIN appears");

		expect(
			await screen.findByText(
				"Comments are unavailable — that session is no longer live.",
			),
		).toBeTruthy();
		expect(screen.queryByPlaceholderText("Add a note…")).toBeNull();
		expect(sendInput).not.toHaveBeenCalled();
	});
});
