import { test, expect, type Page } from '@playwright/test';

const visibleCards = (page: Page) => page.locator('[data-testid="game-card"]:visible');

test.describe('Game filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show all games and filter controls initially', async ({ page }) => {
    await expect(page.getByTestId('game-filters')).toBeVisible();
    await expect(page.getByTestId('filter-publisher')).toBeVisible();
    const total = await page.getByTestId('game-card').count();
    await expect(visibleCards(page)).toHaveCount(total);
  });

  test('should filter by a single category', async ({ page }) => {
    await page.getByLabel('Puzzle').check();
    const cards = visibleCards(page);
    expect(await cards.count()).toBeGreaterThan(0);
    const categoryIds = await cards.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.categoryId));
    expect(new Set(categoryIds).size).toBe(1);
    await expect(page.getByTestId('filter-status')).toContainText('Showing');
  });

  test('should show games from any of several selected categories', async ({ page }) => {
    await page.getByLabel('Puzzle').check();
    const single = await visibleCards(page).count();
    await page.getByLabel('Strategy').check();
    const categoryIds = await visibleCards(page).evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.categoryId));
    expect(new Set(categoryIds).size).toBe(2);
    expect(categoryIds.length).toBeGreaterThan(single);
  });

  test('should filter by publisher', async ({ page }) => {
    await page.getByTestId('filter-publisher').selectOption({ label: 'GitHub Games' });
    const cards = visibleCards(page);
    expect(await cards.count()).toBeGreaterThan(0);
    const publisherIds = await cards.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.publisherId));
    expect(new Set(publisherIds).size).toBe(1);
  });

  test('should combine category and publisher filters', async ({ page }) => {
    await page.getByLabel('Action').check();
    await page.getByTestId('filter-publisher').selectOption({ label: 'CodeForge Studios' });
    const cards = visibleCards(page);
    await expect(cards).toHaveCount(2);
    const combos = await cards.evaluateAll((els) =>
      els.map((el) => `${(el as HTMLElement).dataset.categoryId}/${(el as HTMLElement).dataset.publisherId}`),
    );
    expect(new Set(combos).size).toBe(1);
  });

  test('should reset filters', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();
    await page.getByLabel('Puzzle').check();
    await page.getByTestId('filter-reset').click();
    await expect(visibleCards(page)).toHaveCount(total);
    await expect(page.getByLabel('Puzzle')).not.toBeChecked();
  });

  test('should show an empty state with a reset button when nothing matches', async ({ page }) => {
    // Every seeded category/publisher pair has games, so force a non-matching category.
    await page.evaluate(() => {
      const form = document.querySelector('[data-testid="game-filters"]')!;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'category';
      input.value = '999999';
      input.checked = true;
      form.appendChild(input);
      form.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(visibleCards(page)).toHaveCount(0);
    await expect(page.getByTestId('filter-empty-text')).toHaveText('No games match your filters.');
    await page.getByTestId('filter-empty-reset').click();
    await expect(page.getByTestId('filter-empty')).toBeHidden();
    expect(await visibleCards(page).count()).toBeGreaterThan(0);
  });

  test('should be operable with the keyboard', async ({ page }) => {
    const checkbox = page.getByLabel('Puzzle');
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();
    const categoryIds = await visibleCards(page).evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.categoryId));
    expect(new Set(categoryIds).size).toBe(1);
  });
});
