import { test, expect } from '@playwright/test';

test.describe('Landing Page & Brand Identity', () => {
  test('should render landing page with brand title, hero, and local Vancouver context', async ({ page }) => {
    await page.goto('/');

    // Verify header navbar branding
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(page.getByText('Nannies for Hire', { exact: false }).first()).toBeVisible();

    // Verify Hero section content
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Babysitters in Metro Vancouver/i);

    // Verify Metro Vancouver location tag
    await expect(page.getByText(/Serving All Metro Vancouver Cities/i)).toBeVisible();

    // Verify Search Sitters CTA button in hero box
    const searchSittersCTA = page.getByRole('link', { name: /Search Sitters/i }).first();
    await expect(searchSittersCTA).toBeVisible();
  });

  test('should navigate to sitter search page via hero CTA link', async ({ page }) => {
    await page.goto('/');

    const searchSittersCTA = page.getByRole('link', { name: /Search Sitters/i }).first();
    await searchSittersCTA.click();

    await expect(page).toHaveURL(/\/search/);
    await expect(page.locator('h1')).toContainText(/Find Babysitters in Metro Vancouver/i);
  });
});
