import { describe, expect, it, vi } from "vitest";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import { submitDraft } from "./submitDraft";

function launchers() {
	return {
		onCreateDesign: vi.fn(),
		onCreateHarness: vi.fn(),
		onCreateAssist: vi.fn(),
	};
}

const draft = {
	mode: "draft",
	prompt: "",
	modePending: false,
	clear: vi.fn(),
} as unknown as NewSessionDraft;

describe("submitDraft", () => {
	it("ignores autoApprove on a clone", () => {
		const l = launchers();

		submitDraft(
			draft,
			{ harness: "claude" },
			{
				kind: "clone",
				prompt: {
					origin: "git@x:o/r.git",
					cloneTarget: "/git/r",
					displayName: "r",
				},
			},
			l,
			{ open: true },
		);

		expect(l.onCreateAssist).toHaveBeenCalledWith(
			["backlog", "clone", "git@x:o/r.git"],
			undefined,
			{ title: "Clone r", subtitle: "git@x:o/r.git" },
		);
	});

	it("opens a Shift+clicked draft with autoApprove on the local node", () => {
		const l = launchers();

		submitDraft(
			draft,
			{ harness: "claude" },
			{ kind: "launch", cwd: "/git/app" },
			l,
			{ open: true },
		);
		submitDraft(
			draft,
			{ harness: "claude" },
			{ kind: "launch", cwd: "/git/app" },
			l,
		);

		expect(l.onCreateAssist).toHaveBeenNthCalledWith(
			1,
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/app",
			{ autoApprove: true, open: true },
		);
		expect(l.onCreateAssist).toHaveBeenNthCalledWith(
			2,
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/app",
		);
	});

	it("keeps autoApprove and open alongside the node on a forwarded draft", () => {
		const l = launchers();

		submitDraft(
			{ ...draft, node: "pc-windows" } as NewSessionDraft,
			{ harness: "claude" },
			{ kind: "launch", cwd: "/git/app" },
			l,
			{ open: true },
		);

		expect(l.onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/app",
			{ node: "pc-windows", autoApprove: true, open: true },
		);
	});

	it.each([
		["claude", "onCreateHarness", ["claude"]],
		["codex", "onCreateHarness", ["codex"]],
	] as const)(
		"opens a Shift+clicked %s prompt session",
		(harness, launcher, lead) => {
			const l = launchers();
			const prompt = {
				...draft,
				mode: "prompt",
				prompt: "go",
			} as NewSessionDraft;
			const target = { kind: "launch", cwd: "/git/app" } as const;

			submitDraft(prompt, { harness }, target, l, { open: true });
			submitDraft(
				{ ...prompt, node: "pc" } as NewSessionDraft,
				{ harness },
				target,
				l,
			);

			expect(l[launcher]).toHaveBeenNthCalledWith(
				1,
				...lead,
				"go",
				"/git/app",
				undefined,
				true,
			);
			expect(l[launcher]).toHaveBeenNthCalledWith(
				2,
				...lead,
				"go",
				"/git/app",
				"pc",
			);
		},
	);

	it("launches a prompt session on the chosen model", () => {
		const l = launchers();

		submitDraft(
			{ ...draft, mode: "prompt", prompt: "go" } as NewSessionDraft,
			{ harness: "claude", model: "opus" },
			{ kind: "launch", cwd: "/git/app" },
			l,
		);

		expect(l.onCreateHarness).toHaveBeenCalledWith(
			"claude",
			"go",
			"/git/app",
			undefined,
			false,
			"opus",
		);
	});

	it("passes yolo with auto start and open on a draft", () => {
		const l = launchers();

		submitDraft(
			draft,
			{ harness: "claude" },
			{ kind: "launch", cwd: "/git/app" },
			l,
			{ open: true, yolo: true },
		);

		expect(l.onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "claude", "--no-model"],
			"/git/app",
			{ autoApprove: true, open: true, yolo: true },
		);
	});

	it.each([
		["prompt", "onCreateHarness"],
		["design", "onCreateDesign"],
	] as const)("passes yolo to a %s session", (mode, launcher) => {
		const l = launchers();

		submitDraft(
			{ ...draft, mode, prompt: "go" } as NewSessionDraft,
			{ harness: "claude" },
			{ kind: "launch", cwd: "/git/app" },
			l,
			{ open: true, yolo: true },
		);

		expect(l[launcher]).toHaveBeenCalledWith(
			"claude",
			"go",
			"/git/app",
			undefined,
			true,
			undefined,
			true,
		);
	});
});
