import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, Container, Typography } from "@mui/material";

import Quiz from "./components/Quiz";
import Header from './components/Header';
import Spreken from "./components/SprekenCard";
import StructuredQuiz from "./components/Spreken";

function App() {
  return (
    <>
      <CssBaseline />
        <Router>
          <Header />  {/* Display Header on all pages */}
            <Routes>
                <Route path="/" element={<Navigate to="/kns" replace />}/>
                <Route path="/kns" element={<Quiz type="kns"/>} />
                <Route path="/spreken" element={<StructuredQuiz />} />
            </Routes>
        </Router>
    </>
  );
}

export default App;
