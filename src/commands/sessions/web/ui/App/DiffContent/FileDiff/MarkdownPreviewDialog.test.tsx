// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarkdownPreviewDialog } from "./MarkdownPreviewDialog";
import type { SessionInfo } from "../../../types";
import { useDiffComments } from "../useDiffContent/useDiffComments";

vi.mock("../../../../../../backlog/web/ui/components/MarkdownBlock", () => ({
	MarkdownBlock: ({ content, wide }: { content: string; wide?: boolean }) => (
		<div data-testid="markdown" data-wide={wide ? "true" : "false"}>
			{content.replaceAll("**", "")}
		</div>
	),
}));

type CaretDoc = {
	caretRangeFromPoint?: ((x: number, y: number) => Range | null) | undefined;
	elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};

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

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	(document as CaretDoc).caretRangeFromPoint = undefined;
	(document as CaretDoc).elementFromPoint = undefined;
});

function stubFetch(response: Partial<Response>) {
	const fetch = vi.fn().mockResolvedValue(response);
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

describe("MarkdownPreviewDialog", () => {
	it("reports a file that vanished from the working tree", async () => {
		stubFetch({ ok: false, status: 404 });

		render(
			<MarkdownPreviewDialog
				cwd="/repo"
				path="docs/gone.md"
				onClose={vi.fn()}
			/>,
		);

		expect(
			await screen.findByText("This file is no longer in the working tree."),
		).toBeTruthy();
	});

	it("reports a file that is too large", async () => {
		stubFetch({ ok: false, status: 413 });

		render(
			<MarkdownPreviewDialog
				cwd="/repo"
				path="docs/big.md"
				onClose={vi.fn()}
			/>,
		);

		expect(
			await screen.findByText("This file is too large to display (over 2 MB)."),
		).toBeTruthy();
	});

	it("reports a server error", async () => {
		stubFetch({ ok: false, status: 500 });

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("reports an error when the fetch rejects", async () => {
		const fetch = vi.fn().mockRejectedValue(new Error("offline"));
		vi.stubGlobal("fetch", fetch);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("reports an error when no cwd is known and does not fetch", () => {
		const fetch = stubFetch({ ok: true, status: 200 });

		render(
			<MarkdownPreviewDialog
				cwd={undefined}
				path="docs/a.md"
				onClose={vi.fn()}
			/>,
		);

		expect(screen.getByText("Couldn't load this file.")).toBeTruthy();
		expect(fetch).not.toHaveBeenCalled();
	});

	it("reports an error when the payload has no content", async () => {
		stubFetch({ ok: true, status: 200, json: async () => ({}) } as Response);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("renders the file content unclamped", async () => {
		stubFetch({
			ok: true,
			status: 200,
			json: async () => ({ content: "# Title" }),
		} as Response);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		const block = await screen.findByText("# Title");
		expect(block.dataset.wide).toBe("true");
	});
});

const DOC =
	"# Notes\n\nThe first paragraph\nwraps over two lines.\n\nA **bold** claim here.\n";

const liveSession = {
	id: "daemon-1",
	claudeSessionId: "claude-1",
	name: "one",
	commandType: "claude",
	startedAt: 0,
	status: "running",
} as SessionInfo;

function stubDoc() {
	const fetch = vi.fn(async (url: string) =>
		url.startsWith("/api/rules")
			? { ok: true, status: 200, json: async () => ({ rules: [] }) }
			: { ok: true, status: 200, json: async () => ({ content: DOC }) },
	);
	vi.stubGlobal("fetch", fetch);
}

function Harness({
	sessions,
	claudeSessionId,
	sendInput,
}: {
	sessions: SessionInfo[];
	claudeSessionId: string | undefined;
	sendInput: (sessionId: string, data: string) => void;
}) {
	const comments = useDiffComments(sessions, claudeSessionId, sendInput);
	return (
		<MarkdownPreviewDialog
			cwd="/repo"
			path="docs/notes.md"
			onComment={comments.onFileComment}
			onAddRule={comments.onAddRule}
			unavailable={comments.unavailable}
			onClose={vi.fn()}
		/>
	);
}

async function openPreview(
	sendInput: (sessionId: string, data: string) => void,
	target: { sessions: SessionInfo[]; claudeSessionId: string | undefined } = {
		sessions: [liveSession],
		claudeSessionId: "claude-1",
	},
) {
	stubDoc();
	render(<Harness {...target} sendInput={sendInput} />);
	await screen.findByTestId("markdown");
}

function caretAt(node: Node, offset: number): Range {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	return range;
}

function selectQuote(text: string) {
	const root = screen.getByTestId("markdown");
	const node = root.firstChild as Node;
	const idx = (node.textContent ?? "").indexOf(text);
	if (idx === -1) throw new Error(`text not found: ${text}`);

	(document as CaretDoc).elementFromPoint = vi.fn().mockReturnValue(root);
	(document as CaretDoc).caretRangeFromPoint = vi
		.fn()
		.mockReturnValueOnce(caretAt(node, idx))
		.mockReturnValue(caretAt(node, idx + text.length));

	fireEvent.mouseDown(root, { clientX: 1, clientY: 1 });
	act(() => {
		globalThis.dispatchEvent(
			new MouseEvent("mouseup", { clientX: 2, clientY: 1, bubbles: true }),
		);
	});
}

describe("MarkdownPreviewDialog comments", () => {
	it("sends the path, line range, quote and note to the diff's session", async () => {
		const sendInput = vi.fn();
		await openPreview(sendInput);

		selectQuote("first paragraph\nwraps");
		fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
			target: { value: "tighten this" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

		const [sessionId, data] = sendInput.mock.calls[0] as [string, string];
		expect(sessionId).toBe("daemon-1");
		expect(data).toContain("docs/notes.md:3-4");
		expect(data).toContain("first paragraph");
		expect(data).toContain("tighten this");
	});

	it("explains that commenting is unavailable without a live session", async () => {
		const sendInput = vi.fn();
		await openPreview(sendInput, {
			sessions: [],
			claudeSessionId: undefined,
		});

		selectQuote("first paragraph");

		expect(
			await screen.findByText(
				"Open this diff from a session card to comment on it.",
			),
		).toBeTruthy();
		expect(screen.queryByPlaceholderText("Add a note…")).toBeNull();
		expect(sendInput).not.toHaveBeenCalled();
	});
});
