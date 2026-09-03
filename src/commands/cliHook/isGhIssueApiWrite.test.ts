import { describe, expect, it } from "vitest";
import { isGhIssueApiWrite } from "./isGhIssueApiWrite";

describe("isGhIssueApiWrite write methods", () => {
	it("flags a PATCH of a posted issue comment", () => {
		expect(
			isGhIssueApiWrite(
				"gh api -X PATCH repos/acme/widgets/issues/comments/12345 --input -",
			),
		).toBe(true);
	});

	it("flags a POST of a new issue comment", () => {
		expect(
			isGhIssueApiWrite(
				"gh api -X POST repos/acme/widgets/issues/180/comments -f body=hi",
			),
		).toBe(true);
	});

	it("flags a PATCH of an issue body", () => {
		expect(
			isGhIssueApiWrite("gh api --method PATCH repos/acme/widgets/issues/180"),
		).toBe(true);
	});

	it("flags a POST that opens an issue", () => {
		expect(
			isGhIssueApiWrite("gh api -X POST repos/acme/widgets/issues -f title=x"),
		).toBe(true);
	});

	it("flags a DELETE and a PUT", () => {
		expect(
			isGhIssueApiWrite(
				"gh api -X DELETE repos/acme/widgets/issues/comments/1",
			),
		).toBe(true);
		expect(
			isGhIssueApiWrite("gh api -X PUT repos/acme/widgets/issues/180/lock"),
		).toBe(true);
	});

	it("flags the method however it is spelled", () => {
		expect(
			isGhIssueApiWrite("gh api -XPATCH repos/acme/widgets/issues/comments/1"),
		).toBe(true);
		expect(
			isGhIssueApiWrite(
				"gh api --method=patch repos/acme/widgets/issues/comments/1",
			),
		).toBe(true);
	});

	it("flags a leading-slash path and a full api url", () => {
		expect(
			isGhIssueApiWrite(
				"gh api -X PATCH /repos/acme/widgets/issues/comments/1",
			),
		).toBe(true);
		expect(
			isGhIssueApiWrite(
				"gh api -X PATCH https://api.github.com/repos/acme/widgets/issues/comments/1",
			),
		).toBe(true);
	});

	it("flags a write buried after a command boundary", () => {
		expect(
			isGhIssueApiWrite(
				"cd /repo && gh api -X PATCH repos/acme/widgets/issues/comments/1 --input -",
			),
		).toBe(true);
	});

	it("flags a body-flag write that never names a method", () => {
		expect(
			isGhIssueApiWrite(
				"gh api repos/acme/widgets/issues/comments/1 --input body.json",
			),
		).toBe(true);
		expect(
			isGhIssueApiWrite(
				"gh api repos/acme/widgets/issues/180/comments -f body=x",
			),
		).toBe(true);
	});
});

describe("isGhIssueApiWrite reads and other endpoints", () => {
	it("leaves a plain read alone", () => {
		expect(isGhIssueApiWrite("gh api repos/acme/widgets/issues/180")).toBe(
			false,
		);
		expect(
			isGhIssueApiWrite(
				"gh api --paginate repos/acme/widgets/issues/180/comments --jq '.[].id'",
			),
		).toBe(false);
	});

	it("leaves an explicit GET with fields alone", () => {
		expect(
			isGhIssueApiWrite(
				"gh api -X GET repos/acme/widgets/issues -f state=open",
			),
		).toBe(false);
	});

	it("leaves writes to other endpoints alone", () => {
		expect(
			isGhIssueApiWrite("gh api -X POST repos/acme/widgets/pulls/9/reviews"),
		).toBe(false);
		expect(
			isGhIssueApiWrite("gh api -X PATCH repos/acme/widgets/labels/bug"),
		).toBe(false);
	});

	it("leaves a non-gh-api command alone", () => {
		expect(
			isGhIssueApiWrite("curl -X PATCH repos/acme/widgets/issues/comments/1"),
		).toBe(false);
	});

	it("does not carry a write method across a command boundary", () => {
		expect(
			isGhIssueApiWrite(
				"gh api repos/acme/widgets/issues/180 && curl -X PATCH elsewhere",
			),
		).toBe(false);
	});
});
