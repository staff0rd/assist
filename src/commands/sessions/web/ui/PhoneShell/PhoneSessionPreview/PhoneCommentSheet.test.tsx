// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { PhoneSessionPreview } from "../PhoneSessionPreview";

const preview: PrPreview = {
	requestId: "c1",
	title: "Comment on a backlog item",
	body: "## Description\n\nA pending preview looks like an idle prompt.",
	prNumber: null,
	kind: "backlog-item",
	itemType: "story",
	canStart: false,
};

const SUBMIT_WAIT_MS = 200;

const rules = [{ code: "R1", text: "Keep it tight", source: "CLAUDE.md" }];

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => ({ json: async () => ({ rules }) })),
	);
	Range.prototype.getBoundingClientRect = () => new DOMRect(20, 100, 80, 18);
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllGlobals();
	localStorage.clear();
});

function renderSheet() {
	const onDecision = vi.fn();
	const sendInput = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<PhoneSessionPreview
				preview={preview}
				session={makeSessionInfo({ id: "s1", cwd: "/repo" })}
				keyboardOpen={false}
				sendInput={sendInput}
				onDecision={onDecision}
			/>
		</ThemeProvider>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Review full item" }));
	return { onDecision, sendInput };
}

const sheet = () => within(screen.getByTestId("phone-review-sheet"));
const composer = () => within(screen.getByTestId("phone-comment-sheet"));

function selectText(text: string) {
	const paragraph = sheet().getByText(/idle prompt/);
	const node = paragraph.firstChild as Text;
	const start = (node.textContent ?? "").indexOf(text);
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, start + text.length);
	const selection = document.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);
	act(() => {
		document.dispatchEvent(new Event("selectionchange"));
	});
}

function commentOn(text: string, note: string) {
	selectText(text);
	fireEvent.pointerDown(screen.getByRole("button", { name: "Comment" }));
	fireEvent.change(composer().getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
}

const pasted = (sendInput: ReturnType<typeof vi.fn>) =>
	sendInput.mock.calls.map(([, data]) => String(data)).join("");

describe("phone review sheet comments", () => {
	it("offers Comment only while text in the body is selected", () => {
		renderSheet();
		expect(screen.queryByRole("button", { name: "Comment" })).toBe(null);
		selectText("idle prompt");
		expect(screen.getByRole("button", { name: "Comment" })).toBeTruthy();
	});

	it("queues a comment, highlights it and sends it with the decision", () => {
		const { onDecision } = renderSheet();
		commentOn("looks like", "Name the idle state");
		expect(composer().getByText(/looks like/)).toBeTruthy();
		fireEvent.click(composer().getByRole("button", { name: "Add to review" }));

		expect(
			screen.getByTestId("phone-review-sheet").querySelector("mark.pr-comment")
				?.textContent,
		).toBe("looks like");
		fireEvent.click(sheet().getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				comments: [{ quote: "looks like", note: "Name the idle state" }],
			}),
		);
	});

	it("sends the quoted note to the agent", () => {
		const { sendInput } = renderSheet();
		commentOn("idle prompt", "Explain this");
		fireEvent.click(composer().getByRole("button", { name: "Send to agent" }));
		vi.advanceTimersByTime(SUBMIT_WAIT_MS);
		expect(pasted(sendInput)).toContain("idle prompt");
		expect(pasted(sendInput)).toContain("Explain this");
	});

	it("adds a rule from the quote", () => {
		const { sendInput } = renderSheet();
		commentOn("idle prompt", "Always name states");
		fireEvent.click(composer().getByRole("button", { name: "Add rule" }));
		vi.advanceTimersByTime(SUBMIT_WAIT_MS);
		expect(pasted(sendInput)).toContain("/add-rule");
		expect(pasted(sendInput)).toContain("Always name states");
	});

	it("cites a broken rule", async () => {
		const { sendInput } = renderSheet();
		commentOn("idle prompt", "");
		await waitFor(() => composer().getByText("R1"));
		fireEvent.click(composer().getByText("R1"));
		vi.advanceTimersByTime(SUBMIT_WAIT_MS);
		expect(pasted(sendInput)).toContain("breaks rule R1");
	});
});
