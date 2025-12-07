import { Routes, Route } from "react-router-dom";
import WorkshopMasterPage from "./pages/WorkshopMasterPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkshopMasterPage />} />
    </Routes>
  );
}
