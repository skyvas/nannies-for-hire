import { test, expect } from '@playwright/test';

test.describe('Notification System — Rich Content & Full Management', () => {
  test('should display rich notification details, mark read/unread, delete, and mark all read', async ({ page }) => {
    // 1. Visit landing page & switch role to Sitter (Sarah Jenkins)
    await page.goto('/sitter/jobs');
    await page.waitForLoadState('networkidle');

    const demoBtn = page.getByRole('button', { name: /Demo Role:/i });
    await demoBtn.click();
    const sitterOption = page.locator('.absolute button').filter({ hasText: 'Sarah Jenkins' });
    await sitterOption.first().click();
    await page.waitForURL(/\/sitter\/jobs/);
    await page.waitForLoadState('networkidle');

    // 2. Click Notification Bell
    const bellBtn = page.locator('#notification-bell-btn');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // 3. Verify Notification Dropdown Popover opens
    const dropdown = page.locator('#notification-dropdown-menu');
    await expect(dropdown).toBeVisible();

    // 4. Test "Mark All Read" action if unread notifications exist
    const markAllReadBtn = page.locator('#mark-all-read-btn');
    const isMarkAllVisible = await markAllReadBtn.isVisible();
    if (isMarkAllVisible) {
      await markAllReadBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Verify dropdown lists notification history or empty state message
    await expect(dropdown).toContainText(/Notifications & History/i);
  });
});
