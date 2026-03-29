import { describe, expect, it } from "vitest";
import type { SeqEvent } from "./types";
import { formatEvent } from "./formatEvent";

function makeEvent(overrides: Partial<SeqEvent> = {}): SeqEvent {
	return {
		Timestamp: "2024-01-15T10:30:00.000Z",
		Level: "Information",
		Properties: [],
		MessageTemplateTokens: [{ Text: "Hello world" }],
		...overrides,
	};
}

describe("formatEvent", () => {
	describe("when given a simple text message", () => {
		it("should include the message text", () => {
			const event = makeEvent();

			const result = formatEvent(event);

			expect(result).toContain("Hello world");
		});

		it("should include the level abbreviation", () => {
			const event = makeEvent();

			const result = formatEvent(event);

			expect(result).toContain("INF");
		});
	});

	describe("when the message has template tokens with properties", () => {
		it("should substitute property values", () => {
			const event = makeEvent({
				Properties: [{ Name: "User", Value: "alice" }],
				MessageTemplateTokens: [
					{ Text: "User " },
					{ PropertyName: "User" },
					{ Text: " logged in" },
				],
			});

			const result = formatEvent(event);

			expect(result).toContain("User alice logged in");
		});
	});

	describe("when a property is missing", () => {
		it("should show the placeholder", () => {
			const event = makeEvent({
				MessageTemplateTokens: [{ PropertyName: "Missing" }],
			});

			const result = formatEvent(event);

			expect(result).toContain("{Missing}");
		});
	});

	describe("when the event has an exception", () => {
		it("should include exception lines", () => {
			const event = makeEvent({
				Exception: "NullReferenceException\n  at Program.Main()",
			});

			const result = formatEvent(event);

			expect(result).toContain("NullReferenceException");
			expect(result).toContain("at Program.Main()");
		});
	});

	describe("when the level is Error", () => {
		it("should include ERR abbreviation", () => {
			const event = makeEvent({ Level: "Error" });

			const result = formatEvent(event);

			expect(result).toContain("ERR");
		});
	});

	describe("when the level is Warning", () => {
		it("should include WRN abbreviation", () => {
			const event = makeEvent({ Level: "Warning" });

			const result = formatEvent(event);

			expect(result).toContain("WRN");
		});
	});

	describe("when the level is Fatal", () => {
		it("should include FTL abbreviation", () => {
			const event = makeEvent({ Level: "Fatal" });

			const result = formatEvent(event);

			expect(result).toContain("FTL");
		});
	});

	describe("when the level is Debug", () => {
		it("should include DBG abbreviation", () => {
			const event = makeEvent({ Level: "Debug" });

			const result = formatEvent(event);

			expect(result).toContain("DBG");
		});
	});

	describe("when the level is Verbose", () => {
		it("should include VRB abbreviation", () => {
			const event = makeEvent({ Level: "Verbose" });

			const result = formatEvent(event);

			expect(result).toContain("VRB");
		});
	});

	describe("when the level is unknown", () => {
		it("should use first 3 characters uppercased", () => {
			const event = makeEvent({ Level: "Trace" });

			const result = formatEvent(event);

			expect(result).toContain("TRA");
		});
	});
});
