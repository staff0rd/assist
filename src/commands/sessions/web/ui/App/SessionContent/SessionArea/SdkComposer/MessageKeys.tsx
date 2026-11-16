import { HintKey } from "./HintKey";
export function MessageKeys({ suggestion }: { suggestion: boolean }) {
	return (
		<>
			{suggestion && (
				<span>
					<HintKey label="Tab" /> / <HintKey label="→" /> use suggestion
				</span>
			)}
			<span>
				<HintKey label="Enter" /> send
			</span>
			<span>
				<HintKey label="Shift" />+<HintKey label="Enter" /> new line
			</span>
		</>
	);
}
