import { PhoneSuggestionChip } from "./PhoneSuggestionChip";
import { PhoneSlashSuggestions } from "./PhoneSlashSuggestions/PhoneSlashSuggestions";
import type { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";

export function PhoneReplySuggestions({
	reply,
	suggestion,
	locked,
}: {
	reply: ReturnType<typeof useSlashReply>;
	suggestion?: string;
	locked?: string;
}) {
	const { suggestions } = reply;
	return (
		<>
			{suggestion && !reply.text && !locked && (
				<PhoneSuggestionChip
					suggestion={suggestion}
					onPick={() => reply.fill(suggestion)}
				/>
			)}
			{suggestions && (
				<PhoneSlashSuggestions
					matches={suggestions.matches}
					query={suggestions.query}
					onPick={reply.pick}
				/>
			)}
		</>
	);
}
