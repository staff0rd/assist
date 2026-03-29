export function ManualChecks({ checks }: { checks: string[] }) {
	return (
		<div className="mt-2 pt-2 border-t border-gray-200">
			<span className="text-xs uppercase text-gray-400 tracking-wide">
				Manual Checks
			</span>
			<ul className="list-none ml-1 mt-1">
				{checks.map((check) => (
					<li key={check} className="py-0.5 text-sm text-gray-600">
						<span className="mr-2">{"\u2610"}</span>
						{check}
					</li>
				))}
			</ul>
		</div>
	);
}
