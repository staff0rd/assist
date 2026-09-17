import { describe, expect, it } from "vitest";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import type { HighLevelCheckId } from "./highLevelChecklist";
import type { HighLevelCheckResult, HighLevelSubject } from "./types";

const BODY = `## What

Adds a filter to the orders list.

## Why

Resolves #412`;

function subject(overrides: Partial<HighLevelSubject> = {}): HighLevelSubject {
	return {
		body: BODY,
		changedFiles: ["src/orders/filter.ts"],
		config: { criticalPaths: [], uiPaths: [], descriptionWordCap: 300 },
		...overrides,
	};
}

function check(
	id: HighLevelCheckId,
	overrides: Partial<HighLevelSubject> = {},
): HighLevelCheckResult {
	const result = evaluateHighLevelChecks(subject(overrides)).find(
		(candidate) => candidate.id === id,
	);
	if (!result) throw new Error(`no check ${id}`);
	return result;
}

describe("evaluateHighLevelChecks", () => {
	it("marks every manual item manual", () => {
		const manual = evaluateHighLevelChecks(subject()).filter(
			(result) => result.kind === "manual",
		);
		expect(manual.map((result) => result.id)).toEqual([
			"structure-sensible",
			"critical-diffs-correct",
			"backend-pr-linked",
		]);
		expect(manual.every((result) => result.status === "manual")).toBe(true);
		expect(manual.every((result) => result.reason.length > 0)).toBe(true);
	});

	it("passes a body with a What and a Why", () => {
		expect(check("description-what-why").status).toBe("pass");
	});

	it("fails and names each missing section", () => {
		const result = check("description-what-why", { body: "Just some prose." });
		expect(result.status).toBe("fail");
		expect(result.reason).toContain("no `## What` section");
		expect(result.reason).toContain("no `## Why` section");
	});

	it("fails an empty Why", () => {
		const result = check("description-what-why", {
			body: "## What\n\nA change.\n\n## Why\n",
		});
		expect(result.status).toBe("fail");
		expect(result.reason).toBe("`## Why` is empty");
	});

	it("notes an optional How when present", () => {
		const result = check("description-what-why", {
			body: `${BODY}\n\n## How\n\nBy adding a where clause.`,
		});
		expect(result.status).toBe("pass");
		expect(result.reason).toContain("`## How`");
	});

	it("passes a description under the word cap", () => {
		const result = check("description-word-cap");
		expect(result.status).toBe("pass");
		expect(result.reason).toContain("of 300 words");
	});

	it("fails a description over the word cap, naming the overage", () => {
		const result = check("description-word-cap", {
			body: `## What\n\n${"word ".repeat(40)}\n\n## Why\n\nBecause.`,
			config: { criticalPaths: [], uiPaths: [], descriptionWordCap: 10 },
		});
		expect(result.status).toBe("fail");
		expect(result.reason).toContain("over the 10-word cap");
	});

	it.each([
		["Resolves #412", "#412"],
		["Resolves acme/widgets#9", "acme/widgets#9"],
		[
			"See https://github.com/acme/widgets/issues/9",
			"https://github.com/acme/widgets/issues/9",
		],
	])("accepts %s as a linked issue", (line, expected) => {
		const result = check("description-links-issue", {
			body: `## What\n\nA change.\n\n## Why\n\n${line}`,
		});
		expect(result.status).toBe("pass");
		expect(result.reason).toBe(`links ${expected}`);
	});

	it("fails a description with no issue reference", () => {
		const result = check("description-links-issue", {
			body: "## What\n\nA change.\n\n## Why\n\nIt was broken.",
		});
		expect(result.status).toBe("fail");
	});

	it("does not read a comment anchor as an issue reference", () => {
		const result = check("description-links-issue", {
			body: "## What\n\nA change.\n\n## Why\n\nhttps://github.com/acme/widgets/pull/3#issuecomment-99",
		});
		expect(result.status).toBe("fail");
	});

	it("requires no UI evidence when uiPaths is unset", () => {
		const result = check("ui-evidence", { changedFiles: ["src/ui/App.tsx"] });
		expect(result.status).toBe("pass");
		expect(result.reason).toContain("unset");
	});

	it("requires no UI evidence when no changed file matches uiPaths", () => {
		const result = check("ui-evidence", {
			changedFiles: ["src/orders/filter.ts"],
			config: {
				criticalPaths: [],
				uiPaths: ["src/ui/**"],
				descriptionWordCap: 300,
			},
		});
		expect(result.status).toBe("pass");
		expect(result.reason).toContain("no changed file matches");
	});

	it("fails a UI change with no screenshot", () => {
		const result = check("ui-evidence", {
			changedFiles: ["src/ui/App.tsx"],
			config: {
				criticalPaths: [],
				uiPaths: ["src/ui/**"],
				descriptionWordCap: 300,
			},
		});
		expect(result.status).toBe("fail");
		expect(result.reason).toContain("src/ui/App.tsx");
	});

	it.each([
		"![before](https://example.com/a.png)",
		'<video src="https://example.com/a.mp4"></video>',
		"https://github.com/user-attachments/assets/abc123",
	])("accepts %s as UI evidence", (evidence) => {
		const result = check("ui-evidence", {
			body: `${BODY}\n\n## Screenshots\n\n${evidence}`,
			changedFiles: ["src/ui/App.tsx"],
			config: {
				criticalPaths: [],
				uiPaths: ["src/ui/**"],
				descriptionWordCap: 300,
			},
		});
		expect(result.status).toBe("pass");
	});
});
