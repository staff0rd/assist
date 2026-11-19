import type { SessionInfo } from "../daemon/createSession";
import { connectToDaemon } from "../daemon/connectToDaemon";
import { queryDaemon } from "../daemon/queryDaemon";

export async function findDaemonSession(id: string): Promise<SessionInfo> {
	const socket = await connectToDaemon().catch(() => {
		throw new Error("No sessions daemon is running");
	});
	try {
		const { sessions } = await queryDaemon(socket);
		const session = sessions.find((s) => s.id === id);
		if (session) return session;
		const known = sessions.map((s) => s.id).join(", ") || "none";
		throw new Error(
			`No session ${id}. Known ids (see assist sessions list): ${known}`,
		);
	} finally {
		socket.destroy();
	}
}
