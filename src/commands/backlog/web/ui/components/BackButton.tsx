type BackButtonProps = {
	onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
	return (
		<button
			type="button"
			className="inline-block mb-4 text-blue-600 text-sm cursor-pointer bg-transparent border-none p-0 hover:underline"
			onClick={onClick}
		>
			&larr; Back
		</button>
	);
}
