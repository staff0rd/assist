import Box from "@mui/material/Box";
import type { TestflightTesters } from "../../../../../../../../testflight/TestflightTesters";
import { addToGroupAction } from "./addToGroupAction";
import { TesterRow } from "./TesterRow";
import { TesterSection } from "./TesterSection";

export function TesterLists({
	testers,
	pending,
	onAddToGroup,
}: {
	testers: TestflightTesters;
	pending?: string;
	onAddToGroup: (email: string) => void;
}) {
	return (
		<Box sx={{ pb: 2 }}>
			<TesterSection
				name="Internal"
				hint="team members · no beta review"
				empty={testers.internal.length === 0}
			>
				{testers.internal.map((person) => (
					<TesterRow
						key={person.email}
						{...person}
						addToGroup={addToGroupAction(person, pending, onAddToGroup)}
					/>
				))}
			</TesterSection>
			<TesterSection
				name="External"
				hint="email only · beta review per version"
				empty={testers.external.length === 0}
			>
				{testers.external.map((tester) => (
					<TesterRow key={tester.email} {...tester} />
				))}
			</TesterSection>
		</Box>
	);
}
