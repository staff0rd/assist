import { describe, expect, it, vi } from "vitest";
import type { NewSessionDraft } from "../../useNewSessionDraft";
import { submitDraft } from "./submitDraft";

function launchers() {
	return {
		onCreate: vi.fn(),
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
			"claude",
			{
				kind: "clone",
				prompt: {
					origin: "git@x:o/r.git",
					cloneTarget: "/git/r",
					displayName: "r",
				},
			},
			l,
			true,
		);

		expect(l.onCreateAssist).toHaveBeenCalledWith(
			["backlog", "clone", "git@x:o/r.git"],
			undefined,
			{ title: "Clone r", subtitle: "git@x:o/r.git" },
		);
	});

	it("keeps autoApprove alongside the node on a forwarded draft", () => {
		const l = launchers();

		submitDraft(
			{ ...draft, node: "pc-windows" } as NewSessionDraft,
			"claude",
			{ kind: "launch", cwd: "/git/app" },
			l,
			true,
		);

		expect(l.onCreateAssist).toHaveBeenCalledWith(
			["draft", "--once"],
			"/git/app",
			{ node: "pc-windows", autoApprove: true },
		);
	});
});
