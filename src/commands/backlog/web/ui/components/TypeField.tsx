export function TypeField({
	value,
	onChange,
}: {
	value: "story" | "bug";
	onChange: (v: "story" | "bug") => void;
}) {
	return (
		<fieldset className="mb-4">
			<legend className="block text-sm font-medium text-gray-700 mb-1">
				Type
			</legend>
			<div className="flex gap-4">
				{(["story", "bug"] as const).map((t) => (
					<label key={t} className="flex items-center gap-1.5 cursor-pointer">
						<input
							type="radio"
							name="type"
							value={t}
							checked={value === t}
							onChange={() => onChange(t)}
						/>
						<span className="text-sm capitalize">{t}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
