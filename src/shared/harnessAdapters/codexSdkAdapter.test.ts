import { beforeEach, describe, expect, it, vi } from "vitest";
import { codexSdkAdapter } from "./codexSdkAdapter";
import { launchSdkViaDaemon } from "./launchSdkViaDaemon";

vi.mock("./launchSdkViaDaemon", () => ({ launchSdkViaDaemon: vi.fn() }));

describe("codexSdkAdapter daemon launches", () => {
	beforeEach(() => vi.clearAllMocks());

	it("launches a skill on the Codex SDK with Codex skill syntax", () => {
		codexSdkAdapter.launchSkill("refine", "a1 $x", {
			cwd: "/r",
			allowEdits: false,
			model: "gpt-5",
		});
		expect(launchSdkViaDaemon).toHaveBeenCalledWith({
			harness: "codex-sdk",
			prompt: "$refine a1 $⁠x",
			cwd: "/r",
			allowEdits: false,
			model: "gpt-5",
		});
	});

	it("launches a prompt through the daemon", () => {
		codexSdkAdapter.launchPrompt("do it", { cwd: "/r" });
		expect(launchSdkViaDaemon).toHaveBeenCalledWith({
			harness: "codex-sdk",
			prompt: "do it",
			cwd: "/r",
			allowEdits: undefined,
			model: undefined,
		});
	});

	it("resumes the bound Codex conversation with the nudge", () => {
		codexSdkAdapter.resume("thread-9", "continue", { cwd: "/r" });
		expect(launchSdkViaDaemon).toHaveBeenCalledWith({
			harness: "codex-sdk",
			prompt: "continue",
			cwd: "/r",
			allowEdits: undefined,
			resumeId: "thread-9",
		});
	});
});
