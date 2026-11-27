export function pendingPreviewMessage(pending: unknown): string {
	const which = typeof pending === "string" && pending ? ` (${pending})` : "";
	return `Error: a preview is already pending in the session's web preview pane${which}. This command was not run and opened no preview. Wait for the user's decision on the pending preview — it arrives as your next message — then run this command again.`;
}
