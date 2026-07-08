import Chip from "@mui/material/Chip";
import { Link, Typography } from "@mui/material";
import { useJiraSite } from "./useJiraSite";

const sx = { fontSize: "0.875rem" } as const;
const chipSx = { height: 18, fontSize: "0.65rem" } as const;

type JiraKeyLinkProps = {
	jiraKey?: string;
	variant?: "link" | "chip";
};

export function JiraKeyLink({ jiraKey, variant = "link" }: JiraKeyLinkProps) {
	const site = useJiraSite();

	if (!jiraKey) return null;

	if (variant === "chip") {
		if (!site)
			return (
				<Chip
					label={jiraKey}
					size="small"
					sx={chipSx}
					clickable={false}
					onClick={(e) => e.stopPropagation()}
				/>
			);
		return (
			<Chip
				label={jiraKey}
				size="small"
				sx={chipSx}
				clickable
				component="a"
				href={`https://${site}/browse/${jiraKey}`}
				target="_blank"
				rel="noopener"
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}

	if (!site) {
		return (
			<Typography variant="body2" color="text.disabled" sx={sx}>
				{jiraKey}
			</Typography>
		);
	}

	return (
		<Link
			href={`https://${site}/browse/${jiraKey}`}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
			sx={sx}
		>
			{jiraKey}
		</Link>
	);
}
