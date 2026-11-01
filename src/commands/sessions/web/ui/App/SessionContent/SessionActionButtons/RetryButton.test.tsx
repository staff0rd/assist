// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RetryButton } from "./RetryButton";

afterEach(cleanup);

describe("RetryButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<RetryButton id="54" onRetry={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Retry session 54");
	});

	describe("for a server session", () => {
		it("replaces the running server on shift+click", () => {
			const onRetry = vi.fn();
			render(<RetryButton id="54" onRetry={onRetry} server />);

			fireEvent.click(screen.getByRole("button"), { shiftKey: true });

			expect(onRetry).toHaveBeenCalledWith(true);
		});

		it("leaves the conflict check in place on a plain click", () => {
			const onRetry = vi.fn();
			render(<RetryButton id="54" onRetry={onRetry} server />);

			fireEvent.click(screen.getByRole("button"));

			expect(onRetry).toHaveBeenCalledWith(undefined);
		});

		it("mentions shift+click in its tooltip", () => {
			render(<RetryButton id="54" onRetry={() => {}} server />);

			expect(screen.getByRole("button").title).toContain(
				"shift+click replaces a running server without asking",
			);
		});
	});

	it("does not replace on shift+click for a non-server session", () => {
		const onRetry = vi.fn();
		render(<RetryButton id="54" onRetry={onRetry} />);

		fireEvent.click(screen.getByRole("button"), { shiftKey: true });

		expect(onRetry).toHaveBeenCalledWith(undefined);
	});
});
