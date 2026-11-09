import { beforeEach, describe, expect, it, vi } from "vitest";
import { claudeConversationReader } from "../../../shared/harnessAdapters/claudeConversationReader";
import { codexConversationReader } from "../../../shared/harnessAdapters/codexConversationReader";
import type * as harnessAdapterModule from "../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../shared/harnesses";
import { fakeHarnessMock } from "../../../test/mocks/fakeHarnessMock";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { execGit } from "./execGit";
import { parseTranscriptCommitShas } from "./parseTranscriptCommitShas";
import { transcriptCommits } from "./transcriptCommits";

const fake = fakeHarnessMock();
const FAKE = "fake" as HarnessKind;

vi.mock("../../../shared/harnessAdapters/harnessAdapter", async (original) => {
	const actual = await original<typeof harnessAdapterModule>();
	return {
		harnessAdapter: (kind: HarnessKind | undefined) =>
			(kind as string) === "fake" ? fake : actual.harnessAdapter(kind),
	};
});
vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTail: vi.fn(),
}));
vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: (_cwd: string, id: string) => `/claude/${id}.jsonl`,
	projectDirForCwd: () => "/claude",
}));
vi.mock("../shared/codex/findCodexRolloutPathSync", () => ({
	findCodexRolloutPathSync: (id: string) => `/codex/${id}.jsonl`,
}));

const execGitMock = vi.mocked(execGit);
const transcripts = new Map<string, Record<string, unknown>[]>();

function claudeResult(content: unknown) {
	return {
		type: "user",
		message: {
			role: "user",
			content: [{ type: "tool_result", tool_use_id: "t", content }],
		},
	};
}

function claudeText(text: string) {
	return {
		type: "assistant",
		message: { role: "assistant", content: [{ type: "text", text }] },
	};
}

function codexCommand(output: string) {
	return {
		type: "event_msg",
		payload: {
			type: "item_completed",
			item: { type: "CommandExecution", aggregated_output: output },
		},
	};
}

describe("parseTranscriptCommitShas", () => {
	it("reads git commit and assist commit output from Claude tool results", () => {
		const events = claudeConversationReader.events([
			claudeResult("[pr-branch f16e93bc] Fix the thing\n 1 file changed"),
			claudeResult([{ type: "text", text: "Committed: abc1234def" }]),
			claudeResult("[main (root-commit) 0123abc] Initial"),
			claudeResult("[detached HEAD 9876fed] Detached"),
		]);

		expect(parseTranscriptCommitShas(events)).toEqual([
			"f16e93bc",
			"abc1234def",
			"0123abc",
			"9876fed",
		]);
	});

	it("reads commit output from Codex command executions", () => {
		const events = codexConversationReader.events([
			codexCommand("[a1545 c0ffee1] feat: thing\n 2 files changed"),
		]);

		expect(parseTranscriptCommitShas(events)).toEqual(["c0ffee1"]);
	});

	it("ignores commit-like text outside tool results", () => {
		const events = claudeConversationReader.events([
			claudeText("[pr-branch f16e93bc] Fix the thing"),
		]);

		expect(parseTranscriptCommitShas(events)).toEqual([]);
	});
});

describe("transcriptCommits", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		transcripts.clear();
		vi.mocked(readTranscriptTail).mockImplementation(async (path) =>
			structuredClone(transcripts.get(path) ?? []),
		);
	});

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

	it("returns no commits when the transcript has none", async () => {
		expect(
			await transcriptCommits("/repo", { conversationId: "sess" }),
		).toEqual([]);
	});

	it("keeps only Claude commits reachable from HEAD, resolved and deduplicated", async () => {
		transcripts.set("/claude/sess.jsonl", [
			claudeResult("[pr-branch f16e93bc] Fix"),
			claudeResult("[pr-branch f16e93b] Fix again"),
			claudeResult("[pr-branch aaaa111] Amended away"),
		]);
		withRepo({ f16e93bcd40db3e5: "head", aaaa1112222: "dangling" });

		expect(
			await transcriptCommits("/repo", { conversationId: "sess" }),
		).toEqual([{ sha: "f16e93bcd40db3e5" }]);
	});

	it("reads each concurrent session's own transcript by harness", async () => {
		transcripts.set("/claude/same.jsonl", [claudeResult("[b 1111111] claude")]);
		transcripts.set("/codex/same.jsonl", [codexCommand("[b 2222222] codex")]);
		transcripts.set("/fake/f-1.log", [{ result: "Committed: 3333333" }]);
		withRepo({ "1111111aa": "head", "2222222bb": "head", "3333333cc": "head" });

		expect(
			await transcriptCommits("/repo", { conversationId: "same" }),
		).toEqual([{ sha: "1111111aa" }]);
		expect(
			await transcriptCommits("/repo", {
				conversationId: "same",
				harness: "codex",
			}),
		).toEqual([{ sha: "2222222bb" }]);
		expect(
			await transcriptCommits("/repo", {
				conversationId: "f-1",
				harness: FAKE,
			}),
		).toEqual([{ sha: "3333333cc" }]);
	});

	it("finds nothing for a harness that cannot read transcripts", async () => {
		transcripts.set("/pi/p.jsonl", [claudeResult("[b 1111111] x")]);

		expect(
			await transcriptCommits("/repo", { conversationId: "p", harness: "pi" }),
		).toEqual([]);
		expect(readTranscriptTail).not.toHaveBeenCalled();
	});
});
