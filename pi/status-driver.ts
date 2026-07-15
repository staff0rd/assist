import { spawn } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function setStatus(status: "running" | "waiting"): void {
	try {
		const child = spawn("assist", ["sessions", "set-status", status], {
			stdio: "ignore",
			detached: true,
		});
		child.on("error", () => {});
		child.unref();
	} catch {}
}

export default function (pi: ExtensionAPI) {
	pi.on("agent_start", () => {
		setStatus("running");
	});
	pi.on("agent_settled", () => {
		setStatus("waiting");
	});
}
