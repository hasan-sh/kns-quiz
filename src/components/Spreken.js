import React, { useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Modal, Pagination } from "@mui/material";
import questions from "../data/spreken_questions.json";


const QUESTIONS_PER_PAGE = 10;


console.log(process.env.REACT_APP_VERCEL_PROD)
const Spreken = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchAnswers = async (question) => {
    setLoading(true);
    setSelectedQuestion(question);
    const response = await fetch("https://python-basisexamen.vercel.app/api", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
    },
      body: JSON.stringify({ question }),
    });
    try {
        const data = await response.json();
        setAnswers(data.answers);
        setLoading(false);
        setOpen(true);
    } catch (error) {
        setLoading(false);
        console.error(error) 
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnswers([]);
    setSelectedQuestion(null);
  };

  const displayedQuestions = questions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom>
        Spreken Questions
      </Typography>
      <Grid container spacing={2}>
        {displayedQuestions.map((question, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{question}</Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => fetchAnswers(question)}
                >
                  Hint!
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box gap={1} display="flex" justifyContent="center">
        <Pagination
          shape="rounded"
          variant="outlined"
          count={Math.ceil(questions.length / QUESTIONS_PER_PAGE)}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {selectedQuestion}
          </Typography>
          {loading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : (
            <ul>
              {answers.map((answer, idx) => (
                <li key={idx}>{answer}</li>
              ))}
            </ul>
          )}
          <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};


export default Spreken;
