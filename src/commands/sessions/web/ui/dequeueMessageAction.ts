import { dequeueReplies } from "./useSessionSocket/dequeueReplies";

type SendFn = (msg: object) => void;

export function dequeueMessageAction(send: SendFn) {
	return (id: string, index: number, text: string): Promise<boolean> => {
		const { requestId, removed } = dequeueReplies.await();
		send({ type: "dequeue", sessionId: id, index, text, requestId });
		return removed;
	};
}
