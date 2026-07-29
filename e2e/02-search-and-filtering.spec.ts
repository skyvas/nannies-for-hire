import { test, expect } from '@playwright/test';

test.describe('Caregiver Search & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display initial list of approved sitters', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Find Babysitters in Metro Vancouver/i);
    
    // Check seeded sitters are present (displayed as First Name + Last Initial, e.g., "Sarah J.")
    await expect(page.getByText(/Sarah J/i)).toBeVisible();
    await expect(page.getByText(/Emily W/i)).toBeVisible();
    await expect(page.getByText(/Jessica M/i)).toBeVisible();
  });

  test('should filter sitters by CPR certification toggle', async ({ page }) => {
    const cprCheckbox = page.locator('input[type="checkbox"]');
    await expect(cprCheckbox).toBeVisible();
    await cprCheckbox.check();
    
    // Verify CPR badges exist
    const cprBadges = page.getByText(/CPR Certified/i);
    await expect(cprBadges.first()).toBeVisible();
  });

  test('should display sitter rates in CAD and show detailed booking modal', async ({ page }) => {
    // Check base rate display format ($24.00 for Emily Wong or $26.00 for Sarah)
    await expect(page.getByText(/\$2[46]\.00/).first()).toBeVisible();

    // Click on top sitter's Request Booking button
    const requestButtons = page.getByRole('button', { name: /Request Booking/i });
    await requestButtons.first().click();

    // Verify modal appears with header
    await expect(page.getByText(/Request /i).first()).toBeVisible();

    // Verify 15% platform commission breakdown in modal
    await expect(page.getByText(/15% Platform Commission/i)).toBeVisible();
  });
});
