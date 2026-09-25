import Typography from "@mui/material/Typography";
import { formatConfigValue } from "./ConfigScalarText/formatConfigValue";

export function ConfigScalarText({ value }: { value: unknown }) {
	return (
		<Typography
			component="pre"
			variant="body2"
			sx={{
				m: 0,
				fontFamily: "monospace",
				whiteSpace: "pre-wrap",
				overflowWrap: "anywhere",
			}}
		>
			{formatConfigValue(value)}
		</Typography>
	);
}
