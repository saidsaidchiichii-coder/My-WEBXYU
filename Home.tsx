import { useEffect, useRef, useState } from "react";
import { AIController } from "@/lib/AIController";
import { Settings, Sparkles, Mic, ArrowUp, Paperclip, ChevronDown } from "lucide-react";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      AIController.init("messages", "https://my-webxyu.vercel.app/api/chat");
      initialized.current = true;
    }
  }, []);

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  const handleKeydown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    type: "home" | "chat"
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (type === "home") startChat();
      else send();
    }
  };

  const startChat = () => {
    const text = homeInput.trim();
    if (!text) return;

    setShowChat(true);
    AIController.user(text);
    setHomeInput("");
    AIController.ask(text);
  };

  const send = () => {
    const text = chatInput.trim();
    if (!text) return;
    AIController.user(text);
    setChatInput("");
    AIController.ask(text);
  };

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 h-14 flex justify-between items-center px-4 bg-black/70 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="flex items-center">
          <div
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-900 p-2 rounded-full transition"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
              <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
              <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
              <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
              <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
              <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-900 transition text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Imagine</span>
          </button>
          <button className="p-2 hover:bg-gray-900 rounded-full transition">
            <Settings className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 border border-gray-700 rounded-full text-sm hover:bg-gray-900 transition">
            Sign in
          </button>
          <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition">
            Sign up
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mt-14 overflow-hidden flex flex-col">
        {/* Home View */}
        {!showChat && (
          <section className="flex flex-col justify-center items-center flex-1 p-5 overflow-y-auto">
            <div className="flex flex-col items-center mb-10">
              <div className="flex flex-col items-center gap-4 mb-10">
                <svg
                  className="w-32 h-32 opacity-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                  <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                  <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                  <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                  <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                  <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
                </svg>
                <h1 className="text-6xl font-bold tracking-tight">Grok</h1>
              </div>
            </div>

            <div className="w-full max-w-2xl flex flex-col gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-3 transition focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20">
                <div className="flex items-end gap-3">
                  <button className="p-1 text-gray-600 hover:text-white transition">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    id="homeInput"
                    placeholder="How can I help you today?"
                    rows={1}
                    value={homeInput}
                    onChange={(e) => {
                      setHomeInput(e.target.value);
                      autoResize(e.target);
                    }}
                    onKeyDown={(e) => handleKeydown(e, "home")}
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-600 font-sans text-base resize-none outline-none max-h-52 leading-6"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-gray-600 text-xs px-2 py-1 rounded-xl hover:bg-gray-800 cursor-pointer transition">
                      <span>Auto</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                    <button className="p-1 text-gray-600 hover:text-white transition">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={startChat}
                      className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-gray-600 text-xs">
                <Sparkles className="w-4 h-4" />
                <span>New · Hold Ctrl+D to dictate</span>
              </div>
            </div>
          </section>
        )}

        {/* Chat View */}
        {showChat && (
          <section className="flex flex-col flex-1 overflow-hidden">
            <div
              ref={messagesRef}
              id="messages"
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
            />

            <div className="p-4 bg-black border-t border-gray-800">
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-3 transition focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20 max-w-2xl mx-auto">
                <div className="flex items-end gap-3">
                  <button className="p-1 text-gray-600 hover:text-white transition">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <textarea
                    id="chatInput"
                    placeholder="Send a message..."
                    rows={1}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      autoResize(e.target);
                    }}
                    onKeyDown={(e) => handleKeydown(e, "chat")}
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-600 font-sans text-base resize-none outline-none max-h-52 leading-6"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 text-gray-600 text-xs px-2 py-1 rounded-xl hover:bg-gray-800 cursor-pointer transition">
                      <span>Auto</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                    <button className="p-1 text-gray-600 hover:text-white transition">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={send}
                      className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        /* ==================== MESSAGES ==================== */
        .msg-wrapper {
          display: flex;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .msg {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .msg.user {
          background: #1d9bf0;
          color: white;
          align-self: flex-end;
          border-radius: 18px;
        }

        .msg.ai {
          background: transparent;
          color: #e7e9ea;
          align-self: flex-start;
          border-left: 2px solid #2f3336;
          padding-left: 16px;
          border-radius: 0;
        }

        /* ==================== THINKING ==================== */
        .thinking-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          width: fit-content;
          border: 1px solid #2f3336;
        }

        .loader-dots {
          display: flex;
          gap: 4px;
        }

        .loader-dots span {
          width: 6px;
          height: 6px;
          background: #e7e9ea;
          border-radius: 50%;
          animation: pulse 1.4s infinite;
        }

        .loader-dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .loader-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loader-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }

        .thinking-text {
          font-size: 14px;
          color: #e7e9ea;
        }

        /* ==================== CODE BLOCKS ==================== */
        .code-box {
          background: #16181c;
          border: 1px solid #2f3336;
          border-radius: 12px;
          overflow: hidden;
          margin: 8px 0;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #2f3336;
          background: rgba(255, 255, 255, 0.02);
        }

        .code-lang {
          font-size: 12px;
          color: #71767b;
          font-family: "Monaco", "Courier New", monospace;
        }

        .copy-btn {
          background: transparent;
          border: 1px solid #2f3336;
          color: #71767b;
          padding: 4px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #1d1f23;
          color: #e7e9ea;
          border-color: #e7e9ea;
        }

        pre {
          padding: 16px;
          overflow-x: auto;
          font-family: "Monaco", "Courier New", monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        code {
          color: #e7e9ea;
        }

        .cmt {
          color: #71767b;
        }
        .str {
          color: #71d5ff;
        }
        .num {
          color: #ffd700;
        }
        .kw {
          color: #ff6b6b;
          font-weight: 600;
        }
        .fn {
          color: #69c0ff;
        }

        @media (max-width: 640px) {
          .msg {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
