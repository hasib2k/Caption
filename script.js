// Check for browser support
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
}

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Configure recognition for maximum accuracy
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 10;
recognition.lang = 'en-US'; // English only

// DOM Elements
const textInput = document.getElementById('textInput');
const loadTextBtn = document.getElementById('loadTextBtn');
const readTextBtn = document.getElementById('readTextBtn');
const textDisplay = document.getElementById('textDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const recognizedText = document.getElementById('recognizedText');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// State
let words = [];
let currentWordIndex = 0;
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let voices = [];

// Load available voices
function loadVoices() {
    voices = speechSynthesis.getVoices();
}

// Load voices on page load and when they change
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Language change handler
// Update progress bar
function updateProgress() {
    if (words.length === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '0% Complete';
        return;
    }
    
    const percentage = Math.round((currentWordIndex / words.length) * 100);
    progressFill.style.width = percentage + '%';
    progressText.textContent = percentage + '% Complete';
}

// Get best female voice
function getBestFemaleVoice() {
    if (voices.length === 0) {
        voices = speechSynthesis.getVoices();
    }
    
    // Priority list for high-quality English voices
    const preferredVoices = [
        'Google US English', // Most natural Google voice
        'Google UK English Female',
        'Microsoft Aria Online (Natural)', // Windows 11 Neural voice
        'Microsoft Jenny Online (Natural)',
        'Samantha', // macOS natural voice
        'Siri',
        'Microsoft Zira Desktop',
        'Google UK English',
        'Victoria',
        'Karen',
        'Fiona'
    ];
    
    // Try to find preferred voices first
    for (let prefName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(prefName));
        if (voice) return voice;
    }
    
    // Find any female voice (including Siri-like voices)
    const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('siri') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('susan') ||
        v.name.toLowerCase().includes('fiona') ||
        v.name.toLowerCase().includes('linda')
    );
    
    if (femaleVoice) return femaleVoice;
    
    // Return first available voice
    return voices[0];
}

// Load text and prepare for speech
loadTextBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text first!');
        return;
    }

    // Split text into words and create word spans
    words = text.split(/\s+/);
    textDisplay.innerHTML = words.map((word, index) => 
        `<span class="word" data-index="${index}">${word}</span>`
    ).join(' ');

    currentWordIndex = 0;
    startBtn.disabled = false;
    readTextBtn.disabled = false;
    // Clear any previous highlights and mark the first word as current
    document.querySelectorAll('.word').forEach(w => w.classList.remove('highlighted','current'));
    markCurrentWord(0);
    
    // Reset display styles
    const displaySection = document.querySelector('.display-section');
    if (displaySection) {
        displaySection.style.borderColor = '';
        displaySection.style.background = '';
    }
    
    // Reset status message styles
    statusMessage.style.color = '';
    statusMessage.style.fontSize = '';
    
    statusMessage.textContent = 'Text loaded! Click "Start Speaking" to begin or "Read Text Aloud" to listen.';
});

// Read text aloud
readTextBtn.addEventListener('click', () => {
    // Stop any ongoing speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        readTextBtn.innerHTML = '<span class="icon">🔊</span> Read Text Aloud';
        // Reset all highlights
        const wordElements = document.querySelectorAll('.word');
        wordElements.forEach(el => {
            el.classList.remove('highlighted');
            el.classList.remove('current');
        });
        return;
    }

    if (!words || words.length === 0) return;

    // Reset to beginning for reading
    const wordElements = document.querySelectorAll('.word');
    wordElements.forEach(el => {
        el.classList.remove('highlighted');
        el.classList.remove('current');
    });
    
    let readingWordIndex = 0;
    
    // Create utterance for entire text (natural reading)
    const fullText = words.join(' ');
    currentUtterance = new SpeechSynthesisUtterance(fullText);
    
    const femaleVoice = getBestFemaleVoice();
    if (femaleVoice) {
        currentUtterance.voice = femaleVoice;
        console.log('Using voice:', femaleVoice.name);
    }
    
    currentUtterance.lang = 'en-US';
    currentUtterance.rate = 0.9; // Natural reading pace
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1;
    
    let wordIndex = 0;
    
    // Use word boundary events for perfect synchronization with voice
    currentUtterance.onboundary = (event) => {
        if (event.name === 'word' && wordIndex < words.length) {
            // Remove previous current highlight
            wordElements.forEach(el => el.classList.remove('current'));
            
            // Highlight current word being spoken
            if (wordElements[wordIndex]) {
                wordElements[wordIndex].classList.add('current');
                wordElements[wordIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            wordIndex++;
        }
    };
    
    // Update button text while speaking
    readTextBtn.innerHTML = '<span class="icon">⏸️</span> Stop Reading';
    statusMessage.textContent = '🔊 Reading text aloud...';

    // When finished
    currentUtterance.onend = () => {
        readTextBtn.innerHTML = '<span class="icon">🔊</span> Read Text Aloud';
        statusMessage.textContent = 'Finished reading.';
        
        // Highlight all words when done
        wordElements.forEach(el => {
            el.classList.remove('current');
            el.classList.add('highlighted');
        });
    };

    // On error
    currentUtterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        readTextBtn.innerHTML = '<span class="icon">🔊</span> Read Text Aloud';
        statusMessage.textContent = 'Error reading text.';
        wordElements.forEach(el => el.classList.remove('current'));
    };

    speechSynthesis.speak(currentUtterance);
});
// Start speech recognition
startBtn.addEventListener('click', () => {
    console.log('Starting recognition with language: en-US');
    recognition.lang = 'en-US';
    try {
        recognition.start();
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusMessage.textContent = '🎤 Listening... Speak now!';
        console.log('Recognition started successfully');
    } catch(error) {
        console.error('Failed to start recognition:', error);
        statusMessage.textContent = 'Error: ' + error.message;
    }
});

// Stop speech recognition
stopBtn.addEventListener('click', () => {
    recognition.stop();
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusMessage.textContent = 'Stopped listening.';
});

// Reset everything
resetBtn.addEventListener('click', () => {
    recognition.stop();
    speechSynthesis.cancel();
    isListening = false;
    textInput.value = '';
    textDisplay.innerHTML = '<p class="placeholder">Your text will appear here...</p>';
    recognizedText.textContent = '';
    currentWordIndex = 0;
    
    // Reset progress
    updateProgress();
    words = [];
    startBtn.disabled = true;
    stopBtn.disabled = true;
    readTextBtn.disabled = true;
    readTextBtn.innerHTML = '<span class="icon">🔊</span> Read Text Aloud';
    
    // Reset status message styles
    statusMessage.style.color = '';
    statusMessage.style.fontSize = '';
    statusMessage.textContent = 'Ready';
    
    // Reset display styles
    const displaySection = document.querySelector('.display-section');
    if (displaySection) {
        displaySection.style.borderColor = '';
        displaySection.style.background = '';
    }
});

// Handle speech recognition results
recognition.onresult = (event) => {
    console.log('Recognition result received:', event);
    let interimTranscript = '';
    let finalTranscript = '';
    let allAlternatives = [];
    let highestConfidence = 0;
    let bestTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        // Get all alternatives for better matching
        for (let j = 0; j < event.results[i].length; j++) {
            const alternative = event.results[i][j];
            allAlternatives.push(alternative.transcript);
            
            // Track highest confidence result
            if (alternative.confidence > highestConfidence) {
                highestConfidence = alternative.confidence;
                bestTranscript = alternative.transcript;
            }
        }
        
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    // Use best transcript if confidence is high enough
    const displayText = highestConfidence > 0.7 ? bestTranscript : (finalTranscript || interimTranscript);
    recognizedText.textContent = displayText.trim();

    // Process both interim and final for maximum real-time responsiveness
    if (interimTranscript) {
        processRecognizedText(interimTranscript.trim(), allAlternatives, true);
    }
    if (finalTranscript) {
        processRecognizedText(finalTranscript.trim(), allAlternatives, false);
    }
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[len1][len2];
}

// Calculate similarity percentage
function getSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// Phonetic matching using Soundex algorithm
function soundex(word) {
    const a = word.toLowerCase().split('');
    const firstLetter = a.shift();
    const codes = {
        a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
        b: 1, f: 1, p: 1, v: 1,
        c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
        d: 3, t: 3,
        l: 4,
        m: 5, n: 5,
        r: 6
    };
    
    const coded = a
        .map(letter => codes[letter])
        .filter((code, i, arr) => code !== arr[i - 1])
        .filter(code => code !== '')
        .join('');
    
    return (firstLetter + coded + '000').slice(0, 4).toUpperCase();
}

// Advanced phonetic comparison
function phoneticMatch(word1, word2) {
    return soundex(word1) === soundex(word2);
}

// Normalize text for accent-agnostic comparison
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .trim();
}

// Mark a word as the current expected word (visual)
function markCurrentWord(index) {
    const wordElements = document.querySelectorAll('.word');
    wordElements.forEach(el => el.classList.remove('current'));
    if (wordElements[index]) {
        wordElements[index].classList.add('current');
        wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Process and highlight recognized words
function processRecognizedText(transcript, alternatives = [], isInterim = false) {
    if (currentWordIndex >= words.length) return;

    // Build candidate words from transcript + alternatives
    const spokenWords = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    const allPossibleWords = [...spokenWords];
    alternatives.forEach(alt => {
        allPossibleWords.push(...alt.toLowerCase().split(/\s+/).filter(Boolean));
    });
    const uniqueWords = [...new Set(allPossibleWords)];

    // Matching thresholds: very lenient for interim to ensure real-time highlighting
    const similarityThreshold = isInterim ? 0.35 : 0.6;

    // Try to match the current word, and if matched, advance; repeat if multiple words were spoken
    let progressed = false;
    let matchedAtIndex = -1;
    
    // First, check if any spoken word matches current or next word only (limit skip to 1 word)
    for (let i = currentWordIndex; i <= Math.min(currentWordIndex + 1, words.length - 1); i++) {
        const textWord = normalizeText(words[i]);
        
        for (const spokenWord of uniqueWords) {
            const cleanSpokenWord = normalizeText(spokenWord);
            if (!cleanSpokenWord) continue;

            let isMatch = false;
            
            // Exact match
            if (textWord === cleanSpokenWord) {
                isMatch = true;
            }
            // Contains / substring match
            else if (cleanSpokenWord.length >= 2 && textWord.length >= 2) {
                if (textWord.includes(cleanSpokenWord) || cleanSpokenWord.includes(textWord)) {
                    isMatch = true;
                }
            }
            // Phonetic match
            else if (cleanSpokenWord.length >= 2 && phoneticMatch(textWord, cleanSpokenWord)) {
                isMatch = true;
            }
            // Similarity
            else {
                const similarity = getSimilarity(textWord, cleanSpokenWord);
                if (similarity >= similarityThreshold) {
                    isMatch = true;
                }
            }
            // Starting letters
            if (!isMatch) {
                const minLen = Math.min(cleanSpokenWord.length, textWord.length, 3);
                if (minLen >= 2 && cleanSpokenWord.slice(0, minLen) === textWord.slice(0, minLen)) {
                    isMatch = true;
                }
            }
            
            if (isMatch) {
                matchedAtIndex = i;
                console.log('✅ MATCHED word at index', i, ':', words[i], 'with spoken:', spokenWord);
                
                // Immediate visual feedback for real-time feel
                if (isInterim && i === currentWordIndex) {
                    markCurrentWord(i);
                }
                break;
            }
        }
        
        if (matchedAtIndex >= 0) break;
    }
    
    // If we matched the next word (skipped current), auto-highlight the skipped word
    if (matchedAtIndex === currentWordIndex + 1) {
        console.log('⚡ User skipped 1 word! Auto-highlighting word at index', currentWordIndex);
        highlightWord(currentWordIndex);
        currentWordIndex++;
        updateProgress();
    }
    
    // Now process the matched word
    if (matchedAtIndex >= 0) {
        highlightWord(currentWordIndex);
        currentWordIndex++;
        progressed = true;
        updateProgress();
        markCurrentWord(currentWordIndex);
    }

    // If nothing matched, still mark current word visually
    if (!progressed) {
        markCurrentWord(currentWordIndex);
    }
    
    // Check completion
    if (currentWordIndex >= words.length) {
        showCompletionMessage();
    }
}

// Highlight a specific word
function highlightWord(index) {
    const wordElements = document.querySelectorAll('.word');
    if (wordElements[index]) {
        // Add 'highlighted' to the matched word
        wordElements[index].classList.add('highlighted');
        wordElements[index].classList.remove('current');

        // Scroll into view if needed
        wordElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Mark next word as current (if any)
        const nextIndex = index + 1;
        if (nextIndex < wordElements.length) {
            markCurrentWord(nextIndex);
        }

        // Check if this was the last word
        if (index === words.length - 1) {
            // All words completed!
            setTimeout(() => {
                showCompletionMessage();
            }, 500);
        }
    }
}

// Show completion message
function showCompletionMessage() {
    recognition.stop();
    isListening = false;
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    statusMessage.innerHTML = '🎉 Amazing! You completed the paragraph!';
    statusMessage.style.color = '#58cc02';
    statusMessage.style.fontSize = '1.4em';
    
    recognizedText.innerHTML = '✨ Great job! Enter a new paragraph to continue practicing.';
    
    // Update progress to 100%
    updateProgress();
    
    // Add completion effect to display
    const displaySection = document.querySelector('.display-section');
    if (displaySection) {
        displaySection.style.borderColor = '#58cc02';
        displaySection.style.background = '#f0fdf4';
    }
}

// Handle errors
recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    
    // Auto-retry on network errors
    if (event.error === 'network' || event.error === 'no-speech') {
        statusMessage.textContent = 'Listening... (retrying)';
        if (isListening) {
            setTimeout(() => {
                if (isListening) recognition.start();
            }, 1000);
        }
        return;
    }
    
    statusMessage.textContent = `Error: ${event.error}`;
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
};

// Handle recognition end
recognition.onend = () => {
    if (isListening) {
        // Restart if still supposed to be listening
        recognition.start();
    } else {
        statusMessage.textContent = 'Recognition stopped.';
    }
};

// Initial status
statusMessage.textContent = 'Enter text and click "Load Text" to begin.';
