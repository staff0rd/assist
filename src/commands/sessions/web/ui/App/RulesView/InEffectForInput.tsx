import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export function InEffectForInput({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Box
			sx={(t) => ({
				display: "flex",
				alignItems: "center",
				gap: 1,
				minWidth: 0,
				flex: `1 1 ${t.spacing(35)}`,
				maxWidth: t.spacing(52.5),
			})}
		>
			<Typography
				component="label"
				htmlFor="rules-in-effect-for"
				variant="caption"
				color="text.secondary"
				sx={{ whiteSpace: "nowrap" }}
			>
				In effect for
			</Typography>
			<TextField
				id="rules-in-effect-for"
				size="small"
				fullWidth
				autoComplete="off"
				placeholder="any path, e.g. docs/src/index.md"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				slotProps={{
					htmlInput: {
						sx: { fontFamily: "fontFamilyMono", fontSize: "caption.fontSize" },
					},
				}}
			/>
		</Box>
	);
}
