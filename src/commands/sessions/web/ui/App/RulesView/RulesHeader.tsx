import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { repoLabel } from "../repoLabel";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";
import { InEffectForInput } from "./InEffectForInput";

export function RulesHeader({
	cwd,
	path,
	onPathChange,
}: {
	cwd: string;
	path: string;
	onPathChange: (path: string) => void;
}) {
	return (
		<Box
			component="header"
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "flex-end",
				justifyContent: "space-between",
				gap: 1.5,
				mb: 2,
			}}
		>
			<Box>
				<Typography variant="h6">Rules</Typography>
				<Typography variant="body2" color="text.secondary">
					Every rule your sessions follow in{" "}
					<Box
						component="span"
						sx={{
							fontFamily: "fontFamilyMono",
							fontSize: "caption.fontSize",
							bgcolor: raisedBgcolor,
							borderRadius: 1,
							px: 1,
							py: 0.25,
						}}
					>
						{repoLabel(cwd)}
					</Box>
					, by where it lives
				</Typography>
			</Box>
			<InEffectForInput value={path} onChange={onPathChange} />
		</Box>
	);
}
