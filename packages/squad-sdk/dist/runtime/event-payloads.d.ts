/**
 * Typed Event Payloads for SquadEventType (Issue #304)
 *
 * Canonical payload types for every EventBus event type.
 * These are the SDK-owned contracts that downstream consumers
 * (e.g., SquadOffice visualization) depend on.
 *
 * @module runtime/event-payloads
 */
import type { SquadEventType, SquadEvent } from './event-bus.js';
export interface SessionCreatedPayload {
    agentName: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
}
export interface SessionIdlePayload {
    agentName: string;
    idleSince?: number;
}
export interface SessionErrorPayload {
    agentName: string;
    error: string;
}
export interface SessionDestroyedPayload {
    agentName: string;
    reason?: 'complete' | 'error' | 'abort' | 'timeout' | 'user_exit';
}
export interface SessionMessagePayload {
    message: string;
    role?: string;
    content?: string;
}
export interface SessionToolCallPayload {
    toolName: string;
    toolArgs: Record<string, unknown>;
    resultType?: 'success' | 'failure' | 'rejected' | 'denied';
}
/** Multi-phase coordinator routing - discriminated by `phase`. */
export type CoordinatorRoutingPayload = {
    phase: 'start';
    messageLength: number;
} | {
    phase: 'routed';
    agents: string[];
    confidence: 'high' | 'medium' | 'low';
    reason: string;
} | {
    phase: 'spawning';
    strategy: 'direct' | 'single' | 'multi' | 'fallback';
    agentCount: number;
} | {
    phase: 'complete';
    strategy: string;
    spawnCount: number;
    successCount: number;
};
export type AgentMilestonePayload = {
    event: 'model.fallback';
    agentName: string;
    failedModel: string;
    failedTier: 'premium' | 'standard' | 'fast';
    error: string;
    attemptNumber: number;
} | {
    event: 'model.exhausted';
    agentName: string;
    originalModel: string;
    originalTier: string;
    totalAttempts: number;
};
export interface PoolHealthPayload {
    activeSessions: number;
    availableSlots: number;
    queuedRequests: number;
}
export interface SquadEventPayloadMap {
    'session:created': SessionCreatedPayload;
    'session:idle': SessionIdlePayload;
    'session:error': SessionErrorPayload;
    'session:destroyed': SessionDestroyedPayload;
    'session:message': SessionMessagePayload;
    'session:tool_call': SessionToolCallPayload;
    'agent:milestone': AgentMilestonePayload;
    'coordinator:routing': CoordinatorRoutingPayload;
    'pool:health': PoolHealthPayload;
}
/**
 * A strongly-typed SquadEvent where the payload type is inferred from the
 * event type discriminant. Use this for type-safe event construction.
 */
export interface TypedSquadEvent<T extends SquadEventType = SquadEventType> {
    type: T;
    sessionId?: string;
    agentName?: string;
    payload: T extends keyof SquadEventPayloadMap ? SquadEventPayloadMap[T] : unknown;
    timestamp: Date;
}
/**
 * Type guard: narrows a SquadEvent to a specific typed event.
 */
export declare function isSquadEventOfType<T extends SquadEventType>(event: SquadEvent, type: T): event is TypedSquadEvent<T>;
/**
 * Helper to construct a typed SquadEvent with payload validation at compile time.
 */
export declare function createSquadEvent<T extends SquadEventType>(type: T, payload: T extends keyof SquadEventPayloadMap ? SquadEventPayloadMap[T] : unknown, options?: {
    sessionId?: string;
    agentName?: string;
}): TypedSquadEvent<T>;
//# sourceMappingURL=event-payloads.d.ts.map