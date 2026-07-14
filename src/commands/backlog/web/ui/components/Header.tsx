import { Stack, Typography } from "@mui/material";
import { LastBackedUp } from "../../../../sessions/web/ui/LastBackedUp";
import { CompletedToggle } from "./CompletedToggle";
import { TypeFilter, type TypeFilterValue } from "./TypeFilter";

type HeaderProps = {
	typeFilter: TypeFilterValue;
	onTypeFilterChange: (value: TypeFilterValue) => void;
};

const headerSx = {
	justifyContent: "space-between",
	alignItems: "center",
	mb: 3,
} as const;

const titleSx = { fontWeight: 600 } as const;

const actionsSx = { alignItems: "center" } as const;

export function Header({ typeFilter, onTypeFilterChange }: HeaderProps) {
	return (
		<Stack direction="row" sx={headerSx}>
			<Typography variant="h5" sx={titleSx}>
				Backlog
			</Typography>
			<Stack direction="row" spacing={2} sx={actionsSx}>
				<LastBackedUp />
				<TypeFilter value={typeFilter} onChange={onTypeFilterChange} />
				<CompletedToggle />
			</Stack>
		</Stack>
	);
}
