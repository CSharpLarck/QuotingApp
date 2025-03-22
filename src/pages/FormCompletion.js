import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FormCompletion.css"; // ✅ Import CSS file

const FormCompletion = () => {
  const navigate = useNavigate();

  // ✅ Scroll to top immediately on render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="form-completion">
      <h2>✅ Thank You!</h2>
      <p>The Release of Liability form has been successfully completed.</p>
      <button onClick={() => navigate("/resources")}>Back to Resources</button>
    </div>
  );
};

export default FormCompletion;
