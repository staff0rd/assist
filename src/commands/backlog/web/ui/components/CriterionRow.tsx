import { Button, Stack, TextField } from "@mui/material";

type CriterionRowProps = {
	value: string;
	isFirst: boolean;
	onChange: (value: string) => void;
	onAdd: () => void;
	onRemove: () => void;
};

export function CriterionRow({
	value,
	isFirst,
	onChange,
	onAdd,
	onRemove,
}: CriterionRowProps) {
	return (
		<Stack direction="row" spacing={1}>
			<TextField
				fullWidth
				size="small"
				placeholder="Criterion"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{isFirst ? (
				<Button variant="outlined" onClick={onAdd} sx={{ minWidth: 40 }}>
					+
				</Button>
			) : (
				<Button
					variant="outlined"
					color="error"
					onClick={onRemove}
					sx={{ minWidth: 40 }}
				>
					&minus;
				</Button>
			)}
		</Stack>
	);
}
