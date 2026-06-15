import { describe, expect, it, vi } from "vitest";
import { timeAgo } from "./timeAgo";

describe("timeAgo", () => {
	describe("when less than 60 seconds ago", () => {
		it("should return just now", () => {
			const now = new Date().toISOString();

			expect(timeAgo(now)).toBe("just now");
		});
	});

	describe("when minutes ago", () => {
		it("should return minutes", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-01T12:05:00Z"));

			expect(timeAgo("2026-01-01T12:00:00Z")).toBe("5m ago");

			vi.useRealTimers();
		});
	});

	describe("when hours ago", () => {
		it("should return hours", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-01T15:00:00Z"));

			expect(timeAgo("2026-01-01T12:00:00Z")).toBe("3h ago");

			vi.useRealTimers();
		});
	});

	describe("when days ago", () => {
		it("should return days", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-03T12:00:00Z"));

			expect(timeAgo("2026-01-01T12:00:00Z")).toBe("2d ago");

			vi.useRealTimers();
		});
	});
});
