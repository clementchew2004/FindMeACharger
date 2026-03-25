import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ReportForm } from "../components/report-form";
import { describe, test, expect } from "vitest";

describe("Report Form", () => {
  test("renders all fields", () => {
    render(
      <MemoryRouter>
        <ReportForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/charging point/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type of issue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  test("user can fill form inputs", async () => {
    render(
      <MemoryRouter>
        <ReportForm />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText(/charging point/i), "WESTGATE");
    await userEvent.selectOptions(screen.getByLabelText(/type of issue/i), "Other");
    await userEvent.type(screen.getByLabelText(/description/i), "Test issue");
    expect(screen.getByDisplayValue("WESTGATE")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test issue")).toBeInTheDocument();
  });

  test("submit button is present", () => {
    render(
      <MemoryRouter>
        <ReportForm />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: /submit report/i })).toBeInTheDocument();
  });

  test("back to map button navigates back correctly", () => {
    render(
      <MemoryRouter>
        <ReportForm />
      </MemoryRouter>
    );
    const btn = screen.getByText(/back to map/i);
    expect(btn.closest("a")).toHaveAttribute("href", "/routing");
  });
});