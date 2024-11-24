import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, Container, Typography } from "@mui/material";

import Quiz from "./components/Quiz";
import Header from './components/Header';
import Spreken from "./components/SprekenCard";

function App() {
  return (
    <>
      <CssBaseline />
        <Router>
          <Header />  {/* Display Header on all pages */}
          <Typography variant="h4" align="center" gutterBottom>
            Kennis van de Nederlandse Samenleving (KNS)
          </Typography>
            <Routes>
                <Route path="/" element={<Navigate to="/kns" replace />}/>
                <Route path="/kns" element={<Quiz type="kns"/>} />
                <Route path="/spreken" element={<Quiz type="spreken" />} />
            </Routes>
        </Router>
    </>
  );
}

export default App;
