import { describe, expect, it } from "vitest";
import { isGhApiRead } from "./isGhApiRead";

describe("isGhApiRead", () => {
	describe("non-gh-api commands", () => {
		it("rejects non-gh commands", () => {
			expect(isGhApiRead("curl https://api.github.com")).toBe(false);
		});

		it("rejects gh non-api commands", () => {
			expect(isGhApiRead("gh pr list")).toBe(false);
		});

		it("rejects empty string", () => {
			expect(isGhApiRead("")).toBe(false);
		});
	});

	describe("implicit GET (no method, no body flags)", () => {
		it("allows simple endpoint", () => {
			expect(isGhApiRead("gh api repos/owner/repo")).toBe(true);
		});

		it("allows with query params", () => {
			expect(isGhApiRead("gh api repos/owner/repo?per_page=100")).toBe(true);
		});

		it("allows with --jq flag", () => {
			expect(isGhApiRead("gh api repos/owner/repo --jq .name")).toBe(true);
		});

		it("allows with --paginate", () => {
			expect(isGhApiRead("gh api repos/owner/repo/issues --paginate")).toBe(
				true,
			);
		});

		it("allows actions job logs endpoint", () => {
			expect(
				isGhApiRead("gh api repos/owner/repo/actions/jobs/12345/logs"),
			).toBe(true);
		});
	});

	describe("explicit method flag", () => {
		it("allows --method GET", () => {
			expect(isGhApiRead("gh api repos/owner/repo --method GET")).toBe(true);
		});

		it("allows -X GET", () => {
			expect(isGhApiRead("gh api repos/owner/repo -X GET")).toBe(true);
		});

		it("rejects --method POST", () => {
			expect(isGhApiRead("gh api repos/owner/repo --method POST")).toBe(false);
		});

		it("rejects -X PUT", () => {
			expect(isGhApiRead("gh api repos/owner/repo -X PUT")).toBe(false);
		});

		it("rejects -X DELETE", () => {
			expect(isGhApiRead("gh api repos/owner/repo -X DELETE")).toBe(false);
		});

		it("rejects -X PATCH", () => {
			expect(isGhApiRead("gh api repos/owner/repo -X PATCH")).toBe(false);
		});

		it("allows --method=GET (equals syntax)", () => {
			expect(isGhApiRead("gh api repos/owner/repo --method=GET")).toBe(true);
		});

		it("rejects --method=POST (equals syntax)", () => {
			expect(isGhApiRead("gh api repos/owner/repo --method=POST")).toBe(false);
		});
	});

	describe("body flags imply POST", () => {
		it("rejects -f without method", () => {
			expect(isGhApiRead("gh api repos/owner/repo -f title=Bug")).toBe(false);
		});

		it("rejects -F without method", () => {
			expect(isGhApiRead("gh api repos/owner/repo -F body=@file.txt")).toBe(
				false,
			);
		});

		it("rejects --field without method", () => {
			expect(isGhApiRead("gh api repos/owner/repo --field title=Bug")).toBe(
				false,
			);
		});

		it("rejects --raw-field without method", () => {
			expect(
				isGhApiRead('gh api repos/owner/repo --raw-field body="text"'),
			).toBe(false);
		});

		it("rejects --input without method", () => {
			expect(isGhApiRead("gh api repos/owner/repo --input body.json")).toBe(
				false,
			);
		});
	});

	describe("graphql queries", () => {
		it("allows query operation", () => {
			expect(
				isGhApiRead(`gh api graphql -f query='query { viewer { login } }'`),
			).toBe(true);
		});

		it("allows shorthand query (starts with {)", () => {
			expect(
				isGhApiRead(`gh api graphql -f query='{ viewer { login } }'`),
			).toBe(true);
		});

		it("rejects mutation operation", () => {
			expect(
				isGhApiRead(
					`gh api graphql -f query='mutation { createIssue(input: {}) { issue { id } } }'`,
				),
			).toBe(false);
		});

		it("rejects graphql with no discernible query", () => {
			expect(isGhApiRead("gh api graphql")).toBe(false);
		});
	});
});
