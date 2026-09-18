import { beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const runGhGraphqlJson = vi.fn();
const readGhTokenScopes = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../../prs/shared", () => ({
	getRepoInfo: () => ({ org: "acme", repo: "widgets" }),
}));
vi.mock("../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (...args: unknown[]) => runGhGraphqlJson(...args),
}));
vi.mock("./readGhTokenScopes", () => ({
	readGhTokenScopes: () => readGhTokenScopes(),
}));

import { startIssue } from "./startIssue";

type Board = {
	itemId: string;
	projectId: string;
	number: number;
	title: string;
	field?: { id: string; options: { id: string; name: string }[] } | null;
};

const ROADMAP: Board = {
	itemId: "PVTI_1",
	projectId: "PVT_1",
	number: 1,
	title: "Roadmap",
	field: {
		id: "F_status",
		options: [
			{ id: "OPT_todo", name: "Todo" },
			{ id: "OPT_progress", name: "In Progress" },
		],
	},
};

function graphqlReplies(boards: Board[] = []) {
	return (query: string) => {
		if (query.includes("projectItems(first:")) {
			return JSON.stringify({
				data: {
					repository: {
						issue: {
							id: "I_1",
							projectItems: {
								nodes: boards.map((board) => ({
									id: board.itemId,
									project: {
										id: board.projectId,
										number: board.number,
										title: board.title,
										field: board.field ?? null,
									},
								})),
							},
						},
					},
				},
			});
		}
		return JSON.stringify({
			data: {
				updateProjectV2ItemFieldValue: { projectV2Item: { id: "PVTI_1" } },
			},
		});
	};
}

let logged: string[] = [];

beforeEach(() => {
	execFileSync.mockReset();
	execFileSync.mockReturnValue("");
	runGhGraphqlJson.mockReset();
	runGhGraphqlJson.mockImplementation(graphqlReplies());
	readGhTokenScopes.mockReset();
	readGhTokenScopes.mockReturnValue(["repo", "project"]);
	logged = [];
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		logged.push(args.join(" "));
	});
});

function output(): string {
	return logged.join("\n");
}

describe("startIssue assignment", () => {
	it("assigns the issue to the authenticated user", () => {
		startIssue("7", { repo: "acme/widgets" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["issue", "edit", "7", "--repo", "acme/widgets", "--add-assignee", "@me"],
			expect.anything(),
		);
		expect(output()).toContain("Assigned acme/widgets#7 to you");
	});

	it("assigns against the current repo when no repo is passed", () => {
		startIssue("7", {});

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--repo", "acme/widgets"]),
			expect.anything(),
		);
	});

	it("refuses a number that is not an issue number", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);

		expect(() => startIssue("nonsense", { repo: "acme/widgets" })).toThrow(
			"process.exit",
		);
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("startIssue board", () => {
	it("sets every board offering an In Progress option", () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([
				ROADMAP,
				{
					itemId: "PVTI_2",
					projectId: "PVT_2",
					number: 4,
					title: "Platform",
					field: {
						id: "F_status_2",
						options: [{ id: "OPT_wip", name: "in progress" }],
					},
				},
			]),
		);

		startIssue("7", { repo: "acme/widgets" });

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			{
				projectId: "PVT_1",
				itemId: "PVTI_1",
				fieldId: "F_status",
				optionId: "OPT_progress",
			},
		);
		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			{
				projectId: "PVT_2",
				itemId: "PVTI_2",
				fieldId: "F_status_2",
				optionId: "OPT_wip",
			},
		);
		expect(output()).toContain("project 1 (Roadmap)");
		expect(output()).toContain("project 4 (Platform)");
	});

	it("reads the boards from the issue itself", () => {
		startIssue("7", { repo: "acme/widgets" });

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("projectItems(first:"),
			{ owner: "acme", repo: "widgets", number: 7 },
		);
	});

	it("reports that there was no board to move when the issue is on none", () => {
		startIssue("7", { repo: "acme/widgets" });

		expect(output()).toContain("Assigned acme/widgets#7 to you");
		expect(output()).toContain("is on no project board");
		expect(runGhGraphqlJson).not.toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			expect.anything(),
		);
	});

	it("lists the options a board offers when none of them is In Progress", () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([
				{
					...ROADMAP,
					field: {
						id: "F_status",
						options: [
							{ id: "OPT_todo", name: "Todo" },
							{ id: "OPT_done", name: "Done" },
						],
					},
				},
			]),
		);

		startIssue("7", { repo: "acme/widgets" });

		expect(output()).toContain("Assigned acme/widgets#7 to you");
		expect(output()).toContain("no In Progress option");
		expect(output()).toContain("Todo, Done");
		expect(runGhGraphqlJson).not.toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			expect.anything(),
		);
	});

	it("moves the boards it can when another has no In Progress option", () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([
				{
					itemId: "PVTI_2",
					projectId: "PVT_2",
					number: 4,
					title: "Platform",
					field: { id: "F_status_2", options: [{ id: "OPT_x", name: "Done" }] },
				},
				ROADMAP,
			]),
		);

		startIssue("7", { repo: "acme/widgets" });

		expect(output()).toContain("no In Progress option");
		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateProjectV2ItemFieldValue"),
			{
				projectId: "PVT_1",
				itemId: "PVTI_1",
				fieldId: "F_status",
				optionId: "OPT_progress",
			},
		);
	});

	it("reports a board with no Status field at all", () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([{ ...ROADMAP, field: null }]),
		);

		startIssue("7", { repo: "acme/widgets" });

		expect(output()).toContain("has no Status field");
	});

	it("assigns first and reports the scope problem when the token has no project scope", () => {
		readGhTokenScopes.mockReturnValue(["repo", "read:org"]);

		startIssue("7", { repo: "acme/widgets" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--add-assignee", "@me"]),
			expect.anything(),
		);
		expect(output()).toContain("Assigned acme/widgets#7 to you");
		expect(output()).toContain("gh auth refresh -h github.com -s project");
		expect(runGhGraphqlJson).not.toHaveBeenCalled();
	});
});
