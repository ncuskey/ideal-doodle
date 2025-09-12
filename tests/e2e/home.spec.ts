import { test, expect } from '@playwright/test';

test('landing renders hero, generator button, and tabs work', async ({ page }) => {
  const res = await page.goto('/');
  expect(res && res.ok()).toBeTruthy();

  // Hero H1
  await expect(
    page.getByRole('heading', { name: 'Generate rich lore for your fantasy world.', level: 1 })
  ).toBeVisible();

  // Generate button
  const generateBtn = page.getByRole('button', { name: 'Generate World' });
  await expect(generateBtn).toBeVisible();

  // Scroll to workbench so tabs are in viewport, then verify presence
  await page.locator('#workbench').scrollIntoViewIfNeeded();
  await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Places' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Factions' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Hooks' })).toBeVisible();

  const hooksTab = page.getByRole('tab', { name: 'Hooks' });
  await hooksTab.scrollIntoViewIfNeeded();
  await hooksTab.click();
  await expect(hooksTab).toHaveAttribute('aria-selected', 'true');
  // Region content visible after switching
  await expect(page.getByRole('region', { name: 'Hooks' })).toBeVisible();
});
