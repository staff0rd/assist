import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { phoneFieldSx } from "../phoneFieldSx";

export function PhoneRejectReason({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Box
			component="label"
			sx={{
				display: "flex",
				flexDirection: "column",
				gap: 0.5,
				fontSize: 13,
				color: "text.secondary",
			}}
		>
			Reason (sent on reject)
			<InputBase
				placeholder="Optional"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				sx={phoneFieldSx}
			/>
		</Box>
	);
}
