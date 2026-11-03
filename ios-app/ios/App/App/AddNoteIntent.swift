import AppIntents
import Foundation

struct AddNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Assist note"
    static let description = IntentDescription("Starts a /draft session for a dictated note in a repo on your home node.")
    static let openAppWhenRun = false

    private static let maxAttempts = 3

    @Parameter(title: "Repo", requestValueDialog: "Which repo?")
    var repo: RepoEntity

    @Parameter(title: "Note", requestValueDialog: "What's the note?")
    var text: String

    @Parameter(title: "Confirmed", default: false)
    var confirmed: Bool

    func perform() async throws -> some IntentResult & ProvidesDialog {
        var note = text
        for attempt in 1...Self.maxAttempts {
            if try await $confirmed.requestValue("I heard: \(note). Start a draft in \(repo.name)?") {
                try await startDraft(note)
                return .result(dialog: "Started a draft in \(repo.name).")
            }
            if attempt < Self.maxAttempts {
                note = try await $text.requestValue("Okay, what's the note?")
            }
        }
        return .result(dialog: "Okay, I didn't start a draft.")
    }

    private func startDraft(_ note: String) async throws {
        let endpoint = try HomeNode.url("api/note-draft", query: [URLQueryItem(name: "cwd", value: repo.cwd)])
        var request = URLRequest(url: endpoint, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["text": note])
        _ = try await HomeNode.send(request, expecting: 201)
    }
}
