import Button from "@mui/material/Button";

type Props = {
	saving: boolean;
	canClear?: boolean;
	clearTitle?: string;
	onSave: () => void;
	onClear?: () => void;
	onCancel: () => void;
};

export function ConfigWriteButtons({
	saving,
	canClear,
	clearTitle,
	onSave,
	onClear,
	onCancel,
}: Props) {
	return (
		<>
			<Button
				size="small"
				variant="contained"
				disabled={saving}
				onClick={onSave}
			>
				Save
			</Button>
			<Button size="small" disabled={saving} onClick={onCancel}>
				Cancel
			</Button>
			{canClear && onClear && (
				<Button
					size="small"
					color="error"
					disabled={saving}
					title={clearTitle}
					onClick={onClear}
				>
					Clear
				</Button>
			)}
		</>
	);
}
