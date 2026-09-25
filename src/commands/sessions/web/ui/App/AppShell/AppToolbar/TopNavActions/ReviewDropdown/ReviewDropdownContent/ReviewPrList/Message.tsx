import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function Message({ text }: { text: string }) {
	return (
		<Box sx={{ p: 1.5 }}>
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
				{text}
			</Typography>
		</Box>
	);
}
