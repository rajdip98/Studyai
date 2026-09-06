import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../components/ProductCard";
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

describe("ProductCard", () => {
  it("renders product name and formatted prices", () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Prakriti Bone Relief")).toBeInTheDocument();
    expect(screen.getByText("Rs. 999")).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,399")).toBeInTheDocument();
  });

  it("shows the discount percentage badge", () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/% OFF/)).toBeInTheDocument();
  });
});
