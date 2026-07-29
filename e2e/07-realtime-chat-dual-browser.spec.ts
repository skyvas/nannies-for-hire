import { test, expect } from '@playwright/test';

test.describe('Real-Time Chat & SSE Streaming (Dual-Browser Context)', () => {
  test('should stream live text messages and photo attachments between Parent and Sitter windows side-by-side', async ({ browser }) => {
    // 1. Create two separate browser contexts for Parent and Sitter
    const parentContext = await browser.newContext();
    const sitterContext = await browser.newContext();

    const parentPage = await parentContext.newPage();
    const sitterPage = await sitterContext.newPage();

    // 2. Open Parent Page & Switch Demo Role to David Smith
    await parentPage.goto('/parent/bookings');
    const parentDemoBtn = parentPage.getByRole('button', { name: /Demo Role:/i });
    await parentDemoBtn.click();
    const parentOption = parentPage.locator('.absolute button').filter({ hasText: 'David Smith' });
    await parentOption.first().click();
    await parentPage.waitForLoadState('networkidle');

    // 3. Open Sitter Page & Switch Demo Role to Sarah Jenkins
    await sitterPage.goto('/sitter/jobs');
    const sitterDemoBtn = sitterPage.getByRole('button', { name: /Demo Role:/i });
    await sitterDemoBtn.click();
    const sitterOption = sitterPage.locator('.absolute button').filter({ hasText: 'Sarah Jenkins' });
    await sitterOption.first().click();
    await sitterPage.waitForLoadState('networkidle');

    // 4. Open Chat Windows using explicit test IDs for seed completed booking
    const parentChatBtn = parentPage.locator('[data-testid="open-chat-btn-seed_completed_booking_1"]').first();
    await parentChatBtn.click();

    const sitterChatBtn = sitterPage.locator('[data-testid="open-chat-btn-seed_completed_booking_1"]').first();
    await sitterChatBtn.click();

    await parentPage.waitForTimeout(500);
    await sitterPage.waitForTimeout(500);

    // 5. Parent fills message into #chat-message-input and submits via #chat-send-button
    const parentInput = parentPage.locator('#chat-message-input');
    await expect(parentInput).toBeVisible();
    await parentInput.scrollIntoViewIfNeeded();
    await parentInput.fill('Hi Sarah! Leo and Maya are ready for bedtime.');
    await expect(parentInput).toHaveValue('Hi Sarah! Leo and Maya are ready for bedtime.');
    
    const parentSendBtn = parentPage.locator('#chat-send-button');
    await parentSendBtn.click();

    // 6. Sitter receives live message instantly via SSE stream & fallback poll
    await expect(
      sitterPage.locator('[data-testid="chat-message-text"]', { hasText: 'Hi Sarah! Leo and Maya are ready for bedtime.' })
    ).toBeVisible({ timeout: 10000 });

    // 7. Sitter attaches photo preset and replies
    const photoPresetBtn = sitterPage.locator('#preset-btn-bedtime-photo');
    await photoPresetBtn.click();

    const sitterInput = sitterPage.locator('#chat-message-input');
    await expect(sitterInput).toBeVisible();
    await sitterInput.scrollIntoViewIfNeeded();
    await sitterInput.fill('Story time underway! Bedtime story done.');
    await expect(sitterInput).toHaveValue('Story time underway! Bedtime story done.');

    await sitterPage.waitForTimeout(300);

    const sitterSendBtn = sitterPage.locator('#chat-send-button');
    await sitterSendBtn.click();

    // 8. Parent receives photo attachment & text reply live via SSE stream
    await expect(
      parentPage.locator('[data-testid="chat-message-text"]', { hasText: 'Story time underway! Bedtime story done.' })
    ).toBeVisible({ timeout: 10000 });
    await expect(parentPage.locator('[data-testid="chat-message-photo"]').first()).toBeVisible();

    // Clean up browser contexts
    await parentContext.close();
    await sitterContext.close();
  });
});
