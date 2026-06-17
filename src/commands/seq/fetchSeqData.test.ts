import { describe, expect, it } from "vitest";
import { buildDataParams, mapDataToEvents } from "./fetchSeqData";

describe("buildDataParams", () => {
	it("should pass --from/--to as Seq rangeStartUtc/rangeEndUtc params", () => {
		const params = buildDataParams(
			"@Level = 'Error'",
			50,
			"2026-06-16T08:40:00Z",
			"2026-06-16T09:10:00Z",
		);

		expect(params.get("rangeStartUtc")).toBe("2026-06-16T08:40:00Z");
		expect(params.get("rangeEndUtc")).toBe("2026-06-16T09:10:00Z");
	});

	it("should omit range params when not provided", () => {
		const params = buildDataParams("@Level = 'Error'", 50);

		expect(params.has("rangeStartUtc")).toBe(false);
		expect(params.has("rangeEndUtc")).toBe(false);
	});

	it("should set only rangeStartUtc when only from is provided", () => {
		const params = buildDataParams(
			"@Level = 'Error'",
			50,
			"2026-06-16T08:40:00Z",
		);

		expect(params.get("rangeStartUtc")).toBe("2026-06-16T08:40:00Z");
		expect(params.has("rangeEndUtc")).toBe(false);
	});

	it("should embed the filter and count in the SQL query", () => {
		const params = buildDataParams("@Level = 'Error'", 25);

		expect(params.get("q")).toBe(
			"select @Timestamp, @Level, @Exception, @Message from stream where @Level = 'Error' order by @Timestamp desc limit 25",
		);
	});
});

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
