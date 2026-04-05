import { useNavigate } from "react-router";

type BackButtonProps = {
	to: string;
};

export function BackButton({ to }: BackButtonProps) {
	const navigate = useNavigate();
	return (
		<button
			type="button"
			className="inline-block mb-4 text-blue-600 text-sm cursor-pointer bg-transparent border-none p-0 hover:underline"
			onClick={() => navigate(to)}
		>
			&larr; Back
		</button>
	);
}
