import { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Card';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';

import logo from './logo.svg';
import './App.css';
import { Q_BANK } from './questionBank';

const MAX_DEPTH = 3;
const EASY_DIFF = "EASY";
const MEDIUM_DIFF = "MEDIUM";
const HARD_DIFF = "HARD";
const HARD_DONE_DIFF = "HARD_DONE";

const MAX_QUEST = {
  [EASY_DIFF]: 5, // Maximum number of questions to be asked in Easy level
  [MEDIUM_DIFF]: 5, // Maximum number of questions to be asked in Medium level
  [HARD_DIFF]: 5, // Maximum number of questions to be asked in Hard level
};

const MIN_QUEST = {
  [EASY_DIFF]: 3, // Minimum number of questions to be asked in Easy level
  [MEDIUM_DIFF]: 3, // Minimum number of questions to be asked in Medium level
  [HARD_DIFF]: 3, // Minimum number of questions to be asked in Hard level
};

const EASY_THRESHOLD = 0.8; // Minimum percentage of correct answers required for proficiency at Easy difficulty
const MED_THRESHOLD = 0.6; // Minimum percentage of correct answers required for proficiency at Medium difficulty
const HARD_THRESHOLD = 0.4; // Minimum percentage of correct answers required for proficiency at Hard difficulty

const transitionTime = 2000;


function App() {

  const [isStarterPhase, setIsStarterPhase] = useState(true)
  const [currentQ, setCurrentQ] = useState(null);
  const [currentQuestionBank, setCurrentQuestionBank] = useState(null);
  const [currentDepthLevel, setCurrentDepthLevel] = useState(1);
  const [currentDifficultyLevel, setCurrentDifficultyLevel] =  useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(null);
  const [correctAnswered, setCorrectAnswered] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null)

  const [showCorrectAlert, setShowCorrectAlert] = useState(false);
  const [showIncorrectAlert, setShowIncorrectAlert] = useState(false);

  const [minQuestion, setMinQuestion] =  useState(MIN_QUEST[MEDIUM_DIFF]);

  const [inGrindPhase, setInGrindPhase] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    activateMediumStarterPhase();
  }, [currentDepthLevel]);



  const calculateProficiency = () => {
    return correctAnswered / questionsAnswered;
  }

  const checkDifficultyActivation = () => {

  }

  const fallDefault = () => {
    setCurrentQ(0);
    setQuestionsAnswered(0);
    setCorrectAnswered(0);
    setSelectedOption(null);
  }

  const activateEasyStarterPhase = () => {
    // set related state variables
    // set questionAnswered and totalCorrect as 0
    fallDefault();
    
    setCurrentDifficultyLevel(EASY_DIFF);
    setCurrentQuestionBank(Q_BANK[currentDepthLevel].EASY_QUESTIONS);

    // start triggering questions from EASY bucket
  }

  const activateMediumStarterPhase = () => {
    // set related state variables
    fallDefault();
    
    setCurrentDifficultyLevel(MEDIUM_DIFF);
    setCurrentQuestionBank(Q_BANK[currentDepthLevel].MEDIUM_QUESTIONS);

    // start triggering questions from MEDIUM bucket
    
  }

  const activateHardStarterPhase = () => {
    // set related state variables
    fallDefault();
    
    setCurrentDifficultyLevel(HARD_DIFF);
    setCurrentQuestionBank(Q_BANK[currentDepthLevel].HARD_QUESTIONS);
    
    // set questionAnswered and totalCorrect as 0

    // start triggering questions from EASY bucket
  }

  const getNextQuestion = () => {
    // check for current difficulty level
    // and get the next question
  }

  const selectAnswer = (index) => {
    // set the selected Option
    setSelectedOption(index);
  }

  // derive deriveDifficultyChange
  const deriveDifficultyChange = (proficiency) => {

    if (isStarterPhase) {
      setIsStarterPhase(false);
      // Check proficiency to determine the next difficulty level
      // Unitl starterPhase is over, student is stil in Medium difficulty
      if (proficiency < MED_THRESHOLD) {
          return {shouldChange: true, changePhaseTo: EASY_DIFF};
      } else {
          return {shouldChange: true, changePhaseTo: HARD_DIFF};
      }
    }

    if (proficiency >= EASY_THRESHOLD && currentDifficultyLevel === EASY_DIFF) {
        return {shouldChange: true, changePhaseTo: MEDIUM_DIFF}; // Move to the next higher difficulty level
    } else if (currentDifficultyLevel === MEDIUM_DIFF && proficiency >= MED_THRESHOLD) {
        return { shouldChange: true, changePhaseTo: HARD_DIFF }; // Move to the next higher difficulty level
    } else if (currentDifficultyLevel === "HARD" && proficiency >= HARD_THRESHOLD) {
        return {shouldChange: true, changePhaseTo: HARD_DONE_DIFF};
    } else {
        setInGrindPhase(true);
        return {shouldChange: false, changePhaseTo: currentDifficultyLevel}; // Proceed to the grind phase
    }


  }

  const moveToNextSkillDepth = () => {
    if (currentDepthLevel + 1 <= MAX_DEPTH) {
      setInGrindPhase(false);
      setCurrentDepthLevel(currentDepthLevel + 1);
      // setTimeout(() => {
      //   activateMediumStarterPhase();
      // }, 0);
    } else {
      endGame();
    }
    
  }

  const moveToNextQuestion = () => {
    
    // Clear up current selectedOption
    setTimeout(() => {
      setCurrentQ(currentQ + 1);
      setQuestionsAnswered(questionsAnswered + 1);
      setSelectedOption(null);
    }, transitionTime);
  }

  const answerQuestion = (selectedOption) => {
    // check whether correct or not
    console.debug('what is the answer ', currentQuestionBank[currentQ], currentQuestionBank[currentQ].correctAnswer)
    const totalAnsweredQuestions = questionsAnswered + 1;
    

    // check correct/incorrect
    const isCorrect = currentQuestionBank[currentQ].correctAnswer === selectedOption;
    if (isCorrect) {
      setCorrectAnswered(correctAnswered + 1);
      displayCorrectAlert();
    } else {
      displayInCorrectAlert();
    }

    if (!inGrindPhase) {
      if (totalAnsweredQuestions >= MIN_QUEST[currentDifficultyLevel]) {
        // calculate Proficiency
        const proficiency = calculateProficiency();
        // if need to change then activate other difficulty level phase
        const {shouldChange , changePhaseTo} = deriveDifficultyChange(proficiency);
        if (shouldChange) {
          if (changePhaseTo === EASY_DIFF) {
            activateEasyStarterPhase();
          }
          if (changePhaseTo === MEDIUM_DIFF) {
            activateMediumStarterPhase();
          }
          if (changePhaseTo === HARD_DIFF) {
            activateHardStarterPhase();
          }
          if (changePhaseTo ===  HARD_DONE_DIFF) {
            if ( parseInt(currentDepthLevel) === MAX_DEPTH ) {
              endGame();
            }
            if (parseInt(currentDepthLevel) < MAX_DEPTH) {
              moveToNextSkillDepth();
            }
            
          }
        } else {
          moveToNextQuestion();
        }
      } else {
        moveToNextQuestion();
      }
    } else {
      if (currentQ < MAX_QUEST[currentDifficultyLevel]) {
        moveToNextQuestion();
      } 
      else {
        // Move to the next depth level
        moveToNextSkillDepth();
      }
    }

    

  }


  const endGame = () => {
    // clear everything
    console.debug('Game has ended');
  }

  const init = () => {
    activateMediumStarterPhase();
  }

  const displayCorrectAlert = () => {
    setShowCorrectAlert(true);
    setTimeout(() => {
      setShowCorrectAlert(false)
    }, transitionTime);
  }

  const displayInCorrectAlert = () => {
    setShowIncorrectAlert(true);
    setTimeout(() => {
      setShowIncorrectAlert(false);
    }, transitionTime);
  }

  const renderAlerts = () => {
    if (showCorrectAlert) {
      return (
      <Alert severity="success">
        <AlertTitle>Success</AlertTitle>
        Yay! You answered the question correct.
      </Alert>);
    } 
    if (showIncorrectAlert) {
      return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Oops! You answered the question incorrect.
      </Alert>);
    }
  }


  return (
    <div className="App">
      <Container maxWidth={false}>
        <div>
          { currentQuestionBank && currentQuestionBank.length && 
            (
            <>
              <div className="header-container">
                <Fab variant="extended" size="small" color="secondary" aria-label="add">
                  <span>Skill Depth: {currentDepthLevel}</span>
                </Fab>
                <Fab variant="extended" size="small" color="secondary" aria-label="add">
                  <span>Difficulty: {currentDifficultyLevel}</span>
                </Fab>
                <Fab variant="extended" size="small" color="secondary" aria-label="add">
                  <span>Question - #{currentQ + 1}</span>
                </Fab>

                <Fab variant="extended" size="small" color="secondary" aria-label="add">
                  <span>Proficiency - {questionsAnswered ? (correctAnswered / questionsAnswered) : ''}</span>
                </Fab>
              </div>

              <Paper elevation={2} className="q-container">
                <div>Question text: {currentQuestionBank[currentQ].text}</div>
              </Paper>
            
              <Grid container spacing={4} className="answer-container">
                {currentQuestionBank[currentQ].options.map((value, index) => {
                  return (<Grid item xs={3} 
                    key={`option-${index}`}
                    onClick={() => selectAnswer(index + 1)}

                    >
                      <div className={`option-container ${selectedOption === index + 1 ? 'selected-option' : ''}`} >
                        {value}
                      </div>
                    </Grid>)
                })}
              </Grid>

              <div className='footer-container'>
                <div className='alerts'>
                  {/* {renderAlerts()} */}
                  <Snackbar open={showCorrectAlert} autoHideDuration={2000}>
                    <Alert severity="success" sx={{ width: '100%' }}  variant="filled">
                      Yay! You answered the question correct.
                    </Alert>
                  </Snackbar>
                  <Snackbar open={showIncorrectAlert} autoHideDuration={2000}>
                    <Alert severity="error" sx={{ width: '100%' }} variant="filled">
                      Oops! You answered the question incorrect.
                    </Alert>
                  </Snackbar>
                </div>
                <Button variant="contained" size="large" className="submit-btn" onClick={() => answerQuestion(selectedOption)}>Submit</Button>
              </div>
              {/* <button className="submit-btn" onClick={() => answerQuestion(selectedOption)}>Submit</button> */}
            </>
            )
          }
        </div>
      </Container>
    </div>
  );
}

export default App;
