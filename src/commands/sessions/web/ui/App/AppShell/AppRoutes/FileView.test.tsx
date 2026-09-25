// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ScopedRule } from "../../../../../../rules/types";
import { FileView } from "./FileView";
import type { SessionInfo } from "../../../types";
import { RepoSelectionContext } from "../../../useRepoSelectionContext";

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

type CaretDoc = {
	caretRangeFromPoint?: ((x: number, y: number) => Range | null) | undefined;
	elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};

vi.mock("../../../../../../backlog/web/ui/components/MarkdownBlock", () => ({
	MarkdownBlock: ({ content }: { content: string }) => (
		<div data-testid="markdown">{content.replaceAll("**", "")}</div>
	),
}));

vi.mock("./FileView/FileViewBody/MonacoEditor", () => ({
	MonacoEditor: ({
		value,
		language,
		readOnly,
		onChange,
	}: {
		value: string;
		language?: string;
		readOnly?: boolean;
		onChange?: (value: string) => void;
	}) => (
		<textarea
			data-testid="editor"
			data-language={language ?? ""}
			data-read-only={String(Boolean(readOnly))}
			value={value}
			onChange={(event) => onChange?.(event.target.value)}
		/>
	),
}));

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	(document as CaretDoc).caretRangeFromPoint = undefined;
	(document as CaretDoc).elementFromPoint = undefined;
});

type SaveResponse = {
	ok: boolean;
	status: number;
	body: Record<string, unknown>;
};

const LOADED_MTIME = 1000;

function stubContent(
	content: string,
	save?: SaveResponse,
	rules: ScopedRule[] = [],
) {
	const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
		if (init?.method === "POST" && save)
			return { ok: save.ok, status: save.status, json: async () => save.body };
		if (url.startsWith("/api/rules"))
			return { ok: true, status: 200, json: async () => ({ rules }) };
		return {
			ok: true,
			status: 200,
			json: async () => ({ content, mtimeMs: LOADED_MTIME }),
		};
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function renderView(
	entry: string,
	worktreeCwd = "/repo",
	comments: {
		sessions?: SessionInfo[];
		cardId?: string | null;
		sendInput?: (sessionId: string, data: string) => void;
	} = {},
) {
	const router = createMemoryRouter(
		[
			{
				path: "*",
				element: (
					<RepoSelectionContext.Provider
						value={{
							repos: [],
							selectedCwd: "/repo",
							worktreeCwd,
							setSelectedCwd: vi.fn(),
						}}
					>
						<FileView
							sessions={comments.sessions ?? []}
							sendInput={comments.sendInput ?? vi.fn()}
							cardId={comments.cardId ?? null}
						/>
					</RepoSelectionContext.Provider>
				),
			},
		],
		{ initialEntries: [entry] },
	);
	render(<RouterProvider router={router} />);
	return router;
}

function editor(): HTMLElement | null {
	return screen.queryByTestId("editor");
}

async function findEditor(): Promise<HTMLTextAreaElement> {
	return (await screen.findByTestId("editor")) as HTMLTextAreaElement;
}

function editorValue(): string {
	return (screen.getByTestId("editor") as HTMLTextAreaElement).value;
}

function postCall(fetchMock: ReturnType<typeof stubContent>) {
	const call = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
	if (!call) throw new Error("no save request was sent");
	return { url: call[0], body: JSON.parse(String(call[1]?.body)) };
}

describe("FileView", () => {
	it("renders the file in the editor", async () => {
		stubContent("const a = 1;\nconst b = 2;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).value).toBe("const a = 1;\nconst b = 2;\n");
	});

	it("resolves the editor language from the extension", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).dataset.language).toBe("typescript");
	});

	it("leaves the language unset for an unknown extension", async () => {
		stubContent("plain\n");

		renderView("/file?path=notes.unknownext");

		expect((await findEditor()).dataset.language).toBe("");
	});

	it("opens the editor for editing", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).dataset.readOnly).toBe("false");
	});

	it("keeps edits in the buffer", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});

		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("saves the buffer and replaces it with the formatted text", async () => {
		const fetchMock = stubContent("const  a =1\n", {
			ok: true,
			status: 200,
			body: { content: "const a = 2;\n", mtimeMs: 2000 },
		});

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const  a =2\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(editorValue()).toBe("const a = 2;\n"));
		const { url, body } = postCall(fetchMock);
		expect(url).toContain("path=src%2Fa.ts");
		expect(body).toEqual({
			content: "const  a =2\n",
			mtimeMs: LOADED_MTIME,
		});
	});

	it("saves on ctrl+s", async () => {
		const fetchMock = stubContent("const a = 1;\n", {
			ok: true,
			status: 200,
			body: { content: "const a = 2;\n", mtimeMs: 2000 },
		});

		renderView("/file?path=src/a.ts");
		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});

		fireEvent.keyDown(document, { key: "s", ctrlKey: true });

		await waitFor(() =>
			expect(postCall(fetchMock).body).toEqual({
				content: "const a = 2;\n",
				mtimeMs: LOADED_MTIME,
			}),
		);
	});

	it("sends the modification time the save returned on the next save", async () => {
		const fetchMock = stubContent("const a = 1;\n", {
			ok: true,
			status: 200,
			body: { content: "const a = 2;\n", mtimeMs: 2000 },
		});

		renderView("/file?path=src/a.ts");
		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));
		await waitFor(() => expect(editorValue()).toBe("const a = 2;\n"));

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 3;\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => {
			const posts = fetchMock.mock.calls.filter(
				([, init]) => init?.method === "POST",
			);
			expect(JSON.parse(String(posts.at(-1)?.[1]?.body)).mtimeMs).toBe(2000);
		});
	});

	it("disables save until the buffer is edited", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");
		await findEditor();

		expect(
			(screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});

		expect(
			(screen.getByRole("button", { name: "Save" }) as HTMLButtonElement)
				.disabled,
		).toBe(false);
	});

	it("reports a stale file and keeps the buffer", async () => {
		stubContent("const a = 1;\n", {
			ok: false,
			status: 409,
			body: { error: "The file changed on disk since it was opened" },
		});

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		expect(
			await screen.findByText("The file changed on disk since it was opened"),
		).toBeTruthy();
		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("prompts before navigating away from a dirty buffer", async () => {
		stubContent("const a = 1;\n");

		const router = renderView("/file?path=src/a.ts");
		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});

		router.navigate("/sessions");

		expect(await screen.findByText("Discard unsaved changes?")).toBeTruthy();
		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("leaves the buffer in place when the prompt is cancelled", async () => {
		stubContent("const a = 1;\n");

		const router = renderView("/file?path=src/a.ts");
		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		router.navigate("/sessions");
		fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));

		await waitFor(() =>
			expect(screen.queryByText("Discard unsaved changes?")).toBeNull(),
		);
		expect(router.state.location.pathname).toBe("/file");
		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("navigates on when the prompt is confirmed", async () => {
		stubContent("const a = 1;\n");

		const router = renderView("/file?path=src/a.ts");
		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		router.navigate("/sessions");
		fireEvent.click(await screen.findByRole("button", { name: "Discard" }));

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/sessions"),
		);
	});

	it("navigates away without prompting when the buffer is clean", async () => {
		stubContent("const a = 1;\n");

		const router = renderView("/file?path=src/a.ts");
		await findEditor();

		router.navigate("/sessions");

		await waitFor(() =>
			expect(router.state.location.pathname).toBe("/sessions"),
		);
		expect(screen.queryByText("Discard unsaved changes?")).toBeNull();
	});

	it("reports a failed save and keeps the buffer", async () => {
		stubContent("const a = 1;\n", {
			ok: false,
			status: 400,
			body: { error: "Path outside cwd" },
		});

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		expect(await screen.findByText("Path outside cwd")).toBeTruthy();
		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("toggles markdown between raw and rendered", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		expect((await findEditor()).value).toBe("# Title\n");
		expect(screen.queryByTestId("markdown")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Rendered" }));

		expect(screen.getByTestId("markdown").textContent).toBe("# Title\n");
		expect(editor()).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Raw" }));

		expect(screen.queryByTestId("markdown")).toBeNull();
		expect(editorValue()).toBe("# Title\n");
	});

	it("offers no toggle for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await findEditor();
		expect(screen.queryByRole("button", { name: "Rendered" })).toBeNull();
	});

	it("offers a close button for markdown files", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		await findEditor();
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("offers a close button for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await findEditor();
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("asks for a repo when none is selected", () => {
		renderView("/file?path=src/a.ts", "");

		expect(screen.getByText("Select a repo to view files.")).toBeTruthy();
	});

	it("reads the file from the active worktree, not the clone", async () => {
		const fetchMock = stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts", "/repo/.worktrees/feature");

		await findEditor();
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/file?cwd=%2Frepo%2F.worktrees%2Ffeature&path=src%2Fa.ts",
		);
	});

	it("prefers the cwd pinned in the url over the current selection", async () => {
		const fetchMock = stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts&cwd=/repo/.worktrees/pinned", "/other");

		await findEditor();
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/file?cwd=%2Frepo%2F.worktrees%2Fpinned&path=src%2Fa.ts",
		);
	});

	it("saves back to the cwd pinned in the url", async () => {
		const fetchMock = stubContent("const a = 1;\n");
		renderView("/file?path=src/a.ts&cwd=/repo/.worktrees/pinned", "/other");
		const area = await findEditor();

		fireEvent.change(area, { target: { value: "const a = 2;\n" } });
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => postCall(fetchMock));
		expect(postCall(fetchMock).url).toBe(
			"/api/file?cwd=%2Frepo%2F.worktrees%2Fpinned&path=src%2Fa.ts",
		);
	});

	it("reports a missing file", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 404 }),
		);

		renderView("/file?path=src/gone.ts");

		expect(
			await screen.findByText("This file is not in the working tree."),
		).toBeTruthy();
		await waitFor(() => expect(editor()).toBeNull());
	});

	it("reports a file that is too large", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 413 }),
		);

		renderView("/file?path=src/huge.ts");

		expect(
			await screen.findByText("This file is too large to display (over 2 MB)."),
		).toBeTruthy();
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

async function openRendered(
	comments: Parameters<typeof renderView>[2],
	rules: ScopedRule[] = [],
): Promise<void> {
	stubContent(DOC, undefined, rules);
	renderView("/file?path=docs/notes.md", "/repo", comments);
	await screen.findByTestId("editor");
	fireEvent.click(screen.getByRole("button", { name: "Rendered" }));
}

function note(text: string) {
	fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
		target: { value: text },
	});
}

describe("FileView comments in rendered mode", () => {
	it("sends the path, line range, quote and note to the active session", async () => {
		const sendInput = vi.fn();
		await openRendered({
			sessions: [liveSession],
			cardId: "daemon-1",
			sendInput,
		});

		selectQuote("first paragraph\nwraps");
		note("tighten this");
		fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

		const [sessionId, data] = sendInput.mock.calls[0] as [string, string];
		expect(sessionId).toBe("daemon-1");
		expect(data).toContain("docs/notes.md:3-4");
		expect(data).toContain("first paragraph");
		expect(data).toContain("tighten this");
		expect(await screen.findByText("Comment sent to one")).toBeTruthy();
	});

	it("submits the comment in the terminal", async () => {
		const sendInput = vi.fn();
		await openRendered({
			sessions: [liveSession],
			cardId: "daemon-1",
			sendInput,
		});

		selectQuote("first paragraph");
		note("why");
		fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

		await waitFor(() =>
			expect(sendInput).toHaveBeenLastCalledWith("daemon-1", "\r"),
		);
	});

	it("carries the path alone when the quote is not in the raw file", async () => {
		const sendInput = vi.fn();
		await openRendered({
			sessions: [liveSession],
			cardId: "daemon-1",
			sendInput,
		});

		selectQuote("bold claim");
		note("say which claim");
		fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

		const data = sendInput.mock.calls[0]?.[1] as string;
		expect(data).toContain("docs/notes.md\r");
		expect(data).not.toContain("docs/notes.md:");
		expect(data).toContain("bold claim");
		expect(data).toContain("say which claim");
	});

	it("cites a scoped rule against the located lines", async () => {
		const sendInput = vi.fn();
		await openRendered(
			{ sessions: [liveSession], cardId: "daemon-1", sendInput },
			[{ code: "R1", text: "Keep it tight", source: "CLAUDE.md" }],
		);

		selectQuote("first paragraph");
		fireEvent.click(await screen.findByText("R1"));

		const data = sendInput.mock.calls[0]?.[1] as string;
		expect(data).toContain("docs/notes.md:3");
		expect(data).toContain("breaks rule R1 (CLAUDE.md) — Keep it tight");
	});

	it("offers add rule alongside the note", async () => {
		const sendInput = vi.fn();
		await openRendered({
			sessions: [liveSession],
			cardId: "daemon-1",
			sendInput,
		});

		selectQuote("first paragraph");
		note("keep paragraphs short");
		fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

		expect(sendInput.mock.calls[0]?.[1]).toContain("/add-rule");
	});

	it("explains that commenting is unavailable without a live session", async () => {
		const sendInput = vi.fn();
		await openRendered({ sessions: [], cardId: null, sendInput });

		selectQuote("first paragraph");

		expect(
			await screen.findByText("Select a session card to comment on this file."),
		).toBeTruthy();
		expect(screen.queryByPlaceholderText("Add a note…")).toBeNull();
		expect(sendInput).not.toHaveBeenCalled();
	});
});
