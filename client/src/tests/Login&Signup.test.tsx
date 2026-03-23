import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { describe, test, expect } from "vitest";
import SignupPage from "@/pages/SignupPage";
import { MemoryRouter } from "react-router-dom";

describe("Login/Signup pages", () => {
  test("user can type in login form", async () => {
    render(<App />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456789012");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("123456789012");
  });

  test("login button exists", () => {
    render(<App />);
    const loginButton = screen.getByRole("button", { name: /^login$/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("user can type in signup form", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const displayNameInput = screen.getByPlaceholderText(/display name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password \(min 12 chars\)/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(displayNameInput, "Test User");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456789012");
    await userEvent.type(confirmPasswordInput, "123456789012");

    expect(usernameInput).toHaveValue("testuser");
    expect(displayNameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("123456789012");
    expect(confirmPasswordInput).toHaveValue("123456789012");
  });

  test("back to login button navigates correctly", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await userEvent.click(screen.getByRole("button", { name: /back to login/i }));
    const loginButton = screen.getByRole("button", { name: /^login$/i });
    expect(loginButton).toBeInTheDocument();
  });

  test("shows non-matching passwords error", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/^password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
    const signUpButton = await screen.findByRole("button", { name: /sign up/i });

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "123456789012");
    await userEvent.type(confirmPasswordInput, "mismatch123456");

    await userEvent.click(signUpButton);

    const error = await screen.findByText(/passwords do not match/i);
    expect(error).toBeInTheDocument();
  });
});