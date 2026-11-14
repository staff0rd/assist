import Capacitor
import UIKit
import WebKit

class AssistBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler {
    static let selectionHandler = "assistSelection"
    private static let commentEvent = "window.dispatchEvent(new Event('assist:comment-selection'))"

    private var commentable = false

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        webView?.allowsBackForwardNavigationGestures = false
        webView?.configuration.userContentController.add(self, name: Self.selectionHandler)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        commentable = message.body as? Bool ?? false
    }

    override func buildMenu(with builder: UIMenuBuilder) {
        super.buildMenu(with: builder)
        guard builder.system == .context, commentable else { return }
        let comment = UIAction(title: "Comment", image: UIImage(systemName: "text.bubble")) { [weak self] _ in
            self?.webView?.evaluateJavaScript(Self.commentEvent)
        }
        builder.insertChild(UIMenu(options: .displayInline, children: [comment]), atStartOfMenu: .root)
    }
}
