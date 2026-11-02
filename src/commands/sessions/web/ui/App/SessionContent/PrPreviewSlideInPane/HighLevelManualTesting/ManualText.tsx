import { Box, Link } from "@mui/material";
import { useMemo } from "react";
import { manualTextSegments } from "./manualTextSegments";

export function ManualText({
	text,
	repo,
	headSha,
}: {
	text: string;
	repo: string;
	headSha: string;
}) {
	const segments = useMemo(
		() => manualTextSegments(text, repo, headSha),
		[text, repo, headSha],
	);
	return segments.map((segment, index) => {
		const key = `${index}:${segment.text}`;
		const content = segment.href ? (
			<Link href={segment.href} target="_blank" rel="noopener noreferrer">
				{segment.text}
			</Link>
		) : (
			segment.text
		);
		return segment.code ? (
			<Box
				key={key}
				component="code"
				sx={{ fontFamily: "fontFamilyMono", fontSize: "0.9em" }}
			>
				{content}
			</Box>
		) : (
			<span key={key}>{content}</span>
		);
	});
}
