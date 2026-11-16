import Button from "@mui/material/Button";

const buttonSx = { fontSize: 15, fontWeight: 600, minWidth: 0 } as const;

export function PhoneResumeButton({
	disabled,
	onResume,
}: {
	disabled: boolean;
	onResume: () => void;
}) {
	return (
		<Button sx={buttonSx} disabled={disabled} onClick={onResume}>
			Resume
		</Button>
	);
}
