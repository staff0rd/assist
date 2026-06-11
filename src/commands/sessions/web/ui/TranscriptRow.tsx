import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TranscriptMessage } from "./types";

export function TranscriptRow({ message }: { message: TranscriptMessage }) {
	if (message.role === "tool")
		return <ToolRow tool={message.tool} target={message.target} />;
	return <TextRow role={message.role} text={message.text} />;
}

function ToolRow({ tool, target }: { tool: string; target: string }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, pl: 1 }}>
			<BuildIcon sx={{ fontSize: 14, color: "text.disabled" }} />
			<Typography
				variant="caption"
				sx={{ color: "text.secondary", fontFamily: "monospace" }}
			>
				<Box component="span" sx={{ color: "warning.main" }}>
					{tool}
				</Box>
				{target && <Box component="span"> {target}</Box>}
			</Typography>
		</Box>
	);
}

function TextRow({ role, text }: { role: "user" | "assistant"; text: string }) {
	const isUser = role === "user";
	const accent = isUser ? "info.main" : "success.main";
	return (
		<Box
			sx={{
				mb: 1.5,
				pl: 1.5,
				py: 1,
				pr: 1,
				borderLeft: 2,
				borderColor: accent,
				borderTopRightRadius: 1,
				borderBottomRightRadius: 1,
				bgcolor: isUser ? "action.hover" : "transparent",
			}}
		>
			<Typography
				variant="caption"
				sx={{
					color: accent,
					fontWeight: 600,
					display: "block",
					mb: 0.5,
				}}
			>
				{isUser ? "User" : "Assistant"}
			</Typography>
			<Typography
				variant="body2"
				sx={{
					color: "text.primary",
					whiteSpace: "pre-wrap",
					overflowWrap: "anywhere",
					lineHeight: 1.6,
				}}
			>
				{text}
			</Typography>
		</Box>
	);
}
