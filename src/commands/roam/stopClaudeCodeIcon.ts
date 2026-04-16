import { postRoamActivity } from "./postRoamActivity";

// Equivalent hook for ~/.claude/settings.json (Stop):
//
// {
//   "type": "command",
//   "command": "cat >/dev/null; curl -sf --max-time 0.2 -X POST \"http://127.0.0.1:$(cat 'C:\\Users\\staff_dlpf6ow\\AppData\\Roaming\\Roam\\roam-local-api.port')/api/v1/activity/claude-code/stop?pid=$PPID\" >/dev/null 2>&1 || true",
//   "timeout": 3
// }

export async function stopClaudeCodeIcon(): Promise<void> {
	await postRoamActivity("claude-code", "stop");
}
