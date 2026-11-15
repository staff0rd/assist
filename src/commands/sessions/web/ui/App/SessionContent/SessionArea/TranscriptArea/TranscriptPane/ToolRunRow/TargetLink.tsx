import Link from "@mui/material/Link";
import type { ReactNode } from "react";

export function TargetLink({
	url,
	children,
}: {
	url: string;
	children?: ReactNode;
}) {
	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={(e) => e.stopPropagation()}
			sx={{ fontFamily: "fontFamilyMono", wordBreak: "break-all" }}
		>
			{children ?? url}
		</Link>
	);
}
