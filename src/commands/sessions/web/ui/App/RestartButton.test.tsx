// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RestartButton } from "./RestartButton";

afterEach(cleanup);

describe("RestartButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Restart session 54");
	});

	it("names the session id in the confirm dialog title", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByRole("heading").textContent).toBe("Restart session 54");
	});

	it("says a claude session resumes its conversation", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		fireEvent.click(screen.getByRole("button"));

		expect(
			screen.getByText(/Restart this Claude session/).textContent,
		).toContain("resumes the conversation");
	});

	it("says a codex session resumes its conversation", () => {
		render(<RestartButton id="54" onRestart={() => {}} harness="codex" />);

		fireEvent.click(screen.getByRole("button"));

		expect(
			screen.getByText(/Restart this Codex session/).textContent,
		).toContain("resumes the conversation");
	});

	it("says a pi session relaunches from the start", () => {
		render(<RestartButton id="54" onRestart={() => {}} harness="pi" />);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByText(/Restart this pi session/).textContent).toContain(
			"relaunches it from the start",
		);
	});
});
