import { Box, Divider } from "@mui/material";
import { Fragment } from "react";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import { QuestionFieldset } from "./QuestionFieldset";
import type { useQuestionAnswers } from "./useQuestionAnswers";

export function QuestionList({
	questions,
	state,
}: {
	questions: AskQuestion[];
	state: ReturnType<typeof useQuestionAnswers>;
}) {
	return (
		<Box
			sx={{
				flex: 1,
				overflowY: "auto",
				px: 2,
				py: 3,
				display: "flex",
				flexDirection: "column",
				gap: 4,
			}}
		>
			{questions.map((question, i) => (
				<Fragment key={question.question}>
					{i > 0 && <Divider />}
					<QuestionFieldset
						index={i}
						question={question}
						choice={state.choices[i]}
						onPick={(label) => state.pick(i, label)}
						onPickOther={() => state.pickOther(i)}
						onOtherText={(text) => state.setOtherText(i, text)}
					/>
				</Fragment>
			))}
		</Box>
	);
}
