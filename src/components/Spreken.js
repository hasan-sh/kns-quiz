import React, { useState, useEffect } from "react";
import { Button, Box, Typography, PaginationItem, TextField, Modal, Stack, CircularProgress, useMediaQuery } from "@mui/material";

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


const SprekenQuiz = () => {
  const [firstPartQuestions, setFirstPartQuestions] = useState([]);
  const [secondPartQuestions, setSecondPartQuestions] = useState([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score, setScore] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // "idle", "recording", "stopped", "sending"
  const [recorder, setRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState(null);
  const [loadingSpeech, setLoadingSpeech] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);


  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    fetch(DataPath, { headers: { "Content-Type": "application/json" } })
      .then((res) => res.json())
      .then((data) => {
        // Randomly shuffle questions
        setFirstPartQuestions(data.first_part);
        setSecondPartQuestions(data.second_part);
      });
  }, []);
  
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



  const handleSetChanges = (incrementBy=1) => {
    const nextSetIndex = currentSet + incrementBy;

    const totalQuestions = Math.max(firstPartQuestions.length, secondPartQuestions.length);
    if (nextSetIndex * 12 >= totalQuestions) {
      const totalScore = Object.values(answers).filter(Boolean).length;
      setScore(totalScore);
      setShowScoreModal(true);
    } else {
      setCurrentSet(nextSetIndex);
      setCurrentQuestionIndex(0);
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
      setAudioChunks(event.data);
    };

    newRecorder.start();
    setRecorder(newRecorder);
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setRecordingStatus("stopped");
    }
  };

  const sendRecording = async () => {
    setRecordingStatus("sending");

    const formData = new FormData();
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

  const firstPartSet = firstPartQuestions.slice(currentSet * 12, currentSet * 12 + 12);
  const secondPartSet = secondPartQuestions.slice(currentSet * 12, currentSet * 12 + 12);
  const combinedQuestions = [...firstPartSet, ...secondPartSet];
  const currentQuestion = combinedQuestions[currentQuestionIndex];

  const isFirstPart = currentQuestionIndex < firstPartSet.length;
  const partTitle = isFirstPart ? "Deel 1: Beantwoord de vraag" : "Deel 2: Vul de zin aan";


  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
        Examen #{currentSet + 1}
      </Typography>

      {/* Next Set Button */}
      <Box display="flex" justifyContent="space-around">
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
              background: index === currentQuestionIndex ? "#ddd" : "inherit",
            }}
          >
            {index + 1}
          </PaginationItem>
        ))}
        <Button 
          variant="contained" 
          color="primary" 
          disabled={currentSet === combinedQuestions.length - 1}
          endIcon={<NavigateNextIcon />}
          onClick={() => handleSetChanges()}>
          Volgende Set
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "center", gap: 5, mt: 2 }}>
        {/* Left Column: Question */}
        <Box
          sx={{
            flex: 1,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>{partTitle}</Typography>
          <Typography variant="h6">{currentQuestion}</Typography>
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
              onClick={sendRecording}
              disabled={recordingStatus === "recording"}
              startIcon={<SendIcon />}
            >
              Check
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
              }}
            >
                <Typography variant="caption" sx={{ mb: 2 }}>
                  Correctness Score: {answers[`${currentSet}-${currentQuestionIndex}-ai`].score}%
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                {answers[`${currentSet}-${currentQuestionIndex}-ai`].explanation}
              </Typography>
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

      {/* Score Modal */}
      <Modal open={showScoreModal} onClose={() => setShowScoreModal(false)}>
        <Box sx={{ p: 3, backgroundColor: "white", mx: "auto", mt: "10%", maxWidth: 400 }}>
          <Typography variant="h5">Quiz Voltooid!</Typography>
          <Typography variant="body1">{`Uw Score: ${score}`}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowScoreModal(false)}
            sx={{ mt: 2 }}
          >
            Sluiten
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default SprekenQuiz;