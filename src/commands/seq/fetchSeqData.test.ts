import { describe, expect, it } from "vitest";
import { mapDataToEvents } from "./fetchSeqData";

describe("mapDataToEvents", () => {
	it("should map rows to SeqEvent objects", () => {
		const data = {
			Columns: ["@Timestamp", "@Level", "@Exception", "@Message"],
			Rows: [
				[639104616000000000, "Information", null, "Job started"],
				[639104616600000000, "Error", "NullRef at Main()", "Job failed"],
			],
		};

		const events = mapDataToEvents(data);

		expect(events).toEqual([
			{
				Timestamp: "2026-03-30T10:00:00.000Z",
				Level: "Information",
				Exception: undefined,
				Properties: [],
				MessageTemplateTokens: [{ Text: "Job started" }],
			},
			{
				Timestamp: "2026-03-30T10:01:00.000Z",
				Level: "Error",
				Exception: "NullRef at Main()",
				Properties: [],
				MessageTemplateTokens: [{ Text: "Job failed" }],
			},
		]);
	});

	it("should handle ISO string timestamps", () => {
		const data = {
			Columns: ["@Timestamp", "@Level", "@Exception", "@Message"],
			Rows: [["2026-03-30T10:00:00.000Z", "Warning", null, "Slow query"]],
		};

		const events = mapDataToEvents(data);

		expect(events).toHaveLength(1);
		expect(events[0].Timestamp).toBe("2026-03-30T10:00:00.000Z");
		expect(events[0].Level).toBe("Warning");
		expect(events[0].MessageTemplateTokens).toEqual([{ Text: "Slow query" }]);
	});

	it("should return empty array for no rows", () => {
		const data = {
			Columns: ["@Timestamp", "@Level", "@Exception", "@Message"],
			Rows: [],
		};

		expect(mapDataToEvents(data)).toEqual([]);
	});
});
