export function codexSandboxMode(
	allowEdits: boolean | undefined,
): "read-only" | "workspace-write" {
	return allowEdits === false ? "read-only" : "workspace-write";
}
