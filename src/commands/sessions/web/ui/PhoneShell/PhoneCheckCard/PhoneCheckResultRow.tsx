import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { CheckResult } from "../../../../shared/askCheckInputSchema";

const buttonSx = { borderRadius: "12px", flex: 1 } as const;

export function PhoneCheckResultRow({
	disabled,
	onSend,
}: {
	disabled: boolean;
	onSend: (result: CheckResult) => void;
}) {
	return (
		<Box sx={{ display: "flex", gap: 1 }}>
			<Button
				variant="outlined"
				color="error"
				sx={buttonSx}
				disabled={disabled}
				onClick={() => onSend("doesn't work")}
			>
				Doesn't work
			</Button>
			<Button
				variant="contained"
				color="success"
				disableElevation
				sx={buttonSx}
				disabled={disabled}
				onClick={() => onSend("works")}
			>
				Works
			</Button>
		</Box>
	);
}
