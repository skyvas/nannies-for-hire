import { test, expect } from '@playwright/test';

test.describe('Booking Request Real-Time Notifications', () => {
  test('should display real-time notification badge when a parent submits a new booking request', async ({ browser }) => {
    // 1. Create two separate browser contexts for Parent and Sitter
    const parentContext = await browser.newContext();
    const sitterContext = await browser.newContext();

    const parentPage = await parentContext.newPage();
    const sitterPage = await sitterContext.newPage();

    // 2. Log in Parent (David Smith)
    await parentPage.goto('/search');
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

    // 4. Parent clicks Sarah J. card on search page to open booking modal
    const sarahCard = parentPage.locator('div.bg-white', { hasText: 'Sarah J.' }).first();
    const requestBtn = sarahCard.getByRole('button', { name: /Request Booking/i }).first();
    await requestBtn.click();

    // 5. Parent fills required date field and submits booking request
    const dateInput = parentPage.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);

    const confirmBtn = parentPage.getByRole('button', { name: /Send Request to/i }).first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 6. Sitter's Notification Bell receives real-time notification update with badge "1"
    const sitterBadge = sitterPage.locator('[data-testid="notification-badge"]');
    await expect(sitterBadge).toBeVisible({ timeout: 10000 });

    // 7. Sitter opens Notification Bell dropdown menu
    const sitterBellBtn = sitterPage.locator('[data-testid="notification-bell"]');
    await sitterBellBtn.click();

    const dropdown = sitterPage.locator('[data-testid="notification-dropdown"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toContainText(/New Booking Request/i);

    // 8. Sitter clicks the notification action link
    const notifLink = dropdown.locator('a[href="/sitter/jobs"]').first();
    await notifLink.click();

    // 9. Verify Sitter lands on jobs portal
    await expect(sitterPage).toHaveURL(/\/sitter\/jobs/);

    // Clean up
    await parentContext.close();
    await sitterContext.close();
  });
});
