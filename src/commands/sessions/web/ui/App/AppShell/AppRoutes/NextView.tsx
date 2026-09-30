import Stack from "@mui/material/Stack";
import { useState } from "react";
import type { NextPr } from "../../../../next/types";
import { AllClear } from "./NextView/AllClear";
import { NextHeader } from "./NextView/NextHeader";
import { NextHero } from "./NextView/NextHero";
import { NextPrGroup } from "./NextView/NextPrGroup";
import { NextReviewDialog } from "./NextView/NextReviewDialog";
import { useNextItems } from "./NextView/useNextItems";
import { PageShell } from "../../PageShell";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function NextView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { data, loading, error, refresh } = useNextItems(selectedCwd);
	const [reviewing, setReviewing] = useState<NextPr | null>(null);

	const peerPrs = data?.peerPrs;
	const top = peerPrs?.items[0];
	const allClear = !!peerPrs && !top && !peerPrs.error;

	return (
		<PageShell
			loading={loading && !data}
			header={<NextHeader loading={loading} onRefresh={refresh} />}
			isEmpty={!data}
			emptyMessage={error ?? undefined}
		>
			{peerPrs && (
				<Stack spacing={3}>
					{top && (
						<NextHero
							pr={top}
							waiting={peerPrs.items.length}
							onStart={() => setReviewing(top)}
						/>
					)}
					{allClear ? (
						<AllClear />
					) : (
						<NextPrGroup
							section={peerPrs}
							hidden={top}
							onStart={setReviewing}
						/>
					)}
				</Stack>
			)}
			{reviewing && (
				<NextReviewDialog pr={reviewing} onClose={() => setReviewing(null)} />
			)}
		</PageShell>
	);
}
