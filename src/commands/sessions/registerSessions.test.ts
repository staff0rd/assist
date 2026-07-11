import { Command } from "commander";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerSessions } from "./registerSessions";
import { web } from "./web";

vi.mock("./web", () => ({
	web: vi.fn(),
}));

const webMock = web as unknown as ReturnType<typeof vi.fn>;

function buildProgramWithRootNoOpen(): Command {
	const program = new Command();
	program.name("assist").exitOverride().option("--no-open", "x");
	registerSessions(program);
	return program;
}

describe("registerSessions --no-open", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("honors --no-open on the web subcommand despite the flag on ancestor commands", async () => {
		await buildProgramWithRootNoOpen().parseAsync([
			"node",
			"assist",
			"sessions",
			"web",
			"--no-open",
			"--port",
			"3101",
		]);

		expect(webMock).toHaveBeenCalledWith(
			expect.objectContaining({ port: "3101", open: false }),
		);
	});

	it("opens a browser by default when --no-open is not passed", async () => {
		await buildProgramWithRootNoOpen().parseAsync([
			"node",
			"assist",
			"sessions",
			"web",
		]);

		expect(webMock).toHaveBeenCalledWith(
			expect.objectContaining({ open: true }),
		);
	});

	it("honors --no-open on the sessions default dashboard", async () => {
		await buildProgramWithRootNoOpen().parseAsync([
			"node",
			"assist",
			"sessions",
			"--no-open",
		]);

		expect(webMock).toHaveBeenCalledWith(
			expect.objectContaining({ port: "3100", open: false }),
		);
	});
});
