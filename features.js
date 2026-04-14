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
            fileName.title = file.name;
            
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
            preview.style.display = 'flex';
            lucide.createIcons();
        } else {
            preview.style.display = 'none';
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
        
        try {
            recognition.start();
            
            recognition.onstart = () => {
                micBtn.style.color = '#ff4444';
                textarea.placeholder = 'Listening...';
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
        } catch (err) {
            console.error('Speech recognition not supported:', err);
            stopRecording(type);
        }

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
    
    try {
        recognition.stop();
    } catch (err) {
        console.error('Error stopping recognition:', err);
    }
}

// ==================== TEXT-TO-SPEECH ====================
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Split text into chunks for better processing
        const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        chunks.forEach((chunk, index) => {
            const utterance = new SpeechSynthesisUtterance(chunk.trim());
            utterance.rate = 0.95;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.lang = 'en-US';
            
            // Add delay between chunks
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, index * 100);
        });
    } else {
        alert('Text-to-Speech is not supported in your browser');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Ensure file preview areas are hidden initially
    const homePreview = document.getElementById('homeFilePreview');
    const chatPreview = document.getElementById('chatFilePreview');
    if (homePreview) homePreview.style.display = 'none';
    if (chatPreview) chatPreview.style.display = 'none';
});
