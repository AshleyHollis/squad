/**
 * Internationalization & Accessibility Support
 *
 * String externalization for CLI output with locale switching
 * and accessibility auditing utilities.
 *
 * @module runtime/i18n
 */
// ============================================================================
// Default English Catalog
// ============================================================================
export const defaultCatalog = {
    // CLI
    'cli.version': 'squad {version}',
    'cli.help.header': 'squad {version} — Programmable multi-agent runtime for GitHub Copilot',
    'cli.help.usage': 'Usage: squad [command] [options]',
    'cli.unknown_command': 'Unknown command: {command}',
    'cli.init.success': 'Initialized Squad project in {path}',
    'cli.init.already_exists': 'Squad config already exists at {path}',
    // Config
    'config.loading': 'Loading configuration from {path}…',
    'config.valid': 'Configuration is valid.',
    'config.invalid': 'Configuration validation failed: {error}',
    'config.not_found': 'No configuration file found. Run `squad init` to create one.',
    // Routing
    'routing.match': 'Matched route: {pattern} → {agents}',
    'routing.no_match': 'No routing rule matched. Using fallback: {fallback}',
    // Agents
    'agent.spawned': 'Agent {name} spawned with model {model}.',
    'agent.retired': 'Agent {name} retired.',
    'agent.error': 'Agent {name} encountered an error: {error}',
    // Migration
    'migration.detected': 'Legacy setup detected at {path}. Consider migrating to squad.config.ts.',
    'migration.complete': 'Migration complete. Review {path} and remove legacy files when ready.',
    // General
    'error.unexpected': 'An unexpected error occurred: {error}',
    'info.verbose': 'Verbose output enabled. Disable with --no-verbose.',
};
// ============================================================================
// I18nManager
// ============================================================================
/**
 * Manages locale-specific message catalogs and string formatting.
 */
export class I18nManager {
    locale;
    catalogs;
    constructor(locale = 'en') {
        this.catalogs = new Map();
        this.catalogs.set('en', { ...defaultCatalog });
        this.locale = locale;
    }
    /** Register a catalog for a locale. */
    registerCatalog(locale, catalog) {
        this.catalogs.set(locale, catalog);
    }
    /** Switch the active locale. Throws if no catalog is registered. */
    setLocale(locale) {
        if (!this.catalogs.has(locale)) {
            throw new Error(`No catalog registered for locale: ${locale}`);
        }
        this.locale = locale;
    }
    /** Return the active locale. */
    getLocale() {
        return this.locale;
    }
    /** Return all locales that have a registered catalog. */
    getAvailableLocales() {
        return [...this.catalogs.keys()];
    }
    /**
     * Format a message by key, interpolating `{param}` placeholders.
     * Falls back to 'en' if the key is missing in the active locale.
     * Returns the raw key if no catalog contains it.
     */
    formatMessage(key, params) {
        const catalog = this.catalogs.get(this.locale);
        const fallback = this.catalogs.get('en');
        const template = catalog?.[key] ?? fallback?.[key] ?? key;
        if (!params)
            return template;
        return template.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
    }
}
// ============================================================================
// Accessibility Audit
// ============================================================================
/**
 * Audit a Squad configuration for accessibility concerns.
 * Returns findings with severity levels; `passed` is true when no errors exist.
 */
export function auditAccessibility(config) {
    const findings = [];
    // Check agent display names for screen-reader friendliness
    for (const agent of config.agents ?? []) {
        if (!agent.displayName) {
            findings.push({
                category: 'screen-reader',
                severity: 'warning',
                message: `Agent "${agent.name}" has no displayName. Screen readers will use the raw name.`,
            });
        }
    }
    // Color-contrast note for CLI consumers
    findings.push({
        category: 'color-contrast',
        severity: 'info',
        message: 'CLI output should use ANSI colors that meet WCAG AA contrast on both light and dark terminals.',
    });
    // Verbose mode flag reminder
    findings.push({
        category: 'verbose-mode',
        severity: 'info',
        message: 'Ensure all commands support --verbose / --quiet flags for assistive-technology users.',
    });
    // Keyboard navigation note
    findings.push({
        category: 'keyboard-nav',
        severity: 'info',
        message: 'Interactive prompts must be navigable via keyboard without mouse input.',
    });
    const passed = findings.every((f) => f.severity !== 'error');
    return { passed, findings };
}
//# sourceMappingURL=i18n.js.map