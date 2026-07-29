import { test, expect } from '@playwright/test';

test.describe('Notification Bell & Unread Message Counter (Zero False Positives)', () => {
  test('should display exact unread badge count for incoming messages and reset badge when thread is opened', async ({ browser }) => {
    // 1. Create two separate browser contexts for Parent and Sitter
    const parentContext = await browser.newContext();
    const sitterContext = await browser.newContext();

    const parentPage = await parentContext.newPage();
    const sitterPage = await sitterContext.newPage();

    // 2. Log in Parent (David Smith)
    await parentPage.goto('/parent/bookings');
    const parentDemoBtn = parentPage.getByRole('button', { name: /Demo Role:/i });
    await parentDemoBtn.click();
    const parentOption = parentPage.locator('.absolute button').filter({ hasText: 'David Smith' });
    await parentOption.first().click();
    await parentPage.waitForLoadState('networkidle');

    // 3. Log in Sitter (Sarah Jenkins)
    await sitterPage.goto('/sitter/jobs');
    const sitterDemoBtn = sitterPage.getByRole('button', { name: /Demo Role:/i });
    await sitterDemoBtn.click();
    const sitterOption = sitterPage.locator('.absolute button').filter({ hasText: 'Sarah Jenkins' });
    await sitterOption.first().click();
    await sitterPage.waitForLoadState('networkidle');

    // Clear any existing booking notifications and chat messages from prior test runs to ensure a clean baseline
    await sitterPage.evaluate(async () => {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_ALL' }),
      });
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
    });
    await sitterPage.reload();
    await sitterPage.waitForLoadState('networkidle');

    // 4. Verify Sitter's bell has ZERO false positives initially (no badge visible)
    const sitterBadge = sitterPage.locator('[data-testid="notification-badge"]');
    await expect(sitterBadge).not.toBeVisible();

    // 5. Parent opens chat window and sends a new message to Sitter
    const parentChatBtn = parentPage.locator('[data-testid="open-chat-btn-seed_completed_booking_1"]').first();
    await parentChatBtn.click();

    const parentInput = parentPage.locator('#chat-message-input');
    await parentInput.scrollIntoViewIfNeeded();
    await parentInput.fill('Hi Sarah! Checking in on Leo and Maya for bedtime.');
    const parentSendBtn = parentPage.locator('#chat-send-button');
    await parentSendBtn.click();

    // 6. Sitter's Notification Bell receives real-time unread update and shows badge count "1"
    await expect(sitterBadge).toBeVisible({ timeout: 10000 });
    await expect(sitterBadge).toHaveText('1');

    // 7. Sitter clicks Notification Bell to open dropdown
    const sitterBellBtn = sitterPage.locator('[data-testid="notification-bell"]');
    await sitterBellBtn.click();
    const dropdown = sitterPage.locator('[data-testid="notification-dropdown"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toContainText('Smith Family');

    // 8. Sitter opens chat window for the booking -> marks messages as read
    const sitterChatBtn = sitterPage.locator('[data-testid="open-chat-btn-seed_completed_booking_1"]').first();
    await sitterChatBtn.click();

    // 9. Sitter's Notification Bell badge counter resets to 0 (badge disappears)
    await expect(sitterBadge).not.toBeVisible({ timeout: 10000 });

    // Clean up
    await parentContext.close();
    await sitterContext.close();
  });
});
