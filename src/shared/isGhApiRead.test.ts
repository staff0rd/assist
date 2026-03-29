import { describe, expect, it } from "vitest";
import { isGhApiRead } from "./isGhApiRead";

describe("isGhApiRead", () => {
	describe("when given a non-gh-api command", () => {
		it("should reject", () => {
			const command = "curl https://api.github.com";

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});

		describe("when the command is gh but not api", () => {
			it("should reject", () => {
				const command = "gh pr list";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});
		});

		describe("when the command is empty", () => {
			it("should reject", () => {
				const command = "";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});
		});
	});

	describe("when no method or body flags are present", () => {
		it("should allow a simple endpoint", () => {
			const command = "gh api repos/owner/repo";

			const result = isGhApiRead(command);

			expect(result).toBe(true);
		});

		describe("when query params are present", () => {
			it("should allow", () => {
				const command = "gh api repos/owner/repo?per_page=100";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		describe("when --jq flag is present", () => {
			it("should allow", () => {
				const command = "gh api repos/owner/repo --jq .name";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		describe("when --paginate is present", () => {
			it("should allow", () => {
				const command = "gh api repos/owner/repo/issues --paginate";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		it("should allow actions job logs endpoint", () => {
			const command = "gh api repos/owner/repo/actions/jobs/12345/logs";

			const result = isGhApiRead(command);

			expect(result).toBe(true);
		});
	});

	describe("when an explicit method flag is provided", () => {
		describe("when the method is GET", () => {
			it("should allow --method GET", () => {
				const command = "gh api repos/owner/repo --method GET";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});

			it("should allow -X GET", () => {
				const command = "gh api repos/owner/repo -X GET";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});

			it("should allow -X=GET", () => {
				const command = "gh api repos/owner/repo -X=GET";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});

			it("should allow --method=GET", () => {
				const command = "gh api repos/owner/repo --method=GET";

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		describe("when the method is not GET", () => {
			it("should reject POST", () => {
				const command = "gh api repos/owner/repo --method POST";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});

			it("should reject PUT", () => {
				const command = "gh api repos/owner/repo -X PUT";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});

			it("should reject DELETE", () => {
				const command = "gh api repos/owner/repo -X DELETE";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});

			it("should reject PATCH", () => {
				const command = "gh api repos/owner/repo -X PATCH";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});

			it("should reject --method=POST", () => {
				const command = "gh api repos/owner/repo --method=POST";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});
		});
	});

	describe("when body flags are present without an explicit method", () => {
		it("should reject -f", () => {
			const command = "gh api repos/owner/repo -f title=Bug";

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});

		it("should reject -F", () => {
			const command = "gh api repos/owner/repo -F body=@file.txt";

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});

		it("should reject --field", () => {
			const command = "gh api repos/owner/repo --field title=Bug";

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});

		it("should reject --raw-field", () => {
			const command = 'gh api repos/owner/repo --raw-field body="text"';

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});

		it("should reject --input", () => {
			const command = "gh api repos/owner/repo --input body.json";

			const result = isGhApiRead(command);

			expect(result).toBe(false);
		});
	});

	describe("when the endpoint is graphql", () => {
		describe("when the query is a query operation", () => {
			it("should allow", () => {
				const command = `gh api graphql -f query='query { viewer { login } }'`;

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		describe("when the query is shorthand starting with {", () => {
			it("should allow", () => {
				const command = `gh api graphql -f query='{ viewer { login } }'`;

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});

		describe("when the query is a mutation", () => {
			it("should reject", () => {
				const command = `gh api graphql -f query='mutation { createIssue(input: {}) { issue { id } } }'`;

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});
		});

		describe("when no discernible query is provided", () => {
			it("should reject", () => {
				const command = "gh api graphql";

				const result = isGhApiRead(command);

				expect(result).toBe(false);
			});

			describe("when an explicit GET method is given", () => {
				it("should allow", () => {
					const command = "gh api graphql --method GET";

					const result = isGhApiRead(command);

					expect(result).toBe(true);
				});
			});
		});

		describe("when the query is passed via --field flag", () => {
			it("should allow", () => {
				const command = `gh api graphql --field query='query { viewer { login } }'`;

				const result = isGhApiRead(command);

				expect(result).toBe(true);
			});
		});
	});
});
