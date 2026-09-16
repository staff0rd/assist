import { spawnSync } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function compose(cwd: string): string {
	try {
		const result = spawnSync("assist", ["advise"], { cwd, encoding: "utf8" });
		return result.stdout?.trim() ?? "";
	} catch {
		return "";
	}
}

export default function (pi: ExtensionAPI) {
	let advice = "";

	pi.on("session_start", (_event, ctx) => {
		advice = compose(ctx.cwd);
	});

	pi.on("before_agent_start", (event) => {
		if (!advice || event.systemPrompt.includes(advice)) return undefined;
		return { systemPrompt: `${event.systemPrompt}\n\n${advice}` };
	});
}
