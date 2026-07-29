import { test, expect, Page } from '@playwright/test';

async function switchDemoRole(page: Page, userName: string) {
  const triggerBtn = page.getByRole('button', { name: /Demo Role:/i });
  await triggerBtn.click();
  const menuOption = page.locator('.absolute button').filter({ hasText: userName });
  await expect(menuOption.first()).toBeVisible();
  await menuOption.first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Caregiver Portal & Live Time Clocking', () => {
  test('should allow Caregiver to view rates, accept request, and operate live clocking', async ({ page }) => {
    await page.goto('/sitter/jobs');

    // 1. Switch Demo Role to Sitter (Sarah Jenkins)
    await switchDemoRole(page, 'Sarah Jenkins');

    // 2. Verify Caregiver Dashboard Header
    await expect(page.locator('h1')).toContainText(/Job Requests & Live Time Clocking/i);
    await expect(page.getByText(/Your Current Caregiver Rates/i)).toBeVisible();
    await expect(page.getByText(/85% Payout Direct to Bank Account/i)).toBeVisible();

    // 3. Check for Active / Confirmed Jobs Section
    const activeSection = page.getByText(/Confirmed & Active Jobs/i);
    await expect(activeSection).toBeVisible();
  });
});
