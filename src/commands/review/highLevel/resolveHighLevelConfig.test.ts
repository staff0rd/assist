import { describe, expect, it } from "vitest";
import { defaultCriticalPaths } from "../../../shared/defaultCriticalPaths";
import { assistConfigSchema } from "../../../shared/types";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";
import { selectCriticalDiffs } from "./selectCriticalDiffs";
import type { HighLevelFile } from "./types";

function file(path: string): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://github.com/org/repo/pull/1/files#diff-${path}`,
		patch: "@@ -1 +1 @@\n-old\n+new",
	};
}

const changed = [
	".github/workflows/ci.yml",
	"apps/web/.github/actions/setup/action.yml",
	"package.json",
	"packages/x/package.json",
	"Dockerfile",
	"services/api/Dockerfile.prod",
	"docker/api.Dockerfile",
	"docs/CLAUDE.md",
	"src/app.ts",
	"api/schema.graphql",
].map(file);

function criticalFor(raw: unknown): string[] {
	const config = resolveHighLevelConfig(assistConfigSchema.parse(raw));
	return selectCriticalDiffs(changed, config.criticalPaths).map(
		(diff) => diff.path,
	);
}

const defaultCritical = [
	".github/workflows/ci.yml",
	"apps/web/.github/actions/setup/action.yml",
	"package.json",
	"packages/x/package.json",
	"Dockerfile",
	"services/api/Dockerfile.prod",
	"docker/api.Dockerfile",
	"docs/CLAUDE.md",
];

describe("resolveHighLevelConfig criticalPaths", () => {
	it("defaults to the shared critical paths with no review block", () => {
		expect(
			resolveHighLevelConfig(assistConfigSchema.parse({})).criticalPaths,
		).toEqual(defaultCriticalPaths);
	});

	it("selects workflows, actions, package.json, Dockerfiles and CLAUDE.md anywhere by default", () => {
		expect(criticalFor({})).toEqual(defaultCritical);
	});

	it("applies the defaults to a highLevel block without criticalPaths", () => {
		expect(
			criticalFor({ review: { highLevel: { uiPaths: ["src/ui/**"] } } }),
		).toEqual(defaultCritical);
	});

	it("replaces the defaults with a configured value", () => {
		expect(
			criticalFor({
				review: { highLevel: { criticalPaths: ["**/*.graphql"] } },
			}),
		).toEqual(["api/schema.graphql"]);
	});

	it("selects nothing when configured empty", () => {
		expect(
			criticalFor({ review: { highLevel: { criticalPaths: [] } } }),
		).toEqual([]);
	});
});

describe("resolveHighLevelConfig requireLinkedIssue", () => {
	it("defaults to true with no review block", () => {
		expect(
			resolveHighLevelConfig(assistConfigSchema.parse({})).requireLinkedIssue,
		).toBe(true);
	});

	it("defaults to true for a highLevel block without the key", () => {
		expect(
			resolveHighLevelConfig(
				assistConfigSchema.parse({ review: { highLevel: { uiPaths: [] } } }),
			).requireLinkedIssue,
		).toBe(true);
	});

	it("resolves false when configured off", () => {
		expect(
			resolveHighLevelConfig(
				assistConfigSchema.parse({
					review: { highLevel: { requireLinkedIssue: false } },
				}),
			).requireLinkedIssue,
		).toBe(false);
	});
});
