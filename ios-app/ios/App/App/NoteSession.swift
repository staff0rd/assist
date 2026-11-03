import AppIntents
import Foundation

enum NoteSession {
    private static let maxAttempts = 3

    static func confirmAndStart(
        mode: String,
        action: String,
        repo: RepoEntity,
        text: IntentParameter<String>,
        confirmed: IntentParameter<Bool>
    ) async throws -> some IntentResult & ProvidesDialog {
        var note = text.wrappedValue
        for attempt in 1...maxAttempts {
            if try await confirmed.requestValue("I heard: \(note). \(action) in \(repo.name)?") {
                try await start(mode: mode, note: note, repo: repo)
                return .result(dialog: "Started in \(repo.name).")
            }
            if attempt < maxAttempts {
                note = try await text.requestValue("Okay, what's the note?")
            }
        }
        return .result(dialog: "Okay, I didn't start anything.")
    }

    private static func start(mode: String, note: String, repo: RepoEntity) async throws {
        let endpoint = try HomeNode.url("api/note-session", query: [URLQueryItem(name: "cwd", value: repo.cwd)])
        var request = URLRequest(url: endpoint, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["text": note, "mode": mode])
        _ = try await HomeNode.send(request, expecting: 201)
    }
}
