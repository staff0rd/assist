// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { PrPreviewPane } from "./PrPreviewPane";

if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = () =>
		({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect;
}
if (!Range.prototype.getClientRects) {
	Range.prototype.getClientRects = () =>
		({
			length: 0,
			item: () => null,
			[Symbol.iterator]: [][Symbol.iterator],
		}) as unknown as DOMRectList;
}
if (!URL.createObjectURL) {
	URL.createObjectURL = () => "blob:test";
}
if (!URL.revokeObjectURL) {
	URL.revokeObjectURL = () => {};
}

type CaretDoc = {
	caretRangeFromPoint?: ((x: number, y: number) => Range | null) | undefined;
	elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	(document as CaretDoc).caretRangeFromPoint = undefined;
	(document as CaretDoc).elementFromPoint = undefined;
	localStorage.clear();
});

const preview: PrPreview = {
	requestId: "r1",
	title: "feat: x",
	body: "## What\n\nAdds x to the thing",
	prNumber: null,
};

function caretAt(node: Node, offset: number): Range {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	return range;
}

function selectText(container: HTMLElement, text: string) {
	const root = container.querySelector(".markdown") as HTMLElement;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let node: Node | null = walker.nextNode();
	while (node) {
		const idx = (node.textContent ?? "").indexOf(text);
		if (idx !== -1) break;
		node = walker.nextNode();
	}
	if (!node) throw new Error(`text not found: ${text}`);
	const found = node;
	const idx = (found.textContent ?? "").indexOf(text);

	(document as CaretDoc).elementFromPoint = vi
		.fn()
		.mockReturnValue(found.parentElement as Element);
	(document as CaretDoc).caretRangeFromPoint = vi
		.fn()
		.mockReturnValueOnce(caretAt(found, idx))
		.mockReturnValue(caretAt(found, idx + text.length));

	fireEvent.mouseDown(root, { clientX: 1, clientY: 1 });
	act(() => {
		globalThis.dispatchEvent(
			new MouseEvent("mouseup", { clientX: 2, clientY: 1, bubbles: true }),
		);
	});
}

function addComment(container: HTMLElement, quote: string, note: string) {
	selectText(container, quote);
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

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			[{ quote: "Adds x", note: "say what x is" }],
			[],
		);
	});

	it("gives each highlighted span a distinct colour", () => {
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);

		addComment(container, "Adds x", "first");
		addComment(container, "the thing", "second");

		const marks = Array.from(
			container.querySelectorAll<HTMLElement>("mark.pr-comment"),
		);
		expect(marks).toHaveLength(2);
		expect(marks[0].style.backgroundColor).toBeTruthy();
		expect(marks[1].style.backgroundColor).toBeTruthy();
		expect(marks[0].style.backgroundColor).not.toBe(
			marks[1].style.backgroundColor,
		);
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
		expect(onDecision).toHaveBeenCalledWith("approve", [], []);

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith("reject", [], []);
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

	function pasteImage(name: string) {
		const file = new File(["bytes"], name, { type: "image/png" });
		const event = new Event("paste", { bubbles: true }) as Event & {
			clipboardData: unknown;
		};
		event.clipboardData = {
			items: [{ kind: "file", type: "image/png", getAsFile: () => file }],
		};
		act(() => {
			globalThis.dispatchEvent(event);
		});
	}

	it("uploads a pasted screenshot and shows it in the Screenshots section", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ markdown: "![shot](https://x/y.png)" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);
		pasteImage("shot.png");

		const img = (await screen.findByAltText("screenshot")) as HTMLImageElement;
		expect(img.getAttribute("src")).toMatch(/^blob:/);
		expect(screen.getByRole("heading", { name: "Screenshots" })).toBeTruthy();
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain("/api/pr-preview/upload-image?");
		expect(url).toContain("cwd=%2Frepo");
	});

	it("appends uploaded screenshots to the decision on approve, but not reject", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ markdown: "![shot](https://x/y.png)" }),
			}),
		);
		const onDecision = vi.fn();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={onDecision} />,
		);
		pasteImage("shot.png");
		await screen.findByAltText("screenshot");

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenLastCalledWith("reject", [], []);

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenLastCalledWith(
			"approve",
			[],
			["![shot](https://x/y.png)"],
		);
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
