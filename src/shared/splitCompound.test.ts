import { describe, expect, it } from "vitest";
import { splitCompound } from "./splitCompound";

describe("splitCompound", () => {
	describe("simple commands", () => {
		it("returns single-element array for simple command", () => {
			expect(splitCompound("gh repo view owner/repo")).toEqual([
				"gh repo view owner/repo",
			]);
		});

		it("returns single-element array for command with flags", () => {
			expect(splitCompound("git log --oneline -n 5")).toEqual([
				"git log --oneline -n 5",
			]);
		});
	});

	describe("pipes", () => {
		it("splits pipe into two commands", () => {
			expect(splitCompound("gh repo view owner/repo | grep name")).toEqual([
				"gh repo view owner/repo",
				"grep name",
			]);
		});

		it("splits multi-pipe chain", () => {
			expect(splitCompound("git log --oneline | head -5 | grep fix")).toEqual([
				"git log --oneline",
				"head -5",
				"grep fix",
			]);
		});
	});

	describe("logical operators", () => {
		it("splits && chain", () => {
			expect(splitCompound("git status && git diff")).toEqual([
				"git status",
				"git diff",
			]);
		});

		it("splits || chain", () => {
			expect(splitCompound("echo hello || echo fallback")).toEqual([
				"echo hello",
				"echo fallback",
			]);
		});
	});

	describe("semicolons", () => {
		it("splits semicolons", () => {
			expect(splitCompound("echo hello; echo world")).toEqual([
				"echo hello",
				"echo world",
			]);
		});
	});

	describe("mixed operators", () => {
		it("splits mixed pipe and &&", () => {
			expect(
				splitCompound("gh repo view owner/repo | grep name && echo done"),
			).toEqual(["gh repo view owner/repo", "grep name", "echo done"]);
		});
	});

	describe("env var prefix stripping", () => {
		it("strips single env var prefix", () => {
			expect(splitCompound("NODE_ENV=prod npm test")).toEqual(["npm test"]);
		});

		it("strips multiple env var prefixes", () => {
			expect(splitCompound("FOO=1 BAR=2 npm test")).toEqual(["npm test"]);
		});

		it("strips env var in piped command", () => {
			expect(splitCompound("NODE_ENV=prod npm test | grep pass")).toEqual([
				"npm test",
				"grep pass",
			]);
		});
	});

	describe("fd redirects (safe plumbing)", () => {
		it("allows 2>&1 and strips it from the command", () => {
			expect(splitCompound("npx vitest run 2>&1")).toEqual(["npx vitest run"]);
		});

		it("allows 2>&1 in compound command", () => {
			expect(splitCompound("cd /c/git/assist && npx vitest run 2>&1")).toEqual([
				"cd /c/git/assist",
				"npx vitest run",
			]);
		});

		it("rejects non-numeric >& (file redirect)", () => {
			expect(splitCompound("echo hello >& file.txt")).toBeUndefined();
		});
	});

	describe("unsafe constructs return undefined", () => {
		it("rejects command substitution $()", () => {
			expect(splitCompound("echo $(date)")).toBeUndefined();
		});

		it("rejects backtick substitution", () => {
			expect(splitCompound("echo `date`")).toBeUndefined();
		});

		it("rejects output redirection", () => {
			expect(splitCompound("echo hello > file.txt")).toBeUndefined();
		});

		it("rejects input redirection", () => {
			expect(splitCompound("cat < file.txt")).toBeUndefined();
		});

		it("rejects append redirection", () => {
			expect(splitCompound("echo hello >> file.txt")).toBeUndefined();
		});
	});

	describe("edge cases", () => {
		it("returns undefined for empty string", () => {
			expect(splitCompound("")).toBeUndefined();
		});

		it("returns undefined for whitespace only", () => {
			expect(splitCompound("   ")).toBeUndefined();
		});

		it("trims whitespace from commands", () => {
			expect(splitCompound("  gh repo view owner/repo  ")).toEqual([
				"gh repo view owner/repo",
			]);
		});
	});
});
