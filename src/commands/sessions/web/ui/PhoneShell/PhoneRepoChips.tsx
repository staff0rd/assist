import Box from "@mui/material/Box";
import { type SxProps, type Theme } from "@mui/material/styles";
import type { RepoChip } from "./PhoneRepoChips/buildRepoChips";
import { PhoneRepoChip } from "./PhoneRepoChips/PhoneRepoChip";

const rowSx = {
	flex: "none",
	display: "flex",
	gap: 1,
	px: 2,
	overflowX: "auto",
	scrollbarWidth: "none",
	"&::-webkit-scrollbar": { display: "none" },
	borderBottom: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
} as const;

export function PhoneRepoChips({
	chips,
	total,
	selected,
	onSelect,
	sx = rowSx,
}: {
	chips: RepoChip[];
	total: number;
	selected: string | null;
	onSelect: (repo: string | null) => void;
	sx?: SxProps<Theme>;
}) {
	if (chips.length === 0) return null;
	return (
		<Box role="radiogroup" aria-label="Filter by repo" sx={sx}>
			<PhoneRepoChip
				label="All"
				count={total}
				checked={selected === null}
				onSelect={() => onSelect(null)}
			/>
			{chips.map((chip) => (
				<PhoneRepoChip
					key={chip.key}
					label={chip.label}
					count={chip.count}
					attention={chip.attention}
					checked={chip.key === selected}
					onSelect={() => onSelect(chip.key)}
				/>
			))}
		</Box>
	);
}
