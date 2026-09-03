import { describe, expect, it } from "vitest";
import { findTruncatedReadDeny } from "./findTruncatedReadDeny";

describe("findTruncatedReadDeny", () => {
	it("denies backlog show piped to head", () => {
		const decision = findTruncatedReadDeny([
			"assist backlog show a930",
			"head -60",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist backlog comments",
		);
	});

	it("denies the view alias", () => {
		expect(
			findTruncatedReadDeny(["assist backlog view a930", "head -60"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies tail as well as head", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "tail -20"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies a truncator reached by an absolute path", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "/usr/bin/head -5"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies a raw command that could not be split into parts", () => {
		expect(
			findTruncatedReadDeny(["assist backlog view a930 2>&1 | head -60"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies when the truncator follows an intermediate filter", () => {
		expect(
			findTruncatedReadDeny([
				"assist backlog show a930",
				"grep -n Comments",
				"head -5",
			])?.permissionDecision,
		).toBe("deny");
	});

	it("allows a bare backlog show", () => {
		expect(findTruncatedReadDeny(["assist backlog show a930"])).toBeUndefined();
	});

	it("allows piping backlog show to a filter that does not truncate", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "grep -n Comments"]),
		).toBeUndefined();
	});

	it("allows head on an unrelated command", () => {
		expect(
			findTruncatedReadDeny(["git log --oneline", "head -5"]),
		).toBeUndefined();
	});

	it("does not match a different backlog subcommand", () => {
		expect(
			findTruncatedReadDeny(["assist backlog comments a930", "head -20"]),
		).toBeUndefined();
	});

	it("does not match a command that merely mentions the read as an argument", () => {
		expect(
			findTruncatedReadDeny(["echo assist backlog show a930", "head -5"]),
		).toBeUndefined();
	});

	it.each([
		["assist backlog propose --title x", "assist backlog propose"],
		["assist backlog comment a930 hi", "assist backlog comment"],
		["assist backlog update-plan a930", "assist backlog update-plan"],
		["assist backlog add-phase a930 Fix", "assist backlog add-phase"],
		[
			"assist github issue create --title x --body y",
			"assist github issue create",
		],
		["assist github issue edit 12 --body y", "assist github issue edit"],
		["assist github issue comment 12 --body y", "assist github issue comment"],
		["assist slack post general --body y", "assist slack post"],
		["assist prs raise", "assist prs raise"],
		["assist prs edit", "assist prs edit"],
		["assist prs comment src/a.ts 3 hi", "assist prs comment"],
		["assist prs reply 12 hi", "assist prs reply"],
		["assist prs wontfix 12 because", "assist prs wontfix"],
		["assist miro extract", "assist miro extract"],
	])("denies approval-gated command %s piped to tail", (command, named) => {
		const decision = findTruncatedReadDeny([command, "tail -20"]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(named);
		expect(decision?.permissionDecisionReason).toContain(
			"print at the end of the output",
		);
	});

	it("denies an approval-gated command in a raw unsplit command", () => {
		expect(
			findTruncatedReadDeny([
				"assist github issue create --title x --body y 2>&1 | tail -20",
			])?.permissionDecision,
		).toBe("deny");
	});

	it("allows a bare approval-gated command", () => {
		expect(
			findTruncatedReadDeny(["assist github issue create --title x"]),
		).toBeUndefined();
	});

	it("allows piping an approval-gated command to a filter that does not truncate", () => {
		expect(
			findTruncatedReadDeny(["assist prs raise", "grep -n url"]),
		).toBeUndefined();
	});

	it("does not match a longer subcommand sharing an approval-gated prefix", () => {
		expect(
			findTruncatedReadDeny(["assist backlog comments a930", "tail -20"]),
		).toBeUndefined();
	});
});
