import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePtyCommand } from "./resolvePtyCommand";

const binDir = vi.hoisted(() => ({ value: undefined as string | undefined }));
vi.mock("../../../shared/nodeRuntime/harnessBinDir", () => ({
	harnessBinDir: () => binDir.value,
}));

function onPlatform(platform: NodeJS.Platform): void {
	vi.spyOn(process, "platform", "get").mockReturnValue(platform);
}

describe("resolvePtyCommand", () => {
	afterEach(() => {
		binDir.value = undefined;
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("runs through a login shell on Linux/macOS", () => {
		onPlatform("linux");
		vi.stubEnv("SHELL", "/bin/zsh");

		expect(resolvePtyCommand(["assist", "draft", "it's\nhere"])).toEqual({
			file: "/bin/zsh",
			args: ["-l", "-c", `exec 'assist' 'draft' 'it'\\''s\nhere'`],
		});
	});

	it("exports the declared node's bin dir after the login profile runs", () => {
		onPlatform("linux");
		vi.stubEnv("SHELL", "/bin/bash");
		binDir.value =
			"/home/u/.local/share/fnm/node-versions/v24.22.1/installation/bin";

		expect(resolvePtyCommand(["codex"]).args[2]).toBe(
			`export PATH='${binDir.value}':"$PATH"; exec 'codex'`,
		);
	});

	it("passes a multi-line assist argument to node directly on Windows", () => {
		onPlatform("win32");
		const prompt = "/draft for this configured command:\nline two\nline three";

		expect(resolvePtyCommand(["assist", "draft", prompt])).toEqual({
			file: process.execPath,
			args: [process.argv[1], "draft", prompt],
		});
	});

	it("still runs non-assist commands through cmd.exe on Windows", () => {
		onPlatform("win32");

		expect(resolvePtyCommand(["claude", "--resume", "abc"])).toEqual({
			file: "cmd.exe",
			args: ["/c", "claude", "--resume", "abc"],
		});
	});
});
