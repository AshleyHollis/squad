/**
 * Extension Adapter — bridges Squad SDK to Copilot Extensions API surface
 * Issue #108 (M4-8)
 */
// --- Conversion functions ---
export function toExtensionConfig(config) {
    const tools = new Set();
    for (const agent of config.agents) {
        if (agent.tools) {
            for (const t of agent.tools) {
                tools.add(t);
            }
        }
    }
    return {
        id: slugify(config.team.name),
        name: config.team.name,
        version: config.version,
        description: config.team.description ?? '',
        agents: config.agents.map((a) => ({ name: a.name, role: a.role })),
        tools: [...tools],
        models: {
            default: config.models.default,
            tiers: config.models.tiers,
        },
    };
}
export function fromExtensionEvent(event) {
    const typeMap = {
        'user.message': 'message',
        'tool.invoke': 'tool_call',
        'session.start': 'session_init',
        'session.end': 'session_close',
    };
    return {
        type: typeMap[event.type] ?? event.type,
        data: event.payload,
        receivedAt: new Date().toISOString(),
    };
}
export function registerExtension(manifest) {
    const errors = [];
    if (!manifest.name) {
        errors.push('manifest name is required for registration');
    }
    if (!manifest.version) {
        errors.push('manifest version is required for registration');
    }
    if (errors.length > 0) {
        return { success: false, errors };
    }
    // Abstracted registration — in production this would call the marketplace API
    return {
        success: true,
        extensionId: `ext-${manifest.name}-${manifest.version}`,
        errors: [],
    };
}
// --- ExtensionAdapter class ---
export class ExtensionAdapter {
    config;
    constructor(config) {
        this.config = config;
    }
    toExtensionConfig() {
        return toExtensionConfig(this.config);
    }
    fromExtensionEvent(event) {
        return fromExtensionEvent(event);
    }
    registerExtension(manifest) {
        return registerExtension(manifest);
    }
}
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
//# sourceMappingURL=extension-adapter.js.map