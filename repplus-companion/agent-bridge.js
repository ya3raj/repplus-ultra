// Companion adapter contract for rep+.
// This file is intentionally dependency-injected so it can live beside upstream rep+
// and call the same state/actions/features as the DevTools UI without DOM scraping.

export function createAgentBridge(deps) {
  const { state, actions, extractors, bulkReplay, workspace, capture, version = "unknown" } = deps;

  const capabilities = [
    "history","capture-settings","multi-tab","replay","response-history","timeline","starring","color-tags",
    "blocking","forwarding","workspace-clear","workspace-import","workspace-export","undo-redo","bulk-replay",
    "bulk-job-control","extract-secrets","extract-endpoints","extract-parameters","response-search","attack-surface"
  ];

  return {
    info() { return { version: "1", upstreamVersion: version, capabilities }; },

    history(filter = {}) {
      let rows = [...(state.requests || [])];
      if (filter.host) rows = rows.filter(x => { try { return new URL(x.request.url).host === filter.host; } catch { return false; } });
      if (filter.method) rows = rows.filter(x => (x.request.method || "GET").toUpperCase() === filter.method.toUpperCase());
      if (filter.status != null) rows = rows.filter(x => Number(x.responseStatus || x.response?.status) === Number(filter.status));
      if (filter.text) {
        const needle = String(filter.text).toLowerCase();
        rows = rows.filter(x => JSON.stringify(x).toLowerCase().includes(needle));
      }
      const offset = Number(filter.offset || 0), limit = Number(filter.limit || 100);
      return rows.slice(offset, offset + limit);
    },

    async action(name, payload = {}) {
      switch (name) {
        case "extract-endpoints": return extractors.endpoints(state.requests || [], payload);
        case "extract-parameters": return extractors.parameters(state.requests || [], payload);
        case "extract-secrets": return extractors.secrets(state.requests || [], payload);
        case "star": return actions.starring.toggle(payload.requestId, payload.value);
        case "tag": return actions.requests.setColor?.(payload.requestId, payload.value);
        case "undo": return actions.history.undo?.();
        case "redo": return actions.history.redo?.();
        case "blocking": return actions.blocking.set?.(payload);
        case "forward": return actions.blocking.forward?.(payload.requestId);
        case "bulk-replay": return bulkReplay.start(payload);
        case "bulk-control": return bulkReplay.control(payload.jobId, payload.command);
        case "export-workspace": return workspace.export();
        case "import-workspace": return workspace.import(payload.data);
        case "clear-workspace": return actions.requests.clearAll();
        case "capture-settings": return capture.configure(payload);
        default: throw new Error("Unsupported rep+ action: " + name);
      }
    }
  };
}
