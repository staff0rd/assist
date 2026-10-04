import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";

const wideCellSx = { gridColumn: { xs: "2", sm: "auto" } } as const;

const monoSx = {
	fontFamily: "'Roboto Mono', ui-monospace, Menlo, monospace",
	fontSize: 12,
	fontVariantNumeric: "tabular-nums",
} as const;

export function Versions({ entry }: { entry: NodeUpdateEntry }) {
	const status = entry.status;
	if (!status)
		return (
			<Typography variant="caption" color="text.secondary" sx={wideCellSx}>
				—
			</Typography>
		);
	const behind = status.running !== status.built;
	return (
		<Box sx={{ ...wideCellSx, display: "flex", flexDirection: "column" }}>
			<Box component="span" sx={monoSx}>
				v{status.running}
				{behind && (
					<>
						{" "}
						<Box component="span" sx={{ color: "warning.main" }}>
							→
						</Box>{" "}
						v{status.built}
					</>
				)}
			</Box>
			<Typography variant="caption" color="text.secondary">
				{behind ? "running → built" : "running"}
			</Typography>
		</Box>
	);
}
