import { HintKey } from "./HintKey";
export function MessageKeys({ suggestion }: { suggestion: boolean }) {
	return (
		<>
			{suggestion && (
				<span>
					<HintKey label="Tab" /> / <HintKey label="→" /> edit suggestion
				</span>
			)}
			<span>
				<HintKey label="Enter" /> send{suggestion && " suggestion"}
			</span>
			<span>
				<HintKey label="Shift" />+<HintKey label="Enter" /> new line
			</span>
		</>
	);
}
