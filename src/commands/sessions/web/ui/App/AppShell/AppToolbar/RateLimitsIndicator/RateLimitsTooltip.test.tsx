// @vitest-environment jsdom
import { createTheme, hexToRgb } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RateLimits } from "../../../../../../../../shared/RateLimits";
import type { RateLimitLevel } from "../../../../../../../../shared/rateLimitLevel";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../../../../../shared/rateLimitLevel";
import { RateLimitsTooltip } from "./RateLimitsTooltip";

const NOW = 1_700_000_000;

beforeEach(() => vi.useFakeTimers({ now: NOW * 1000 }));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const { palette } = createTheme();

function levelColor(level: RateLimitLevel): string {
	const swatch = {
		ok: palette.success,
		warn: palette.warning,
		over: palette.error,
	};
	return hexToRgb(swatch[level].main);
}

function colorOf(text: string): string {
	return getComputedStyle(screen.getByText(text)).color;
}

function rowText(label: string): string {
	return screen.getByText(label).parentElement?.textContent ?? "";
}

function usageWindow(pct: number, elapsed: number, windowSeconds: number) {
	return {
		used_percentage: pct,
		resets_at: NOW + windowSeconds * (1 - elapsed),
	};
}

function renderTooltip(rateLimits: RateLimits) {
	render(<RateLimitsTooltip rateLimits={rateLimits} />);
}

describe("RateLimitsTooltip", () => {
	it("steps a green window to its yellow threshold", () => {
		renderTooltip({ five_hour: usageWindow(18, 0.4, FIVE_HOUR_SECONDS) });

		expect(screen.getByText("5h")).toBeTruthy();
		expect(colorOf("18%")).toBe(levelColor("ok"));
		expect(colorOf("30%")).toBe(levelColor("warn"));
	});

	it("steps a yellow window back to green and on to its red threshold", () => {
		renderTooltip({ seven_day: usageWindow(35, 0.4, SEVEN_DAY_SECONDS) });

		expect(screen.getByText("7d")).toBeTruthy();
		expect(colorOf("35%")).toBe(levelColor("warn"));
		expect(colorOf("30%")).toBe(levelColor("ok"));
		expect(colorOf("40%")).toBe(levelColor("over"));
		expect(rowText("7d")).toBe("7d30%←35%→40%green in 11h 12m");
	});

	it("reports a yellow window at or over 75% as unrecoverable before reset", () => {
		renderTooltip({ five_hour: usageWindow(80, 0.9, FIVE_HOUR_SECONDS) });

		expect(colorOf("80%")).toBe(levelColor("warn"));
		expect(screen.getByText("not before reset")).toBeTruthy();
		expect(screen.queryByText(/green in/)).toBeNull();
	});

	it("steps a red window back to its yellow threshold", () => {
		renderTooltip({ five_hour: usageWindow(45, 0.4, FIVE_HOUR_SECONDS) });

		expect(colorOf("45%")).toBe(levelColor("over"));
		expect(colorOf("40%")).toBe(levelColor("warn"));
		expect(rowText("5h")).toBe("5h40%←45%under in 15m");
		expect(screen.queryByText("→")).toBeNull();
	});

	it("reports a red window at or over 100% as unrecoverable before reset", () => {
		renderTooltip({ five_hour: usageWindow(120, 0.4, FIVE_HOUR_SECONDS) });

		expect(colorOf("120%")).toBe(levelColor("over"));
		expect(screen.getByText("not before reset")).toBeTruthy();
		expect(screen.queryByText(/under in/)).toBeNull();
	});

	it("notes a window with no projection yet instead of a threshold", () => {
		renderTooltip({ seven_day: usageWindow(2, 0.04, SEVEN_DAY_SECONDS) });

		expect(colorOf("2%")).toBe(levelColor("ok"));
		expect(screen.getByText("no projection yet")).toBeTruthy();
		expect(screen.queryByText("→")).toBeNull();
	});

	it("renders one row per window that carries a percentage", () => {
		renderTooltip({
			five_hour: usageWindow(18, 0.4, FIVE_HOUR_SECONDS),
			seven_day: { used_percentage: undefined },
		});

		expect(screen.getByText("5h")).toBeTruthy();
		expect(screen.queryByText("7d")).toBeNull();
	});
});
