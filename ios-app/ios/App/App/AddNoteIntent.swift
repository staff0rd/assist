import AppIntents
import Foundation

struct AddNoteIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Assist note"
    static let description = IntentDescription("Adds a dictated note to your home node's backlog.")
    static let openAppWhenRun = false

    @Parameter(title: "Note", requestValueDialog: "What's the note?")
    var text: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let endpoint = try homeNodeItemsUrl()
        var request = URLRequest(url: endpoint, timeoutInterval: 10)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["text": text])

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw AddNoteError.unreachable
        }
        guard (response as? HTTPURLResponse)?.statusCode == 201,
              let created = try? JSONDecoder().decode(CreatedItem.self, from: data) else {
            throw AddNoteError.rejected
        }
        return .result(dialog: "Added \(created.id): \(created.name)")
    }

    private func homeNodeItemsUrl() throws -> URL {
        // Capacitor Preferences stores keys in UserDefaults under this prefix (see nodeStore.ts).
        guard let saved = UserDefaults.standard.string(forKey: "CapacitorStorage.homeNodeUrl"),
              let base = URL(string: saved) else {
            throw AddNoteError.noHomeNode
        }
        return base.appendingPathComponent("api/items")
    }
}

private struct CreatedItem: Decodable {
    let id: String
    let name: String
}

private enum AddNoteError: Error, CustomLocalizedStringResourceConvertible {
    case noHomeNode
    case unreachable
    case rejected

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .noHomeNode:
            return "No home node is saved. Open Assist and pick a home node first."
        case .unreachable:
            return "Couldn't reach your home node. Check Tailscale is connected."
        case .rejected:
            return "Your home node didn't save the note."
        }
    }
}
