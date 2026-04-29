/**
 * Bridge file for legacy imports.
 * All canonical types are now defined in src/domain.
 */

export * from './domain/index';

// Re-export specific types if needed to maintain isolatedModules compatibility, 
// though 'export *' should usually suffice for types in TypeScript 3.8+.
