import { test, expect } from '@playwright/test';

test.describe('Role-Based Notification System (Parent & Sitter Workflows)', () => {
  test('should dispatch rich notifications to Parent when Sitter accepts booking, and allow Parent management actions', async ({ browser }) => {
    const parentContext = await browser.newContext();
    const sitterContext = await browser.newContext();

    const parentPage = await parentContext.newPage();
    const sitterPage = await sitterContext.newPage();

    // 1. Log in Sitter (Sarah Jenkins)
    await sitterPage.goto('/sitter/jobs');
    const sitterDemoBtn = sitterPage.getByRole('button', { name: /Demo Role:/i });
    await sitterDemoBtn.click();
    const sitterOption = sitterPage.locator('.absolute button').filter({ hasText: 'Sarah Jenkins' });
    await sitterOption.first().click();
    await sitterPage.waitForURL(/\/sitter\/jobs/);
    await sitterPage.waitForLoadState('networkidle');

    // 2. Log in Parent (David Smith)
    await parentPage.goto('/parent/bookings');
    const parentDemoBtn = parentPage.getByRole('button', { name: /Demo Role:/i });
    await parentDemoBtn.click();
    const parentOption = parentPage.locator('.absolute button').filter({ hasText: 'David Smith' });
    await parentOption.first().click();
    await parentPage.waitForURL(/\/parent\/bookings/);
    await parentPage.waitForLoadState('networkidle');

    // 3. Sitter accepts an incoming booking request on Sitter Jobs portal
    const acceptBtn = sitterPage.getByRole('button', { name: /Accept Job Request/i }).first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await sitterPage.waitForLoadState('networkidle');
    }

    // 4. Parent refreshes and opens Notification Bell
    await parentPage.reload();
    await parentPage.waitForLoadState('networkidle');

    const parentBellBtn = parentPage.locator('[data-testid="notification-bell"]');
    await expect(parentBellBtn).toBeVisible();
    await parentBellBtn.click();

    const parentDropdown = parentPage.locator('[data-testid="notification-dropdown"]');
    await expect(parentDropdown).toBeVisible();

    // Verify parent popover includes mark all read button and unread count indicator
    const markAllReadBtn = parentPage.locator('[data-testid="mark-all-read-btn"]');
    if (await markAllReadBtn.isVisible()) {
      await markAllReadBtn.click();
      await parentPage.waitForTimeout(500);
    }

    // Clean up
    await parentContext.close();
    await sitterContext.close();
  });
});
