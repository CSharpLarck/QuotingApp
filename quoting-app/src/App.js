import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuotePage from "./pages/QuotePage";
import OrderReviewPage from "./pages/OrderReviewPage";

function App() {
  return (
    <Router>
      <div>
        {/* Naviagtion bar or header (optional) */}
        <nav>
          <a href="/">Home</a>
          <a href="/quote">Get a Quote</a>
          <a href="/order-review">Review Orders</a>
        </nav>

        {/* Define application routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/order-review" element={<OrderReviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
