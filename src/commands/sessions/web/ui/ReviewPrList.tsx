import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PrSummary } from "../prList";
import { dropdownStyle } from "./DropdownWrapper";
import { formatRelativeTime } from "./formatRelativeTime";
import { useOpenPrs } from "./useOpenPrs";

export function ReviewPrList({
	cwd,
	onPick,
}: {
	cwd: string;
	onPick: (pr: PrSummary) => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);

	return (
		<Paper elevation={4} sx={{ ...dropdownStyle, left: "auto", width: 320 }}>
			{loading ? (
				<Message text="Loading open PRs…" />
			) : prs.length === 0 ? (
				<Message text="No open PRs" />
			) : (
				<MenuList dense disablePadding>
					{prs.map((pr) => (
						<PrRow key={pr.number} pr={pr} onPick={onPick} />
					))}
				</MenuList>
			)}
		</Paper>
	);
}

function PrRow({
	pr,
	onPick,
}: {
	pr: PrSummary;
	onPick: (pr: PrSummary) => void;
}) {
	return (
		<MenuItem
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => onPick(pr)}
			sx={{ alignItems: "flex-start", py: 0.75, whiteSpace: "normal" }}
		>
			<Stack spacing={0.25} sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 13, lineHeight: 1.3, fontWeight: 500 }}>
					{pr.title}
				</Typography>
				<Typography sx={{ fontSize: 11, color: "text.secondary" }}>
					#{pr.number} · {pr.author} · {formatRelativeTime(pr.createdAt)}
				</Typography>
			</Stack>
		</MenuItem>
	);
}

function Message({ text }: { text: string }) {
	return (
		<Box sx={{ p: 1.5 }}>
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
				{text}
			</Typography>
		</Box>
	);
}
