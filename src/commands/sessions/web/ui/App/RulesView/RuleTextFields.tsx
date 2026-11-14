import TextField from "@mui/material/TextField";

type Props = {
	title: string;
	text: string;
	onTitleChange: (title: string) => void;
	onTextChange: (text: string) => void;
};

export function RuleTextFields({
	title,
	text,
	onTitleChange,
	onTextChange,
}: Props) {
	return (
		<>
			<TextField
				label="Title"
				size="small"
				value={title}
				onChange={(event) => onTitleChange(event.target.value)}
			/>
			<TextField
				label="Rule"
				size="small"
				multiline
				minRows={3}
				value={text}
				onChange={(event) => onTextChange(event.target.value)}
			/>
		</>
	);
}
