// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { PrPreviewPane } from "./PrPreviewPane";

if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = () =>
		({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect;
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	localStorage.clear();
});

const preview: PrPreview = {
	requestId: "r1",
	title: "feat: x",
	body: "## What\n\nAdds x to the thing",
	prNumber: null,
};

function mockSelection(container: HTMLElement, text: string) {
	const root = container.querySelector(".markdown") as HTMLElement;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let node: Node | null = walker.nextNode();
	let range: Range | null = null;
	while (node) {
		const idx = (node.textContent ?? "").indexOf(text);
		if (idx !== -1) {
			range = document.createRange();
			range.setStart(node, idx);
			range.setEnd(node, idx + text.length);
			break;
		}
		node = walker.nextNode();
	}
	if (!range) throw new Error(`text not found: ${text}`);
	const r = range;
	vi.spyOn(globalThis, "getSelection").mockReturnValue({
		isCollapsed: false,
		rangeCount: 1,
		getRangeAt: () => r,
		removeAllRanges: () => {},
		addRange: () => {},
		toString: () => text,
	} as unknown as Selection);
}

function addComment(container: HTMLElement, quote: string, note: string) {
	mockSelection(container, quote);
	fireEvent.mouseUp(container.querySelector(".markdown") as Element);
	fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
	fireEvent.click(screen.getByRole("button", { name: "Add comment" }));
}

describe("PrPreviewPane inline comments", () => {
	it("attaches a selected span + note and sends them with a reject on Request changes", () => {
		const onDecision = vi.fn();
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={onDecision} />,
		);

		addComment(container, "Adds x", "say what x is");

		expect(screen.getByText("Comments (1)")).toBeTruthy();
		const mark = container.querySelector("mark.pr-comment");
		expect(mark?.textContent).toBe("Adds x");
		fireEvent.click(
			screen.getByRole("button", { name: /Request changes \(1\)/ }),
		);

		expect(onDecision).toHaveBeenCalledWith("reject", [
			{ quote: "Adds x", note: "say what x is" },
		]);
	});

	it("removes an attached comment", () => {
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);

		addComment(container, "Adds x", "say what x is");
		expect(screen.getByText("Comments (1)")).toBeTruthy();

		expect(container.querySelector("mark.pr-comment")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Remove comment" }));
		expect(screen.queryByText("Comments (1)")).toBeNull();
		expect(
			screen.queryByRole("button", { name: /Request changes/ }),
		).toBeNull();
		expect(container.querySelector("mark.pr-comment")).toBeNull();
	});

	it("plain Approve and Reject send no comments", () => {
		const onDecision = vi.fn();
		render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith("approve", []);

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith("reject", []);
	});

	it("restores persisted comments after a remount (page refresh)", () => {
		const first = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);
		addComment(first.container, "Adds x", "say what x is");
		expect(screen.getByText("Comments (1)")).toBeTruthy();

		first.unmount();

		render(<PrPreviewPane preview={preview} onDecision={vi.fn()} />);
		expect(screen.getByText("Comments (1)")).toBeTruthy();
		expect(screen.getByText("say what x is")).toBeTruthy();
	});

	it("clears persisted comments once a decision is made", () => {
		const { container, unmount } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);
		addComment(container, "Adds x", "say what x is");
		fireEvent.click(
			screen.getByRole("button", { name: /Request changes \(1\)/ }),
		);
		unmount();

		render(<PrPreviewPane preview={preview} onDecision={vi.fn()} />);
		expect(screen.queryByText("Comments (1)")).toBeNull();
	});
});
