import { spawnSync } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type Decision = { decision: "allow" | "deny" | "gate"; reason?: string };

const POLICED_TOOLS = new Set([
	"bash",
	"read",
	"write",
	"edit",
	"grep",
	"find",
	"ls",
]);

function classify(toolName: string, input: unknown): Decision {
	try {
		const result = spawnSync("assist", ["pi-hook"], {
			input: JSON.stringify({ toolName, input }),
			encoding: "utf8",
		});
		const out = result.stdout?.trim();
		if (!out) return { decision: "gate" };
		return JSON.parse(out) as Decision;
	} catch {
		return { decision: "gate" };
	}
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!POLICED_TOOLS.has(event.toolName)) return undefined;

		const { decision, reason } = classify(event.toolName, event.input);

		if (decision === "allow") return undefined;
		if (decision === "deny")
			return {
				block: true,
				reason: reason ?? "Denied by the assist allowlist",
			};

		const command =
			typeof event.input.command === "string" ? event.input.command.trim() : "";
		if (!ctx.hasUI || event.toolName !== "bash" || !command) return undefined;

		const choice = await ctx.ui.select(
			"Command not in the assist allowlist:\n\n  " + command + "\n\nRun it?",
			["Yes", "No"],
		);
		if (choice !== "Yes") return { block: true, reason: "Blocked by user" };
		return undefined;
	});
}
