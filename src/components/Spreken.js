import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Box, Typography, PaginationItem, TextField, Modal, Stack, CircularProgress, useMediaQuery, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SendIcon from "@mui/icons-material/Send"
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const DataPath = `${process.env.PUBLIC_URL}/data/spreken_questions.json`;
let SERVER_URL = "https://python-basisexamen.vercel.app/api";
if (process.env.NODE_ENV === "development") {
  SERVER_URL = "http://127.0.0.1:5000/api";
}

const filterAudioKeys = (answers) => {
  const filtered = {};
  for (const key in answers) {
    if (!key.includes("audio")) {
      filtered[key] = answers[key];
    }
  }
  return filtered;
};

const parseParam = (params, name) => {
  return Number(params.get(name)) ? Number(params.get(name)) - 1 : 1
}

const SprekenQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [questions, setQuestions] = useState([]);
  const [currentSet, setCurrentSet] = useState(parseParam(params, "examen"));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(parseParam(params, "vraag"));
  const [answers, setAnswers] = useState({});
  const [questionsFinished, setQuestionsFinished] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // "idle", "recording", "stopped", "sending"
  const [recorder, setRecorder] = useState(null);
  const [loadingSpeech, setLoadingSpeech] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);


  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    fetch(DataPath, { headers: { "Content-Type": "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        const combinedQuestions = [];
        const minLength = Math.min(data.first_part.length, data.second_part.length);

        // Loop through the minimum length of both parts and add 12 questions at a time
        for (let i = 0; i < minLength; i += 12) {
          combinedQuestions.push(
            ...data.first_part.slice(i, i + 12),
            ...data.second_part.slice(i, i + 12)
          );
        }
        // Add the remaining questions from both parts (if any)
        combinedQuestions.push(...data.first_part.slice(minLength));
        combinedQuestions.push(...data.second_part.slice(minLength));
        // Set the state with the combined questions
        setQuestions(combinedQuestions);
      });

      // Initialize answers state from localStorage if available
      const savedAnswers = localStorage.getItem("answers");
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
  }, []);

  useEffect(() => {
    // Save answers to localStorage whenever it changes
    const filteredAnswers = filterAudioKeys(answers);
    localStorage.setItem("answers", JSON.stringify(filteredAnswers));
  }, [answers]);

  // Update the URL query parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("examen", currentSet + 1);
    params.set("vraag", currentQuestionIndex + 1);
    navigate(`?${params.toString()}`, { replace: true });
  }, [currentSet, currentQuestionIndex]);

  
  const fetchAnswers = async (formData) => {
    setLoadingAnswers(true);
    const question = combinedQuestions[currentQuestionIndex];
    
    try {
      formData.append("question", question);
      formData.append("userAnswer", answers[`${currentSet}-${currentQuestionIndex}-input`] || "");

      const response = await fetch(SERVER_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      handleAnswerChange({ 
        answers: data.answers,
        score: data.correctnessScore,
        explanation: data.explanation,
      }, "ai")
      if (data.transcription) {
        handleAnswerChange(data.transcription, "input")
      }

      setLoadingAnswers(false);
    } catch (error) {
      // setLoading(false);
      console.error(error);
      setLoadingAnswers(false);
    }
  };


  const handleSetChanges = (incrementBy=1, sliceFrom) => {
    const nextSetIndex = currentSet + incrementBy;
    if (nextSetIndex * 24 >= questions.length) {
      setQuestionsFinished(true);
    } else {
      setCurrentSet(nextSetIndex);
      setCurrentQuestionIndex(0);
      setQuestionsFinished(false);
    }
  };

  const handleAnswerChange = (value, el) => {
    setAnswers((prev) => ({
      ...prev,
      [`${currentSet}-${currentQuestionIndex}-${el}`]: value,
    }));
  };


  const startRecording = async () => {
    setRecordingStatus("recording");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const newRecorder = new MediaRecorder(stream);
    
    newRecorder.ondataavailable = (event) => {
      handleAnswerChange(event.data, "audio")
    };

    newRecorder.start();
    setRecorder(newRecorder);
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
      setRecordingStatus("stopped");
    }
  };

  const sendRequest = async () => {
    setRecordingStatus("sending");

    const formData = new FormData();
    const audioChunks = answers[`${currentSet}-${currentQuestionIndex}-audio`];
    if (audioChunks) {
      formData.append("audio", audioChunks, "audio.wav");
    }

    fetchAnswers(formData);
    setRecordingStatus("idle");
  };

  const handleTextToSpeech = (text) => {
    setLoadingSpeech(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL";
    utterance.rate = 0.75;

    // Choose a Dutch voice explicitly
    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find((voice) => voice.lang === "nl-NL");
    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    speechSynthesis.speak(utterance);
    utterance.onend = () => setLoadingSpeech(false);
  };

  const combinedQuestions = questions.slice(currentSet * 24, currentSet * 24 + 24)
  const currentQuestion = combinedQuestions[currentQuestionIndex];

  if (!questions.length) {
    return null
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <Box sx={{ display: "flex", justifyContent: "center", }}>
        <FormControl variant="outlined" sx={{ minWidth: 120, mb: 3, textAlign: "center" }}>
          <InputLabel id="set-selector-label">Examen</InputLabel>
          <Select
            labelId="set-selector-label"
            id="set-selector"
            value={currentSet}
            onChange={(event) => setCurrentSet(event.target.value)} // Update the currentSet state
            label="Examen"
          >
            {Array.from({ length: Math.ceil(questions.length / 24) }, (_, index) => (
              <MenuItem key={index} value={index}>{index + 1}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>


      {/* Pagination */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: .5, justifyContent: "center", mt: 1 }}>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={currentSet === 0}
          startIcon={<NavigateBeforeIcon />}
          onClick={() => handleSetChanges(-1)}>
          Vorige Set
        </Button>
        {combinedQuestions.map((_, index) => (
          <PaginationItem
            key={index}
            variant="outlined"
            onClick={() => setCurrentQuestionIndex(index)}
            color={index < 12 ? "standard" : "secondary"}
            page={index+1}
            sx={{
              m: 0,
              width: 10,
              borderColor: index < 12 ? "red" : "blue",
              background: index === currentQuestionIndex ? "#ddd !important" : "inherit",
            }}
          >
            {index + 1}
          </PaginationItem>
        ))}
        <Button 
          variant="contained" 
          color="primary" 
          disabled={questionsFinished}
          endIcon={<NavigateNextIcon />}
          onClick={() => handleSetChanges(1)}>
          Volgende Set
        </Button>
      </Box>

      <Box sx={{ display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        justifyContent: "center",
        gap: 5,
        mt: 2,
        minHeight: 400,
        }}>
        {/* Left Column: Question */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            alignItems: "space-between",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>Vraag</Typography>
          <Typography variant="h5">{currentQuestion}</Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              disabled={loadingSpeech}
              onClick={() => handleTextToSpeech(currentQuestion)}
              startIcon={<VolumeUpIcon />}
            >
              Listen
              {loadingSpeech && <CircularProgress sx={{marginLeft: 1}} size={20}/>}
            </Button>
        </Box>
        {/* Right Column: Controllers */}
        <Box
          sx={{
            flex: 2,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <TextField
            variant="outlined"
            label="Uw Antwoord"
            fullWidth
            value={answers[`${currentSet}-${currentQuestionIndex}-input`] || ""}
            onChange={(e) => handleAnswerChange(e.target.value, "input")}
            sx={{ mb: 2 }}
          />

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={startRecording}
              disabled={recordingStatus === "recording"}
              startIcon={<PlayCircleOutlineIcon />}
            >
              Record
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={stopRecording}
              disabled={recordingStatus !== "recording"}
              startIcon={<StopCircleIcon />}
            >
              Stoppen
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={sendRequest}
              disabled={recordingStatus === "recording"}
              startIcon={<SendIcon />}
            >
              {answers[`${currentSet}-${currentQuestionIndex}-ai`] ? "Retry" : "Check"}
            </Button>
          </Stack>

          {/* Recording Status */}
          {recordingStatus === "recording" && (
            <Typography color="success.main">Bezig met opnemen...</Typography>
          )}
          {recordingStatus === "stopped" && (
            <Typography color="warning.main">Opname gestopt, klaar om te verzenden.</Typography>
          )}
          {recordingStatus === "sending" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography>Klaar om te verzenden...</Typography>
            </Stack>
          )}



          {answers[`${currentSet}-${currentQuestionIndex}-ai`] && (
            <Box
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                p: 4,
                mt: 1,
              }}
            >
                {(answers[`${currentSet}-${currentQuestionIndex}-input`] || answers[`${currentSet}-${currentQuestionIndex}-audio`]) && (
                  <>
                    <Typography variant="caption" sx={{ mb: 2 }}>
                      Correctness Score: {answers[`${currentSet}-${currentQuestionIndex}-ai`].score}%
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {answers[`${currentSet}-${currentQuestionIndex}-ai`].explanation}
                    </Typography>
                  </>
                )}
              <Typography variant="h6">Top 3 Answers:</Typography>
              <ul>
                {answers[`${currentSet}-${currentQuestionIndex}-ai`].answers.map((answer, idx) => (
                  <li key={idx}>{answer}</li>
                ))}
              </ul>
            </Box>
          )}

        </Box>
      </Box>

      {/* Controllers */}
      <Stack direction="row" justifyContent="space-around" sx={{ mt: 4, mb: 3 }}>
        <Button
          variant="contained"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          startIcon={<NavigateBeforeIcon />}
        >
          Vraag: {currentQuestionIndex !== 0 && currentQuestionIndex}
        </Button>
        <Button
          variant="contained"
          disabled={currentQuestionIndex === combinedQuestions.length - 1}
          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
          endIcon={<NavigateNextIcon />}
        >
          Vraag: {currentQuestionIndex !== combinedQuestions.length - 1 && currentQuestionIndex + 2}
        </Button>
      </Stack>

      <Modal open={loadingAnswers} onClose={() => setLoadingSpeech(false)}>
            <Box display="flex" justifyContent="center" alignItems="center"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                borderRadius: 2,
                p: 4,
              }}
            >
              <CircularProgress sx={{color: "white"}} size={100}/>
            </Box>
      </Modal>

    </Box>
  );
};

export default SprekenQuiz;