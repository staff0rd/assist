import Box from "@mui/material/Box";

export type StatusGroup = {
	key: string;
	prefix: string;
	color: string;
	count: number;
};

export function GitStatusChips({ groups }: { groups: StatusGroup[] }) {
	return groups.map((g) => (
		<Box key={g.key} component="span" sx={{ color: g.color }}>
			{g.prefix}
			{g.count}
		</Box>
	));
}
