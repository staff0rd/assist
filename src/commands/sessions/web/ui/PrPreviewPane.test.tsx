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
if (!Element.prototype.setPointerCapture) {
	Element.prototype.setPointerCapture = () => {};
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

		expect(onDecision).toHaveBeenCalledWith("reject", {
			comments: [{ quote: "Adds x", note: "say what x is" }],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
			draft: false,
		});
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
		expect(onDecision).toHaveBeenCalledWith("approve", {
			comments: [],
			screenshots: [],
			reviewAfter: true,
			announceAfter: true,
			draft: false,
		});

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith("reject", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
			draft: false,
		});
	});

	describe("Review and Post chain toggles", () => {
		const toggle = (label: string) =>
			screen.getByLabelText(label) as HTMLInputElement;
		const approve = () =>
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		it("are both checked by default and approve with the whole chain on", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(true);

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: true, announceAfter: true }),
			);
		});

		it("keeps the announce when only Review is unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Review"));
			expect(toggle("Review").checked).toBe(false);
			expect(toggle("Post").checked).toBe(true);

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: false, announceAfter: true }),
			);
		});

		it("keeps the review when only Post is unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Post"));

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: true, announceAfter: false }),
			);
		});

		it("approves with nothing chained when both are unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Review"));
			fireEvent.click(toggle("Post"));

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: false, announceAfter: false }),
			);
		});

		const retry: PrPreview = { ...preview, requestId: "r2" };

		it("restores the chosen toggles when the same session re-raises under a new requestId", () => {
			const first = render(
				<PrPreviewPane preview={preview} sessionId="s1" onDecision={vi.fn()} />,
			);
			fireEvent.click(toggle("Post"));
			fireEvent.click(screen.getByRole("button", { name: "Reject" }));
			first.unmount();

			render(
				<PrPreviewPane preview={retry} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(false);
		});

		it("starts a different session at the defaults", () => {
			const first = render(
				<PrPreviewPane preview={preview} sessionId="s1" onDecision={vi.fn()} />,
			);
			fireEvent.click(toggle("Post"));
			first.unmount();

			render(
				<PrPreviewPane preview={retry} sessionId="s2" onDecision={vi.fn()} />,
			);

			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(true);
		});

		it("prunes a chain older than the 24h TTL and falls back to the defaults", () => {
			const key = "assist:pr-preview-chain:s1";
			const dayAgo = Date.now() - 25 * 60 * 60 * 1000;
			localStorage.setItem(
				key,
				JSON.stringify({
					savedAt: dayAgo,
					items: [{ reviewAfter: false, announceAfter: false }],
				}),
			);
			localStorage.setItem(
				"assist:pr-preview-chain:stale-other",
				JSON.stringify({
					savedAt: dayAgo,
					items: [{ reviewAfter: false, announceAfter: false }],
				}),
			);

			render(
				<PrPreviewPane preview={preview} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(true);
			expect(localStorage.getItem(key)).toBeNull();
			expect(
				localStorage.getItem("assist:pr-preview-chain:stale-other"),
			).toBeNull();
		});

		it("keeps a chain saved within the TTL", () => {
			localStorage.setItem(
				"assist:pr-preview-chain:s1",
				JSON.stringify({
					savedAt: Date.now() - 60 * 60 * 1000,
					items: [{ reviewAfter: false, announceAfter: true }],
				}),
			);

			render(
				<PrPreviewPane preview={preview} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Review").checked).toBe(false);
			expect(toggle("Post").checked).toBe(true);
		});

		it("clears the remembered choice once the preview is approved", () => {
			const first = render(
				<PrPreviewPane preview={preview} sessionId="s1" onDecision={vi.fn()} />,
			);
			fireEvent.click(toggle("Post"));
			approve();
			first.unmount();

			render(
				<PrPreviewPane preview={retry} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Post").checked).toBe(true);
		});
	});

	describe("Draft toggle", () => {
		const toggle = (label: string) =>
			screen.getByLabelText(label) as HTMLInputElement;
		const approve = () =>
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		const readyPr: PrPreview = { ...preview, draft: false };
		const draftPr: PrPreview = { ...preview, draft: true };

		it("starts unchecked for a PR the CLI resolved as ready", () => {
			render(<PrPreviewPane preview={readyPr} onDecision={vi.fn()} />);

			expect(toggle("Draft").checked).toBe(false);
		});

		it("starts checked for a PR the CLI resolved as a draft", () => {
			render(<PrPreviewPane preview={draftPr} onDecision={vi.fn()} />);

			expect(toggle("Draft").checked).toBe(true);
		});

		it("approves a ready PR as a draft once ticked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={readyPr} onDecision={onDecision} />);

			fireEvent.click(toggle("Draft"));
			approve();

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ draft: true }),
			);
		});

		it("approves a resolved draft as ready once unticked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={draftPr} onDecision={onDecision} />);

			fireEvent.click(toggle("Draft"));
			approve();

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ draft: false }),
			);
		});

		it("is absent on an update to an existing PR", () => {
			render(
				<PrPreviewPane
					preview={{ ...preview, prNumber: 42 }}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.queryByLabelText("Draft")).toBeNull();
			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(true);
		});

		const retry: PrPreview = { ...readyPr, requestId: "r2" };

		it("remembers a manual tick across a reject and re-raise", () => {
			const first = render(
				<PrPreviewPane preview={readyPr} sessionId="s1" onDecision={vi.fn()} />,
			);
			fireEvent.click(toggle("Draft"));
			fireEvent.click(screen.getByRole("button", { name: "Reject" }));
			first.unmount();

			render(
				<PrPreviewPane preview={retry} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Draft").checked).toBe(true);
		});

		it("falls back to the resolved state once the preview is approved", () => {
			const first = render(
				<PrPreviewPane preview={readyPr} sessionId="s1" onDecision={vi.fn()} />,
			);
			fireEvent.click(toggle("Draft"));
			approve();
			first.unmount();

			render(
				<PrPreviewPane preview={retry} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Draft").checked).toBe(false);
		});

		it("flips the header chip as the toggle is ticked and unticked", () => {
			render(<PrPreviewPane preview={readyPr} onDecision={vi.fn()} />);
			expect(screen.getByText("New PR")).toBeTruthy();

			fireEvent.click(toggle("Draft"));
			expect(screen.getByText("New draft PR")).toBeTruthy();

			fireEvent.click(toggle("Draft"));
			expect(screen.getByText("New PR")).toBeTruthy();
		});

		it("uses the resolved state when a stored chain predates the Draft toggle", () => {
			localStorage.setItem(
				"assist:pr-preview-chain:s1",
				JSON.stringify({
					savedAt: Date.now() - 60 * 60 * 1000,
					items: [{ reviewAfter: false, announceAfter: true }],
				}),
			);

			render(
				<PrPreviewPane preview={draftPr} sessionId="s1" onDecision={vi.fn()} />,
			);

			expect(toggle("Draft").checked).toBe(true);
			expect(toggle("Review").checked).toBe(false);
		});
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

	type UploadResponse = { ok: boolean; json: () => Promise<unknown> };

	function deferredUpload() {
		let settle: (res: UploadResponse) => void = () => {};
		const promise = new Promise<UploadResponse>((resolve) => {
			settle = resolve;
		});
		return {
			promise,
			succeed: async (markdown: string) => {
				await act(async () => {
					settle({ ok: true, json: async () => ({ markdown }) });
				});
			},
			fail: async (error: string) => {
				await act(async () => {
					settle({ ok: false, json: async () => ({ error }) });
				});
			},
		};
	}

	function stubDeferredUploads() {
		const first = deferredUpload();
		const second = deferredUpload();
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockReturnValueOnce(first.promise)
				.mockReturnValueOnce(second.promise),
		);
		return { first, second };
	}

	const uploadingIndicators = () =>
		screen.queryAllByText("Uploading screenshot…");

	it("shows an indicator per in-flight upload and keeps them independent", async () => {
		const { first, second } = stubDeferredUploads();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);

		pasteImage("one.png");
		pasteImage("two.png");
		expect(uploadingIndicators()).toHaveLength(2);

		await first.succeed("![one](https://x/one.png)");
		expect(uploadingIndicators()).toHaveLength(1);
		expect(screen.getAllByAltText("screenshot")).toHaveLength(1);

		await second.succeed("![two](https://x/two.png)");
		expect(uploadingIndicators()).toHaveLength(0);
		const images = screen.getAllByAltText("screenshot") as HTMLImageElement[];
		expect(images).toHaveLength(2);
		expect(images.map((img) => img.getAttribute("src"))).toEqual([
			expect.stringMatching(/^blob:/),
			expect.stringMatching(/^blob:/),
		]);
	});

	it("reports one upload's failure without disturbing a concurrent upload", async () => {
		const { first, second } = stubDeferredUploads();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);

		pasteImage("one.png");
		pasteImage("two.png");

		await first.fail("gh image blew up");
		expect(screen.getByText("gh image blew up")).toBeTruthy();
		expect(uploadingIndicators()).toHaveLength(1);

		await second.succeed("![two](https://x/two.png)");
		expect(screen.getByText("gh image blew up")).toBeTruthy();
		expect(screen.getAllByAltText("screenshot")).toHaveLength(1);
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
		expect(onDecision).toHaveBeenLastCalledWith("reject", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
			draft: false,
		});

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenLastCalledWith("approve", {
			comments: [],
			screenshots: ["![shot](https://x/y.png)"],
			reviewAfter: true,
			announceAfter: true,
			draft: false,
		});
	});

	describe("backlog item previews", () => {
		const item: PrPreview = {
			requestId: "b1",
			title: "Preview never opens",
			body: "**Type:** bug\n\n## Description\n\nThe pane stays shut",
			prNumber: null,
			kind: "backlog-item",
			itemType: "bug",
		};

		it("shows a type chip instead of a PR chip", () => {
			render(<PrPreviewPane preview={item} onDecision={vi.fn()} />);

			expect(screen.getByText("Bug")).toBeTruthy();
			expect(screen.queryByText("New PR")).toBeNull();
		});

		it("shows a Story chip for a story", () => {
			render(
				<PrPreviewPane
					preview={{ ...item, itemType: "story" }}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.getByText("Story")).toBeTruthy();
		});

		it("offers no screenshot UI and ignores a pasted image", async () => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			render(<PrPreviewPane preview={item} cwd="/repo" onDecision={vi.fn()} />);
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();

			pasteImage("shot.png");
			await Promise.resolve();

			expect(fetchMock).not.toHaveBeenCalled();
			expect(screen.queryByAltText("screenshot")).toBeNull();
		});

		it("supports drag-select inline commenting", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={item} onDecision={onDecision} />,
			);

			addComment(container, "stays shut", "which pane?");

			expect(container.querySelector("mark.pr-comment")?.textContent).toBe(
				"stays shut",
			);
			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);
			expect(onDecision).toHaveBeenCalledWith("reject", {
				comments: [{ quote: "stays shut", note: "which pane?" }],
				screenshots: [],
				reviewAfter: false,
				announceAfter: false,
				draft: false,
			});
		});

		it("offers no chain toggles", () => {
			render(<PrPreviewPane preview={item} onDecision={vi.fn()} />);

			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
		});
	});

	describe("backlog comment previews", () => {
		const comment: PrPreview = {
			requestId: "c1",
			title: "Comment on a934: Preview pane for assist backlog comment",
			body: "Phase 1 landed the gate; the chip is still a Story",
			prNumber: null,
			kind: "backlog-comment",
		};

		it("shows a neutral Comment chip", () => {
			render(<PrPreviewPane preview={comment} onDecision={vi.fn()} />);

			expect(screen.getByText("Comment")).toBeTruthy();
			expect(screen.queryByText("Story")).toBeNull();
			expect(screen.queryByText("New PR")).toBeNull();
		});

		it("offers no chain toggles", () => {
			render(<PrPreviewPane preview={comment} onDecision={vi.fn()} />);

			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
		});

		it("offers no screenshot UI and ignores a pasted image", async () => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			render(
				<PrPreviewPane preview={comment} cwd="/repo" onDecision={vi.fn()} />,
			);
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();

			pasteImage("shot.png");
			await Promise.resolve();

			expect(fetchMock).not.toHaveBeenCalled();
			expect(screen.queryByAltText("screenshot")).toBeNull();
		});

		it("returns each inline comment with Request changes", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={comment} onDecision={onDecision} />,
			);

			addComment(container, "still a Story", "should read Comment");

			expect(container.querySelector("mark.pr-comment")?.textContent).toBe(
				"still a Story",
			);
			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);
			expect(onDecision).toHaveBeenCalledWith("reject", {
				comments: [{ quote: "still a Story", note: "should read Comment" }],
				screenshots: [],
				reviewAfter: false,
				announceAfter: false,
				draft: false,
			});
		});
	});

	describe("pr comment previews", () => {
		const prComment: PrPreview = {
			requestId: "p1",
			title: "Comment on src/foo.ts:42",
			body: "This branch swallows the error silently",
			prNumber: null,
			kind: "pr-comment",
		};

		it("shows a neutral Comment chip with no PR chain or screenshot UI", () => {
			render(<PrPreviewPane preview={prComment} onDecision={vi.fn()} />);

			expect(screen.getByText("Comment")).toBeTruthy();
			expect(screen.queryByText("New PR")).toBeNull();
			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();
		});

		it("stays neutral when the preview carries a PR number", () => {
			render(
				<PrPreviewPane
					preview={{ ...prComment, prNumber: 42 }}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.getByText("Comment")).toBeTruthy();
			expect(screen.queryByText("Update #42")).toBeNull();
			expect(screen.queryByLabelText("Review")).toBeNull();
		});

		it("returns each inline comment with Request changes", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={prComment} onDecision={onDecision} />,
			);

			addComment(container, "swallows the error", "name the error");

			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);
			expect(onDecision).toHaveBeenCalledWith("reject", {
				comments: [{ quote: "swallows the error", note: "name the error" }],
				screenshots: [],
				reviewAfter: false,
				announceAfter: false,
				draft: false,
			});
		});
	});

	describe("github issue comment previews", () => {
		const issueComment: PrPreview = {
			requestId: "g1",
			title: "Comment on acme/widgets#42",
			body: "Fixed by the latest release",
			prNumber: null,
			kind: "github-issue-comment",
		};

		it("shows a neutral Comment chip with no PR chain or screenshot UI", () => {
			render(<PrPreviewPane preview={issueComment} onDecision={vi.fn()} />);

			expect(screen.getByText("Comment")).toBeTruthy();
			expect(screen.queryByText("New PR")).toBeNull();
			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();
		});

		it("returns each inline comment with Request changes", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={issueComment} onDecision={onDecision} />,
			);

			addComment(container, "latest release", "name the version");

			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);
			expect(onDecision).toHaveBeenCalledWith("reject", {
				comments: [{ quote: "latest release", note: "name the version" }],
				screenshots: [],
				reviewAfter: false,
				announceAfter: false,
				draft: false,
			});
		});
	});

	describe("github issue create previews", () => {
		const newIssue: PrPreview = {
			requestId: "n1",
			title: "Crash on load",
			body: "Details about the crash",
			prNumber: null,
			kind: "github-issue",
			metadata: [
				{ label: "Repository", value: "acme/widgets" },
				{ label: "Type", value: "Epic" },
				{ label: "Labels", value: "bug, needs triage" },
			],
		};

		it("names the pane as a new issue and lists its metadata above the body", () => {
			const { container } = render(
				<PrPreviewPane preview={newIssue} onDecision={vi.fn()} />,
			);

			expect(screen.getByText("New issue")).toBeTruthy();
			expect(screen.getByText("acme/widgets")).toBeTruthy();
			expect(screen.getByText("bug, needs triage")).toBeTruthy();
			expect(container.querySelector(".markdown")?.textContent?.trim()).toBe(
				"Details about the crash",
			);
		});

		it("uploads a pasted screenshot and shows it in the Screenshots section", async () => {
			const fetchMock = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ markdown: "![shot](https://x/y.png)" }),
			});
			vi.stubGlobal("fetch", fetchMock);

			render(
				<PrPreviewPane preview={newIssue} cwd="/repo" onDecision={vi.fn()} />,
			);
			pasteImage("shot.png");

			await screen.findByAltText("screenshot");
			expect(screen.getByRole("heading", { name: "Screenshots" })).toBeTruthy();
			expect(fetchMock.mock.calls[0][0] as string).toContain(
				"/api/pr-preview/upload-image?",
			);
		});

		it("sends the screenshots on approve but not on reject", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					ok: true,
					json: async () => ({ markdown: "![shot](https://x/y.png)" }),
				}),
			);
			const onDecision = vi.fn();
			render(
				<PrPreviewPane
					preview={newIssue}
					cwd="/repo"
					onDecision={onDecision}
				/>,
			);
			pasteImage("shot.png");
			await screen.findByAltText("screenshot");

			fireEvent.click(screen.getByRole("button", { name: "Reject" }));
			expect(onDecision).toHaveBeenLastCalledWith(
				"reject",
				expect.objectContaining({ screenshots: [] }),
			);

			fireEvent.click(screen.getByRole("button", { name: "Approve" }));
			expect(onDecision).toHaveBeenLastCalledWith(
				"approve",
				expect.objectContaining({ screenshots: ["![shot](https://x/y.png)"] }),
			);
		});

		it("offers no chain toggles", () => {
			render(<PrPreviewPane preview={newIssue} onDecision={vi.fn()} />);

			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
		});
	});

	describe("previews without screenshot capture", () => {
		const kinds = [
			"backlog-item",
			"backlog-comment",
			"pr-comment",
			"github-issue-comment",
			"github-issue-edit",
			"miro-board",
			"slack-post",
		] as const;

		it.each(kinds)("offers no screenshot UI for %s", async (kind) => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			render(
				<PrPreviewPane
					preview={{ ...preview, requestId: `ns-${kind}`, kind }}
					cwd="/repo"
					onDecision={vi.fn()}
				/>,
			);
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();

			pasteImage("shot.png");
			await Promise.resolve();

			expect(fetchMock).not.toHaveBeenCalled();
			expect(screen.queryByAltText("screenshot")).toBeNull();
		});
	});

	describe("github issue edit previews", () => {
		const issueEdit: PrPreview = {
			requestId: "e1",
			title: "Edit acme/widgets#42: Tidy the history",
			body: "## Notes\n\nlots of noise here",
			prNumber: null,
			kind: "github-issue-edit",
		};

		const collapse = () =>
			fireEvent.click(screen.getByRole("button", { name: "Collapse" }));

		it("wraps the selection in a details block shown in the pane", () => {
			const { container } = render(
				<PrPreviewPane preview={issueEdit} onDecision={vi.fn()} />,
			);

			selectText(container, "lots of noise");
			collapse();

			const details = container.querySelector("details");
			expect(details?.querySelector("summary")?.textContent).toBe(
				"Click to expand",
			);
			expect(details?.textContent).toContain("lots of noise here");
			expect(screen.queryByText("Comments (1)")).toBeNull();
			expect(container.querySelector("mark.pr-comment")).toBeNull();
		});

		it("sends the collapsed markdown as the body on approve", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={issueEdit} onDecision={onDecision} />,
			);

			selectText(container, "lots of noise");
			collapse();
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					body: "## Notes\n\n<details>\n<summary>Click to expand</summary>\n\nlots of noise here\n\n</details>",
				}),
			);
		});

		it("sends the edited body with Request changes alongside the comments", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={issueEdit} onDecision={onDecision} />,
			);

			selectText(container, "lots of noise");
			collapse();
			addComment(container, "Notes", "name the section");
			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);

			expect(onDecision).toHaveBeenCalledWith(
				"reject",
				expect.objectContaining({
					comments: [{ quote: "Notes", note: "name the section" }],
					body: expect.stringContaining("<summary>Click to expand</summary>"),
				}),
			);
		});

		it("still returns an unedited body when nothing was collapsed", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={issueEdit} onDecision={onDecision} />);

			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ body: issueEdit.body }),
			);
		});

		it("links the issue reference in the title to GitHub", () => {
			render(
				<PrPreviewPane
					preview={{
						...issueEdit,
						title: "Edit staff0rd/sandbox#8: Tidy the history",
					}}
					onDecision={vi.fn()}
				/>,
			);

			const link = screen.getByRole("link", { name: "staff0rd/sandbox#8" });
			expect(link.getAttribute("href")).toBe(
				"https://github.com/staff0rd/sandbox/issues/8",
			);
			expect(screen.getByText(/Tidy the history/)).toBeTruthy();
		});

		it("shows an Edit chip with no PR chain or screenshot UI", () => {
			render(<PrPreviewPane preview={issueEdit} onDecision={vi.fn()} />);

			expect(screen.getByText("Edit issue")).toBeTruthy();
			expect(screen.queryByText("New PR")).toBeNull();
			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
			expect(screen.queryByLabelText("Draft")).toBeNull();
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();
		});
	});

	describe("acceptance criteria outliner", () => {
		const criteriaBody = [
			"## Background",
			"",
			"why",
			"",
			"## Acceptance criteria",
			"",
			"1. first",
			"   1. nested",
			"",
			"## Notes",
			"",
			"tail",
		].join("\n");

		const issueEdit: PrPreview = {
			requestId: "e2",
			title: "Edit acme/widgets#7: Tidy the criteria",
			body: criteriaBody,
			prNumber: null,
			kind: "github-issue-edit",
		};

		const row = (number: string) =>
			screen.getByLabelText(`Criterion ${number}`) as HTMLTextAreaElement;

		it("replaces the section with a row per criterion at its source depth", () => {
			const { container } = render(
				<PrPreviewPane preview={issueEdit} onDecision={vi.fn()} />,
			);

			expect(row("1").value).toBe("first");
			expect(row("1.1").value).toBe("nested");
			expect(screen.getByText("1.1.")).toBeTruthy();
			expect(container.querySelector("ol")).toBeNull();
			expect(container.textContent).toContain("Background");
			expect(container.textContent).toContain("tail");
		});

		it("rewrites only the criteria section when a row is edited", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={issueEdit} onDecision={onDecision} />);

			fireEvent.change(row("1"), { target: { value: "first edited" } });
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({
					body: criteriaBody.replace("1. first", "1. first edited"),
				}),
			);
		});

		it("pushes the body unchanged when no criterion is touched", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={issueEdit} onDecision={onDecision} />);

			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ body: criteriaBody }),
			);
		});

		it("leaves a bulleted section rendered as markdown", () => {
			const { container } = render(
				<PrPreviewPane
					preview={{
						...issueEdit,
						requestId: "e3",
						body: "## Acceptance criteria\n\n- first\n- second",
					}}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.queryByLabelText("Criterion 1")).toBeNull();
			expect(container.querySelector("ul")).toBeTruthy();
		});

		const sectionBody = (...items: string[]) =>
			[
				"## Background",
				"",
				"why",
				"",
				"## Acceptance criteria",
				"",
				...items,
				"",
				"## Notes",
				"",
				"tail",
			].join("\n");

		const openWith = (requestId: string, ...items: string[]) => {
			const onDecision = vi.fn();
			render(
				<PrPreviewPane
					preview={{ ...issueEdit, requestId, body: sectionBody(...items) }}
					onDecision={onDecision}
				/>,
			);
			return onDecision;
		};

		const pushedBody = (onDecision: ReturnType<typeof vi.fn>) => {
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));
			const [, payload] = onDecision.mock.calls[0] as [
				string,
				{ body: string },
			];
			return payload.body;
		};

		const caretEnd = (field: HTMLTextAreaElement) => {
			field.setSelectionRange(field.value.length, field.value.length);
		};

		it("Enter splits a criterion into a sibling at the same depth", () => {
			const onDecision = openWith("k1", "1. first");
			const field = row("1");
			caretEnd(field);

			fireEvent.keyDown(field, { key: "Enter" });
			fireEvent.change(row("2"), { target: { value: "second" } });

			expect(pushedBody(onDecision)).toBe(sectionBody("1. first", "1. second"));
		});

		it("Tab indents a criterion three spaces under the one above", () => {
			const onDecision = openWith("k2", "1. first", "1. second");

			fireEvent.keyDown(row("2"), { key: "Tab" });

			expect(screen.getByLabelText("Criterion 1.1")).toBeTruthy();
			expect(pushedBody(onDecision)).toBe(
				sectionBody("1. first", "   1. second"),
			);
		});

		it("Shift+Tab outdents a criterion and carries its children", () => {
			const onDecision = openWith(
				"k3",
				"1. first",
				"   1. second",
				"      1. third",
			);

			fireEvent.keyDown(row("1.1"), { key: "Tab", shiftKey: true });

			expect(pushedBody(onDecision)).toBe(
				sectionBody("1. first", "1. second", "   1. third"),
			);
		});

		it("Alt+Down moves a criterion below its next sibling with its children", () => {
			const onDecision = openWith("k4", "1. a", "   1. a1", "1. b");

			fireEvent.keyDown(row("1"), { key: "ArrowDown", altKey: true });

			expect(pushedBody(onDecision)).toBe(
				sectionBody("1. b", "1. a", "   1. a1"),
			);
		});

		it("Alt+Up moves a criterion above its previous sibling with its children", () => {
			const onDecision = openWith("k5", "1. a", "1. b", "   1. b1");

			fireEvent.keyDown(row("2"), { key: "ArrowUp", altKey: true });

			expect(pushedBody(onDecision)).toBe(
				sectionBody("1. b", "   1. b1", "1. a"),
			);
		});

		it("Backspace on an empty criterion removes the row", () => {
			const onDecision = openWith("k6", "1. a", "1.", "1. c");

			fireEvent.keyDown(row("2"), { key: "Backspace" });

			expect(pushedBody(onDecision)).toBe(sectionBody("1. a", "1. c"));
		});

		it("adds and deletes criteria from the row controls", () => {
			const onDecision = openWith("k7", "1. first");

			fireEvent.click(
				screen.getByRole("button", { name: "Add criterion after 1" }),
			);
			fireEvent.change(row("2"), { target: { value: "second" } });
			fireEvent.click(
				screen.getByRole("button", { name: "Delete criterion 1" }),
			);

			expect(pushedBody(onDecision)).toBe(sectionBody("1. second"));
		});

		it("drops a criterion dragged by its grip below the last row", () => {
			const onDecision = openWith("k8", "1. a", "1. b", "1. c");
			const grip = screen.getByRole("button", { name: "Reorder criterion 1" });

			fireEvent.pointerDown(grip, { clientX: 0, clientY: 0 });
			fireEvent.pointerMove(grip, { clientX: 0, clientY: 999 });
			fireEvent.pointerUp(grip, { clientX: 0, clientY: 999 });

			expect(pushedBody(onDecision)).toBe(sectionBody("1. b", "1. c", "1. a"));
		});

		it("shows no outliner on a preview that is not editable", () => {
			render(
				<PrPreviewPane
					preview={{ ...issueEdit, requestId: "e4", kind: "github-issue" }}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.queryByLabelText("Criterion 1")).toBeNull();
		});
	});

	describe("Collapse is confined to the editable kind", () => {
		const noCollapse = (p: PrPreview) => {
			const { container, unmount } = render(
				<PrPreviewPane preview={p} onDecision={vi.fn()} />,
			);
			selectText(container, "Adds x");
			expect(screen.getByRole("button", { name: "Add comment" })).toBeTruthy();
			expect(screen.queryByRole("button", { name: "Collapse" })).toBeNull();
			unmount();
		};

		it("offers no Collapse button on a PR preview", () => {
			noCollapse(preview);
		});

		it("offers no Collapse button on an issue create preview", () => {
			noCollapse({ ...preview, requestId: "i1", kind: "github-issue" });
		});

		it("sends no body on a PR preview decision", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

			expect(onDecision.mock.calls[0][1]).not.toHaveProperty("body");
		});
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
