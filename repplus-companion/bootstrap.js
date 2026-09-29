import { state, actions } from "../js/core/state.js";
import { extractEndpoints, extractParameters, scanForSecrets } from "../js/features/extractors/index.js";
import { generateAttackRequests } from "../js/features/bulk-replay/engine.js";
import { createRepPlusDispatcher } from "./dispatcher.js";
import { createExtensionTransport } from "./extension-transport.js";
import { createEditorAdapter } from "./editor-adapter.js";
import { events, EVENT_NAMES } from "../js/core/events.js";
import { elements } from "../js/ui/main-ui.js";
import { highlightHTTP } from "../js/core/utils/network.js";

// Integration bootstrap loaded by the rep+ panel build.
// UI-bound capabilities can be supplied incrementally through adapters below.
export function startRepPlusCodex(adapters={}) {
  const editor=adapters.editor??createEditorAdapter({state,actions,events,EVENT_NAMES,elements,highlightHTTP});
  const dispatcher=createRepPlusDispatcher({
    state,actions,extractEndpoints,extractParameters,scanForSecrets,generateAttackRequests,
    version:chrome.runtime.getManifest().version,
    sendRawRequest:adapters.sendRawRequest,
    workspace:adapters.workspace,
    capture:adapters.capture,
    attackSurface:adapters.attackSurface,
    evidence:adapters.evidence,
    preview:adapters.preview,
    editor
  });
  return createExtensionTransport(dispatcher,adapters.transport);
}
