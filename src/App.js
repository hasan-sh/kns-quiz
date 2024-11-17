import React from "react";
import { CssBaseline, Container, Typography } from "@mui/material";
import Quiz from "./components/Quiz";

function App() {
  return (
    <>
      <CssBaseline />
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Kennis van Nederlandse Samenleving (KNS)
        </Typography>
        <Quiz />
      </Container>
    </>
  );
}

export default App;
