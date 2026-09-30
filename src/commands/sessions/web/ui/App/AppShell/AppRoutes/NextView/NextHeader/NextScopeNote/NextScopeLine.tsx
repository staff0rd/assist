import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

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
		<Typography variant="body2" sx={{ color: "text.secondary" }}>
			{label}: {value ?? unset}
			{showSetter && (
				<>
					{" · set with "}
					<Typography
						component="code"
						variant="body2"
						sx={{ fontFamily: "monospace" }}
					>
						{setter}
					</Typography>
				</>
			)}
		</Typography>
	);
}
