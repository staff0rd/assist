import { Box, Stack, Typography } from "@mui/material";
import type { AskCheckInput } from "../../../../../../shared/askCheckInputSchema";
import { BeforeChips } from "./BeforeChips";
import { InlineCode } from "./InlineCode";
import { WhatChanged } from "./WhatChanged";
import { Label } from "./Label";

export function CheckBody({ check }: { check: AskCheckInput }) {
	const before = check.before ?? [];
	return (
		<Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflowY: "auto" }}>
			{before.length > 0 && (
				<Stack spacing={0.75}>
					<BeforeChips items={before} />
				</Stack>
			)}
			<Stack spacing={0.75}>
				<Label>Steps</Label>
				<Box component="ol" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.75 }}>
					{check.steps.map((step) => (
						<Typography component="li" variant="body1" key={step}>
							<InlineCode text={step} />
						</Typography>
					))}
				</Box>
			</Stack>
			{check.changed && <WhatChanged changed={check.changed} />}
		</Stack>
	);
}
