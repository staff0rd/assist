import { useAtom } from "jotai";
import { showCompletedAtom } from "../showCompletedAtom";

export function CompletedToggle() {
	const [showCompleted, setShowCompleted] = useAtom(showCompletedAtom);

	return (
		<label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
			<button
				type="button"
				role="switch"
				aria-checked={showCompleted}
				onClick={() => setShowCompleted(!showCompleted)}
				className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showCompleted ? "bg-blue-600" : "bg-gray-300"}`}
			>
				<span
					className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${showCompleted ? "translate-x-[18px]" : "translate-x-[3px]"}`}
				/>
			</button>
			Show completed
		</label>
	);
}
