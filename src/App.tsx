
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { ConvexWrapper } from "./lib/convex-provider";
import { UserSync } from "./components/UserSync";

const queryClient = new QueryClient();

// Create the router using the route tree
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <ConvexWrapper>
      <QueryClientProvider client={queryClient}>
        <UserSync />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ConvexWrapper>
  );
}

export default App;

  