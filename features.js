// ==================== FILE UPLOAD FEATURE ====================
function setupFileUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', (e) => {
        const files = e.target.files;
        preview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', 'file');
            
            const fileName = document.createElement('span');
            fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            
            const removeBtn = document.createElement('i');
            removeBtn.setAttribute('data-lucide', 'x');
            removeBtn.className = 'remove-file';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                fileItem.remove();
                // Remove from input
                const dt = new DataTransfer();
                Array.from(input.files).forEach((f, i) => {
                    if (i !== index) dt.items.add(f);
                });
                input.files = dt.files;
            };
            
            fileItem.appendChild(icon);
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeBtn);
            preview.appendChild(fileItem);
        });
        
        if (files.length > 0) {
            lucide.createIcons();
        }
    });
}

// ==================== VOICE RECOGNITION ====================
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = 'en-US';

function toggleMic(type) {
    const micBtn = document.getElementById(type === 'home' ? 'homeMicBtn' : 'chatMicBtn');
    const textarea = document.getElementById(type === 'home' ? 'homeInput' : 'chatInput');

    if (!isRecording) {
        isRecording = true;
        micBtn.classList.add('recording');
        audioChunks = [];
        
        recognition.start();
        
        recognition.onstart = () => {
            micBtn.style.color = '#ff4444';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    textarea.value += (textarea.value ? ' ' : '') + transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (interimTranscript) {
                textarea.placeholder = 'Listening: ' + interimTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording(type);
        };

        recognition.onend = () => {
            stopRecording(type);
        };

    } else {
        stopRecording(type);
    }
}

function stopRecording(type) {
    isRecording = false;
    const micBtn = document.getElementById(type === 'home' ? 'homeMicBtn' : 'chatMicBtn');
    const textarea = document.getElementById(type === 'home' ? 'homeInput' : 'chatInput');
    
    micBtn.classList.remove('recording');
    micBtn.style.color = '';
    textarea.placeholder = type === 'home' ? 'How can I help you today?' : 'Send a message...';
    
    recognition.stop();
}

// ==================== TEXT-TO-SPEECH ====================
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    }
}

// Add voice button to AI messages
function addVoiceButton(messageElement, text) {
    const voiceContainer = document.createElement('div');
    voiceContainer.className = 'voice-message';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'voice-btn-play';
    playBtn.innerHTML = '<i data-lucide="volume-2"></i>';
    playBtn.onclick = () => speakText(text);
    
    const duration = document.createElement('span');
    duration.className = 'voice-duration';
    duration.textContent = 'Listen';
    
    voiceContainer.appendChild(playBtn);
    voiceContainer.appendChild(duration);
    
    messageElement.appendChild(voiceContainer);
    lucide.createIcons();
}

// Override the streamRender to add voice buttons
const originalStreamRender = AI.streamRender;
AI.streamRender = async function(fullText) {
    await originalStreamRender.call(this, fullText);
    
    // Add voice button to the last AI message
    const messages = this.messagesBox.querySelectorAll('.msg-wrapper.ai');
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const msgContent = lastMessage.querySelector('.msg.ai');
        
        // Extract text without code blocks for voice
        let textForVoice = fullText.split('```')[0].trim();
        if (textForVoice) {
            addVoiceButton(msgContent, textForVoice);
        }
    }
};
