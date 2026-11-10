// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import type { HunkData, ViewType } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiNodeContext } from "../../useApiNode";
import { DiffHeadSourceProvider } from "./DiffHeadSourceProvider";
import { FileDiff } from "./FileDiff";
import { diffFileDomId } from "./diffFileDomId";
import { useStableDiffFiles } from "./useDiffContent/useDiffFileData/useStableDiffFiles";
import { filePath } from "./filePath";

const commentHunks = new Map<string, HunkData[]>();

vi.mock("../DiffCommentLayer", () => ({
	DiffCommentLayer: ({
		path,
		hunks,
		children,
	}: {
		path: string;
		hunks: HunkData[];
		children: ReactNode;
	}) => {
		commentHunks.set(path, hunks);
		return <>{children}</>;
	},
}));

const head = (name: string) =>
	`${Array.from({ length: 60 }, (_, i) => `const ${name}${i + 1} = ${i + 1};`).join("\n")}\n`;

function context(from: number, to: number) {
	return Array.from(
		{ length: to - from + 1 },
		(_, i) => ` const x${from + i} = ${from + i};`,
	);
}

function modified(path: string, line: number, replacement: string) {
	return [
		`diff --git a/${path} b/${path}`,
		"index 1111111..2222222 100644",
		`--- a/${path}`,
		`+++ b/${path}`,
		`@@ -${line - 3},7 +${line - 3},7 @@`,
		...context(line - 3, line - 1),
		`-const x${line} = ${line};`,
		`+${replacement}`,
		...context(line + 1, line + 3),
		"",
	].join("\n");
}

const added = [
	"diff --git a/new.ts b/new.ts",
	"new file mode 100644",
	"index 0000000..3333333",
	"--- /dev/null",
	"+++ b/new.ts",
	"@@ -0,0 +1,2 @@",
	"+const n = 1;",
	"+const m = 2;",
	"",
].join("\n");

const deleted = [
	"diff --git a/gone.ts b/gone.ts",
	"deleted file mode 100644",
	"index 4444444..0000000",
	"--- a/gone.ts",
	"+++ /dev/null",
	"@@ -1,1 +0,0 @@",
	"-const g = 1;",
	"",
].join("\n");

const binary = [
	"diff --git a/logo.png b/logo.png",
	"index 1111111..2222222 100644",
	"Binary files a/logo.png and b/logo.png differ",
	"",
].join("\n");

function Harness({
	diff,
	scope = "all",
	viewType = "unified",
}: {
	diff: string;
	scope?: string;
	viewType?: ViewType;
}) {
	const files = useStableDiffFiles(diff);
	return (
		<DiffHeadSourceProvider cwd="/repo" scope={scope} files={files}>
			{files.map((file) => (
				<FileDiff
					key={filePath(file)}
					file={file}
					viewType={viewType}
					cwd="/repo"
					collapsed={false}
					onToggle={() => {}}
				/>
			))}
		</DiffHeadSourceProvider>
	);
}

function serveFiles(contents: Record<string, string | number>) {
	const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
		const url = new URL(String(input), "http://x");
		const content = contents[url.searchParams.get("path") ?? ""];
		if (typeof content === "number")
			return Response.json({}, { status: content });
		return Response.json({ content, mtimeMs: 1 });
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function fileCard(path: string) {
	const card = document.getElementById(diffFileDomId(path));
	if (!card) throw new Error(`no card for ${path}`);
	return within(card);
}

function rowText(path: string, text: string) {
	const card = document.getElementById(diffFileDomId(path));
	return (
		[...(card?.querySelectorAll("tr") ?? [])].find((row) =>
			row.textContent?.includes(text),
		) ?? null
	);
}

afterEach(() => {
	cleanup();
	commentHunks.clear();
	vi.unstubAllGlobals();
});

describe("session diff gap expansion", () => {
	it("replaces hunk headers with expanders above and below a modified file's hunk", () => {
		render(<Harness diff={modified("a.ts", 30, "const X = 0;")} />);

		const card = fileCard("a.ts");
		expect(
			card.getByRole("button", { name: "Show 20 lines above" }),
		).toBeTruthy();
		expect(
			card.getByRole("button", { name: "Show 20 lines below" }),
		).toBeTruthy();
		for (const header of card.getAllByText(/^@@/))
			expect(header.closest(".diff-gap")).toBeTruthy();
	});

	it.each(["unified", "split"] as const)(
		"reveals 20 lines above and below from the working tree in %s view",
		async (viewType) => {
			const fetchMock = serveFiles({ "a.ts": head("x") });
			render(
				<Harness
					diff={modified("a.ts", 30, "const X = 0;")}
					viewType={viewType}
				/>,
			);

			fireEvent.click(
				fileCard("a.ts").getByRole("button", { name: "Show 20 lines above" }),
			);
			await waitFor(() =>
				expect(rowText("a.ts", "const x7 = 7;")).toBeTruthy(),
			);
			expect(rowText("a.ts", "const x6 = 6;")).toBeNull();

			fireEvent.click(
				fileCard("a.ts").getByRole("button", { name: "Show 20 lines below" }),
			);
			await waitFor(() =>
				expect(rowText("a.ts", "const x53 = 53;")).toBeTruthy(),
			);
			expect(rowText("a.ts", "const x54 = 54;")).toBeNull();
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
				"/api/file?cwd=%2Frepo&path=a.ts",
			);
		},
	);

	it("reads the file through the selected node", async () => {
		const fetchMock = serveFiles({ "a.ts": head("x") });
		render(
			<ApiNodeContext.Provider value="laptop">
				<Harness diff={modified("a.ts", 30, "const X = 0;")} />
			</ApiNodeContext.Provider>,
		);

		fireEvent.click(
			fileCard("a.ts").getByRole("button", { name: "Show 20 lines above" }),
		);

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
			"/api/file?cwd=%2Frepo&path=a.ts&node=laptop",
		);
	});

	it("passes the expanded lines to the comment layer", async () => {
		serveFiles({ "a.ts": head("x") });
		render(<Harness diff={modified("a.ts", 30, "const X = 0;")} />);

		fireEvent.click(
			fileCard("a.ts").getByRole("button", { name: "Show 20 lines above" }),
		);

		await waitFor(() =>
			expect(
				commentHunks
					.get("a.ts")
					?.flatMap((hunk) => hunk.changes)
					.some((change) => change.content === "const x7 = 7;"),
			).toBe(true),
		);
	});

	it("shows no expanders for added, deleted and binary files", () => {
		render(<Harness diff={[added, deleted, binary].join("")} />);

		expect(screen.queryByRole("button", { name: /^Show / })).toBeNull();
	});

	it("shows no expanders in a single-commit scope", () => {
		render(
			<Harness diff={modified("a.ts", 30, "const X = 0;")} scope="abc1234" />,
		);

		expect(screen.queryByRole("button", { name: /^Show / })).toBeNull();
	});

	it("shows the error with a retry when the file is too large, then loads on retry", async () => {
		const fetchMock = serveFiles({ "a.ts": 413 });
		render(<Harness diff={modified("a.ts", 30, "const X = 0;")} />);

		fireEvent.click(
			fileCard("a.ts").getByRole("button", { name: "Show 20 lines above" }),
		);
		await waitFor(() =>
			expect(
				fileCard("a.ts").getByText(
					/Couldn't load this file from the working tree: the file is too large/,
				),
			).toBeTruthy(),
		);
		expect(rowText("a.ts", "const X = 0;")).toBeTruthy();

		fetchMock.mockResolvedValueOnce(
			Response.json({ content: head("x"), mtimeMs: 1 }),
		);
		fireEvent.click(fileCard("a.ts").getByRole("button", { name: "Retry" }));

		await waitFor(() => expect(rowText("a.ts", "const x7 = 7;")).toBeTruthy());
	});

	it("resets only the file whose diff changed on a poll", async () => {
		const fetchMock = serveFiles({ "a.ts": head("x"), "b.ts": head("x") });
		const a = modified("a.ts", 30, "const X = 0;");
		const b = modified("b.ts", 30, "const B = 0;");
		const { rerender } = render(<Harness diff={a + b} />);

		for (const path of ["a.ts", "b.ts"]) {
			fireEvent.click(
				fileCard(path).getByRole("button", { name: "Show 20 lines above" }),
			);
			await waitFor(() => expect(rowText(path, "const x7 = 7;")).toBeTruthy());
		}

		await act(async () =>
			rerender(<Harness diff={a + modified("b.ts", 30, "const B = 1;")} />),
		);

		expect(rowText("a.ts", "const x7 = 7;")).toBeTruthy();
		expect(rowText("b.ts", "const x7 = 7;")).toBeNull();

		fireEvent.click(
			fileCard("b.ts").getByRole("button", { name: "Show 20 lines above" }),
		);
		await waitFor(() => expect(rowText("b.ts", "const x7 = 7;")).toBeTruthy());
		expect(
			fetchMock.mock.calls.filter(([url]) => String(url).includes("b.ts")),
		).toHaveLength(2);
	});
});
