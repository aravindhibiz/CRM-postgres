import { test, expect } from '@playwright/test';

/**
 * Critical End-to-End User Workflows
 * 
 * These tests verify the most important user journeys in the CRM system
 */

test.describe('Critical User Workflows', () => {
  
  test('Should login and navigate to deals page', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    
    // 2. Use demo admin login
    await page.click('text=Demo as Admin');
    
    // 3. Should redirect to dashboard
    await expect(page).toHaveURL('/sales-dashboard');
    
    // 4. Navigate to deals page
    await page.click('a[href="/deal-management"]');
    await expect(page).toHaveURL('/deal-management');
    
    // 5. Verify deals page loaded - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'Deal Management' })).toBeVisible();
  });

  test('Should login and navigate to contacts page', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    
    // 2. Use demo admin login
    await page.click('text=Demo as Admin');
    
    // 3. Should redirect to dashboard
    await expect(page).toHaveURL('/sales-dashboard');
    
    // 4. Navigate to contacts page
    await page.click('a[href="/contact-management"]');
    await expect(page).toHaveURL('/contact-management');
    
    // 5. Verify contacts page loaded - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'Contact Management' })).toBeVisible();
  });

  test('Should login and navigate to analytics page', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    
    // 2. Use demo admin login  
    await page.click('text=Demo as Admin');
    
    // 3. Should redirect to dashboard
    await expect(page).toHaveURL('/sales-dashboard');
    
    // 4. Navigate to analytics page
    await page.click('a[href="/pipeline-analytics"]');
    await expect(page).toHaveURL('/pipeline-analytics');
    
    // 5. Verify analytics page loaded - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'Pipeline Analytics' })).toBeVisible();
  });

  test('Should login and navigate to activity timeline', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    
    // 2. Use demo admin login
    await page.click('text=Demo as Admin');
    
    // 3. Should redirect to dashboard
    await expect(page).toHaveURL('/sales-dashboard');
    
    // 4. Navigate to activity timeline
    await page.click('a[href="/activity-timeline"]');
    await expect(page).toHaveURL('/activity-timeline');
    
    // 5. Verify activity timeline page loaded - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'Activity Timeline' })).toBeVisible();
  });

  test('Should navigate between all main pages', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.click('text=Demo as Admin');
    await expect(page).toHaveURL('/sales-dashboard');
    
    // Test all navigation links
    const pages = [
      { link: '/deal-management', title: 'Deal Management' },
      { link: '/contact-management', title: 'Contact Management' },
      { link: '/pipeline-analytics', title: 'Pipeline Analytics' },
      { link: '/activity-timeline', title: 'Activity Timeline' },
      { link: '/sales-dashboard', title: 'Dashboard' }
    ];
    
    for (const pageInfo of pages) {
      await page.click(`a[href="${pageInfo.link}"]`);
      await expect(page).toHaveURL(pageInfo.link);
      await expect(page.getByRole('heading', { name: pageInfo.title })).toBeVisible();
    }
  });
});
