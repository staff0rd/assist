export type SessionClient = {
	send(data: string): void;
};

export function sendTo(client: SessionClient, msg: object): void {
	client.send(JSON.stringify(msg));
}

export function broadcast(clients: Set<SessionClient>, msg: object): void {
	const json = JSON.stringify(msg);
	for (const client of clients) {
		client.send(json);
	}
}
