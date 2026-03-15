import { test, expect } from "@playwright/test";

/**
 * Visual Snapshot Tests
 *
 * PR마다 주요 페이지 스크린샷을 자동 캡처 → artifacts에 업로드.
 * 렌더링 문제(레이아웃 깨짐, 이모지 노출, 텍스트 잘림 등)를
 * 코드 분석만으로 놓치는 것을 방지하기 위한 근본 해결책.
 *
 * 사용법:
 * - CI: playwright-report/screenshots/ 에 저장 → artifacts에서 다운로드 가능
 * - 로컬: npx playwright test visual-snapshot --headed
 */

const KEY_PAGES = [
  { path: "/", name: "home" },
  { path: "/compare", name: "compare" },
  { path: "/strategies", name: "strategies" },
  { path: "/simulate", name: "simulate" },
  { path: "/about", name: "about" },
  { path: "/fees", name: "fees" },
  { path: "/market", name: "market" },
];

test.describe("Visual snapshots — desktop", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`screenshot: ${name} (desktop)`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // Wait for fonts + lazy images
      await page.waitForTimeout(800);

      await page.screenshot({
        path: `playwright-report/screenshots/${name}-desktop.png`,
        fullPage: true,
      });

      // Basic sanity: page must load (no 4xx/5xx)
      const title = await page.title();
      expect(title.length, `${name} has empty title`).toBeGreaterThan(0);

      // No raw i18n keys visible (e.g. "hero.cta_primary" literally on page)
      const body = await page.locator("body").innerText();
      const rawKey = body.match(/\b\w+\.\w+_\w+\b/g);
      expect(
        rawKey?.length ?? 0,
        `Raw i18n key found on ${name}: ${rawKey?.slice(0, 3).join(", ")}`,
      ).toBe(0);
    });
  }
});

test.describe("Visual snapshots — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true });

  for (const { path, name } of [
    { path: "/", name: "home" },
    { path: "/compare", name: "compare" },
    { path: "/strategies", name: "strategies" },
  ]) {
    test(`screenshot: ${name} (mobile)`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);

      await page.screenshot({
        path: `playwright-report/screenshots/${name}-mobile.png`,
        fullPage: true,
      });

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }

  test("mobile: hamburger opens menu", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const btn = page.locator("#mobile-menu-btn");
    await btn.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();

    await page.screenshot({
      path: "playwright-report/screenshots/home-mobile-menu-open.png",
    });
  });
});

test.describe("GNB: Strategies dropdown visible", () => {
  test("desktop: Strategies hover shows dropdown", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const strategiesLink = page.locator("nav .hidden.md\\:flex a", {
      hasText: "Strategies",
    });
    await strategiesLink.hover();
    await page.waitForTimeout(200);

    // Dropdown must contain Daily Ranking
    const dropdown = page.locator("nav .hidden.md\\:flex .group:hover div a", {
      hasText: "Daily Ranking",
    });
    await expect(dropdown.first()).toBeVisible({ timeout: 3000 });

    await page.screenshot({
      path: "playwright-report/screenshots/nav-strategies-dropdown.png",
    });
  });
});
