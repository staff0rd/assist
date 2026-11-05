import { inboxFlagInstructions } from "./inboxFlagInstructions";

export function buildInboxScanPrompt(since: Date): string {
	const sinceUnix = Math.floor(since.getTime() / 1000);
	return [
		"Triage my Gmail and Slack for messages a person wrote to me that need my reply or action.",
		"You are read-only: never label, mark read, react to, reply to or otherwise change any message.",
		"",
		"Gmail:",
		'- Call search_threads with query "in:inbox is:unread" (page through all results).',
		"- Call get_thread with messageFormat PLAIN_TEXT on each thread.",
		"- Consider the latest unread message in each thread.",
		"",
		`Slack (only messages since ${since.toISOString()}, unix ${sinceUnix}):`,
		`- Call slack_search_public_and_private with filters "is:dm" and after "${sinceUnix}".`,
		`- Call slack_search_public_and_private with keywords ["<@MY_USER_ID>"] and after "${sinceUnix}", where MY_USER_ID is the logged-in user id from the tool description.`,
		"- Skip messages I wrote myself.",
		"- For a message in a thread, call slack_read_thread and skip it if I have replied in that thread after it.",
		"",
		...inboxFlagInstructions(),
	].join("\n");
}
