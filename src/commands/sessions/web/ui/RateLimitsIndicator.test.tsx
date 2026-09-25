// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimitsIndicator } from "./RateLimitsIndicator";

const NOW = 1_700_000_000;

beforeEach(() => vi.useFakeTimers({ now: NOW * 1000 }));

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

const claude = { five_hour: { used_percentage: 12, resets_at: NOW + 3600 } };
const codex = { seven_day: { used_percentage: 34, resets_at: NOW + 86400 } };

function renderIndicator(props: Parameters<typeof RateLimitsIndicator>[0]) {
	return render(
		<MemoryRouter>
			<RateLimitsIndicator {...props} />
		</MemoryRouter>,
	);
}

describe("RateLimitsIndicator", () => {
	it("shows Claude's chips without a harness label when only Claude reports", () => {
		renderIndicator({ rateLimits: claude });

		expect(screen.getByRole("link").textContent).toBe("12% (1h 0m)");
	});

	it("labels each harness when Codex reports alongside Claude", () => {
		renderIndicator({ rateLimits: claude, harnessRateLimits: { codex } });

		expect(screen.getByRole("link").textContent).toBe(
			"Claude12% (1h 0m)Codex34% (1d 0h)",
		);
	});

	it("shows Codex usage on its own when Claude has reported nothing", () => {
		renderIndicator({ rateLimits: null, harnessRateLimits: { codex } });

		expect(screen.getByRole("link").textContent).toBe("Codex34% (1d 0h)");
	});

	it("falls back to the Usage link when nothing has reported", () => {
		renderIndicator({ rateLimits: null });

		expect(screen.getByRole("link").textContent).toBe("Usage");
	});
});
