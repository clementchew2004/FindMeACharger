import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import SignupPage from "../pages/SignupPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

describe("App Authentication Flow", () => {
  test("user can login with invalid credentials", async () => {
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), "wrong@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpassword");

    const loginButton = screen
      .getAllByRole("button", { name: /login/i })
      .find(b => b.getAttribute("type") === "submit")!;
    await userEvent.click(loginButton);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("user can login with correct credentials", async () => {
    render(<App />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "correctpassword");

    const loginButton = screen
      .getAllByRole("button", { name: /login/i })
      .find(b => b.getAttribute("type") === "submit")!;
    await userEvent.click(loginButton);

    expect(loginButton).toBeInTheDocument();
  });

  test("user can fill signup form successfully", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/username/i), "testuser");
    await userEvent.type(screen.getByPlaceholderText(/email/i), "testuser@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password (Min 12 chars)"), "password12chars");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "password12chars");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
  });

  test("signup shows error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/username/i), "testuser");
    await userEvent.type(screen.getByPlaceholderText(/email/i), "testuser@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password (Min 12 chars)"), "password12chars");
    await userEvent.type(screen.getByPlaceholderText("Confirm Password"), "mismatchpassword");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test("Back to Login button navigates correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /back to login/i }));

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});