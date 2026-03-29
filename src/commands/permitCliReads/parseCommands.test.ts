import { describe, expect, it } from "vitest";
import { hasSubcommands, parseCommands } from "./parseCommands";

describe("parseCommands", () => {
	describe("when given a standard help output with Commands section", () => {
		it("should extract space-separated commands", () => {
			const help = `Usage: tool [options]

Commands:
  init        Initialize a project
  build       Build the project

Options:
  --help      Show help`;

			const result = parseCommands(help);

			expect(result).toEqual([
				{ name: "init", description: "Initialize a project" },
				{ name: "build", description: "Build the project" },
			]);
		});
	});

	describe("when using colon-style format", () => {
		it("should parse gh-style commands", () => {
			const help = `Commands:
  repo:   Manage repos
  pr:     Manage PRs`;

			const result = parseCommands(help);

			expect(result).toEqual([
				{ name: "repo", description: "Manage repos" },
				{ name: "pr", description: "Manage PRs" },
			]);
		});
	});

	describe("when using az-style format with tags", () => {
		it("should parse commands with bracketed tags", () => {
			const help = `Commands:
  login [Core] : Sign in to Azure
  logout [Core] : Sign out`;

			const result = parseCommands(help);

			expect(result).toEqual([
				{ name: "login", description: "Sign in to Azure" },
				{ name: "logout", description: "Sign out" },
			]);
		});
	});

	describe("when the section header has different casing", () => {
		it("should handle 'CORE COMMANDS'", () => {
			const help = `CORE COMMANDS
  status      Show status
  log         Show log`;

			const result = parseCommands(help);

			expect(result).toEqual([
				{ name: "status", description: "Show status" },
				{ name: "log", description: "Show log" },
			]);
		});

		it("should handle 'Available commands:'", () => {
			const help = `Available commands:
  serve       Start server`;

			const result = parseCommands(help);

			expect(result).toEqual([{ name: "serve", description: "Start server" }]);
		});
	});

	describe("when lines start with dashes or angle brackets", () => {
		it("should skip flags and placeholders", () => {
			const help = `Commands:
  run         Run something
  -h          Show help
  <input>     Input file`;

			const result = parseCommands(help);

			expect(result).toEqual([{ name: "run", description: "Run something" }]);
		});
	});

	describe("when there is no commands section", () => {
		it("should return an empty array", () => {
			const help = `Usage: tool [options]

Options:
  --help      Show help`;

			const result = parseCommands(help);

			expect(result).toEqual([]);
		});
	});

	describe("when a bare command name has no description", () => {
		it("should include it with empty description", () => {
			const help = `Commands:
  deploy`;

			const result = parseCommands(help);

			expect(result).toEqual([{ name: "deploy", description: "" }]);
		});
	});

	describe("when section ends with non-indented line", () => {
		it("should stop parsing commands", () => {
			const help = `Commands:
  build       Build it
Notes:
  Some note`;

			const result = parseCommands(help);

			expect(result).toEqual([{ name: "build", description: "Build it" }]);
		});
	});
});

describe("hasSubcommands", () => {
	describe("when help text contains a commands section", () => {
		it("should return true", () => {
			const help = `Usage: tool

Commands:
  init    Initialize`;

			expect(hasSubcommands(help)).toBe(true);
		});
	});

	describe("when help text has no commands section", () => {
		it("should return false", () => {
			const help = `Usage: tool [options]

Options:
  --help    Show help`;

			expect(hasSubcommands(help)).toBe(false);
		});
	});
});
