import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { LeftoverReport } from "../../../../../../shared/LeftoverReport";

const monoSx = {
	fontFamily: "fontFamilyMono",
	wordBreak: "break-all",
} as const;

export function LeftoverList({ report }: { report: LeftoverReport }) {
	return (
		<>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
				Reaped worktree paths assist could not delete. Remove them on{" "}
				{report.nodeName} with:
			</Typography>
			<Typography variant="body2" sx={{ ...monoSx, mb: 2 }}>
				{report.command}
			</Typography>
			{report.leftovers.map(({ path, reason }) => (
				<Box key={path} sx={{ mb: 1 }}>
					<Typography variant="body2" sx={monoSx}>
						{path}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{reason}
					</Typography>
				</Box>
			))}
		</>
	);
}
