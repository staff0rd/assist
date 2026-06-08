import { describe, expect, it, vi } from "vitest";
import { dispatchMode, MODES } from "./dispatchMode";

describe("dispatchMode", () => {
	it("appends trimmed text to the assist args", () => {
		const onCreateAssist = vi.fn();

		dispatchMode(
			"assist-bug",
			"/repo",
			onCreateAssist,
			() => {},
			"  this is broken  ",
		);

		expect(onCreateAssist).toHaveBeenCalledWith(
			["bug", "--once", "this is broken"],
			"/repo",
		);
	});

	it("launches the plain assist session when no text is given", () => {
		const onCreateAssist = vi.fn();

		dispatchMode("assist-draft", "/repo", onCreateAssist, () => {});

		expect(onCreateAssist).toHaveBeenCalledWith(["draft", "--once"], "/repo");
	});

	it("omits empty or whitespace-only text from the args", () => {
		const onCreateAssist = vi.fn();

		dispatchMode("assist-draft", "/repo", onCreateAssist, () => {}, "   ");

		expect(onCreateAssist).toHaveBeenCalledWith(["draft", "--once"], "/repo");
	});

	it("sets free mode instead of spawning an assist session", () => {
		const onCreateAssist = vi.fn();
		const setMode = vi.fn();

		dispatchMode("free", "/repo", onCreateAssist, setMode);

		expect(onCreateAssist).not.toHaveBeenCalled();
		expect(setMode).toHaveBeenCalledWith("free");
	});
});

describe("MODES", () => {
	it("flags draft and bug as prompt modes but not next", () => {
		const promptModes = Object.fromEntries(
			MODES.map((m) => [m.value, m.prompt]),
		);

		expect(promptModes).toEqual({
			"assist-draft": true,
			"assist-bug": true,
			"assist-next": false,
		});
	});
});
