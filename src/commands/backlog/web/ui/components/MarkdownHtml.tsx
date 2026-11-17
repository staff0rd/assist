import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { type MouseEventHandler, useMemo } from "react";

export function MarkdownHtml({
	html,
	component = "div",
	className,
	sx,
	onClick,
}: {
	html: string;
	component?: "div" | "span";
	className?: string;
	sx?: SxProps<Theme>;
	onClick?: MouseEventHandler<HTMLElement>;
}) {
	const dangerous = useMemo(() => ({ __html: html }), [html]);
	return (
		<Box
			component={component}
			className={className}
			sx={sx}
			onClick={onClick}
			dangerouslySetInnerHTML={dangerous}
		/>
	);
}
