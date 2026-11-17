import { SessionSlashTextField } from "../../slashSuggestions/SessionSlashTextField";

type Props = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
};

export function RuleAddNoteField({ value, onChange, onSubmit }: Props) {
	return (
		<SessionSlashTextField
			autoFocus
			multiline
			minRows={2}
			maxRows={8}
			size="small"
			placeholder="What should agents do or stop doing?"
			value={value}
			onChange={onChange}
			onKeyDown={(e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					onSubmit();
				}
			}}
		/>
	);
}
