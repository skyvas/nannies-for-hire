import { test, expect } from '@playwright/test';

test.describe('Past Booking Prevention & Time Validation', () => {
  test('should enforce min date attribute on UI and reject past date booking requests via API & UI', async ({ page, request }) => {
    await page.goto('/search');

    // 1. Switch Demo Role to Parent (David Smith)
    const demoBtn = page.getByRole('button', { name: /Demo Role:/i });
    await demoBtn.click();
    const parentOption = page.locator('.absolute button').filter({ hasText: 'David Smith' });
    await parentOption.first().click();
    await page.waitForLoadState('networkidle');

    // 2. Open Booking Modal for Sarah J.
    const sarahCard = page.locator('div.bg-white', { hasText: 'Sarah J.' }).first();
    const requestBtn = sarahCard.getByRole('button', { name: /Request Booking/i }).first();
    await requestBtn.click();

    // 3. Verify HTML5 date input min attribute enforces Vancouver current date restriction
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    const minAttribute = await dateInput.getAttribute('min');
    expect(minAttribute).toBeTruthy();
    expect(new Date(minAttribute!).getFullYear()).toBeGreaterThanOrEqual(2026);

    // 4. Verify Backend API endpoint rejects past date requests with HTTP 400
    const pastApiRes = await request.post('/api/bookings/request', {
      data: {
        sitterProfileId: 'sitter_profile_sarah_jenkins_id',
        householdId: 'demo_household_1',
        startDateTime: '2020-01-01T18:00:00.000Z',
        endDateTime: '2020-01-01T22:00:00.000Z',
        numChildren: 1,
        durationHours: 4,
      },
    });
    expect(pastApiRes.status()).toBe(400);
    const pastApiData = await pastApiRes.json();
    expect(pastApiData.error).toContain('cannot be in the past');

    // 5. Select a valid FUTURE date (3 days from now in Vancouver)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);

    // 6. Submit valid future booking request in UI
    const submitBtn = page.getByRole('button', { name: /Send Request to/i }).first();
    await submitBtn.click();

    // 7. Verify booking request succeeds
    await expect(page.getByText(/Booking request sent to/i)).toBeVisible();
  });
});
