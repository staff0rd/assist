import AppIntents
import Foundation

enum HomeNode {
    // Short enough that Siri speaks the failure instead of giving up on the intent first.
    static let timeout: TimeInterval = 8

    static func url(_ path: String, query: [URLQueryItem] = []) throws -> URL {
        // Capacitor Preferences stores keys in UserDefaults under this prefix (see nodeStore.ts).
        guard let saved = UserDefaults.standard.string(forKey: "CapacitorStorage.homeNodeUrl"),
              let base = URL(string: saved),
              var components = URLComponents(url: base.appendingPathComponent(path), resolvingAgainstBaseURL: false) else {
            throw HomeNodeError.noHomeNode
        }
        if !query.isEmpty {
            components.queryItems = query
        }
        guard let url = components.url else {
            throw HomeNodeError.noHomeNode
        }
        return url
    }

    static func send(_ request: URLRequest, expecting status: Int) async throws -> Data {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw HomeNodeError.unreachable
        }
        guard (response as? HTTPURLResponse)?.statusCode == status else {
            throw HomeNodeError.rejected
        }
        return data
    }
}

enum HomeNodeError: Error, CustomLocalizedStringResourceConvertible {
    case noHomeNode
    case unreachable
    case rejected

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .noHomeNode:
            return "No home node is saved. Open Assist and pick a home node first."
        case .unreachable:
            return "Your home node is unreachable. Check Tailscale is connected."
        case .rejected:
            return "Your home node rejected the request. Check Assist is up to date there."
        }
    }
}
