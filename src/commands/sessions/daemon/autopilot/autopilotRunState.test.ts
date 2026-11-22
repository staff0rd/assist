import { describe, expect, it } from "vitest";
import type { Session } from "../types";
import { autopilotRunState } from "./autopilotRunState";

const session = (status: Session["status"], autopilot = "root") =>
	({ id: "x", status, autopilot }) as Session;

describe("autopilotRunState", () => {
	it("stays live while a backlog run the root started is running", () => {
		const root = session("waiting");
		expect(autopilotRunState(root, [root, session("running")])).toBe("live");
	});

	it("ends once the root and every run it started have ended", () => {
		const root = session("waiting");
		expect(autopilotRunState(root, [root, session("done")])).toBe("ended");
	});

	it("reports the root's error when nothing is live", () => {
		const root = session("error");
		expect(autopilotRunState(root, [root])).toBe("errored");
	});
});
