import { test, expect, Page } from '@playwright/test';

async function switchDemoRole(page: Page, userName: string) {
  const triggerBtn = page.getByRole('button', { name: /Demo Role:/i });
  await triggerBtn.click();
  const menuOption = page.locator('.absolute button').filter({ hasText: userName });
  await expect(menuOption.first()).toBeVisible();
  await menuOption.first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Vetting Queue & Financial Analytics', () => {
  test('should allow Platform Admin to view pending vetting applicants and approve Chloe Tremblay', async ({ page }) => {
    await page.goto('/admin/vetting');

    // 1. Switch Demo Role to Admin (Platform Admin)
    await switchDemoRole(page, 'Platform Admin');

    // 2. Verify Vetting Page Header
    await expect(page.locator('h1')).toContainText(/Caregiver Vetting & Verification Queue/i);

    // 3. Handle pending approve button if present or verify approved state idempotently
    const approveButton = page.locator('[data-testid="approve-sitter-btn"]').first();
    const isPending = await approveButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (isPending) {
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/admin/vetting') && resp.status() === 200
      );
      await approveButton.click();
      await responsePromise;
      await expect(page.getByText(/Sitter profile successfully APPROVED/i)).toBeVisible();
    } else {
      // Idempotent fallback: Chloe Tremblay was approved in prior run
      await expect(page.getByText(/Active Approved Sitters/i)).toBeVisible();
      await expect(page.getByText(/Chloe Tremblay/i)).toBeVisible();
    }
  });

  test('should allow Platform Admin to view financial analytics & 15% platform commission reports', async ({ page }) => {
    await page.goto('/admin/disputes');

    // Switch Demo Role to Admin
    await switchDemoRole(page, 'Platform Admin');

    // Verify Financial Analytics Page
    await expect(page.locator('h1')).toContainText(/Marketplace Financials & Dispute Monitor/i);
    await expect(page.getByText('Gross Merchandise Volume', { exact: true })).toBeVisible();
    await expect(page.getByText('15% Platform Commission', { exact: true })).toBeVisible();
  });
});
