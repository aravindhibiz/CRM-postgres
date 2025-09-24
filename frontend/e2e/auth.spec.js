import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Check the actual title from index.html
    await expect(page).toHaveTitle('salesflow_pro');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for welcome text
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Sign in to your SalesFlow account')).toBeVisible();
    
    // Check for demo buttons
    await expect(page.locator('text=Demo as Admin')).toBeVisible();
    await expect(page.locator('text=Demo as Sales Rep')).toBeVisible();
  });

  test('should use demo admin login', async ({ page }) => {
    await page.goto('/login');

    // Click demo admin button
    await page.click('text=Demo as Admin');

    // Wait for navigation to sales dashboard
    await page.waitForURL('**/sales-dashboard', { timeout: 10000 });

    // Verify we're redirected to dashboard
    await expect(page.url()).toContain('sales-dashboard');
  });

  test('should handle manual login form', async ({ page }) => {
    await page.goto('/login');

    // Fill manual login form
    await page.fill('input[type="email"]', 'admin@salesflow.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/sales-dashboard', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.url()).toContain('sales-dashboard');
  });
});
