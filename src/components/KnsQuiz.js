import React, { useState, useEffect } from "react";
import { Pagination, Box, Button, FormControl, InputLabel, Select, MenuItem, PaginationItem } from "@mui/material";
import Grid from '@mui/material/Grid2';
import KnsCard from "./KnsCard";
import ScoreReport from "./ScoreReport";

// Shuffle questions and pick a random subset
const getRandomQuestions = (num, questions, randomize=true) => {
  const shuffled = randomize ? [...questions].sort(() => 0.5 - Math.random()) : questions;
  return shuffled.slice(0, num);
};


const DataPath = `${process.env.PUBLIC_URL}/data/questions.json`;

const Quiz = () => {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [selectedNumberOfQuestions, setSelectedNumberOfQuestions] = useState(20);
  const [randomizeQuestions, setRandomizeQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [randomQuestions, setRandomQuestions] = useState([]);


  useEffect(() => {
    fetch(DataPath, { headers: { "Content-Type": "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        setRandomQuestions(getRandomQuestions(selectedNumberOfQuestions, data, randomizeQuestions));
        setQuestions(data);
      });
  }, []);

  const restartQuiz = () => {
    if (!randomQuestions.length) return;
    setRandomQuestions(getRandomQuestions(selectedNumberOfQuestions, questions, randomizeQuestions));
    setAnswers({});
    setPage(0);
    setShowScore(false);
  };

  useEffect(() => {
    restartQuiz();
  }, [selectedNumberOfQuestions, randomizeQuestions]);

  if (!randomQuestions.length) {
    return null;
  }

  // Calculate the score dynamically
  const calculateScore = () => {
    return Object.entries(answers).reduce((score, [key, value]) => {
      const question = randomQuestions.find((q) => q.question_id === key);
      return question?.correct_answer === value ? score + 1 : score;
    }, 0);
  };

  // Generate a report of incorrect answers
  const getIncorrectQuestions = () => {
    return Object.entries(answers)
      .filter(([key, value]) => {
        const question = randomQuestions.find((q) => q.question_id === key);
        return question?.correct_answer !== value;
      })
      .map(([key]) => {
        return randomQuestions.find((q) => q.question_id === key);
      });
  };

  const handleAnswer = (selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [randomQuestions[page].question_id]: selectedAnswer,
    }));

    // Automatically advance to the next question
    const nextQuestion = page + 1;
    if (nextQuestion < randomQuestions.length) {
      setPage(nextQuestion);
    } else {
      setShowScore(true); // End quiz if it was the last question
    }
  };

  const handlePageChange = (event, page) => {
    setPage(page - 1);
  };


  const score = calculateScore();
  const incorrectQuestions = getIncorrectQuestions();
  const currentQuestion = randomQuestions[page];

  return (
    <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" gap={2}>
            <FormControl sx={{ width: 150 }}>
                <InputLabel id="question-count-label">Questions</InputLabel>
                <Select
                labelId="question-count-label"
                value={selectedNumberOfQuestions}
                label="Questions"
                onChange={(e) => {
                    const n = e.target.value;
                    setSelectedNumberOfQuestions(n)
                }}>
                {[...Array.from({ length: Math.ceil(questions.length / 10) }, (_, i) => Math.min((i + 1) * 10, questions.length))].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}
                  </MenuItem>
                ))}
                </Select>
            </FormControl>
            <FormControl sx={{ width: 150 }}>
                <InputLabel id="random-questions">Randomized?</InputLabel>
                <Select
                    labelId="random-questions"
                    value={randomizeQuestions}
                    label="Questions"
                    onChange={(e) => setRandomizeQuestions(e.target.value)}
                    >
                <MenuItem value={0}>Ordered</MenuItem>
                <MenuItem value={1}>Random</MenuItem>
                </Select>
            </FormControl>
        </Box>

      {showScore &&
        <ScoreReport
          score={score}
          totalQuestions={randomQuestions.length}
          incorrectQuestions={incorrectQuestions}
          answers={answers}
          hide={() => setShowScore(false)}
        />}

        <Grid container spacing={2} justifyContent="center">
           <KnsCard
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.question_id] || ""}
              handleAnswer={handleAnswer}
              finished={showScore}
          />
        </Grid>

        <Box gap={1} display="flex" flexDirection="column" alignItems="center">
          <Pagination
              shape="rounded"
              variant="outlined"
              count={randomQuestions.length}
              page={page + 1}
              onChange={handlePageChange}
              siblingCount={1}
              boundaryCount={1}
              renderItem={(item) => {
                const isAnswered = item.type === 'page' && answers[randomQuestions[item.page - 1]?.question_id];
                return (
                  <PaginationItem
                    {...item}
                    style={{
                      fontWeight: isAnswered ? "bold" : "normal",
                      backgroundColor: isAnswered || item.selected ? "#d1e7dd" : "inherit",
                    }}
                  />
                );
              }}
          />

          <Box display="flex" justifyContent="center" gap={2}>
              <Button
                  variant="contained"
                  color="warning"
                  onClick={restartQuiz}
              >
                  Restart Quiz
              </Button>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowScore(true)}
              >
                  Show Results
              </Button>
          </Box>
        </Box>
    </Box>
  );
};

export default Quiz;
