import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MapRoutingPage from "../pages/MapRoutingPage";
import { describe, test, expect } from "vitest";

describe("Map Page", () => {
  test("renders report button", () => {
    render(
      <MemoryRouter>
        <MapRoutingPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/report a problem/i)).toBeInTheDocument();
  });

  test("report button navigates correctly", async () => {
    render(
      <MemoryRouter>
        <MapRoutingPage />
      </MemoryRouter>
    );
    const btn = screen.getByText(/report a problem/i);
    expect(btn.closest("a")).toHaveAttribute("href", "/report");
  });

  test("profile button navigates correctly", () => {
    render(
      <MemoryRouter>
        <MapRoutingPage />
      </MemoryRouter>
    );
    const btn = screen.getByText(/my profile/i);
    expect(btn.closest("a")).toHaveAttribute("href", "/profile");
  });
});