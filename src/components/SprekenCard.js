import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Button, Modal, TextField } from "@mui/material";
import Grid from '@mui/material/Grid2';


let SERVER_URL = "https://python-basisexamen.vercel.app/api";
if (process.env.NODE_ENV === "development") {
  SERVER_URL = "http://127.0.0.1:5000/api";
}


const SprekenCard = ({ question }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [llmResult, setLlmResult] = useState(null);

  const fetchAnswers = async (question) => {
    setLoading(true);
    
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, userAnswer }),
      });
      const data = await response.json();
      setAnswers(data.answers);
      setLlmResult({ score: data.correctnessScore, explanation: data.explanation });
      setLoading(false);
      setOpen(true);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnswers([]);
    setLlmResult(null);
  };


const handleTextToSpeech = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "nl-NL";
  utterance.rate = 0.85;
  speechSynthesis.speak(utterance);
};

  return (
    <>
      <Grid xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">{question}</Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => handleTextToSpeech(question)}
            >
              Listen
            </Button>

            <TextField
              label="Your Answer"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <Button
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
              onClick={() => fetchAnswers(question)}
            >
              Verify
            </Button>
          </CardContent>
        </Card>
      </Grid>

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
            {question}
          </Typography>
          {loading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : (
            <>
            {llmResult !== null && (
              <>
                <Typography variant="caption" sx={{ mb: 2 }}>
                  Correctness Score: {llmResult.score}%
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {llmResult.explanation}
                </Typography>
              </>
            )}
              <Typography variant="h6">Top 3 Answers:</Typography>
              <ul>
                {answers.map((answer, idx) => (
                  <li key={idx}>{answer}</li>
                ))}
              </ul>
            </>
          )}
          <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default SprekenCard;