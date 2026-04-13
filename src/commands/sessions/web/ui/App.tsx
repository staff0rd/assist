import { createRoot } from "react-dom/client";
import { Sidebar } from "./Sidebar";
import { TerminalPane } from "./TerminalPane";
import { useSessionSocket } from "./useSessionSocket";

export function App() {
	const socket = useSessionSocket();

	return (
		<div style={{ display: "flex", width: "100%", height: "100%" }}>
			<Sidebar
				sessions={socket.sessions}
				activeId={socket.activeId}
				onSelect={socket.setActiveId}
				onCreate={socket.createSession}
				onDismiss={socket.dismissSession}
			/>
			<div style={{ flex: 1, position: "relative", background: "#1e1e1e" }}>
				{socket.sessions.map((s) => (
					<TerminalPane
						key={s.id}
						sessionId={s.id}
						visible={s.id === socket.activeId}
						onOutput={socket.onOutput}
						sendInput={socket.sendInput}
						sendResize={socket.sendResize}
					/>
				))}
				{socket.sessions.length === 0 && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
							color: "#666",
							fontSize: 14,
						}}
					>
						Create a session to get started
					</div>
				)}
			</div>
		</div>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
