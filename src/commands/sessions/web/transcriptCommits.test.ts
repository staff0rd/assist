import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { execGit } from "./execGit";
import { transcriptCommits } from "./transcriptCommits";
import { parseTranscriptCommitShas } from "./parseTranscriptCommitShas";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(),
}));

const execGitMock = vi.mocked(execGit);
const findTranscriptPathSyncMock = vi.mocked(findTranscriptPathSync);

function toolResult(content: unknown): string {
	return JSON.stringify({
		type: "user",
		message: {
			role: "user",
			content: [{ type: "tool_result", tool_use_id: "t", content }],
		},
	});
}

function assistantText(text: string): string {
	return JSON.stringify({
		type: "assistant",
		message: { role: "assistant", content: [{ type: "text", text }] },
	});
}

describe("parseTranscriptCommitShas", () => {
	it("reads git commit and assist commit output from tool results", () => {
		const transcript = [
			toolResult("[pr-branch f16e93bc] Fix the thing\n 1 file changed"),
			toolResult([{ type: "text", text: "Committed: abc1234def" }]),
			toolResult("[main (root-commit) 0123abc] Initial"),
			toolResult("[detached HEAD 9876fed] Detached"),
		].join("\n");

		expect(parseTranscriptCommitShas(transcript)).toEqual([
			"f16e93bc",
			"abc1234def",
			"0123abc",
			"9876fed",
		]);
	});

	it("ignores commit-like text outside tool results", () => {
		const transcript = assistantText("[pr-branch f16e93bc] Fix the thing");

		expect(parseTranscriptCommitShas(transcript)).toEqual([]);
	});

	it("skips malformed lines", () => {
		expect(parseTranscriptCommitShas('{"tool_result" not json')).toEqual([]);
	});
});

describe("transcriptCommits", () => {
	let dir: string;

	beforeEach(() => {
		vi.clearAllMocks();
		dir = fs.mkdtempSync(path.join(os.tmpdir(), "transcript-commits-"));
	});

	afterEach(() => {
		fs.rmSync(dir, { recursive: true, force: true });
	});

	function withTranscript(...lines: string[]): void {
		const file = path.join(dir, "session.jsonl");
		fs.writeFileSync(file, lines.join("\n"));
		findTranscriptPathSyncMock.mockReturnValue(file);
	}

	function withRepo(onHead: Record<string, string>): void {
		execGitMock.mockImplementation(async (_cwd, args) => {
			if (args[0] === "rev-parse") {
				const short = String(args[3]).replace("^{commit}", "");
				const full = Object.keys(onHead).find((sha) => sha.startsWith(short));
				if (!full) throw new Error("unknown revision");
				return `${full}\n`;
			}
			if (args[0] === "merge-base" && onHead[String(args[2])] === "head")
				return "";
			throw new Error("not an ancestor");
		});
	}

	it("returns no commits when the transcript cannot be found", async () => {
		findTranscriptPathSyncMock.mockReturnValue(null);

		expect(await transcriptCommits("/repo", "sess")).toEqual([]);
	});

	it("keeps only commits reachable from HEAD, resolved and deduplicated", async () => {
		withTranscript(
			toolResult("[pr-branch f16e93bc] Fix"),
			toolResult("[pr-branch f16e93b] Fix again"),
			toolResult("[pr-branch aaaa111] Amended away"),
		);
		withRepo({ f16e93bcd40db3e5: "head", aaaa1112222: "dangling" });

		expect(await transcriptCommits("/repo", "sess")).toEqual([
			{ sha: "f16e93bcd40db3e5" },
		]);
	});
});
