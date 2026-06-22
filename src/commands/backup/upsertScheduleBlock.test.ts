import { describe, expect, it } from "vitest";
import {
	BEGIN_MARKER,
	END_MARKER,
	readScheduleBlock,
	removeScheduleBlock,
	upsertScheduleBlock,
} from "./upsertScheduleBlock";

const CRON_LINE =
	"0 */6 * * * /usr/bin/node /opt/assist backup >> /home/u/.assist/backups/cron.log 2>&1";

describe("upsertScheduleBlock", () => {
	describe("when the crontab is empty", () => {
		it("adds the marked block", () => {
			const result = upsertScheduleBlock("", "6h", CRON_LINE);
			expect(result).toBe(
				`${BEGIN_MARKER}\n# every 6h\n${CRON_LINE}\n${END_MARKER}\n`,
			);
		});
	});

	describe("when the crontab has unrelated entries", () => {
		it("appends the block and preserves the existing lines", () => {
			const existing = "0 0 * * * /usr/bin/other\n";
			const result = upsertScheduleBlock(existing, "6h", CRON_LINE);
			expect(result).toBe(
				`0 0 * * * /usr/bin/other\n${BEGIN_MARKER}\n# every 6h\n${CRON_LINE}\n${END_MARKER}\n`,
			);
		});
	});

	describe("when a block already exists", () => {
		it("replaces it in place without duplicating", () => {
			const first = upsertScheduleBlock(
				"0 0 * * * /usr/bin/other\n",
				"5m",
				"*/5 * * * * x",
			);
			const second = upsertScheduleBlock(first, "6h", CRON_LINE);

			const occurrences = second.split(BEGIN_MARKER).length - 1;
			expect(occurrences).toBe(1);
			expect(second).toContain("# every 6h");
			expect(second).not.toContain("# every 5m");
			expect(second).toContain("0 0 * * * /usr/bin/other");
		});
	});

	describe("when other lines surround the block", () => {
		it("leaves the surrounding lines intact when replacing", () => {
			const withBlock = upsertScheduleBlock("before\n", "5m", "*/5 * * * * x");
			const result = upsertScheduleBlock(
				`${withBlock}after\n`,
				"6h",
				CRON_LINE,
			);
			expect(result.startsWith("before\n")).toBe(true);
			expect(result.trimEnd().endsWith("after")).toBe(true);
		});
	});
});

describe("readScheduleBlock", () => {
	describe("when no block is present", () => {
		it("returns undefined", () => {
			expect(readScheduleBlock("0 0 * * * /usr/bin/other\n")).toBeUndefined();
			expect(readScheduleBlock("")).toBeUndefined();
		});
	});

	describe("when a block is present", () => {
		it("returns the cadence and cron expression", () => {
			const crontab = upsertScheduleBlock("", "6h", CRON_LINE);
			expect(readScheduleBlock(crontab)).toEqual({
				every: "6h",
				cron: "0 */6 * * *",
			});
		});
	});
});

describe("removeScheduleBlock", () => {
	describe("when a block is present among other lines", () => {
		it("removes only the block", () => {
			const crontab = upsertScheduleBlock(
				"0 0 * * * /usr/bin/other\n",
				"6h",
				CRON_LINE,
			);
			const result = removeScheduleBlock(crontab);
			expect(result).toBe("0 0 * * * /usr/bin/other\n");
		});
	});

	describe("when no block is present", () => {
		it("returns the crontab unchanged", () => {
			const crontab = "0 0 * * * /usr/bin/other\n";
			expect(removeScheduleBlock(crontab)).toBe(crontab);
		});
	});

	describe("when the block is the only content", () => {
		it("returns an empty string", () => {
			const crontab = upsertScheduleBlock("", "6h", CRON_LINE);
			expect(removeScheduleBlock(crontab)).toBe("");
		});
	});
});
