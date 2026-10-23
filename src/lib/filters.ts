/**
 * Pure game-filtering logic shared by the build-time helpers and the
 * client-side filter script on the home page (see `GameFilters.astro`).
 *
 * Kept framework-free so it is unit-testable (see `filters.test.ts`).
 */
import type { Game } from '../types/game';

/** Active filter selection. Empty/`null` means "no restriction". */
export interface GameFilterCriteria {
    /** Match any of these categories (OR). Empty matches every category. */
    categoryIds: number[];
    /** Match this publisher. `null` matches every publisher. */
    publisherId: number | null;
}

/** The ids a game is filtered on. */
export interface GameFilterKeys {
    categoryId: number | null;
    publisherId: number | null;
}

/**
 * True when the keys satisfy the criteria. Categories combine with OR;
 * the category and publisher filters combine with AND.
 */
export function matchesFilters(keys: GameFilterKeys, criteria: GameFilterCriteria): boolean {
    const categoryMatches =
        criteria.categoryIds.length === 0 ||
        (keys.categoryId !== null && criteria.categoryIds.includes(keys.categoryId));
    const publisherMatches =
        criteria.publisherId === null || keys.publisherId === criteria.publisherId;
    return categoryMatches && publisherMatches;
}

/** Games that satisfy the criteria, preserving their original order. */
export function filterGames(games: Game[], criteria: GameFilterCriteria): Game[] {
    return games.filter((game) =>
        matchesFilters(
            { categoryId: game.category?.id ?? null, publisherId: game.publisher?.id ?? null },
            criteria,
        ),
    );
}
