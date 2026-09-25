// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RetryButton } from "./RetryButton";

afterEach(cleanup);

describe("RetryButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<RetryButton id="54" onRetry={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Retry session 54");
	});
});
