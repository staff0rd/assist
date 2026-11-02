import AppIntents
import Foundation

struct AddNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Assist note"
    static let description = IntentDescription("Adds a dictated note to a repo's backlog on your home node.")
    static let openAppWhenRun = false

    @Parameter(title: "Repo", requestValueDialog: "Which repo?")
    var repo: RepoEntity

    @Parameter(title: "Note", requestValueDialog: "What's the note?")
    var text: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let endpoint = try HomeNode.url("api/items", query: [URLQueryItem(name: "cwd", value: repo.cwd)])
        var request = URLRequest(url: endpoint, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["text": text])

        let data = try await HomeNode.send(request, expecting: 201)
        guard let created = try? JSONDecoder().decode(CreatedItem.self, from: data) else {
            throw HomeNodeError.rejected
        }
        return .result(dialog: "Added \(created.id) to \(repo.name): \(created.name)")
    }
}

private struct CreatedItem: Decodable {
    let id: String
    let name: String
}
