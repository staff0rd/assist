// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CardHeader } from "./CardHeader";
import type { SessionInfo } from "./types";

afterEach(cleanup);

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

describe("CardHeader prompt", () => {
	it("clamps the prompt to 5 lines with hidden overflow", () => {
		render(<CardHeader session={session} onDismiss={() => {}} />);

		const style = getComputedStyle(screen.getByText("my session"));
		expect(style.getPropertyValue("-webkit-line-clamp")).toBe("5");
		expect(style.overflow).toBe("hidden");
	});
});
