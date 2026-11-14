import { describe, expect, it } from "vitest";
import { renderPrompt } from "./renderPrompt";

describe("renderPrompt", () => {
	it("shows a bash-mode input as the command run", () => {
		expect(renderPrompt("<bash-input>git status</bash-input>")).toBe(
			"! git status",
		);
	});

	it("shows the user's own text for a message sent with shell results", () => {
		expect(
			renderPrompt(
				"<bash-input>ls</bash-input>\n<bash-stdout>a</bash-stdout><bash-stderr></bash-stderr>\n\nlook at a",
			),
		).toBe("look at a");
	});
});
