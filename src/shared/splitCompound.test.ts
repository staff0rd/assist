import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { splitCompound } from "./splitCompound";

const ok = (parts: string[]) => ({ ok: true as const, parts });
const unparseable = { ok: false as const, error: "unable to parse" };
const redirectError = (target: string) => ({
	ok: false as const,
	error: `redirect target '${target}' is outside the OS temp directory`,
});

describe("splitCompound", () => {
	describe("when given a simple command", () => {
		it("should return a single-element array", () => {
			const command = "gh repo view owner/repo";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["gh repo view owner/repo"]));
		});

		describe("when the command has flags", () => {
			it("should return a single-element array", () => {
				const command = "git log --oneline -n 5";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["git log --oneline -n 5"]));
			});
		});
	});

	describe("when the command contains a single pipe", () => {
		it("should split into two commands", () => {
			const command = "gh repo view owner/repo | grep name";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["gh repo view owner/repo", "grep name"]));
		});
	});

	describe("when the command contains multiple pipes", () => {
		it("should split into all segments", () => {
			const command = "git log --oneline | head -5 | grep fix";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["git log --oneline", "head -5", "grep fix"]));
		});
	});

	describe("when the command contains &&", () => {
		it("should split into separate commands", () => {
			const command = "git status && git diff";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["git status", "git diff"]));
		});
	});

	describe("when the command contains ||", () => {
		it("should split into separate commands", () => {
			const command = "echo hello || echo fallback";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["echo hello", "echo fallback"]));
		});
	});

	describe("when the command contains semicolons", () => {
		it("should split into separate commands", () => {
			const command = "echo hello; echo world";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["echo hello", "echo world"]));
		});
	});

	describe("when the command mixes pipes and &&", () => {
		it("should split all operators", () => {
			const command = "gh repo view owner/repo | grep name && echo done";

			const result = splitCompound(command);

			expect(result).toEqual(
				ok(["gh repo view owner/repo", "grep name", "echo done"]),
			);
		});
	});

	describe("when the command has env var prefixes", () => {
		describe("when there is a single prefix", () => {
			it("should strip the prefix", () => {
				const command = "NODE_ENV=prod npm test";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["npm test"]));
			});
		});

		describe("when there are multiple prefixes", () => {
			it("should strip all prefixes", () => {
				const command = "FOO=1 BAR=2 npm test";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["npm test"]));
			});
		});

		describe("when the prefixed command is piped", () => {
			it("should strip the prefix and split", () => {
				const command = "NODE_ENV=prod npm test | grep pass";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["npm test", "grep pass"]));
			});
		});
	});

	describe("when the command has fd redirects", () => {
		describe("when using 2>&1", () => {
			it("should strip the redirect", () => {
				const command = "npx vitest run 2>&1";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["npx vitest run"]));
			});

			describe("when in a compound command", () => {
				it("should strip the redirect and split", () => {
					const command = "cd /c/git/assist && npx vitest run 2>&1";

					const result = splitCompound(command);

					expect(result).toEqual(ok(["cd /c/git/assist", "npx vitest run"]));
				});
			});
		});

		describe("when using non-numeric >&", () => {
			it("should reject", () => {
				const command = "echo hello >& file.txt";

				const result = splitCompound(command);

				expect(result).toEqual(unparseable);
			});
		});

		describe("when using 2>/dev/null", () => {
			it("should strip the redirect", () => {
				const command = "gh pr checks 607 2>/dev/null";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["gh pr checks 607"]));
			});

			describe("when in a piped command", () => {
				it("should strip the redirect and split", () => {
					const command = "gh pr checks 607 2>/dev/null | head -20";

					const result = splitCompound(command);

					expect(result).toEqual(ok(["gh pr checks 607", "head -20"]));
				});
			});
		});

		describe("when using >/dev/null", () => {
			it("should strip the redirect", () => {
				const command = "echo hello >/dev/null";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["echo hello"]));
			});
		});

		describe("when using 2>$null (PowerShell)", () => {
			it("should strip the redirect", () => {
				const command = "assist run foo 2>$null";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["assist run foo"]));
			});

			it("should strip the redirect in a compound command", () => {
				const command =
					"assist run foo 2>$null; assist run bar && assist run baz";

				const result = splitCompound(command);

				expect(result).toEqual(
					ok(["assist run foo", "assist run bar", "assist run baz"]),
				);
			});
		});

		describe("when using >$null (PowerShell)", () => {
			it("should strip the redirect", () => {
				const command = "echo hello >$null";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["echo hello"]));
			});
		});
	});

	describe("when the command redirects to the OS temp directory", () => {
		const tmp = tmpdir();

		it("should strip > <tmpdir>/file", () => {
			const command = `az logs show --tail 300 > ${tmp}/ca-logs3.json`;

			const result = splitCompound(command);

			expect(result).toEqual(ok(["az logs show --tail 300"]));
		});

		it("should strip >> <tmpdir>/file (append)", () => {
			const command = `echo hello >> ${tmp}/out.log`;

			const result = splitCompound(command);

			expect(result).toEqual(ok(["echo hello"]));
		});

		it("should strip 2>&1 combined with > to a temp path", () => {
			const command = `az containerapp logs show -n foo --tail 300 2>&1 > ${tmp}/ca-logs3.json`;

			const result = splitCompound(command);

			expect(result).toEqual(
				ok(["az containerapp logs show -n foo --tail 300"]),
			);
		});

		it("should strip 2> prefix when redirecting to temp", () => {
			const command = `echo hello 2>${tmp}/errlog`;

			const result = splitCompound(command);

			expect(result).toEqual(ok(["echo hello"]));
		});

		it("should reject a target outside the temp directory with a clear error", () => {
			const command = "echo hello > /not-temp/file.txt";

			const result = splitCompound(command);

			expect(result).toEqual(redirectError("/not-temp/file.txt"));
		});
	});

	describe("when the command contains unsafe constructs", () => {
		describe("when using $() substitution", () => {
			it("should reject", () => {
				const command = "echo $(date)";

				const result = splitCompound(command);

				expect(result).toEqual(unparseable);
			});
		});

		describe("when using backtick substitution", () => {
			it("should reject", () => {
				const command = "echo `date`";

				const result = splitCompound(command);

				expect(result).toEqual(unparseable);
			});

			describe("when backticks are inside double-quoted arguments", () => {
				it("should allow them as literal characters", () => {
					const command =
						'assist backlog add-phase 48 "title" --task "Install `react-router` as a dependency"';

					const result = splitCompound(command);

					expect(result).toEqual(
						ok([
							"assist backlog add-phase 48 title --task Install `react-router` as a dependency",
						]),
					);
				});
			});

			describe("when backticks are inside single-quoted arguments", () => {
				it("should allow them as literal characters", () => {
					const command = "echo 'hello `world`'";

					const result = splitCompound(command);

					expect(result).toEqual(ok(["echo hello `world`"]));
				});
			});

			describe("when backticks are escaped with backslash", () => {
				it("should allow them as literal characters", () => {
					const command = "echo \\`not-a-substitution\\`";

					const result = splitCompound(command);

					expect(result).toEqual(ok(["echo `not-a-substitution`"]));
				});
			});
		});

		describe("when using output redirection to a non-temp path", () => {
			it("should reject with a clear error", () => {
				const command = "echo hello > file.txt";

				const result = splitCompound(command);

				expect(result).toEqual(redirectError("file.txt"));
			});
		});

		describe("when using input redirection", () => {
			it("should reject", () => {
				const command = "cat < file.txt";

				const result = splitCompound(command);

				expect(result).toEqual(unparseable);
			});
		});

		describe("when using append redirection to a non-temp path", () => {
			it("should reject with a clear error", () => {
				const command = "echo hello >> file.txt";

				const result = splitCompound(command);

				expect(result).toEqual(redirectError("file.txt"));
			});
		});
	});

	describe("when the command contains glob patterns", () => {
		it("should treat glob tokens as their pattern string", () => {
			const command = "ls *.ts";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["ls *.ts"]));
		});

		describe("when the glob is in a compound command", () => {
			it("should split and preserve the glob pattern", () => {
				const command = "echo start && ls *.ts | grep foo";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["echo start", "ls *.ts", "grep foo"]));
			});
		});

		describe("when the glob uses **", () => {
			it("should preserve the full pattern", () => {
				const command = "cat src/**/*.test.ts";

				const result = splitCompound(command);

				expect(result).toEqual(ok(["cat src/**/*.test.ts"]));
			});
		});
	});

	describe("when given an empty string", () => {
		it("should return an error", () => {
			const command = "";

			const result = splitCompound(command);

			expect(result).toEqual(unparseable);
		});
	});

	describe("when given whitespace only", () => {
		it("should return an error", () => {
			const command = "   ";

			const result = splitCompound(command);

			expect(result).toEqual(unparseable);
		});
	});

	describe("when the command has leading and trailing whitespace", () => {
		it("should trim the whitespace", () => {
			const command = "  gh repo view owner/repo  ";

			const result = splitCompound(command);

			expect(result).toEqual(ok(["gh repo view owner/repo"]));
		});
	});
});
