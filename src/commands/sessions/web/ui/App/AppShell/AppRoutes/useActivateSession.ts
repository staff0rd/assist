import { useCallback } from "react";
import { useNavigate } from "react-router";

export function useActivateSession(
	selectSession: (id: string) => void,
): (id: string) => void {
	const navigate = useNavigate();

	return useCallback(
		(id: string) => {
			selectSession(id);
			navigate("/sessions");
		},
		[selectSession, navigate],
	);
}
