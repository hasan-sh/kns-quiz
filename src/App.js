import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, Container, Typography } from "@mui/material";

import KnsQuiz from "./components/KnsQuiz";
import Header from './components/Header';
import SprekenQuiz from "./components/Spreken";
import VerbsAndPhrases from "./components/VerbsAndPhrases";

function App() {
  return (
    <>
      <CssBaseline />
        <Router>
          <Header />  {/* Display Header on all pages */}
            <Routes>
                <Route path="/" element={<Navigate to="/kns" replace />}/>
                <Route path="/kns" element={<KnsQuiz />} />
                <Route path="/spreken" element={<SprekenQuiz />} />
                <Route path="/verbs-and-phrases" element={<VerbsAndPhrases />} />
            </Routes>
        </Router>
    </>
  );
}

export default App;
