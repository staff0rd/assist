import { Box, Chip } from "@mui/material";
import { Label } from "./Label";

export function BeforeChips({ items }: { items: string[] }) {
	return (
		<>
			<Label>Before</Label>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
				{items.map((item) => (
					<Chip key={item} size="small" variant="tonal" label={item} />
				))}
			</Box>
		</>
	);
}
