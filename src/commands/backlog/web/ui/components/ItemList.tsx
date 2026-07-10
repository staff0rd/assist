import { Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { LastBackedUp } from "../../../../sessions/web/ui/LastBackedUp";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import { formatItemId } from "../../../formatItemId";
import type { BacklogItemSummary } from "../types";
import { useSearchItems } from "../useSearchItems";
import { CompletedToggle } from "./CompletedToggle";
import { ListBody } from "./ListBody";
import { RepoSummaryChips } from "./RepoSummaryChips";
import { SearchInput } from "./SearchInput";

type ItemListProps = {
	items: BacklogItemSummary[];
	loading: boolean;
	socket: SessionSocket;
	onReload: () => Promise<void>;
};

const headerSx = {
	justifyContent: "space-between",
	alignItems: "center",
	mb: 3,
} as const;

const titleSx = { fontWeight: 600 } as const;
const actionsSx = { alignItems: "center" } as const;

function Header() {
	return (
		<Stack direction="row" sx={headerSx}>
			<Typography variant="h5" sx={titleSx}>
				Backlog
			</Typography>
			<Stack direction="row" spacing={2} sx={actionsSx}>
				<LastBackedUp />
				<CompletedToggle />
			</Stack>
		</Stack>
	);
}

export function ItemList({ items, loading, socket, onReload }: ItemListProps) {
	const navigate = useNavigate();
	const { query, setQuery, results, loading: searching } = useSearchItems();
	const visible = results ?? items;

	return (
		<>
			<Header />
			<SearchInput value={query} onChange={setQuery} />
			<RepoSummaryChips />
			<ListBody
				loading={loading || searching}
				query={query}
				items={visible}
				socket={socket}
				onSelect={(item) => navigate(`/backlog/items/${formatItemId(item.id)}`)}
				onReload={onReload}
			/>
		</>
	);
}
