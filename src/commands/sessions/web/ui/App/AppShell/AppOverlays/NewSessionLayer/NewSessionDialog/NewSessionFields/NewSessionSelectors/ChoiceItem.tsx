import MenuItem from "@mui/material/MenuItem";

export type Choice = {
	key: string;
	label: string;
	checked: boolean;
	pick: () => void;
};

export function ChoiceItem({
	choice,
	onClose,
}: {
	choice: Choice;
	onClose: () => void;
}) {
	return (
		<MenuItem
			role="menuitemradio"
			aria-checked={choice.checked}
			selected={choice.checked}
			onClick={() => {
				choice.pick();
				onClose();
			}}
			sx={{ fontSize: 13 }}
		>
			{choice.label}
		</MenuItem>
	);
}
