# Career Sync - Skill Assessment Platform

AI-powered knowledge assessment web application using Google's Gemini API.

## Features

- ✅ Dynamic test generation for any course/subject
- ✅ Three difficulty levels: Beginner, Intermediate, Advanced
- ✅ 20 multiple-choice questions per test
- ✅ 30-minute countdown timer
- ✅ Real-time progress tracking
- ✅ Detailed results with question-by-question analysis
- ✅ Topic-wise performance breakdown
- ✅ Weak area identification with improvement suggestions
- ✅ Fully responsive design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Setup Phase:**
   - Enter a course name (e.g., Python, Java, Machine Learning)
   - Select difficulty level (Beginner/Intermediate/Advanced)
   - Enter your Gemini API key
   - Click "Attempt Test"

2. **Test Phase:**
   - Answer all 20 questions
   - Monitor time with floating timer
   - Track progress with progress bar
   - Submit when complete

3. **Results Phase:**
   - View overall score and percentage
   - Review each question with correct answers
   - Analyze topic-wise performance
   - Identify weak areas for improvement
   - Take another test

## API Key

Get your free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Technologies Used

- React 18
- React Router v6
- Bootstrap 5
- Google Gemini API
- JavaScript ES6+

## Project Structure

```
src/
├── components/
│   ├── SetupPage.js       # Initial configuration page
│   ├── TestPage.js         # Test interface with timer
│   ├── ResultPage.js       # Results and analysis
│   └── *.css              # Component styles
├── utils/
│   └── geminiApi.js       # Gemini API integration
├── App.js                 # Main app component
└── index.js              # Entry point
```

## License

MIT
