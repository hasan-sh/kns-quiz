import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";

const MainImagesPath = `${process.env.PUBLIC_URL}/kns_fotos`;

const ScoreReport = ({ score, totalQuestions, incorrectQuestions, answers, restartQuiz }) => {
  return (
    <Box textAlign="center">
      <Typography variant="h4" gutterBottom>
        Your Score: {score} / {totalQuestions}
      </Typography>

      {incorrectQuestions.length > 0 && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            Questions You got some wrong questions:
          </Typography>
          <List>
            {incorrectQuestions.map((question, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={`${question.question_text}`}
                  secondary={`Your Answer: ${
                    answers[question.question_id]
                  }, Correct Answer: ${question.correct_answer}`}
                />
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Possible Answers:
                  </Typography>
                  <Typography variant="body2">
                    A: {question.answer_a}
                  </Typography>
                  <Typography variant="body2">
                    B: {question.answer_b}
                  </Typography>
                </Box>

                <Box mt={2}>
                <img src={`${MainImagesPath}/${question.question_id}.jpeg`} alt="related to the question" width="200" />
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {incorrectQuestions.length === 0 && (
        <Typography variant="h6" color="success">
          Great Job! You got everything correct!
        </Typography>
      )}

      <Button variant="contained" onClick={restartQuiz}>
        Restart Quiz
      </Button>
    </Box>
  );
};

export default ScoreReport;
