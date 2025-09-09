// tests/scroll-reset.spec.ts
import { test, expect } from '@playwright/test'

const SEL = '#scrollable-content'

test('resets scroll on route change (PUSH)', async ({ page }) => {
  await page.goto('/orders')
  await page.waitForSelector(SEL)

  // scroll down in the app container
  await page.evaluate((sel) => {
    const el = document.querySelector(sel)!
    el.scrollTop = 500
  }, SEL)

  // navigate to a different page
  await page.click('a[href="/glazes"]')

  // should be at top
  const top = await page.evaluate((sel) => {
    const el = document.querySelector(sel)!
    return el.scrollTop
  }, SEL)
  expect(top).toBe(0)
})

test('keeps browser restore on back/forward (POP)', async ({ page }) => {
  await page.goto('/orders')
  await page.waitForSelector(SEL)
  await page.evaluate((sel) => (document.querySelector(sel)!.scrollTop = 400), SEL)

  await page.click('a[href="/glazes"]')
  await page.goBack() // POP

  // after POP, scroll should be restored (not forced to 0)
  const restored = await page.evaluate((sel) => document.querySelector(sel)!.scrollTop, SEL)
  expect(restored).toBeGreaterThan(0)
})
