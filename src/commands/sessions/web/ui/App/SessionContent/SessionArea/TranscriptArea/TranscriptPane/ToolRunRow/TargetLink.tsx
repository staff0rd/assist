import Link from "@mui/material/Link";

export function TargetLink({ url }: { url: string }) {
	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			sx={{ fontFamily: "fontFamilyMono", wordBreak: "break-all" }}
		>
			{url}
		</Link>
	);
}
