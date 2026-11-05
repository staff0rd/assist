import { inboxFlagInstructions } from "./inboxFlagInstructions";

export function buildInboxThreadsPrompt(threadIds: string[]): string {
	return [
		"Triage these unread threads from my Gmail inbox for messages that need my reply or action.",
		"You are read-only: never label, mark read, reply to or otherwise change any message.",
		"",
		"Call get_thread with messageFormat PLAIN_TEXT on every one of these thread ids, and consider the latest unread message in each:",
		...threadIds.map((id) => `- ${id}`),
		"",
		...inboxFlagInstructions(),
	].join("\n");
}
