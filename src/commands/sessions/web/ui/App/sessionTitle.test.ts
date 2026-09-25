import { describe, expect, it } from "vitest";
import { sessionTitle } from "./sessionTitle";
import type { SessionInfo } from "../types";

function makeSession(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "1",
		name: "fallback",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("sessionTitle", () => {
	it("shows the first arg (slash command) for assist sessions", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft", "--once"],
			name: "assist draft --once",
		});

		expect(sessionTitle(session)).toBe("draft");
	});

	it("falls back to the name when an assist session has no args", () => {
		const session = makeSession({ commandType: "assist", name: "assist" });

		expect(sessionTitle(session)).toBe("assist");
	});

	it("shows 'run: <name>' for run sessions", () => {
		const session = makeSession({
			commandType: "run",
			runName: "build",
			name: "run: build",
		});

		expect(sessionTitle(session)).toBe("run: build");
	});

	it("shows the prompt-derived name for claude sessions", () => {
		const session = makeSession({ commandType: "claude", name: "fix the bug" });

		expect(sessionTitle(session)).toBe("fix the bug");
	});

	it("shows the placeholder while a prompted draft card awaits its title", () => {
		const session = makeSession({
			id: "11",
			commandType: "assist",
			assistArgs: ["draft", "--once", "add dark mode"],
		});

		expect(sessionTitle(session)).toBe("Session 11");
	});

	it("shows the item name for a backlog activity (id is shown as a chip)", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["next", "--once"],
			activity: {
				kind: "backlog",
				itemId: 129,
				itemName: "Session card type",
				phase: 2,
				totalPhases: 3,
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Session card type");
	});

	it("shows the item name for a refine session (id is shown as a chip)", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["refine", "--once", "254"],
			activity: {
				kind: "command",
				name: "refine 254",
				itemId: 254,
				itemName: "Add refine mode button",
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Add refine mode button");
	});

	it("shows the generated title for a claude session in place of the name", () => {
		const session = makeSession({
			commandType: "claude",
			name: "Session 7",
			generatedTitle: "Fix login redirect",
		});

		expect(sessionTitle(session)).toBe("Fix login redirect");
	});

	it("shows the generated title for an assist session in place of the raw prompt", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft", "--once", "add dark mode to the settings page"],
			generatedTitle: "Dark mode setting",
		});

		expect(sessionTitle(session)).toBe("Dark mode setting");
	});

	it("prefers an explicit title over a generated one", () => {
		const session = makeSession({
			commandType: "assist",
			title: "Explicit title",
			generatedTitle: "Generated title",
		});

		expect(sessionTitle(session)).toBe("Explicit title");
	});

	it("prefers a backlog item name over a generated title", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["next", "--once"],
			generatedTitle: "Generated title",
			activity: {
				kind: "backlog",
				itemId: 129,
				itemName: "Session card type",
				phase: 2,
				totalPhases: 3,
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Session card type");
	});

	it("prefers a refine session's item name over a generated title", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["refine", "--once", "254"],
			generatedTitle: "Generated title",
			activity: {
				kind: "command",
				name: "refine 254",
				itemId: 254,
				itemName: "Add refine mode button",
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe("Add refine mode button");
	});

	it("prefers a filed item name over a bug card's generated title", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: [
				"bug",
				"--once",
				"https://centium.atlassian.net/browse/PA-556",
			],
			generatedTitle: "Contact email dropped on save",
			activity: {
				kind: "command",
				name: "bug",
				itemId: 871,
				itemName: "Saving a client twice drops the contact email",
				startedAt: 0,
			},
		});

		expect(sessionTitle(session)).toBe(
			"Saving a client twice drops the contact email",
		);
	});

	it("shows the entered prompt text for an assist command that gets no title", () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["next", "--once", "add dark mode"],
		});

		expect(sessionTitle(session)).toBe("add dark mode");
	});

	it("keeps the run name for run sessions even with a generated title", () => {
		const session = makeSession({
			commandType: "run",
			runName: "build",
			generatedTitle: "Generated title",
		});

		expect(sessionTitle(session)).toBe("run: build");
	});
});
