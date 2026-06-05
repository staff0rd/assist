import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { list as backlogList } from "./backlog/list";
import { setBacklogDir } from "./backlog/shared";
import { registerBacklog } from "./registerBacklog";
import { registerList } from "./registerList";

vi.mock("./backlog/list", () => ({
	list: vi.fn(),
}));

vi.mock("./backlog/shared", () => ({
	setBacklogDir: vi.fn(),
}));

function createProgram(): Command {
	const program = new Command();
	registerBacklog(program);
	registerList(program);
	return program;
}

describe("registerList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("registers list with alias ls", () => {
		const program = createProgram();
		const listCommand = program.commands.find((c) => c.name() === "list");

		expect(listCommand?.aliases()).toContain("ls");
	});

	it("delegates ls to the backlog list action with parsed options", async () => {
		const program = createProgram();

		await program.parseAsync(
			["ls", "--status", "todo", "--all", "--all-repos", "--verbose"],
			{ from: "user" },
		);

		expect(backlogList).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "todo",
				all: true,
				allRepos: true,
				verbose: true,
			}),
		);
	});

	it("sets the backlog dir before delegating when --dir is given", async () => {
		const program = createProgram();

		await program.parseAsync(["list", "--dir", "/tmp/backlog"], {
			from: "user",
		});

		expect(setBacklogDir).toHaveBeenCalledWith("/tmp/backlog");
		expect(vi.mocked(setBacklogDir).mock.invocationCallOrder[0]).toBeLessThan(
			vi.mocked(backlogList).mock.invocationCallOrder[0],
		);
	});

	it("supports the same flags as backlog list", () => {
		const program = createProgram();
		const backlogCommand = program.commands.find((c) => c.name() === "backlog");
		const backlogListCommand = backlogCommand?.commands.find(
			(c) => c.name() === "list",
		);
		const listCommand = program.commands.find((c) => c.name() === "list");

		const flagsOf = (cmd: Command | undefined): string[] =>
			(cmd?.options ?? []).map((o) => o.flags);
		// --dir lives on the backlog parent command, so the top-level shortcut
		// carries it alongside the list flags.
		expect(flagsOf(listCommand)).toEqual([
			...flagsOf(backlogListCommand),
			"--dir <path>",
		]);
	});
});
