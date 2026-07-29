import { test, expect, Page } from '@playwright/test';

async function switchDemoRole(page: Page, userName: string) {
  const triggerBtn = page.getByRole('button', { name: /Demo Role:/i });
  await expect(triggerBtn).toBeVisible({ timeout: 10000 });
  await triggerBtn.click();
  const menuOption = page.locator('.absolute button').filter({ hasText: userName });
  await expect(menuOption.first()).toBeVisible();
  await menuOption.first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Nanny Application Signup Workflow & Admin Vetting', () => {
  test('should allow a caregiver to apply from home page CTA, complete 5-step wizard, and allow Admin to review application', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Click "Become a Nanny" CTA button in Hero
    const heroApplyBtn = page.locator('#hero-apply-nanny-btn');
    await expect(heroApplyBtn).toBeVisible();
    await heroApplyBtn.click();

    // 3. Verify Navigation to /sitter/apply
    await expect(page).toHaveURL(/\/sitter\/apply/);
    await expect(page.locator('h1', { hasText: 'Nanny Caregiver Application' })).toBeVisible();

    // 4. Fill Step 1 — Personal Information
    const uniqueEmail = `sarah.nanny.${Date.now()}@example.com`;
    await page.locator('#apply-first-name').fill('Sarah');
    await page.locator('#apply-last-name').fill('Jenkins');
    await page.locator('#apply-email').fill(uniqueEmail);
    await page.locator('#apply-phone').fill('(604) 555-9876');
    await page.locator('#apply-address').fill('1850 W 4th Ave');
    await page.locator('#apply-postal-code').fill('V6K 1N2');
    await page.locator('#apply-emergency-contact').fill('Robert Jenkins');
    await page.locator('#apply-emergency-phone').fill('(604) 555-1122');

    await page.locator('#wizard-next-btn').click();

    // 5. Fill Step 2 — Professional Information
    await expect(page.locator('h2', { hasText: 'Step 2' })).toBeVisible();
    await page.locator('#apply-years-experience').fill('5');
    await page.locator('#apply-languages').fill('English, French');
    await page.locator('#apply-cpr-checkbox').check().catch(() => {});
    await page.locator('#apply-availability').fill('Available weekdays 4pm-10pm and weekends');

    await page.locator('#wizard-next-btn').click();

    // 6. Step 3 — Required Documents Verification
    await expect(page.locator('h2', { hasText: 'Step 3' })).toBeVisible();
    // Default mock documents are pre-populated for demo testing
    await page.locator('#wizard-next-btn').click();

    // 7. Step 4 — Agreements & Electronic Signature
    await expect(page.locator('h2', { hasText: 'Step 4' })).toBeVisible();
    await page.locator('#apply-agree-checkbox').check();
    await page.locator('#apply-signature').fill('Sarah Marie Jenkins');

    await page.locator('#wizard-next-btn').click();

    // 8. Step 5 — Review & Submit
    await expect(page.locator('h2', { hasText: 'Step 5' })).toBeVisible();
    const submitBtn = page.locator('#wizard-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 9. Verify Confirmation Screen & Reference Number
    const refNumberEl = page.locator('#app-reference-number');
    await expect(refNumberEl).toBeVisible({ timeout: 10000 });
    const appRefNumber = await refNumberEl.innerText();
    expect(appRefNumber).toMatch(/^APP-\d{6}$/);

    // 10. Navigate to /admin/vetting & Switch Demo Role to Admin
    await page.goto('/admin/vetting');
    await page.waitForLoadState('networkidle');

    await switchDemoRole(page, 'Platform Admin');

    // 11. Switch to Applications tab
    const appTabBtn = page.locator('#admin-tab-applications');
    await expect(appTabBtn).toBeVisible();
    await appTabBtn.click();

    // 12. Verify Nanny Applications tab contains the submitted application
    const appRow = page.locator('tr', { hasText: appRefNumber });
    await expect(appRow).toBeVisible();
    await expect(appRow).toContainText('Sarah Jenkins');

    // 13. Open Review Modal
    const reviewBtn = appRow.locator('button', { hasText: 'Review' }).first();
    await reviewBtn.click();

    // 14. Update Workflow Status to "UNDER_REVIEW" & Save Notes
    const statusSelect = page.locator('#admin-update-status-select');
    await statusSelect.selectOption('UNDER_REVIEW');

    const notesInput = page.locator('#admin-notes-input');
    await notesInput.fill('Verified CPR certificate & driver license in Vancouver database.');

    const saveBtn = page.locator('#admin-save-status-btn');
    await saveBtn.click();

    // 15. Assert status updated
    await expect(page.locator('span', { hasText: 'UNDER_REVIEW' }).first()).toBeVisible();
  });
});
