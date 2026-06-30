// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DismissButton } from "./DismissButton";

afterEach(cleanup);

describe("DismissButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<DismissButton id="54" status="waiting" onDismiss={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Dismiss session 54");
	});
});
