import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ErrorBoundary>
			{clerkKey ? (
				<ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
					<App />
				</ClerkProvider>
			) : (
				<App />
			)}
		</ErrorBoundary>
	</StrictMode>
);
