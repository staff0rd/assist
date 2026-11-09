import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { itemGitRefs, items } from "../../shared/db/schema";
import { claudeAdapter } from "../../shared/harnessAdapters/claudeAdapter";
import { codexAdapter } from "../../shared/harnessAdapters/codexAdapter";
import { piAdapter } from "../../shared/harnessAdapters/piAdapter";
import type {
	ExecutionIdentity,
	HarnessAdapter,
	NativeToolCall,
} from "../../shared/harnessAdapters/types";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";

let root: string;
let restrictedDir: string;
let orm: Db;
const mockDocsLocked = vi.fn<() => Promise<boolean>>();
const mockLogDenied = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	getProjectRoot: () => root,
	loadConfig: () => ({ sessions: { askQuestion: true } }),
}));
vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));
vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
	closeDb: () => Promise.resolve(),
}));
vi.mock("../backlog/isDocsLocked", () => ({
	isDocsLocked: () => mockDocsLocked(),
}));
vi.mock("../sessions/shared/isLiveDaemonSession", () => ({
	isLiveDaemonSession: () => Promise.resolve(true),
}));
vi.mock("../cliHook/logDeniedToolCall", () => ({
	logDeniedToolCall: (entry: unknown) => mockLogDenied(entry),
}));

import { getSchemaSessionApprovalPath } from "../schema/getSchemaSessionApprovalPath";
import { decideToolOperations } from "./decideToolOperations";
import { logPolicyDeny } from "./logPolicyDeny";

const SCHEMA = "src/shared/db/schema.ts";
const DOCS = "docs/src/content/docs/guide.md";
const RESTRICTED = "/home/me/.assist/restricted/secret.json";

type Vocabulary = {
	write: (path: string, text: string) => NativeToolCall;
	read: (path: string) => NativeToolCall;
	shell: (command: string) => NativeToolCall;
};

const patch = (path: string, text: string) =>
	`*** Begin Patch\n*** Add File: ${path}\n+${text}\n*** End Patch`;

const harnesses: [string, HarnessAdapter, Vocabulary][] = [
	[
		"claude",
		claudeAdapter,
		{
			write: (path, text) => ({
				toolName: "Write",
				toolInput: { file_path: path, content: text },
			}),
			read: (path) => ({ toolName: "Read", toolInput: { file_path: path } }),
			shell: (command) => ({ toolName: "Bash", toolInput: { command } }),
		},
	],
	[
		"codex",
		codexAdapter,
		{
			write: (path, text) => ({
				toolName: "apply_patch",
				toolInput: { command: patch(path, text) },
			}),
			read: (path) => ({
				toolName: "Bash",
				toolInput: { command: `cat ${path}` },
			}),
			shell: (command) => ({ toolName: "Bash", toolInput: { command } }),
		},
	],
	[
		"pi",
		piAdapter,
		{
			write: (path, text) => ({
				toolName: "write",
				toolInput: { path, content: text },
			}),
			read: (path) => ({ toolName: "read", toolInput: { path } }),
			shell: (command) => ({ toolName: "bash", toolInput: { command } }),
		},
	],
	[
		"fake",
		fakeHarnessMock(),
		{
			write: (file, text) => ({ toolName: "save", toolInput: { file, text } }),
			read: (file) => ({ toolName: "open", toolInput: { file } }),
			shell: (cmd) => ({ toolName: "shell", toolInput: { cmd } }),
		},
	],
];

function identity(
	harness: string,
	overrides: Partial<ExecutionIdentity> = {},
): ExecutionIdentity {
	return { harness, conversationId: "conv-a", itemId: null, ...overrides };
}

async function decide(
	adapter: HarnessAdapter,
	call: NativeToolCall,
	who: ExecutionIdentity,
) {
	return decideToolOperations(adapter.toolOperations(call), who);
}

function approveSession(harness: string, conversationId: string): void {
	const path = getSchemaSessionApprovalPath({
		harness,
		conversationId,
	}) as string;
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, JSON.stringify({ harness, conversationId }));
}

async function addStory(unlockRef?: string): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({
			origin: "github.com/acme/app",
			name: "Job runs",
			status: "in-progress",
			currentPhase: 1,
		})
		.returning({ id: items.id });
	if (unlockRef)
		await orm.insert(itemGitRefs).values({
			itemId: row.id,
			kind: "schema-unlock",
			ref: unlockRef,
			title: "unlocked",
		});
	return row.id;
}

beforeEach(async () => {
	({ orm } = await createTestDb());
	root = mkdtempSync(join(tmpdir(), "assist-policy-"));
	restrictedDir = mkdtempSync(join(tmpdir(), "assist-policy-restricted-"));
	mockDocsLocked.mockResolvedValue(true);
	vi.stubEnv("ASSIST_SESSION", "1");
	vi.stubEnv("ASSIST_SESSION_ID", "s1");
});

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
	rmSync(restrictedDir, { recursive: true, force: true });
});

describe.each(harnesses)("%s enforcement", (harness, adapter, native) => {
	it("denies a locked schema write", async () => {
		const decision = await decide(
			adapter,
			native.write(SCHEMA, "export {}"),
			identity(harness),
		);
		expect(decision?.permissionDecisionReason).toContain(
			"assist schema unlock",
		);
	});

	it("denies a new pgTable module", async () => {
		const decision = await decide(
			adapter,
			native.write("src/shared/db/jobRuns.ts", "pgTable('job_runs', {})"),
			identity(harness),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("denies a locked docs write", async () => {
		const decision = await decide(
			adapter,
			native.write(DOCS, "# Guide"),
			identity(harness),
		);
		expect(decision?.permissionDecisionReason).toContain("Refresh docs");
	});

	it("denies reading a restricted path", async () => {
		const decision = await decide(
			adapter,
			native.read(RESTRICTED),
			identity(harness),
		);
		expect(decision?.permissionDecisionReason).toContain(".assist/restricted");
	});

	it("denies a compound command that writes the schema", async () => {
		const decision = await decide(
			adapter,
			native.shell(`ls && echo x > ${SCHEMA}`),
			identity(harness),
		);
		expect(decision?.permissionDecisionReason).toContain(
			"assist schema unlock",
		);
	});

	it("allows the schema write once this conversation is approved", async () => {
		approveSession(harness, "conv-a");
		expect(
			await decide(adapter, native.write(SCHEMA, "x"), identity(harness)),
		).toBeUndefined();
	});

	it("rejects another conversation's approval", async () => {
		approveSession(harness, "conv-b");
		const decision = await decide(
			adapter,
			native.write(SCHEMA, "x"),
			identity(harness),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("allows a phase run once its harness unlocked the current phase", async () => {
		const suffix = harness === "claude" ? "" : `:${harness}`;
		const itemId = await addStory(`phase-1${suffix}`);
		expect(
			await decide(
				adapter,
				native.write(SCHEMA, "x"),
				identity(harness, { itemId }),
			),
		).toBeUndefined();
	});

	it("leaves ordinary writes alone", async () => {
		expect(
			await decide(adapter, native.write("src/app.ts", "x"), identity(harness)),
		).toBeUndefined();
	});
});

describe("harness scoping", () => {
	it("a Claude session approval does not unlock a Codex conversation with the same id", async () => {
		approveSession("claude", "conv-a");
		const decision = await decide(
			codexAdapter,
			{ toolName: "apply_patch", toolInput: { command: patch(SCHEMA, "x") } },
			identity("codex"),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("a Claude phase unlock does not unlock a Codex run of the same phase", async () => {
		const itemId = await addStory("phase-1");
		const decision = await decide(
			codexAdapter,
			{ toolName: "apply_patch", toolInput: { command: patch(SCHEMA, "x") } },
			identity("codex", { itemId }),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("keeps legacy Claude approval files valid", async () => {
		const path = getSchemaSessionApprovalPath({
			harness: "claude",
			conversationId: "conv-a",
		}) as string;
		expect(path.endsWith(join("schema-sessions", "conv-a.json"))).toBe(true);
		mkdirSync(join(path, ".."), { recursive: true });
		writeFileSync(path, JSON.stringify({ claudeSessionId: "conv-a" }));
		expect(
			await decide(
				claudeAdapter,
				{ toolName: "Edit", toolInput: { file_path: SCHEMA } },
				identity("claude"),
			),
		).toBeUndefined();
	});
});

describe("codex apply_patch replays", () => {
	it("denies a patch that updates one ordinary file and moves another into the schema", async () => {
		const command =
			"*** Begin Patch\n*** Update File: src/app.ts\n@@\n-a\n+b\n*** Update File: src/old.ts\n*** Move to: src/shared/db/schema.ts\n@@\n+x\n*** End Patch";
		const decision = await decide(
			codexAdapter,
			{ toolName: "apply_patch", toolInput: { command } },
			identity("codex"),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("denies apply_patch invoked through a shell heredoc", async () => {
		const command = `apply_patch <<'EOF'\n${patch(DOCS, "# Guide")}\nEOF`;
		const decision = await decide(
			codexAdapter,
			{ toolName: "Bash", toolInput: { command } },
			identity("codex"),
		);
		expect(decision?.permissionDecisionReason).toContain("Refresh docs");
	});
});

describe("preview questions", () => {
	const questions = [{ question: "Which?", header: "Pick", options: [] }];

	it.each([
		["claude", claudeAdapter, "AskUserQuestion", { questions }],
		["fake", fakeHarnessMock(), "ask", { questions }],
	] as const)(
		"%s routes its native question to assist ask-question",
		async (harness, adapter, toolName, toolInput) => {
			const decision = await decide(
				adapter,
				{ toolName, toolInput },
				identity(harness),
			);
			expect(decision?.permissionDecisionReason).toContain(
				"assist ask-question",
			);
		},
	);
});

describe("auto-approval", () => {
	it("never auto-approves a compound command whose patch is denied", async () => {
		const command = `cat a.ts && apply_patch <<'EOF'\n${patch(SCHEMA, "x")}\nEOF`;
		const decision = await decide(
			codexAdapter,
			{ toolName: "Bash", toolInput: { command } },
			identity("codex"),
		);
		expect(decision?.permissionDecision).toBe("deny");
	});
});

describe("denied-call logging", () => {
	it("logs a denied write with the conversation id", async () => {
		const operations = codexAdapter.toolOperations({
			toolName: "apply_patch",
			toolInput: { command: patch(SCHEMA, "x") },
		});
		const who = identity("codex");
		const decision = await decideToolOperations(operations, who);
		logPolicyDeny(operations, decision, who, "/work/app");
		expect(mockLogDenied).toHaveBeenCalledWith(
			expect.objectContaining({
				tool: "apply_patch",
				command: SCHEMA,
				repo: "app",
				sessionId: "conv-a",
			}),
		);
	});
});
