import { test, expect, Page } from '@playwright/test';

async function switchDemoRole(page: Page, userName: string) {
  const triggerBtn = page.getByRole('button', { name: /Demo Role:/i });
  await triggerBtn.click();
  const menuOption = page.locator('.absolute button').filter({ hasText: userName });
  await expect(menuOption.first()).toBeVisible();
  await menuOption.first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Booking Workflow & Commission Pricing Engine', () => {
  test('should allow Parent to switch role, create a booking request, and calculate 15% platform commission', async ({ page }) => {
    await page.goto('/search');

    // 1. Switch Demo Role to Parent (David Smith)
    await switchDemoRole(page, 'David Smith');

    // 2. Open Booking Modal for Sarah Jenkins
    const requestButtons = page.getByRole('button', { name: /Request Booking/i });
    await requestButtons.first().click();

    // 3. Fill Booking Form Details
    const dateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateString = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateString);

    // Verify 15% Platform Commission in price breakdown
    await expect(page.getByText(/15% Platform Commission/i)).toBeVisible();
    await expect(page.getByText(/Total Estimated Cost/i)).toBeVisible();

    // 4. Submit Booking Request
    const submitButton = page.getByRole('button', { name: /Send Request to/i });
    await submitButton.click();

    // 5. Verify Confirmation success message
    await expect(page.getByText(/Booking request sent to/i)).toBeVisible();
  });
});
