import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Practice from "@/pages/Practice";
import Review from "@/pages/Review";
import Mistakes from "@/pages/Mistakes";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice/:caseId" element={<Practice />} />
        <Route path="/review/:caseId" element={<Review />} />
        <Route path="/mistakes" element={<Mistakes />} />
      </Routes>
    </Router>
  );
}
