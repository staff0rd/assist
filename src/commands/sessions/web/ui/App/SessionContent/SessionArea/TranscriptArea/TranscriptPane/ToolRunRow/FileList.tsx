import Box from "@mui/material/Box";
import { Fragment } from "react";
import { baseName } from "./baseName";

const CAP = 2;
const mono = { fontFamily: "fontFamilyMono" } as const;

export function FileList({
	label,
	color,
	paths,
}: {
	label: string;
	color: string;
	paths: string[];
}) {
	const more = paths.length - CAP;
	return (
		<span>
			<Box
				component="span"
				sx={{ fontSize: "0.85em", letterSpacing: "0.04em", color, mr: 0.5 }}
			>
				{label}
			</Box>
			{paths.slice(0, CAP).map((p, i) => (
				<Fragment key={p}>
					{i > 0 && ", "}
					<Box
						component="span"
						title={p}
						sx={{ ...mono, color: "text.primary" }}
					>
						{baseName(p)}
					</Box>
				</Fragment>
			))}
			{more > 0 && <Box component="span" sx={mono}>{` +${more}`}</Box>}
		</span>
	);
}
