import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: "#111827", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;