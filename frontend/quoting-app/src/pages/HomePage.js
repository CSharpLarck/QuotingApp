import React from "react";
import Navbar from "../components/Navbar";

function HomePage() {
    return (
        <>
            <Navbar />
        <div className="container mt-5">
            <h1 className="text-primary">Welcome to the Quoting App</h1>
            <p className="lead">Create quotes and place orders effortlessly!</p>
            <button className="btn btn-success">Get Started</button>
        </div>
    </>
    );
}

export default HomePage;
