import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import SignupPage from "../pages/SignupPage";
import { MemoryRouter } from "react-router-dom";

test("user can login with invalid credentials", async () => {
  render(<App />);

  await userEvent.type(screen.getByPlaceholderText(/email/i), "wrong@example.com");
  await userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpassword");
  const buttons = screen.getAllByRole("button", { name: /login/i });
  const loginButton = buttons.find(b => b.getAttribute("type") === "submit")!;
  await userEvent.click(loginButton);

  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});

test("user can fill signup form", async () => {
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
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password (Min 12 chars)")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
});