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
import { commentColor } from "../../App/commentColor";
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
const composer = () => within(screen.getByTestId("phone-comment-composer"));
const mark = () =>
	screen.getByTestId("phone-review-sheet").querySelector("mark.pr-comment");

function selectText(text: string) {
	const paragraph = sheet().getByText(/A pending preview/);
	const node = [...paragraph.childNodes].find(
		(n) => n.nodeType === Node.TEXT_NODE && n.textContent?.includes(text),
	) as Text;
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

const commentButton = () =>
	screen.queryByRole("button", { name: "Comment on selection" });

function commentOn(text: string, note: string) {
	selectText(text);
	fireEvent.pointerDown(commentButton() as HTMLElement);
	fireEvent.change(composer().getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
}

function queue(text: string, note: string) {
	commentOn(text, note);
	fireEvent.click(composer().getByRole("button", { name: "Add to review" }));
}

const pasted = (sendInput: ReturnType<typeof vi.fn>) =>
	sendInput.mock.calls.map(([, data]) => String(data)).join("");

describe("phone review sheet comments", () => {
	it("offers a Comment bar only while text in the body is selected", () => {
		renderSheet();
		expect(commentButton()).toBe(null);
		selectText("idle prompt");
		expect(commentButton()).toBeTruthy();
	});

	it("uses the native text menu when the app provides one", () => {
		const postMessage = vi.fn();
		vi.stubGlobal("webkit", {
			messageHandlers: { assistSelection: { postMessage } },
		});
		renderSheet();
		selectText("idle prompt");
		expect(commentButton()).toBe(null);
		expect(postMessage).toHaveBeenLastCalledWith(true);

		act(() => {
			globalThis.dispatchEvent(new Event("assist:comment-selection"));
		});
		expect(composer().getByText(/idle prompt/)).toBeTruthy();
	});

	it("queues a comment, pins its highlight and sends it with the approval", () => {
		const { onDecision } = renderSheet();
		queue("looks like", "Name the idle state");

		expect(mark()?.textContent).toBe("looks like");
		expect((mark() as HTMLElement).dataset.pin).toBe("1");
		expect(
			sheet().getByRole("button", { name: "1 review comment ›" }),
		).toBeTruthy();
		fireEvent.click(sheet().getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				comments: [{ quote: "looks like", note: "Name the idle state" }],
			}),
		);
	});

	it("undoes a queued comment from the toast", () => {
		renderSheet();
		queue("looks like", "Name the idle state");
		fireEvent.click(screen.getByRole("button", { name: "Undo" }));
		expect(mark()).toBe(null);
	});

	it("edits and deletes a queued comment from its highlight", () => {
		const { onDecision } = renderSheet();
		queue("looks like", "First note");

		fireEvent.click(mark() as HTMLElement);
		fireEvent.click(screen.getByRole("button", { name: "Edit" }));
		fireEvent.change(composer().getByDisplayValue("First note"), {
			target: { value: "Second note" },
		});
		fireEvent.click(composer().getByRole("button", { name: "Save" }));
		fireEvent.click(sheet().getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenLastCalledWith(
			"approve",
			expect.objectContaining({
				comments: [{ quote: "looks like", note: "Second note" }],
			}),
		);

		fireEvent.click(mark() as HTMLElement);
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		expect(mark()).toBe(null);
	});

	it("opens an existing comment when a selection lands on it", async () => {
		renderSheet();
		queue("looks like", "First note");
		await waitFor(() =>
			expect(screen.queryByTestId("phone-comment-composer")).toBe(null),
		);
		const range = document.createRange();
		range.selectNodeContents(mark() as HTMLElement);
		document.getSelection()?.removeAllRanges();
		document.getSelection()?.addRange(range);
		act(() => {
			document.dispatchEvent(new Event("selectionchange"));
		});
		fireEvent.pointerDown(commentButton() as HTMLElement);

		expect(screen.queryByTestId("phone-comment-composer")).toBe(null);
		expect(
			within(screen.getByTestId("phone-comment-peek")).getByText("First note"),
		).toBeTruthy();
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
		fireEvent.click(
			composer().getByRole("button", { name: "Make this a rule…" }),
		);
		vi.advanceTimersByTime(SUBMIT_WAIT_MS);
		expect(pasted(sendInput)).toContain("/add-rule");
		expect(pasted(sendInput)).toContain("Always name states");
	});

	it("cites a broken rule from the rules page", async () => {
		const { sendInput } = renderSheet();
		commentOn("idle prompt", "");
		await waitFor(() => composer().getByText("Cite a rule"));
		fireEvent.click(composer().getByText("Cite a rule"));
		fireEvent.click(composer().getByText("R1"));
		vi.advanceTimersByTime(SUBMIT_WAIT_MS);
		expect(pasted(sendInput)).toContain("breaks rule R1");
	});
});

describe("phone review comment list", () => {
	const list = () => within(screen.getByTestId("phone-review-comments"));

	async function queueTwo() {
		queue("looks like", "Name the idle state");
		await waitFor(() =>
			expect(screen.queryByTestId("phone-comment-composer")).toBe(null),
		);
		queue("idle prompt", "Say which prompt");
		await waitFor(() =>
			expect(screen.queryByTestId("phone-comment-composer")).toBe(null),
		);
		fireEvent.click(
			sheet().getByRole("button", { name: "2 review comments ›" }),
		);
	}

	it("lists queued comments with quotes matching their highlight colours", async () => {
		renderSheet();
		await queueTwo();
		const border = (text: string) =>
			getComputedStyle(list().getByText(text)).borderLeftColor;
		const css = (color: string) => {
			const probe = document.createElement("div");
			probe.style.color = color;
			return probe.style.color;
		};
		expect(list().getByText("Review comments (2)")).toBeTruthy();
		expect(list().getByText("Say which prompt")).toBeTruthy();
		expect(border("looks like")).toBe(css(commentColor(0).solid));
		expect(border("idle prompt.")).toBe(css(commentColor(1).solid));
	});

	it("removes a comment and sends the rest with Reject", async () => {
		const { onDecision } = renderSheet();
		await queueTwo();
		fireEvent.click(
			list().getAllByRole("button", { name: "Remove comment" })[0],
		);
		expect(list().getByText("Review comments (1)")).toBeTruthy();
		expect(list().queryByText("looks like")).toBe(null);
		fireEvent.click(list().getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({
				comments: [{ quote: "idle prompt.", note: "Say which prompt" }],
			}),
		);
	});

	it("sends the remaining comments with Approve from the sheet", async () => {
		const { onDecision } = renderSheet();
		await queueTwo();
		fireEvent.click(
			list().getAllByRole("button", { name: "Remove comment" })[1],
		);
		fireEvent.click(list().getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				comments: [{ quote: "looks like", note: "Name the idle state" }],
			}),
		);
	});
});
