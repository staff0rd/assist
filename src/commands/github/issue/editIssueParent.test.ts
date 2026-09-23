import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const mockRequestPreviewDecision = vi.fn();
const runGhGraphqlJson = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../../prs/shared", () => ({
	getRepoInfo: () => ({ org: "acme", repo: "widgets" }),
}));
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (...args: unknown[]) => runGhGraphqlJson(...args),
}));

import { editIssue } from "./editIssue";

const CHILD_NUMBER = 42;

function graphqlReplies(world: { parentExists?: boolean } = {}) {
	return (query: string, variables?: Record<string, unknown>) => {
		if (query.includes("issue(number:")) {
			if (variables?.number === CHILD_NUMBER) {
				return JSON.stringify({
					data: { repository: { issue: { id: "I_child" } } },
				});
			}
			const found = world.parentExists ?? true;
			return JSON.stringify({
				data: { repository: { issue: found ? { id: "I_parent" } : null } },
			});
		}
		return JSON.stringify({
			data: { addSubIssue: { subIssue: { id: "I_child" } } },
		});
	};
}

function exitThrows() {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

function errorText(spy: { mock: { calls: unknown[][] } }): string {
	return spy.mock.calls.map((call) => call.join(" ")).join("\n");
}

function expectParentedTo(owner: string, repo: string, number: number): void {
	expect(runGhGraphqlJson).toHaveBeenCalledWith(
		expect.stringContaining("issue(number:"),
		{ owner, repo, number },
	);
	expect(runGhGraphqlJson).toHaveBeenCalledWith(
		expect.stringContaining("addSubIssue"),
		{ issueId: "I_parent", subIssueId: "I_child" },
	);
}

beforeEach(() => {
	execFileSync.mockReset();
	mockRequestPreviewDecision.mockReset();
	runGhGraphqlJson.mockReset();
	runGhGraphqlJson.mockImplementation(graphqlReplies());
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("editIssue --parent", () => {
	it("parents the issue outside a web session", async () => {
		await editIssue("42", { repo: "acme/widgets", parent: "acme/widgets#12" });

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("issue(number:"),
			{ owner: "acme", repo: "widgets", number: CHILD_NUMBER },
		);
		expectParentedTo("acme", "widgets", 12);
	});

	it("leaves the body untouched and previews nothing in a web session", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";

		await editIssue("42", { parent: "12" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).not.toHaveBeenCalled();
		expectParentedTo("acme", "widgets", 12);
	});

	it("parents under a github.com issue URL", async () => {
		await editIssue("42", {
			parent: "https://github.com/acme/widgets/issues/12",
		});

		expectParentedTo("acme", "widgets", 12);
	});

	it("reads a bare parent number against --repo", async () => {
		await editIssue("42", { repo: "other/tools", parent: "12" });

		expectParentedTo("other", "tools", 12);
	});

	it("accepts a parent in another repository", async () => {
		await editIssue("42", { repo: "acme/widgets", parent: "other/tools#3" });

		expectParentedTo("other", "tools", 3);
	});

	it("reports the new parent", async () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await editIssue("42", { parent: "other/tools#3" });

		expect(errorText(logSpy)).toContain(
			"acme/widgets#42 is now a sub-issue of other/tools#3",
		);
	});

	it("exits non-zero without parenting when the reference is not an issue", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(editIssue("42", { parent: "nonsense" })).rejects.toThrow(
			"process.exit",
		);

		expect(errorText(errorSpy)).toContain("Could not read");
		expect(runGhGraphqlJson).not.toHaveBeenCalledWith(
			expect.stringContaining("addSubIssue"),
			expect.anything(),
		);
	});

	it("exits non-zero without parenting when the parent does not exist", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ parentExists: false }),
		);

		await expect(
			editIssue("42", { parent: "acme/widgets#12" }),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("No issue acme/widgets#12");
		expect(runGhGraphqlJson).not.toHaveBeenCalledWith(
			expect.stringContaining("addSubIssue"),
			expect.anything(),
		);
	});

	it("names the issue and the error when the mutation fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		const replies = graphqlReplies();
		runGhGraphqlJson.mockImplementation(
			(query: string, variables?: Record<string, unknown>) => {
				if (query.includes("addSubIssue")) throw new Error("HTTP 403");
				return replies(query, variables);
			},
		);

		await expect(
			editIssue("42", { parent: "acme/widgets#12" }),
		).rejects.toThrow("process.exit");

		const output = errorText(errorSpy);
		expect(output).toContain("acme/widgets#42");
		expect(output).toContain("HTTP 403");
	});
});
