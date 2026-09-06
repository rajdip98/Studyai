import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import type { Product } from "../api/types";

const product: Product = {
  id: "1",
  slug: "prakriti-bone-relief",
  name: "Prakriti Bone Relief",
  subtitle: "Ortho Care",
  description: "desc",
  images: [],
  priceInPaise: 99900,
  mrpInPaise: 139900,
  stockQuantity: 5,
  isBestseller: true,
  tags: [],
  ingredients: [],
  ratingAverage: 4.4,
  ratingCount: 508,
};

function renderCard(p: Product) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <ProductCard product={p} />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("ProductCard", () => {
  it("renders product name and formatted prices", async () => {
    renderCard(product);
    // `findBy` waits for (and act-wraps) the AuthProvider's pending session
    // check to settle, rather than asserting synchronously against a
    // still-updating tree.
    expect(await screen.findByText("Prakriti Bone Relief")).toBeInTheDocument();
    expect(screen.getByText("Rs. 999")).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,399")).toBeInTheDocument();
  });

  it("shows a Sale badge when discounted", async () => {
    renderCard(product);
    expect(await screen.findByText("Sale")).toBeInTheDocument();
  });

  it("shows In Stock / Out of Stock status", async () => {
    const { unmount } = renderCard(product);
    expect(await screen.findByText("In Stock")).toBeInTheDocument();
    unmount();

    renderCard({ ...product, stockQuantity: 0 });
    expect(await screen.findByText("Out of Stock")).toBeInTheDocument();
  });
});
