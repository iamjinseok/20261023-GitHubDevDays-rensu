import { describe, it, expect } from 'vitest';
import type { Game } from '../types/game';
import { filterGames, matchesFilters } from './filters';

/**
 * Builds a game fixture with only the fields filtering depends on.
 *
 * @param id - Game id (also used for the title).
 * @param categoryId - Category id, or `null` for an uncategorized game.
 * @param publisherId - Publisher id, or `null` for a game without a publisher.
 * @returns A `Game` fixture.
 */
function makeGame(id: number, categoryId: number | null, publisherId: number | null): Game {
    return {
        id,
        title: `Game ${id}`,
        description: 'desc',
        starRating: null,
        category: categoryId === null ? null : { id: categoryId, name: `Cat ${categoryId}` },
        publisher: publisherId === null ? null : { id: publisherId, name: `Pub ${publisherId}` },
    };
}

const catalog: Game[] = [
    makeGame(1, 1, 10),
    makeGame(2, 1, 20),
    makeGame(3, 2, 10),
    makeGame(4, 3, 20),
    makeGame(5, null, null),
];

/** Extracts the ids of the given games, for compact assertions. */
const ids = (games: Game[]): number[] => games.map((g) => g.id);

describe('matchesFilters', () => {
    it('matches everything when no filter is active', () => {
        expect(matchesFilters({ categoryId: null, publisherId: null }, { categoryIds: [], publisherId: null })).toBe(true);
    });

    it('matches a game whose category is any of the selected categories', () => {
        const criteria = { categoryIds: [1, 2], publisherId: null };
        expect(matchesFilters({ categoryId: 2, publisherId: 10 }, criteria)).toBe(true);
        expect(matchesFilters({ categoryId: 3, publisherId: 10 }, criteria)).toBe(false);
    });

    it('does not match a game without a category when a category is selected', () => {
        expect(matchesFilters({ categoryId: null, publisherId: 10 }, { categoryIds: [1], publisherId: null })).toBe(false);
    });

    it('requires both category and publisher to match', () => {
        const criteria = { categoryIds: [1], publisherId: 20 };
        expect(matchesFilters({ categoryId: 1, publisherId: 20 }, criteria)).toBe(true);
        expect(matchesFilters({ categoryId: 1, publisherId: 10 }, criteria)).toBe(false);
        expect(matchesFilters({ categoryId: 2, publisherId: 20 }, criteria)).toBe(false);
    });
});

describe('filterGames', () => {
    it('returns every game when no filter is active', () => {
        expect(ids(filterGames(catalog, { categoryIds: [], publisherId: null }))).toEqual([1, 2, 3, 4, 5]);
    });

    it('filters by a single category', () => {
        expect(ids(filterGames(catalog, { categoryIds: [1], publisherId: null }))).toEqual([1, 2]);
    });

    it('filters by multiple categories (OR)', () => {
        expect(ids(filterGames(catalog, { categoryIds: [2, 3], publisherId: null }))).toEqual([3, 4]);
    });

    it('filters by publisher', () => {
        expect(ids(filterGames(catalog, { categoryIds: [], publisherId: 20 }))).toEqual([2, 4]);
    });

    it('combines category and publisher filters (AND)', () => {
        expect(ids(filterGames(catalog, { categoryIds: [1, 2], publisherId: 10 }))).toEqual([1, 3]);
    });

    it('returns an empty list when nothing matches', () => {
        expect(filterGames(catalog, { categoryIds: [3], publisherId: 10 })).toEqual([]);
    });
});
