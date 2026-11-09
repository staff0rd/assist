import { describe, expect, it } from "vitest";
import { buildInboxScanPrompt } from "./buildInboxScanPrompt";
import { buildInboxThreadsPrompt } from "./buildInboxThreadsPrompt";

const prompts = [
	buildInboxScanPrompt(new Date("2026-11-09T21:00:00Z")),
	buildInboxThreadsPrompt(["1a1c23992eda4933"]),
];

describe("inboxFlagInstructions", () => {
	it.each(prompts)(
		"flags person-written messages relayed by notification emails",
		(prompt) => {
			expect(prompt).toContain(
				"A notification email that relays a message a person wrote to me",
			);
			expect(prompt).toContain("even when it comes from a no-reply address");
		},
	);

	it.each(prompts)("names the relayed message's author as sender", (prompt) => {
		expect(prompt).toContain(
			"for a relayed message, the person who wrote it, never the notification address",
		);
	});

	it.each(prompts)("still skips purely automated notifications", (prompt) => {
		expect(prompt).toContain(
			"Do not flag purely automated messages with no person-written message to me: bots, apps, CI, calendars, ticketing, monitoring, newsletters or mailing lists.",
		);
		expect(prompt).not.toContain("no-reply addresses)");
	});
});
