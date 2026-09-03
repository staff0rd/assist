import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const mockRequestPreviewDecision = vi.fn();
const runGhGraphqlJson = vi.fn();
const readGhTokenScopes = vi.fn();

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
vi.mock("./readGhTokenScopes", () => ({
	readGhTokenScopes: () => readGhTokenScopes(),
}));

import { createIssue } from "./createIssue";

const ISSUE_URL = "https://github.com/acme/widgets/issues/7";
const CREATED_NUMBER = 7;

const STATUS_FIELD = {
	id: "F_status",
	options: [
		{ id: "OPT_backlog", name: "Backlog" },
		{ id: "OPT_done", name: "Done" },
	],
};

const PROJECT = { id: "PVT_1", title: "Roadmap", field: STATUS_FIELD };

type GraphqlWorld = {
	orgTypes?: { id: string; name: string }[];
	project?: { id: string; title: string; field?: unknown } | null;
	projectRoot?: "organization" | "user";
	labels?: string[];
	parentExists?: boolean;
};

function graphqlReplies(world: GraphqlWorld = {}) {
	return (query: string, variables?: Record<string, unknown>) => {
		if (query.includes("labels(first:")) {
			return JSON.stringify({
				data: {
					repository: {
						labels: {
							nodes: (world.labels ?? []).map((name) => ({ name })),
							pageInfo: { hasNextPage: false, endCursor: null },
						},
					},
				},
			});
		}
		if (query.includes("issueTypes")) {
			return JSON.stringify({
				data: { organization: { issueTypes: { nodes: world.orgTypes ?? [] } } },
			});
		}
		if (query.includes("projectV2(number:")) {
			const root = query.includes("organization(login:")
				? "organization"
				: "user";
			const found = root === (world.projectRoot ?? "organization");
			return JSON.stringify({
				data: { [root]: found ? { projectV2: world.project ?? null } : null },
			});
		}
		if (query.includes("issue(number:")) {
			if (variables?.number === CREATED_NUMBER) {
				return JSON.stringify({
					data: { repository: { issue: { id: "I_1" } } },
				});
			}
			const found = world.parentExists ?? true;
			return JSON.stringify({
				data: { repository: { issue: found ? { id: "I_parent" } : null } },
			});
		}
		if (query.includes("addSubIssue")) {
			return JSON.stringify({
				data: { addSubIssue: { subIssue: { id: "I_1" } } },
			});
		}
		if (query.includes("addProjectV2ItemById")) {
			return JSON.stringify({
				data: { addProjectV2ItemById: { item: { id: "PVTI_1" } } },
			});
		}
		if (query.includes("updateProjectV2ItemFieldValue")) {
			return JSON.stringify({
				data: {
					updateProjectV2ItemFieldValue: { projectV2Item: { id: "PVTI_1" } },
				},
			});
		}
		return JSON.stringify({
			data: { updateIssueIssueType: { issue: { id: "I_1" } } },
		});
	};
}

beforeEach(() => {
	execFileSync.mockReset();
	execFileSync.mockReturnValue(`${ISSUE_URL}\n`);
	mockRequestPreviewDecision.mockReset();
	runGhGraphqlJson.mockReset();
	readGhTokenScopes.mockReset();
	readGhTokenScopes.mockReturnValue(["repo", "project"]);
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

function exitThrows() {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

describe("createIssue arguments", () => {
	it("requires a title and a body", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(createIssue({ body: "Details" })).rejects.toThrow(
			"process.exit",
		);
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("delegates to gh issue create", async () => {
		await createIssue({ title: "Crash on load", body: "Details" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["issue", "create", "--title", "Crash on load", "--body", "Details"],
			expect.anything(),
		);
	});

	it("passes the target repo through", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
		});

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--repo", "acme/widgets"]),
			expect.anything(),
		);
	});

	it("rejects a title referencing claude", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({ title: "Crash found by Claude", body: "Details" }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("rejects a body referencing a backlog item", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({ title: "Crash on load", body: "Tracked as a706." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("createIssue preview", () => {
	it("creates without a preview outside a web session", async () => {
		await createIssue({ title: "Crash on load", body: "Details" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).toHaveBeenCalled();
	});

	it("previews the issue in a web session and creates it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await createIssue({ title: "Crash on load", body: "Details" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Crash on load",
				body: "Details",
				kind: "github-issue",
				prNumber: null,
			}),
		);
		expect(execFileSync).toHaveBeenCalled();
	});

	it("appends approved screenshots under a Screenshots heading", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			screenshots: ["![a](https://x/a.png)", "![b](https://x/b.png)"],
		});

		await createIssue({ title: "Crash on load", body: "Details" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"create",
				"--title",
				"Crash on load",
				"--body",
				"Details\n\n## Screenshots\n\n![a](https://x/a.png)\n\n![b](https://x/b.png)",
			],
			expect.anything(),
		);
	});

	it("leaves the body alone when the reviewer attached nothing", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await createIssue({ title: "Crash on load", body: "Details" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--body", "Details"]),
			expect.anything(),
		);
	});

	it("discards screenshots when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			screenshots: ["![a](https://x/a.png)"],
		});

		await expect(
			createIssue({ title: "Crash on load", body: "Details" }),
		).rejects.toThrow("process.exit");

		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("exits non-zero without creating when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "needs repro steps",
			comments: [{ quote: "Details", note: "list the steps" }],
		});

		await expect(
			createIssue({ title: "Crash on load", body: "Details" }),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("needs repro steps");
		expect(output).toContain("> Details");
		expect(output).toContain("list the steps");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("createIssue --type", () => {
	it("aborts before creating when the organisation has no such type", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({
				orgTypes: [
					{ id: "IT_epic", name: "Epic" },
					{ id: "IT_bug", name: "Bug" },
				],
			}),
		);

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				type: "Saga",
			}),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Epic, Bug");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("previews the metadata block without posting it in the body", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ orgTypes: [{ id: "IT_epic", name: "Epic" }] }),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			type: "epic",
		});

		const request = mockRequestPreviewDecision.mock.calls[0]?.[0];
		expect(request?.body).toBe("Details");
		expect(request?.metadata).toEqual([
			{ label: "Repository", value: "acme/widgets" },
			{ label: "Type", value: "Epic" },
		]);

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"create",
				"--title",
				"Crash on load",
				"--body",
				"Details",
				"--repo",
				"acme/widgets",
			],
			expect.anything(),
		);
	});

	it("applies the resolved type to the created issue", async () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ orgTypes: [{ id: "IT_epic", name: "Epic" }] }),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			type: "Epic",
		});

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateIssueIssueType"),
			{ issueId: "I_1", issueTypeId: "IT_epic" },
		);
	});

	it("reports the created issue and the failing step when typing fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		const replies = graphqlReplies({
			orgTypes: [{ id: "IT_epic", name: "Epic" }],
		});
		runGhGraphqlJson.mockImplementation((query: string) => {
			if (query.includes("updateIssueIssueType")) throw new Error("HTTP 403");
			return replies(query);
		});

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				type: "Epic",
			}),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain(ISSUE_URL);
		expect(output).toContain("issue type to Epic");
		expect(output).toContain("HTTP 403");
	});
});

describe("createIssue --project", () => {
	function errorText(spy: { mock: { calls: unknown[][] } }): string {
		return spy.mock.calls.map((call) => call.join(" ")).join("\n");
	}

	it("rejects --status without --project before creating", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				status: "Backlog",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("needs --project");
		expect(execFileSync).not.toHaveBeenCalled();
		expect(runGhGraphqlJson).not.toHaveBeenCalled();
	});

	it("aborts before creating when the token has no project scope", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		readGhTokenScopes.mockReturnValue(["repo", "read:org"]);
		runGhGraphqlJson.mockImplementation(graphqlReplies({ project: PROJECT }));

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				project: "1",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain(
			"gh auth refresh -h github.com -s project",
		);
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("aborts before creating when the project has no such status", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(graphqlReplies({ project: PROJECT }));

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				project: "1",
				status: "Shipped",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("Backlog, Done");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("aborts before creating when the owner has no such project", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(graphqlReplies({ project: null }));

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				project: "9",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("No project 9 owned by acme");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("resolves a project owned by a user when the owner is not an organisation", async () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ project: PROJECT, projectRoot: "user" }),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			project: "1",
		});

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("addProjectV2ItemById"),
			{ projectId: "PVT_1", contentId: "I_1" },
		);
	});

	it("previews the project and status without posting them in the body", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		runGhGraphqlJson.mockImplementation(graphqlReplies({ project: PROJECT }));

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			project: "1",
			status: "backlog",
		});

		const request = mockRequestPreviewDecision.mock.calls[0]?.[0];
		expect(request?.body).toBe("Details");
		expect(request?.metadata).toEqual([
			{ label: "Repository", value: "acme/widgets" },
			{ label: "Project", value: "1 (Roadmap)" },
			{ label: "Status", value: "Backlog" },
		]);

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"create",
				"--title",
				"Crash on load",
				"--body",
				"Details",
				"--repo",
				"acme/widgets",
			],
			expect.anything(),
		);
	});

	it("adds the created issue to the project and sets its status", async () => {
		runGhGraphqlJson.mockImplementation(graphqlReplies({ project: PROJECT }));

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			project: "1",
			status: "Backlog",
		});

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("addProjectV2ItemById"),
			{ projectId: "PVT_1", contentId: "I_1" },
		);
		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			{
				projectId: "PVT_1",
				itemId: "PVTI_1",
				fieldId: "F_status",
				optionId: "OPT_backlog",
			},
		);
	});

	it("reports the created issue and the failing step when the status mutation fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		const replies = graphqlReplies({ project: PROJECT });
		runGhGraphqlJson.mockImplementation((query: string) => {
			if (query.includes("updateProjectV2ItemFieldValue")) {
				throw new Error("HTTP 403");
			}
			return replies(query);
		});

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				project: "1",
				status: "Backlog",
			}),
		).rejects.toThrow("process.exit");

		const output = errorText(errorSpy);
		expect(output).toContain(ISSUE_URL);
		expect(output).toContain("status to Backlog");
		expect(output).toContain("HTTP 403");
	});
});

describe("createIssue --parent", () => {
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
			{ issueId: "I_parent", subIssueId: "I_1" },
		);
	}

	beforeEach(() => {
		runGhGraphqlJson.mockImplementation(graphqlReplies());
	});

	it("parents the created issue under owner/repo#number", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			parent: "acme/widgets#12",
		});

		expectParentedTo("acme", "widgets", 12);
	});

	it("parents the created issue under a github.com issue URL", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			parent: "https://github.com/acme/widgets/issues/12",
		});

		expectParentedTo("acme", "widgets", 12);
	});

	it("reads a bare parent number against --repo", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			parent: "12",
		});

		expectParentedTo("acme", "widgets", 12);
	});

	it("reads a bare parent number against the current repo", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			parent: "12",
		});

		expectParentedTo("acme", "widgets", 12);
	});

	it("accepts a parent in another repository", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			parent: "other/tools#3",
		});

		expectParentedTo("other", "tools", 3);
	});

	it("previews the parent without posting it in the body", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			parent: "other/tools#3",
		});

		const request = mockRequestPreviewDecision.mock.calls[0]?.[0];
		expect(request?.body).toBe("Details");
		expect(request?.metadata).toEqual([
			{ label: "Repository", value: "acme/widgets" },
			{ label: "Parent", value: "other/tools#3" },
		]);
	});

	it("creates nothing when the reference is not an issue", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				parent: "nonsense",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("Could not read");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("creates nothing when the parent issue does not exist", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ parentExists: false }),
		);

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				parent: "acme/widgets#12",
			}),
		).rejects.toThrow("process.exit");

		expect(errorText(errorSpy)).toContain("No issue acme/widgets#12");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("reports the created issue and the failing step when parenting fails", async () => {
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
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				parent: "acme/widgets#12",
			}),
		).rejects.toThrow("process.exit");

		const output = errorText(errorSpy);
		expect(output).toContain(ISSUE_URL);
		expect(output).toContain("sub-issue of acme/widgets#12");
		expect(output).toContain("HTTP 403");
	});
});

describe("createIssue --label", () => {
	it("aborts before creating when the repo has no such label", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ labels: ["bug", "documentation"] }),
		);

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				label: ["regression"],
			}),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("bug, documentation");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("passes the repo's own spelling of each label to gh issue create", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		runGhGraphqlJson.mockImplementation(
			graphqlReplies({ labels: ["bug", "needs triage"] }),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			label: ["Bug", "needs-triage"],
		});

		const request = mockRequestPreviewDecision.mock.calls[0]?.[0];
		expect(request?.body).toBe("Details");
		expect(request?.metadata).toEqual([
			{ label: "Repository", value: "acme/widgets" },
			{ label: "Labels", value: "bug, needs triage" },
		]);
		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"create",
				"--title",
				"Crash on load",
				"--body",
				"Details",
				"--repo",
				"acme/widgets",
				"--label",
				"bug",
				"--label",
				"needs triage",
			],
			expect.anything(),
		);
	});
});
