import { HintKey } from "./HintKey";
export function ShellKeys({ cwd }: { cwd: string }) {
	return (
		<>
			<span>
				<HintKey label="Enter" /> run in {cwd}
			</span>
			<span>
				<HintKey label="⌫" /> on empty leaves shell mode
			</span>
		</>
	);
}
