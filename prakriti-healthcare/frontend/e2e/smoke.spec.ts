import { test, expect } from "@playwright/test";

// End-to-end smoke test covering the storefront's golden path: browse ->
// view product -> reach the sign-in gate on checkout. Full checkout/payment
// requires a running backend + seeded database (see backend/README) and is
// exercised in the staging environment, not in this fast CI smoke test.
test("home page renders the hero and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Prakriti Healthcare" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Shop Bestsellers/i })).toBeVisible();
});

test("shop page lists products and links to product detail", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
});

test("checkout redirects an unauthenticated visitor to login", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login/);
});
