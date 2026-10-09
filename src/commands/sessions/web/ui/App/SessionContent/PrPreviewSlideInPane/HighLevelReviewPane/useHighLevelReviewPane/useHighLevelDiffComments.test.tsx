// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HighLevelCriticalDiff } from "../../../../../../../../review/highLevel/types";
import { makeSessionInfo } from "../../../../../../../../../test/mothers/makeSessionInfo";
import { CommentSentSnackbar } from "../../../../CommentSentSnackbar";
import type { SessionInfo } from "../../../../../types";
import { HighLevelCriticalDiffs } from "./highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelStructureView } from "./highLevelCheckDetails/HighLevelStructureView";
import { highLevelTreeFixture } from "./highLevelTreeFixture";
import { useHighLevelDiffComments } from "./useHighLevelDiffComments";

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

const liveSession = makeSessionInfo({
	id: "daemon-1",
	name: "review-42",
	commandType: "claude",
	status: "running",
});

const criticalDiff: HighLevelCriticalDiff = {
	path: "schema.graphql",
	status: "modified",
	additions: 1,
	deletions: 0,
	diffUrl: "https://github.com/o/r/pull/1/files#diff-def",
	patch: "@@ -1 +1,2 @@\n type Query\n+scalar Renamed",
};

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
	localStorage.clear();
	vi.unstubAllGlobals();
	(document as CaretDoc).caretRangeFromPoint = undefined;
	(document as CaretDoc).elementFromPoint = undefined;
});

function Harness({
	session,
	sendInput,
}: {
	session: SessionInfo | undefined;
	sendInput: (sessionId: string, data: string) => void;
}) {
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);
	return (
		<>
			<HighLevelStructureView
				subject="comments-test"
				structure={{
					tree: highLevelTreeFixture,
					added: 0,
					removed: 0,
					modified: 3,
					additions: 3,
					deletions: 3,
				}}
				comments={comments}
			/>
			<HighLevelCriticalDiffs
				diffs={[criticalDiff]}
				criticalPaths={["**/*.graphql"]}
				subject="comments-test"
				comments={comments}
			/>
			<CommentSentSnackbar sessionName={sentTo} onClose={clearSent} />
		</>
	);
}

function renderHarness(session: SessionInfo | undefined = liveSession) {
	const sendInput = vi.fn();
	render(<Harness session={session} sendInput={sendInput} />);
	return sendInput;
}

function textNodeContaining(root: Element, text: string): Text {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode())
		if (node.textContent?.includes(text)) return node as Text;
	throw new Error(`text not found: ${text}`);
}

function caretAt(node: Node, offset: number): Range {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	return range;
}

function selectWord(root: Element, word: string) {
	const node = textNodeContaining(root, word);
	const idx = (node.textContent ?? "").indexOf(word);
	const cell = node.parentElement as Element;

	(document as CaretDoc).elementFromPoint = vi.fn().mockReturnValue(cell);
	(document as CaretDoc).caretRangeFromPoint = vi
		.fn()
		.mockReturnValueOnce(caretAt(node, idx))
		.mockReturnValue(caretAt(node, idx + word.length));

	fireEvent.mouseDown(cell, { clientX: 1, clientY: 1 });
	act(() => {
		globalThis.dispatchEvent(
			new MouseEvent("mouseup", { clientX: 2, clientY: 1, bubbles: true }),
		);
	});
}

function submitNote(note: string) {
	fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
	fireEvent.click(screen.getByRole("button", { name: "Add comment" }));
}

function openSecondStructureFile() {
	fireEvent.click(screen.getByLabelText("Show the diff of src/lib/util.ts"));
	fireEvent.click(screen.getByRole("button", { name: "Next" }));
	return screen.getByRole("dialog");
}

describe("useHighLevelDiffComments", () => {
	it("sends a comment on the structure dialog's diff to the review session", () => {
		const sendInput = renderHarness();

		selectWord(openSecondStructureFile(), "now");
		submitNote("why rename?");

		const [sessionId, data] = sendInput.mock.calls[0] as [string, string];
		expect(sessionId).toBe("daemon-1");
		expect(data).toContain("src/app.ts:1");
		expect(data).toContain("now");
		expect(data).toContain("why rename?");
	});

	it("sends a comment on a critical diff to the review session", () => {
		const sendInput = renderHarness();

		selectWord(document.body, "Renamed");
		submitNote("is this breaking?");

		const [sessionId, data] = sendInput.mock.calls[0] as [string, string];
		expect(sessionId).toBe("daemon-1");
		expect(data).toContain("schema.graphql:2");
		expect(data).toContain("Renamed");
		expect(data).toContain("is this breaking?");
	});

	it("confirms the comment reached the session", async () => {
		renderHarness();

		selectWord(document.body, "Renamed");
		submitNote("is this breaking?");

		expect(await screen.findByText("Comment sent to review-42")).toBeTruthy();
	});

	it("explains that commenting is unavailable once the session stops", async () => {
		const sendInput = renderHarness({ ...liveSession, status: "stopped" });

		selectWord(document.body, "Renamed");

		expect(
			await screen.findByText(
				"Comments are unavailable — that session is no longer live.",
			),
		).toBeTruthy();
		expect(screen.queryByPlaceholderText("Add a note…")).toBeNull();
		expect(sendInput).not.toHaveBeenCalled();
	});
});
