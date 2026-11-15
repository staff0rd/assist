import Box from "@mui/material/Box";
import type { ToolInputField } from "../../../../../../../../../../shared/harnessAdapters/types";
import { isUrlTarget } from "./isUrlTarget";
import { TargetLink } from "./TargetLink";

export function RevealedFields({ fields }: { fields: ToolInputField[] }) {
	return (
		<Box
			component="dl"
			sx={{
				m: 0,
				ml: 4,
				mb: 0.5,
				display: "grid",
				gridTemplateColumns: "max-content minmax(0, 1fr)",
				columnGap: 1,
				typography: "caption",
				fontFamily: "fontFamilyMono",
				color: "text.secondary",
			}}
		>
			{fields.map(({ name, value }) => (
				<Box key={name} sx={{ display: "contents" }}>
					<Box component="dt">{name}</Box>
					<Box
						component="dd"
						sx={{ m: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}
					>
						{isUrlTarget(value) ? <TargetLink url={value.trim()} /> : value}
					</Box>
				</Box>
			))}
		</Box>
	);
}
