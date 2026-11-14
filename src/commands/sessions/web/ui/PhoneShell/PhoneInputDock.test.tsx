// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { PhoneInputDock } from "./PhoneInputDock";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("../apiFetch", () => ({ apiFetch }));

afterEach(() => {
	cleanup();
	apiFetch.mockReset();
});

describe("PhoneInputDock", () => {
	it("renders for a harness this bundle does not know, without suggesting commands", () => {
		render(
			<PhoneInputDock
				harness={"future-harness" as HarnessKind}
				cwd="/repo"
				waiting={false}
				keyboardOpen={false}
				onSend={() => {}}
			/>,
		);
		expect(
			screen.getByPlaceholderText("Reply to future-harness…"),
		).toBeTruthy();
		expect(apiFetch).not.toHaveBeenCalled();
	});
});
