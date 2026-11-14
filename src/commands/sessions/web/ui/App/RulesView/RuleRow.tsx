import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";
import type { RuleScope } from "../../../../../rules/types";

type Rule = RuleScope["rules"][number];

export function RuleRow({ rule }: { rule: Rule }) {
	return (
		<Box
			component="li"
			sx={{
				display: "grid",
				gridTemplateColumns: (t) => `${t.spacing(5.5)} minmax(0, 1fr)`,
				gap: 1.5,
				px: 2,
				py: 1.5,
				borderBottom: 1,
				borderColor: "divider",
				"&:last-child": { borderBottom: 0 },
				"&:hover": { bgcolor: raisedBgcolor },
			}}
		>
			<Typography
				variant="caption"
				sx={{
					fontFamily: "fontFamilyMono",
					color: rule.code ? "primary.main" : "text.disabled",
					pt: 0.25,
				}}
			>
				{rule.code ?? "—"}
			</Typography>
			<Box sx={{ minWidth: 0 }}>
				{rule.title && (
					<Typography variant="body2" sx={{ fontWeight: 500 }}>
						{rule.title}
					</Typography>
				)}
				<Typography
					variant="body2"
					color={rule.title ? "text.secondary" : "text.primary"}
					sx={{ mt: 0.25, maxWidth: "72ch", textWrap: "pretty" }}
				>
					{rule.text}
				</Typography>
			</Box>
		</Box>
	);
}
