import { TextField } from "@mui/material";

type SearchInputProps = {
	value: string;
	onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
	return (
		<TextField
			fullWidth
			size="small"
			placeholder="Search backlog…"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			sx={{ mb: 2 }}
		/>
	);
}
