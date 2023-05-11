import { expect, test } from '@playwright/test';

test('Home Page has Header', async ({ page }) => {
    await page.goto('/');
    expect(await page.textContent('h1')).toBe('Header');
});
