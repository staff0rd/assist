import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

const mockLoadConfig = vi.mocked(loadConfig);

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { resolveDevDir } from "./resolveDevDir";

describe("resolveDevDir", () => {
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;

	function withDir(dir: string | undefined): void {
		mockLoadConfig.mockReturnValue(makeAssistConfig({ devlog: { dir } }));
	}

	beforeEach(() => {
		vi.clearAllMocks();
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`exit:${code}`);
		}) as never);
	});

	afterEach(() => {
		errorSpy.mockRestore();
		exitSpy.mockRestore();
	});

	it("returns the configured directory", () => {
		withDir("/srv/blog/dev");
		expect(resolveDevDir()).toBe("/srv/blog/dev");
	});

	it("expands a leading tilde", () => {
		withDir("~/git/blog/src/content/dev");
		expect(resolveDevDir()).toBe(join(homedir(), "git/blog/src/content/dev"));
	});

	it.each([undefined, "  "])(
		"exits with the setter hint when unset (%j)",
		(dir) => {
			withDir(dir);
			expect(() => resolveDevDir()).toThrow("exit:1");
			expect(String(errorSpy.mock.calls[0][0])).toContain(
				"assist config set devlog.dir",
			);
		},
	);
});
