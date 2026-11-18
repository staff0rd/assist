import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { sessionTextSize } from "../../../../../sessionTextSize";

const codeSx = (t: Theme) => ({
	fontFamily: t.typography.fontFamilyMono,
	fontSize: sessionTextSize(11.5),
	color: "text.primary",
});

export function NextScopeLine({
	label,
	value,
	unset,
	setter,
	showSetter,
}: {
	label: string;
	value: ReactNode;
	unset: string;
	setter: string;
	showSetter: boolean;
}) {
	return (
		<Typography
			variant="body2"
			component="span"
			sx={{ color: "text.secondary", fontSize: "inherit" }}
		>
			{label}: {value ?? unset}
			{showSetter && (
				<>
					{" · set with "}
					<Typography component="code" variant="body2" sx={codeSx}>
						{setter}
					</Typography>
				</>
			)}
		</Typography>
	);
}
