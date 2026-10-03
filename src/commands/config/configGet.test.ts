import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import { configGet } from "./configGet";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockConfig = vi.mocked(loadConfig);

function output(run: () => void): string {
	const lines: string[] = [];
	const log = vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(String(line));
	});
	try {
		run();
	} finally {
		log.mockRestore();
	}
	return lines.join("\n");
}

describe("configGet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockConfig.mockReturnValue(
			makeAssistConfig({
				database: { url: "postgres://user:pass@host/db" },
				commit: { push: true },
				sql: {
					connections: [
						{
							name: "main",
							server: "localhost",
							port: 1433,
							user: "sa",
							password: "hunter2",
							database: "app",
						},
					],
				},
			}),
		);
	});

	it("masks a secret value", () => {
		expect(output(() => configGet("database.url"))).toBe(SECRET_MASK);
	});

	it("masks a secret nested in an array of objects", () => {
		expect(output(() => configGet("sql.connections"))).toContain(
			`"password": "${SECRET_MASK}"`,
		);
		expect(output(() => configGet("sql.connections"))).toContain(
			'"name": "main"',
		);
	});

	it("prints the raw value with --reveal", () => {
		expect(output(() => configGet("database.url", { reveal: true }))).toBe(
			"postgres://user:pass@host/db",
		);
	});

	it("prints non-secret values unchanged", () => {
		expect(output(() => configGet("commit.push"))).toBe("true");
	});

	it("reports an unset secret as not set", () => {
		mockConfig.mockReturnValue(makeAssistConfig({ database: {} }));

		expect(errorOutput(() => configGet("database.url"))).toContain(
			'"database.url" is not set',
		);
	});

	it("reports the schema default and note for a valid unset key", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		const text = errorOutput(() => configGet("worktree.enabled"));

		expect(text).toContain('Key "worktree.enabled" is not set');
		expect(text).toContain("the schema default is false");
		expect(text).toContain("spill concurrent sessions");
		expect(text).toContain("assist config set worktree.enabled true");
	});

	it("says a valid unset key has no default when the schema gives none", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		expect(errorOutput(() => configGet("worktree.root"))).toContain(
			'Key "worktree.root" is not set and has no schema default',
		);
	});

	it("reports an unknown key as not set with no default", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		const text = errorOutput(() => configGet("nope.nope"));

		expect(text).toContain('Key "nope.nope" is not set');
		expect(text).not.toContain("schema default");
	});

	it("still prints an explicitly set falsy value instead of the default", () => {
		mockConfig.mockReturnValue(
			makeAssistConfig({ worktree: { enabled: false } }),
		);

		expect(output(() => configGet("worktree.enabled"))).toBe("false");
	});
});

function errorOutput(run: () => void): string {
	const lines: string[] = [];
	const error = vi.spyOn(console, "error").mockImplementation((line) => {
		lines.push(String(line));
	});
	const exit = vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("exit");
	}) as never);
	try {
		expect(run).toThrow("exit");
	} finally {
		error.mockRestore();
		exit.mockRestore();
	}
	return lines.join("\n");
}
