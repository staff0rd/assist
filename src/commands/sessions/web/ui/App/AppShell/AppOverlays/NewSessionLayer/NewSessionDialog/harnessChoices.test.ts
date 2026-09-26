import { describe, expect, it } from "vitest";
import { harnessChoices } from "./harnessChoices";

describe("harnessChoices", () => {
	it("offers claude alone when no other harness is exposed", () => {
		expect(
			harnessChoices({ exposeCodexActions: false, exposePiActions: false }),
		).toEqual(["claude"]);
	});

	it("adds codex when codex actions are exposed", () => {
		expect(
			harnessChoices({ exposeCodexActions: true, exposePiActions: false }),
		).toEqual(["claude", "codex"]);
	});

	it("adds every exposed harness, claude first", () => {
		expect(
			harnessChoices({ exposeCodexActions: true, exposePiActions: true }),
		).toEqual(["claude", "codex", "pi"]);
	});
});
