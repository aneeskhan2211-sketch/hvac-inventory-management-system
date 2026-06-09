import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleAuthProvider } from "./context/GoogleAuthContext";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <QueryClientProvider client={queryClient}>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>,
);
