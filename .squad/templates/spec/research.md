# Research: {feature-name}

## Executive Summary
<!-- 2-3 sentence summary of the most important findings -->

## External Research

### Best Practices
<!-- Best-practice finding with source URL -->

### Prior Art
<!-- Comparable solutions, libraries, or patterns and why they matter -->

### Pitfalls to Avoid
<!-- Known failure modes, anti-patterns, or maintenance traps -->

## Codebase Analysis

### Existing Patterns
<!-- Existing project patterns with file paths and notes on reuse -->

### Dependencies
<!-- Existing dependencies or platform capabilities that can be leveraged -->

### Constraints
<!-- Technical limitations or conventions discovered in the current codebase -->

## Quality Commands

| Type | Command | Source |
|------|---------|--------|
| Lint | `{actual command}` | {where found} |
| TypeCheck | `{actual command}` | {where found} |
| Test | `{actual command}` | {where found} |
| Build | `{actual command}` | {where found} |

**Local CI**: `{lint} && {typecheck} && {test} && {build}`

<!-- Discover these from package.json scripts, Makefile, CI configs, or task runners -->
<!-- Never assume commands exist without verifying them -->

## Verification Tooling

| Tool | Command/Value | Detected From |
|------|---------------|---------------|
| Dev Server | `{command}` | {source} |
| Port | `{number}` | {source} |
| Health Endpoint | `{path}` | {source} |
| Browser Automation | `{tool}` | {source} |

**Project Type**: {Web App | API | CLI | Library}
**Verification Strategy**: {how automated verification should prove the feature works}

## Related Specs

| Spec | Relationship | May Need Update |
|------|--------------|-----------------|
| {spec-name} | {High | Medium | Low - why} | {yes/no} |

## Feasibility Assessment

| Aspect | Assessment | Notes |
|--------|------------|-------|
| Technical Viability | High/Medium/Low | {why} |
| Effort Estimate | S/M/L/XL | {basis} |
| Risk Level | High/Medium/Low | {key risks} |

## Recommendations
1. {specific recommendation based on research}
2. {second recommendation}

## Open Questions
- {question that still needs resolution}

## Sources
- {URL or file path}
