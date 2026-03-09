/**
 * Internationalization & Accessibility Support
 *
 * String externalization for CLI output with locale switching
 * and accessibility auditing utilities.
 *
 * @module runtime/i18n
 */
import type { SquadConfig } from '../config/schema.js';
/**
 * Map of message keys to localized strings.
 * Supports `{param}` interpolation placeholders.
 */
export type MessageCatalog = Record<string, string>;
/** Accessibility audit finding. */
export interface AccessibilityFinding {
    category: 'color-contrast' | 'screen-reader' | 'verbose-mode' | 'keyboard-nav';
    severity: 'info' | 'warning' | 'error';
    message: string;
}
/** Result of an accessibility audit against a Squad config. */
export interface AccessibilityReport {
    passed: boolean;
    findings: AccessibilityFinding[];
}
export declare const defaultCatalog: MessageCatalog;
/**
 * Manages locale-specific message catalogs and string formatting.
 */
export declare class I18nManager {
    private locale;
    private catalogs;
    constructor(locale?: string);
    /** Register a catalog for a locale. */
    registerCatalog(locale: string, catalog: MessageCatalog): void;
    /** Switch the active locale. Throws if no catalog is registered. */
    setLocale(locale: string): void;
    /** Return the active locale. */
    getLocale(): string;
    /** Return all locales that have a registered catalog. */
    getAvailableLocales(): string[];
    /**
     * Format a message by key, interpolating `{param}` placeholders.
     * Falls back to 'en' if the key is missing in the active locale.
     * Returns the raw key if no catalog contains it.
     */
    formatMessage(key: string, params?: Record<string, string>): string;
}
/**
 * Audit a Squad configuration for accessibility concerns.
 * Returns findings with severity levels; `passed` is true when no errors exist.
 */
export declare function auditAccessibility(config: SquadConfig): AccessibilityReport;
//# sourceMappingURL=i18n.d.ts.map