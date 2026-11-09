import Box from "@mui/material/Box";
import type { TestflightTesters } from "../../../../../../../../testflight/TestflightTesters";
import { addToGroupAction } from "./addToGroupAction";
import { PendingTesterRow } from "./PendingTesterRow";
import { TesterRow } from "./TesterRow";
import { TesterSection } from "./TesterSection";
import type { PendingTester } from "./useAddTester";

function newPendingEmail(
	pending: PendingTester | undefined,
	internal: boolean,
	listed: { email: string }[],
): string | undefined {
	if (!pending || pending.internal !== internal) return undefined;
	return listed.some((person) => person.email === pending.email)
		? undefined
		: pending.email;
}

export function TesterLists({
	testers,
	pending,
	onAddToGroup,
}: {
	testers: TestflightTesters;
	pending?: PendingTester;
	onAddToGroup: (email: string) => void;
}) {
	const addingInternal = newPendingEmail(pending, true, testers.internal);
	const addingExternal = newPendingEmail(pending, false, testers.external);
	return (
		<Box sx={{ pb: 2 }}>
			<TesterSection
				name="Internal"
				hint="team members · no beta review"
				empty={testers.internal.length === 0 && !addingInternal}
			>
				{addingInternal && <PendingTesterRow email={addingInternal} />}
				{testers.internal.map((person) => (
					<TesterRow
						key={person.email}
						{...person}
						addToGroup={addToGroupAction(person, pending?.email, onAddToGroup)}
					/>
				))}
			</TesterSection>
			<TesterSection
				name="External"
				hint="email only · beta review per version"
				empty={testers.external.length === 0 && !addingExternal}
			>
				{addingExternal && <PendingTesterRow email={addingExternal} />}
				{testers.external.map((tester) => (
					<TesterRow key={tester.email} {...tester} />
				))}
			</TesterSection>
		</Box>
	);
}
