import { postRoamActivity } from "./postRoamActivity";

// Equivalent hook for ~/.claude/settings.json (PostToolUse):
//
// {
//   "type": "command",
//   "command": "cat >/dev/null; curl -sf --max-time 0.2 -X POST \"http://127.0.0.1:$(cat 'C:\\Users\\staff_dlpf6ow\\AppData\\Roaming\\Roam\\roam-local-api.port')/api/v1/activity/claude-code/post-tool-use?pid=$PPID\" >/dev/null 2>&1 || true",
//   "timeout": 3
// }

export function showClaudeCodeIcon(): void {
	postRoamActivity("claude-code", "post-tool-use");
}
