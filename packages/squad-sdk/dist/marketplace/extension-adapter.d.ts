/**
 * Extension Adapter — bridges Squad SDK to Copilot Extensions API surface
 * Issue #108 (M4-8)
 */
import type { SquadConfig } from '../config/schema.js';
import type { MarketplaceManifest } from './index.js';
export type ExtensionEventType = 'user.message' | 'tool.invoke' | 'session.start' | 'session.end';
export interface ExtensionEvent {
    type: ExtensionEventType;
    timestamp: string;
    payload: Record<string, unknown>;
}
export interface ExtensionConfig {
    id: string;
    name: string;
    version: string;
    description: string;
    agents: Array<{
        name: string;
        role: string;
    }>;
    tools: string[];
    models: {
        default: string;
        tiers: Record<string, string[]>;
    };
}
export interface RegistrationResult {
    success: boolean;
    extensionId?: string;
    errors: string[];
}
export declare function toExtensionConfig(config: SquadConfig): ExtensionConfig;
export declare function fromExtensionEvent(event: ExtensionEvent): {
    type: string;
    data: Record<string, unknown>;
    receivedAt: string;
};
export declare function registerExtension(manifest: MarketplaceManifest): RegistrationResult;
export declare class ExtensionAdapter {
    private config;
    constructor(config: SquadConfig);
    toExtensionConfig(): ExtensionConfig;
    fromExtensionEvent(event: ExtensionEvent): {
        type: string;
        data: Record<string, unknown>;
        receivedAt: string;
    };
    registerExtension(manifest: MarketplaceManifest): RegistrationResult;
}
//# sourceMappingURL=extension-adapter.d.ts.map