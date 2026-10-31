import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";

export function PhoneValueGroup({
	title,
	rows,
}: {
	title: string;
	rows: { key: string; label: string; value: string; color?: string }[];
}) {
	return (
		<>
			<Box sx={nodeListSx.label}>{title}</Box>
			<Box sx={nodeListSx.group}>
				{rows.map((row) => (
					<Box key={row.key} sx={nodeListSx.item}>
						<Box component="span" sx={nodeListSx.grow}>
							{row.label}
						</Box>
						<Box
							component="span"
							sx={[
								nodeListSx.end,
								{ fontFamily: "fontFamilyMono" },
								row.color ? { color: row.color } : {},
							]}
						>
							{row.value}
						</Box>
					</Box>
				))}
			</Box>
		</>
	);
}
