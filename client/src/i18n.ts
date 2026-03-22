import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "login.title": "Login",
      "login.email": "Email",
      "login.password": "Password",
      "login.rememberMe": "Remember me",
      "login.button": "Login",
      "login.loggingIn": "Logging in...",
      "login.continueWithoutLogin": "Continue without login (for development)",
      "login.noAccount": "Don't have an account?",
      "login.signUp": "Sign up",
      "login.error.invalidCredentials": "Incorrect email or password.",
      "login.error.tooManyRequests": "Too many attempts. Please try again later.",
      "login.error.generic": "Something went wrong. Please try again.",
      "signup.title": "Sign Up",
      "signup.username": "Username",
      "signup.displayName": "Display Name (Optional)",
      "signup.email": "Email",
      "signup.password": "Password (Min 12 chars)",
      "signup.confirmPassword": "Confirm Password",
      "signup.button": "Sign up",
      "signup.creatingAccount": "Creating account...",
      "signup.backToLogin": "Back to Login",
      "signup.error.passwordsMatch": "Passwords do not match.",
      "signup.error.userExists": "An account with this email already exists.",
      "signup.error.invalidEmail": "Please enter a valid email address.",
      "signup.error.weakPassword": "Password must be at least 12 characters.",
      "signup.success": "Account created!",
      "profile.title": "My Profile",
      "profile.loading": "Loading profile...",
      "profile.loadError": "Could not load profile. Please try logging in again",
      "profile.fetchError": "Failed to load profile details",
      "profile.updateError": "Failed to update profile",
      "profile.goToLogin": "Go to Login",
      "profile.email": "Email",
      "profile.emailUnchangeable": "Your email address cannot be changed",
      "profile.username": "Username",
      "profile.displayName": "Display Name",
      "profile.optional": "Optional",
      "profile.saveChanges": "Save Changes",
      "profile.saving": "Saving...",
      "profile.backToMap": "Back to Map",
      "profile.logout": "Log out",
      "profile.updateSuccess": "Profile updated successfully!",
      "map.searchPlaceholder": "Search location",
      "map.myProfile": "My Profile",
      "map.filters": "Filters",
      "map.calculateRoute": "Calculate route",
      "map.distance": "Distance",
      "map.duration": "Duration",
      "map.applyFilters": "Apply Filters",
      "map.maxDistance": "Max Distance (km)",
      "map.cost": "Cost",
      "map.free": "Free",
      "map.paid": "Paid",
      "map.availableOnly": "Available only",
      "map.accessibility": "Accessibility",
      "map.wheelchairAccess": "Wheelchair access",
      "map.noBlockedSockets": "No blocked sockets",
      "map.mode.walk": "Walk",
      "map.mode.cycle": "Cycle",
      "map.mode.drive": "Drive",
      "map.mode.wheelchair": "Wheelchair",
      "map.info.availability": "Availability",
      "map.info.cost": "Cost",
      "map.info.userReports": "User Reports",
      "map.info.bay": "Bay",
      "map.info.chargerType": "Charger Type",
      "map.info.book": "Book",
      "map.info.busy": "Busy",
      "map.info.loading": "loading.."
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;