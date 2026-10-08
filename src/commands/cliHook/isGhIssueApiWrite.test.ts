import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
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

describe("isGhIssueApiWrite graphql mutations", () => {
	const dir = mkdtempSync(join(tmpdir(), "gh-graphql-"));
	afterAll(() => rmSync(dir, { recursive: true, force: true }));

	function queryFile(name: string, query: string): string {
		const path = join(dir, name);
		writeFileSync(path, query);
		return path;
	}

	it("flags the createIssue mutation from the repro", () => {
		expect(
			isGhIssueApiWrite(
				`gh api graphql -f query='mutation{createIssue(input:{repositoryId:"R_1",title:"t",body:"b"}){issue{url}}}'`,
			),
		).toBe(true);
	});

	it("flags a variable-driven createIssue with a body file", () => {
		expect(
			isGhIssueApiWrite(
				'gh api graphql -f query=\'mutation($body:String!){createIssue(input:{repositoryId:"R_1",title:"t",body:$body}){issue{url}}}\' -F body=@body.md',
			),
		).toBe(true);
	});

	it.each(["updateIssue", "addComment", "updateIssueComment", "addSubIssue"])(
		"flags a %s mutation",
		(name) => {
			expect(
				isGhIssueApiWrite(
					`gh api graphql -f query='mutation { ${name}(input: {id: "I_1"}) { clientMutationId } }'`,
				),
			).toBe(true);
		},
	);

	it("flags a query passed however the field flag is spelled", () => {
		const query = "'query=mutation{addComment(input:{}){clientMutationId}}'";
		expect(isGhIssueApiWrite(`gh api graphql --raw-field ${query}`)).toBe(true);
		expect(isGhIssueApiWrite(`gh api graphql --field=${query}`)).toBe(true);
		expect(isGhIssueApiWrite(`gh api graphql -f${query}`)).toBe(true);
	});

	it("flags a mutation read from a query file", () => {
		const path = queryFile(
			"create.graphql",
			'mutation($id: ID!) {\n  createIssue(input: {repositoryId: $id, title: "t"}) { issue { url } }\n}\n',
		);
		expect(
			isGhIssueApiWrite(`gh api graphql -F query=@${path} -f id=R_1`),
		).toBe(true);
	});

	it("flags a mutation in a --input request body", () => {
		const path = queryFile(
			"body.json",
			JSON.stringify({ query: "mutation{updateIssue(input:{}){issue{id}}}" }),
		);
		expect(isGhIssueApiWrite(`gh api graphql --input ${path}`)).toBe(true);
	});

	it("falls back to the command text for a query file it cannot read", () => {
		expect(
			isGhIssueApiWrite(
				'cat > missing.graphql <<\'EOF\'\nmutation { addComment(input: {subjectId: "I_1", body: "x"}) { clientMutationId } }\nEOF\ngh api graphql -F query=@missing.graphql',
			),
		).toBe(true);
	});

	it("leaves read-only graphql queries alone", () => {
		expect(
			isGhIssueApiWrite(
				`gh api graphql -f query='query{repository(owner:"acme",name:"widgets"){issue(number:1){title}}}'`,
			),
		).toBe(false);
		const path = queryFile("read.graphql", "{ viewer { login } }");
		expect(isGhIssueApiWrite(`gh api graphql -F query=@${path}`)).toBe(false);
	});

	it("flags an issue write inside a command substitution", () => {
		const mutation = `gh api graphql -f query='mutation($repo:ID!){createIssue(input:{repositoryId:$repo}){issue{id}}}' -f repo=x`;
		expect(isGhIssueApiWrite(mutation)).toBe(true);
		expect(isGhIssueApiWrite(`R=$(${mutation})`)).toBe(true);
		expect(isGhIssueApiWrite(`R=\`${mutation}\``)).toBe(true);
		expect(
			isGhIssueApiWrite("echo $(gh api -X POST repos/acme/widgets/issues)"),
		).toBe(true);
		expect(
			isGhIssueApiWrite("echo `gh api -X POST repos/acme/widgets/issues`"),
		).toBe(true);
	});

	it("leaves issue reads inside a command substitution alone", () => {
		expect(isGhIssueApiWrite("R=$(gh api repos/acme/widgets/issues/180)")).toBe(
			false,
		);
		expect(isGhIssueApiWrite("R=`gh api repos/acme/widgets/issues/180`")).toBe(
			false,
		);
		expect(
			isGhIssueApiWrite(
				"echo $(gh api repos/acme/widgets/issues/180) -X POST -f x=y",
			),
		).toBe(false);
	});

	it("leaves non-issue mutations alone", () => {
		expect(
			isGhIssueApiWrite(
				`gh api graphql -f query='mutation{addStar(input:{starrableId:"R_1"}){clientMutationId}}'`,
			),
		).toBe(false);
	});
});
