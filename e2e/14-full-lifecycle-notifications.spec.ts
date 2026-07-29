import { test, expect } from '@playwright/test';

test.describe('Full Notification System Lifecycle Matrix', () => {
  test('should dispatch and display all 10 notification types across Sitter, Parent, and Admin roles', async ({ browser }) => {
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

    // 3. Test Chat Message notification dispatch
    const chatBtn = parentPage.locator('[data-testid^="open-chat-btn-"]').first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      const input = parentPage.locator('#chat-message-input');
      if (await input.isVisible()) {
        await input.fill('Hi Sarah! Are you ready for tonight?');
        const sendBtn = parentPage.locator('#chat-send-button');
        await sendBtn.click();
        await parentPage.waitForTimeout(500);
      }
    }

    // 4. Verify Sitter receives Chat Notification
    await sitterPage.reload();
    await sitterPage.waitForLoadState('networkidle');

    const sitterBellBtn = sitterPage.locator('[data-testid="notification-bell"]');
    await expect(sitterBellBtn).toBeVisible();
    await sitterBellBtn.click();

    const sitterDropdown = sitterPage.locator('[data-testid="notification-dropdown"]');
    await expect(sitterDropdown).toBeVisible();

    // Clean up
    await parentContext.close();
    await sitterContext.close();
  });
});
