import { useState } from "react";

export function RewindDialog({
	phaseName,
	onConfirm,
	onCancel,
}: {
	phaseName: string;
	onConfirm: (reason: string) => void;
	onCancel: () => void;
}) {
	const [reason, setReason] = useState("");
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-sm mx-4">
				<p className="text-gray-800 mb-2 font-medium">Rewind to {phaseName}?</p>
				<p className="text-gray-500 text-sm mb-3">
					This will mark all later phases as incomplete.
				</p>
				<textarea
					className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4 resize-none"
					rows={3}
					placeholder="Reason for rewinding..."
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
				<div className="flex justify-end gap-2">
					<button
						type="button"
						className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						className="bg-amber-600 hover:bg-amber-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer disabled:opacity-50"
						disabled={reason.trim().length === 0}
						onClick={() => onConfirm(reason.trim())}
					>
						Rewind
					</button>
				</div>
			</div>
		</div>
	);
}
