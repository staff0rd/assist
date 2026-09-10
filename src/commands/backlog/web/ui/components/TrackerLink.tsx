import { Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { TrackerChip } from "./TrackerChip";
import { TrackerIconLink } from "./TrackerIconLink";
import { TrackerToken } from "./TrackerToken";

const sx = { fontSize: "0.875rem" } as const;

export type TrackerLinkVariant = "link" | "chip" | "token" | "icon";

type TrackerLinkProps = {
	label: string;
	url?: string;
	variant?: TrackerLinkVariant;
	icon?: ReactNode;
	title?: string;
};

export function TrackerLink({
	label,
	url,
	variant = "link",
	icon,
	title,
}: TrackerLinkProps) {
	if (variant === "chip") return <TrackerChip label={label} url={url} />;
	if (variant === "token") return <TrackerToken label={label} url={url} />;
	if (variant === "icon")
		return (
			<TrackerIconLink
				icon={icon}
				label={label}
				title={title ?? label}
				url={url}
			/>
		);

	if (!url)
		return (
			<Typography variant="body2" color="text.disabled" sx={sx}>
				{label}
			</Typography>
		);

	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
			sx={sx}
		>
			{label}
		</Link>
	);
}
