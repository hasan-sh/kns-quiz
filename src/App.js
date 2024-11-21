import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, Typography } from "@mui/material";

import Quiz from "./components/Quiz";
import Header from './components/Header';
import Spreken from "./components/Spreken";

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
                <Route path="/" element={<Quiz />} />
                <Route path="/spreken" element={<Spreken />} />
            </Routes>
        </Router>
    </>
  );
}

export default App;
