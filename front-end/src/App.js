import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
// import "react-toastify/dist/ReactToastify.css";
import router from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-bodyFont">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
