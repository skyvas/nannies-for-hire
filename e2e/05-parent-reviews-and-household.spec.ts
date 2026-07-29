import { test, expect, Page } from '@playwright/test';

async function switchDemoRole(page: Page, userName: string) {
  const triggerBtn = page.getByRole('button', { name: /Demo Role:/i });
  await triggerBtn.click();
  const menuOption = page.locator('.absolute button').filter({ hasText: userName });
  await expect(menuOption.first()).toBeVisible();
  await menuOption.first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Parent Household & Reviews', () => {
  test('should display household profile details and children routines', async ({ page }) => {
    await page.goto('/parent/household');

    // Switch Demo Role to Parent (David Smith)
    await switchDemoRole(page, 'David Smith');

    // Verify Household Title and Children Cards
    await expect(page.locator('h1')).toContainText(/Smith Family/i);
    await expect(page.getByText(/Kitsilano/i).first()).toBeVisible();

    // Verify children profiles (Leo and Maya from seed data)
    await expect(page.getByText('Leo', { exact: true })).toBeVisible();
    await expect(page.getByText('Maya', { exact: true })).toBeVisible();
    await expect(page.getByText(/Peanut allergy/i)).toBeVisible();
  });

  test('should allow Parent to view past bookings and submitted reviews', async ({ page }) => {
    await page.goto('/parent/bookings');

    // Switch Demo Role to Parent (David Smith)
    await switchDemoRole(page, 'David Smith');

    // Verify Parent Bookings page
    await expect(page.locator('h1')).toContainText(/My Babysitting Bookings/i);
    await expect(page.getByText(/Sarah Jenkins/i).first()).toBeVisible();
  });
});
