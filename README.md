# Speech Practice App

A real-time speech-to-text practice application with synchronized highlighting. Practice your speaking skills and see your progress!

## Features

- 🎤 **Real-time Speech Recognition**: Speak and see words highlight instantly
- 🔊 **Text-to-Speech**: Listen to natural voice reading with synchronized highlighting
- 🎯 **Smart Matching**: Advanced fuzzy matching works with any accent
- ⏭️ **Auto-skip Detection**: Skips highlighted automatically if you miss a word
- 📊 **Progress Tracking**: Visual progress bar shows completion percentage
- 🎉 **Completion Celebration**: Motivating messages when you finish
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- HTML5
- CSS3 (Duolingo-inspired design)
- Vanilla JavaScript
- Web Speech API (SpeechRecognition & SpeechSynthesis)

## Browser Requirements

- **Chrome** (recommended) - Best speech recognition support
- **Edge** - Good support
- **Safari** - Limited support (TTS only)
- **Firefox** - Not supported (no Web Speech API)

**Note**: Microphone permission required for speech recognition.

## How to Use

1. **Enter Text**: Type or paste text into the input area
2. **Load Text**: Click "Load Text" to prepare the paragraph
3. **Start Speaking**: Click "Start Speaking" and read aloud
4. **See Progress**: Watch words highlight in real-time as you speak
5. **Listen**: Click "Read Text Aloud" to hear natural voice reading

## Features in Detail

### Speech Recognition
- Continuous listening with interim results
- 10 alternative hypotheses for better accuracy
- Lenient matching (60% similarity threshold)
- Phonetic matching using Soundex algorithm
- Levenshtein distance for fuzzy string matching

### Text-to-Speech
- Natural female voice selection
- Synchronized word highlighting during playback
- Browser-based boundary detection for perfect timing
- Adjustable rate and pitch

### Smart Highlighting
- Sequential word-by-word highlighting
- Auto-skip: If you skip one word, it auto-highlights
- Real-time visual feedback with yellow current word indicator
- Green highlighting for completed words

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   cd "c:\Users\Hasib Ahmed\Desktop\Caption"
   vercel
   ```

3. **Or Deploy via GitHub**:
   - Push code to GitHub repository
   - Import project in Vercel dashboard
   - Deploy automatically

4. **Or Deploy via Drag & Drop**:
   - Go to [vercel.com](https://vercel.com)
   - Drag the project folder into the upload area

### Configuration

No build step required - this is a static site. Vercel automatically serves `index.html`.

## Local Development

Simply open `index.html` in Chrome or Edge:

```bash
start index.html
```

Or use a local server:

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## Project Structure

```
Caption/
├── index.html      # Main HTML structure
├── style.css       # Duolingo-inspired styles
├── script.js       # Speech recognition & TTS logic
├── vercel.json     # Vercel configuration
└── README.md       # This file
```

## Algorithms Used

### Fuzzy Matching
- **Levenshtein Distance**: Edit distance between strings
- **Soundex**: Phonetic algorithm for similar-sounding words
- **Substring Matching**: Partial word recognition
- **Similarity Threshold**: 60% for final, 35% for interim

### Highlight Synchronization
- **Boundary Events**: Uses `onboundary` for exact TTS sync
- **Interim Results**: Processes partial recognition for instant feedback
- **Skip Detection**: Checks next word when current doesn't match

## Troubleshooting

### Speech Recognition Not Working
- Ensure you're using Chrome or Edge
- Allow microphone permission
- Check if mic is working in system settings
- Speak clearly and at normal pace

### Highlighting Not Syncing
- Refresh the page
- Try a different browser (Chrome recommended)
- Check console (F12) for errors

### Voice Not Reading
- Ensure volume is not muted
- Try different voice in browser settings
- Check if TTS is enabled in system

## License

MIT License - Free to use and modify

## Credits

Design inspired by Duolingo's friendly and motivating UI.

---

**Made with ❤️ for language learners and public speakers**
