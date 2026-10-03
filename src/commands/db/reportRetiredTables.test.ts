import { afterEach, describe, expect, it, vi } from "vitest";
import { reportRetiredTables } from "./reportRetiredTables";

describe("reportRetiredTables", () => {
	afterEach(() => vi.restoreAllMocks());

	it("warns with the row count and the drop command", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		reportRetiredTables([{ name: "handovers", rows: 3 }]);
		expect(error).toHaveBeenCalledOnce();
		expect(error.mock.calls[0][0]).toContain("handovers");
		expect(error.mock.calls[0][0]).toContain("3 rows");
		expect(error.mock.calls[0][0]).toContain("assist db drop-retired");
	});

	it("prints nothing when no retired table exists", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		reportRetiredTables([]);
		expect(error).not.toHaveBeenCalled();
	});
});
