import Box from "@mui/material/Box";
import type { AskCheckInput } from "../../../../shared/askCheckInputSchema";
import { BeforeChips } from "../../App/SessionContent/PrPreviewSlideInPane/CheckPane/BeforeChips";
import { InlineCode } from "../../App/SessionContent/PrPreviewSlideInPane/CheckPane/InlineCode";
import { Label } from "../../App/SessionContent/PrPreviewSlideInPane/CheckPane/Label";
import { WhatChanged } from "../../App/SessionContent/PrPreviewSlideInPane/CheckPane/WhatChanged";
import { PhoneCheckEyebrow } from "./PhoneCheckEyebrow";

export function PhoneCheckBody({
	check,
	phase,
}: {
	check: AskCheckInput;
	phase: string | undefined;
}) {
	const before = check.before ?? [];
	return (
		<>
			<PhoneCheckEyebrow phase={phase} />
			<Box sx={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>
				{check.title}
			</Box>
			{before.length > 0 && (
				<Box>
					<BeforeChips items={before} />
				</Box>
			)}
			<Box>
				<Label>Steps</Label>
				<Box
					component="ol"
					sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.75, fontSize: 15 }}
				>
					{check.steps.map((step) => (
						<li key={step}>
							<InlineCode text={step} />
						</li>
					))}
				</Box>
			</Box>
			{check.changed && <WhatChanged changed={check.changed} />}
		</>
	);
}
