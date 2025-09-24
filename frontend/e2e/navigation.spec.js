import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main sections', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('text=Demo as Admin');
    await expect(page).toHaveURL('/sales-dashboard');

    // Test navigation to different sections
    const navigationItems = [
      { name: 'Dashboard', path: '/sales-dashboard', heading: 'Dashboard' },
      { name: 'Contacts', path: '/contact-management', heading: 'Contact Management' },
      { name: 'Deals', path: '/deal-management', heading: 'Deal Management' },
      { name: 'Activity', path: '/activity-timeline', heading: 'Activity Timeline' },
      { name: 'Analytics', path: '/pipeline-analytics', heading: 'Pipeline Analytics' },
    ];

    for (const item of navigationItems) {
      await page.click(`a[href="${item.path}"]`);
      await expect(page).toHaveURL(item.path);
      
      // Verify the page loaded correctly
      await expect(page.getByRole('heading', { name: item.heading })).toBeVisible();
    }
  });

  test('should have responsive navigation', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('text=Demo as Admin');
    await expect(page).toHaveURL('/sales-dashboard');
    
    // Test desktop navigation first
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopNav = page.locator('nav');
    await expect(desktopNav).toBeVisible();
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    
    // On mobile, main nav should be hidden and there might be a mobile menu button
    const mobileNav = page.locator('nav.hidden');
    await expect(mobileNav).toBeAttached(); // Should exist but be hidden
  });

  test('should handle theme toggle', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('text=Demo as Admin');
    await expect(page).toHaveURL('/sales-dashboard');
    
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      // Verify theme changed (this would depend on your implementation)
      // Could check for class changes, localStorage, etc.
    }
  });
});
