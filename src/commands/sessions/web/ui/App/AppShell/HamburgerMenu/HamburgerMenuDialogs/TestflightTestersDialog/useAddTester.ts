import { useState } from "react";
import type { AddTesterOutcome } from "../../../../../../../../testflight/addTesterOutcome";
import { testflightJson } from "./testflightJson";

export type AddNotice = {
	message: string;
	severity: "success" | "info" | "error";
};

export type PendingTester = { email: string; internal: boolean };

const postTester = (email: string, internal: boolean) =>
	testflightJson<AddTesterOutcome>({
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, internal }),
	});

export function useAddTester(reload: () => Promise<void>) {
	const [pending, setPending] = useState<PendingTester>();
	const [notice, setNotice] = useState<AddNotice | null>(null);

	const add = async (email: string, internal: boolean): Promise<boolean> => {
		setPending({ email, internal });
		try {
			const { message, waiting } = await postTester(email, internal);
			await reload();
			setNotice({ message, severity: waiting ? "info" : "success" });
			return true;
		} catch (error) {
			setNotice({
				message: error instanceof Error ? error.message : String(error),
				severity: "error",
			});
			return false;
		} finally {
			setPending(undefined);
		}
	};

	return { add, pending, notice, clearNotice: () => setNotice(null) };
}
