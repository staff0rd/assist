import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";

const fieldSx = {
	width: "100%",
	px: 1.5,
	py: 1,
	borderRadius: "10px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.default",
	fontSize: 16,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

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
				sx={fieldSx}
			/>
		</Box>
	);
}
