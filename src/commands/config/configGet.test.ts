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

type Captured = {
	stdout: string;
	stderr: string;
	exitCode: number | undefined;
};

const exitCalled = new Error("process.exit called");

function capture(run: () => void): Captured {
	const stdout: string[] = [];
	const stderr: string[] = [];
	let exitCode: number | undefined;
	const log = vi.spyOn(console, "log").mockImplementation((line) => {
		stdout.push(String(line));
	});
	const error = vi.spyOn(console, "error").mockImplementation((line) => {
		stderr.push(String(line));
	});
	const exit = vi.spyOn(process, "exit").mockImplementation(((
		code?: number,
	) => {
		exitCode = code ?? 0;
		throw exitCalled;
	}) as never);
	try {
		run();
	} catch (error_) {
		if (error_ !== exitCalled) throw error_;
	} finally {
		log.mockRestore();
		error.mockRestore();
		exit.mockRestore();
	}
	return { stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode };
}

function output(run: () => void): string {
	return capture(run).stdout;
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

	it("reports an unset secret as not set on stdout without failing", () => {
		mockConfig.mockReturnValue(makeAssistConfig({ database: {} }));

		const result = capture(() => configGet("database.url"));

		expect(result.exitCode).toBeUndefined();
		expect(result.stderr).toBe("");
		expect(result.stdout).toContain('"database.url" is not set');
	});

	it("prints the schema default, note and setter for a valid unset key on stdout", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		const result = capture(() => configGet("worktree.enabled"));

		expect(result.exitCode).toBeUndefined();
		expect(result.stderr).toBe("");
		expect(result.stdout).toContain('Key "worktree.enabled" is not set');
		expect(result.stdout).toContain("the schema default is false");
		expect(result.stdout).toContain(
			"every session spills into a fresh adjacent <clone>-N worktree",
		);
		expect(result.stdout).toContain("assist config set worktree.enabled true");
	});

	it("prints that a valid unset key with no default is unset, with its note and setter, on stdout", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		const result = capture(() => configGet("docs.refreshAfter"));

		expect(result.exitCode).toBeUndefined();
		expect(result.stderr).toBe("");
		expect(result.stdout).toContain(
			'Key "docs.refreshAfter" is not set and has no schema default',
		);
		expect(result.stdout).toContain("assist config set docs.refreshAfter 5");
	});

	it("exits 1 on stderr for a key not in the schema", () => {
		mockConfig.mockReturnValue(makeAssistConfig());

		const result = capture(() => configGet("nope.nope"));

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toContain('Key "nope.nope" is not set');
		expect(result.stderr).not.toContain("schema default");
	});

	it("prints just an explicitly set false instead of the default", () => {
		mockConfig.mockReturnValue(
			makeAssistConfig({ worktree: { enabled: false } }),
		);

		const result = capture(() => configGet("worktree.enabled"));

		expect(result).toEqual({
			stdout: "false",
			stderr: "",
			exitCode: undefined,
		});
	});

	it("prints just an explicitly set 0", () => {
		mockConfig.mockReturnValue({
			...makeAssistConfig(),
			docs: { refreshAfter: 0 },
		});

		const result = capture(() => configGet("docs.refreshAfter"));

		expect(result).toEqual({ stdout: "0", stderr: "", exitCode: undefined });
	});
});
