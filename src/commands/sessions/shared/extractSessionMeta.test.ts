import { describe, expect, it } from "vitest";
import { extractSessionMeta } from "./extractSessionMeta";

function line(obj: unknown): string {
	return JSON.stringify(obj);
}

describe("extractSessionMeta", () => {
	it("captures command-name and command-args from the first user message", () => {
		const meta = extractSessionMeta([
			line({ sessionId: "abc", cwd: "/home/me/git/repo", timestamp: "t" }),
			line({
				type: "user",
				message: {
					role: "user",
					content:
						"<command-message>next</command-message>\n<command-name>/next</command-name>\n<command-args>223</command-args>",
				},
			}),
		]);
		expect(meta.commandName).toBe("next");
		expect(meta.commandArgs).toBe("223");
		expect(meta.name).toBe("");
	});

	it("leaves markers empty when the first message is a plain prompt", () => {
		const meta = extractSessionMeta([
			line({ sessionId: "abc" }),
			line({
				type: "user",
				message: { role: "user", content: "does this work?" },
			}),
		]);
		expect(meta.commandName).toBe("");
		expect(meta.commandArgs).toBe("");
		expect(meta.name).toBe("does this work?");
	});

	it("skips meta user entries", () => {
		const meta = extractSessionMeta([
			line({ type: "user", isMeta: true, message: { content: "ignored" } }),
			line({
				type: "user",
				message: {
					role: "user",
					content: "<command-name>/draft</command-name>",
				},
			}),
		]);
		expect(meta.commandName).toBe("draft");
	});

	it("synthesizes next markers from a backlog run phase prompt", () => {
		const meta = extractSessionMeta([
			line({ sessionId: "abc" }),
			line({
				type: "user",
				message: {
					role: "user",
					content:
						"You are implementing phase 3 of backlog item a324: History card opens read-only transcript\n\nDescription: ...",
				},
			}),
		]);
		expect(meta.commandName).toBe("next");
		expect(meta.commandArgs).toBe(
			"324 History card opens read-only transcript",
		);
	});
});
