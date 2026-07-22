import { useCallback, useState } from "react";

/** A success notice plus the session it refers to, for the toast's View action. */
export type SuccessNotice = { message: string; sessionId: string | null };

export type ServerConflict = {
	existing: { id: string; name: string; cwd?: string; port?: number };
	runName?: string;
	cwd?: string;
	sessionId?: string;
};

/** Transient error and success notices surfaced as snackbars. */
export function useNotices() {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<SuccessNotice | null>(null);
	const [serverConflict, setServerConflict] = useState<ServerConflict | null>(
		null,
	);
	const clearError = useCallback(() => setError(null), []);
	const clearSuccess = useCallback(() => setSuccess(null), []);
	const clearServerConflict = useCallback(() => setServerConflict(null), []);
	return {
		error,
		setError,
		clearError,
		success,
		setSuccess,
		clearSuccess,
		serverConflict,
		setServerConflict,
		clearServerConflict,
	};
}
