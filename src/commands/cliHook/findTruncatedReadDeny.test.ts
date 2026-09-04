import { describe, expect, it } from "vitest";
import {
	findTruncatedReadDeny,
	findTruncatedReadDenyRaw,
} from "./findTruncatedReadDeny";

describe("findTruncatedReadDeny", () => {
	it("denies backlog show piped to head", () => {
		const decision = findTruncatedReadDeny([
			"assist backlog show a930",
			"head -60",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toBe(
			"Do not pipe 'assist backlog show' through head or tail. Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run 'assist backlog show <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.",
		);
	});

	it("names the view alias in its reason", () => {
		expect(
			findTruncatedReadDeny(["assist backlog view a930", "head -60"])
				?.permissionDecisionReason,
		).toBe(
			"Do not pipe 'assist backlog view' through head or tail. Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run 'assist backlog view <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.",
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
			findTruncatedReadDenyRaw("assist backlog view a930 2>&1 | head -60")
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

	it("denies prs list-comments piped to head", () => {
		const decision = findTruncatedReadDeny([
			"assist prs list-comments",
			"head -60",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toBe(
			"Do not pipe 'assist prs list-comments' through head or tail. Every unresolved thread prints in full above the resolved index, with its author, path:line, id, url and body, so a truncated read leaves you the one-line resolved index instead of the threads. Run 'assist prs list-comments' bare and read all of it — do not read or parse the YAML cache; fixed, wontfix and reply locate it themselves.",
		);
	});

	it("denies prs list-comments piped to tail", () => {
		const decision = findTruncatedReadDeny([
			"assist prs list-comments 12",
			"tail -20",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist prs list-comments",
		);
		expect(decision?.permissionDecisionReason).toContain(
			"do not read or parse the YAML cache",
		);
	});

	it("allows a bare prs list-comments", () => {
		expect(findTruncatedReadDeny(["assist prs list-comments"])).toBeUndefined();
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
		[
			"assist github issue edit-comment 12 --body y",
			"assist github issue edit-comment",
		],
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

	it("keeps the shared approval-gated reason", () => {
		expect(
			findTruncatedReadDeny(["assist prs raise", "tail -20"])
				?.permissionDecisionReason,
		).toBe(
			"Do not pipe 'assist prs raise' through head or tail. It gates on a preview the reviewer can reject with inline comments, and those comments print at the end of the output. Nothing persists them, so a truncated read discards the reviewer's feedback for good and they have to retype it. Run 'assist prs raise' bare and read all of it.",
		);
	});

	it("denies an approval-gated command in a raw unsplit command", () => {
		expect(
			findTruncatedReadDenyRaw(
				"assist github issue create --title x --body y 2>&1 | tail -20",
			)?.permissionDecision,
		).toBe("deny");
	});

	it("allows a gated command whose argument text only quotes a pipe to a truncator", () => {
		expect(
			findTruncatedReadDeny([
				"assist backlog comment a972 denied when piped as | tail -20",
			]),
		).toBeUndefined();
	});

	it("allows a gated body that documents piping through head", () => {
		expect(
			findTruncatedReadDeny([
				"assist github issue create --title x --body repro: run it | head -5",
			]),
		).toBeUndefined();
	});

	it("still denies a gated command truncated by a real pipe alongside such body text", () => {
		expect(
			findTruncatedReadDeny([
				"assist backlog comment a972 mentions | tail -20 in the body",
				"tail -20",
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
