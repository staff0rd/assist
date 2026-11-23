/** Autopilot's reply to a run session that ended its turn waiting on a chat answer. */
export function idleMemberPrompt(): string {
	return "Autopilot is running this session unattended, so no one reads or answers chat. Treat this message as the user's own reply: yes, go ahead with what you recommended. If you asked whether to mark the item done or complete it, this is the user's explicit instruction to complete it, so run the completion steps now. If you need a decision, ask through an assist preview (ask-question, ask or ask-check), never in chat.";
}
