import { describe, expect, it } from "vitest";
import { divergencePrompt } from "./divergencePrompt";

describe("divergencePrompt", () => {
	it("asks for a non-destructive reconcile, push, build and close on a real divergence", () => {
		const prompt = divergencePrompt(
			"/git/repo",
			"fatal: Not possible to fast-forward, aborting.\r\n",
		);

		expect(prompt).toContain("fatal: Not possible to fast-forward, aborting.");
		expect(prompt).toContain("git rebase @{u}");
		expect(prompt).toContain("plain `git push`");
		expect(prompt).toContain("assist run auto-build");
		expect(prompt).toContain("Run /close");
		expect(prompt).toContain("Never force-push");
	});

	it("only asks to close on a simulated divergence", () => {
		const prompt = divergencePrompt(
			"/git/repo",
			"simulated divergence from origin/main (requested by assist watch simulate-divergence; nothing has actually diverged)\r\n",
		);

		expect(prompt).toContain("nothing to reconcile. Run /close now");
		expect(prompt).not.toContain("git rebase");
	});
});
