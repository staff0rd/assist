import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSdkInput } from "../createSdkInput";
import { createSdkSessionProcess } from "../createSdkSessionProcess";
import { codexSdkDriver } from "./codexSdkDriver";

const codex = vi.hoisted(() => {
	const thread = { id: null as string | null, runStreamed: vi.fn() };
	return {
		thread,
		startThread: vi.fn(() => thread),
		resumeThread: vi.fn((id: string) => {
			thread.id = id;
			return thread;
		}),
	};
});

vi.mock("@openai/codex-sdk", () => ({
	Codex: class {
		startThread = codex.startThread;
		resumeThread = codex.resumeThread;
	},
}));

async function* threadStarted() {
	yield { type: "thread.started", thread_id: "thread-1" };
}
vi.mock("../../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../prepareCodexLaunch", () => ({ prepareCodexLaunch: vi.fn() }));
vi.mock("./awaitCodexResume", () => ({ awaitCodexResume: vi.fn() }));
vi.mock("./codexSdkOptions", () => ({
	codexSdkOptions: () => ({
		codex: {},
		thread: { sandboxMode: "workspace-write" },
	}),
}));

function start(resumeId?: string) {
	const abort = new AbortController();
	const control = createSdkSessionProcess("3", abort);
	const input = createSdkInput();
	const query = codexSdkDriver.start({
		opts: { sessionId: "3", cwd: "/repo", resumeId },
		label: "session 3",
		abort,
		control,
		input: input.messages,
	});
	return { query, input };
}

describe("codexSdkDriver", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		codex.thread.id = null;
	});

	it("continues the bound Codex conversation with resumeThread", () => {
		start("thread-9");
		expect(codex.resumeThread).toHaveBeenCalledWith("thread-9", {
			sandboxMode: "workspace-write",
		});
		expect(codex.startThread).not.toHaveBeenCalled();
	});

	it("starts a fresh thread when the session has no bound conversation", () => {
		start();
		expect(codex.startThread).toHaveBeenCalled();
		expect(codex.resumeThread).not.toHaveBeenCalled();
	});

	it("reports the thread id as the conversation when the thread starts", async () => {
		codex.thread.runStreamed.mockResolvedValue({ events: threadStarted() });
		const { query, input } = start();
		input.push("hi");
		input.close();
		const seen = [];
		for await (const event of query.events) seen.push(event);
		expect(seen).toContainEqual({ kind: "conversation", id: "thread-1" });
	});
});
