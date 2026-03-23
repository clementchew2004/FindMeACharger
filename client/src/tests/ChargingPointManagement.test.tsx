import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChargingPointManagement } from "../components/charging-point-management";
import { describe, test, expect } from "vitest";

describe("Charging Point Management", () => {
  test("renders charging points", () => {
    render(<ChargingPointManagement />);
    const heyBrew = screen.getAllByText(/hey brew cafe/i)[0];
    const bullring = screen.getAllByText(/bullring charging/i)[0];
    const sellyOak = screen.getAllByText(/selly oak station/i)[0];
    expect(heyBrew).toBeInTheDocument();
    expect(bullring).toBeInTheDocument();
    expect(sellyOak).toBeInTheDocument();
  });

  test("add new button opens form", async () => {
    render(<ChargingPointManagement />);
    await userEvent.click(screen.getByText(/\+ add new/i));
    expect(screen.getByText(/add new charging point/i)).toBeInTheDocument();
  });

  test("user can fill add form", async () => {
    render(<ChargingPointManagement />);
    await userEvent.click(screen.getByText(/\+ add new/i));
    const nameInput = screen.getByPlaceholderText("e.g. Hey Brew Cafe");
    const codeInput = screen.getByPlaceholderText("e.g. CP-004");
    await userEvent.type(nameInput, "Test CP");
    await userEvent.type(codeInput, "CP-999");
    await userEvent.click(screen.getByRole("button", { name: /add charging point/i }));
    const newPoint = screen.getByText(/test cp/i);
    expect(newPoint).toBeInTheDocument();
  });

  test("edit button opens form", async () => {
    render(<ChargingPointManagement />);
    const editBtn = screen.getAllByRole("button", { name: /edit/i })[0];
    await userEvent.click(editBtn);
    expect(screen.getByText(/edit charging point/i)).toBeInTheDocument();
  });

  test("suspend button toggles status", async () => {
    render(<ChargingPointManagement />);
    const suspendBtn = screen.getAllByRole("button", { name: /suspend/i })[0];
    await userEvent.click(suspendBtn);
    const suspendedBadges = screen.getAllByText(/suspended/i);
    expect(suspendedBadges.length).toBeGreaterThan(0);
  });

  test("reactivate button toggles status", async () => {
    render(<ChargingPointManagement />);
    const suspendBtn = screen.getAllByRole("button", { name: /suspend/i })[0];
    await userEvent.click(suspendBtn);
    const reactivateBtn = screen.getAllByRole("button", { name: /reactivate/i })[0];
    await userEvent.click(reactivateBtn);
    const activeBadges = screen.getAllByText(/active/i);
    expect(activeBadges.some(el => el.tagName === "SPAN")).toBe(true);
  });

  test("remove button deletes charging point", async () => {
    render(<ChargingPointManagement />);
    const firstCard = screen.getAllByRole("button", { name: /edit/i })[0].closest("div")!;
    const removeBtn = within(firstCard).getByRole("button", { name: /remove/i });
    const initialCount = screen.getAllByRole("button", { name: /edit/i }).length;
    await userEvent.click(removeBtn);
    const afterCount = screen.queryAllByRole("button", { name: /edit/i }).length;
    expect(afterCount).toBeLessThan(initialCount);
  });
});