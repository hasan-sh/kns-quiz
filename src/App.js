import React from "react";
import { CssBaseline, Container, Typography } from "@mui/material";
import Quiz from "./components/Quiz";

function App() {
  return (
    <>
      <CssBaseline />
      <Container style={{margin: "15px 0"}}>
        <Typography variant="h4" align="center" gutterBottom>
          Kennis van de Nederlandse Samenleving (KNS)
        </Typography>
        <Quiz />
      </Container>
    </>
  );
}

export default App;
