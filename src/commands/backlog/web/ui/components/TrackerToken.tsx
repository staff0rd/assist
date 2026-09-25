import Link from "@mui/material/Link";

const tokenSx = {
	color: "primary.main",
	opacity: 0.85,
	whiteSpace: "nowrap",
} as const;

type TrackerTokenProps = { label: string; url?: string; title?: string };

export function TrackerToken({ label, url, title }: TrackerTokenProps) {
	if (!url) return label;

	return (
		<Link
			href={url}
			title={title}
			target="_blank"
			rel="noopener"
			underline="hover"
			sx={tokenSx}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{label}
		</Link>
	);
}
