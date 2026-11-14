import Box from "@mui/material/Box";
import { isUrlTarget } from "./isUrlTarget";
import { TargetLink } from "./TargetLink";

export function RevealedTarget({ target }: { target: string }) {
	return (
		<Box
			component="pre"
			sx={{
				m: 0,
				ml: 4,
				mb: 0.5,
				typography: "caption",
				fontFamily: "fontFamilyMono",
				color: "text.secondary",
				whiteSpace: "pre-wrap",
				wordBreak: "break-all",
			}}
		>
			{isUrlTarget(target) ? <TargetLink url={target.trim()} /> : target}
		</Box>
	);
}
