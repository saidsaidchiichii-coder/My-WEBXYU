const AI = {
  messagesBox: null,
  API_URL: null,
  currentUser: null,

  highlight(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["\'`].*?["\'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g, '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  },

  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
    this.checkAuth();
  },

  // ==================== AUTH LOGIC ====================
  
  async checkAuth() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      this.currentUser = JSON.parse(userData);
      this.updateUIForAuth(true);
    } else {
      this.updateUIForAuth(false);
    }
  },

  updateUIForAuth(isLoggedIn) {
    const authButtons = document.getElementById("authButtons");
    const userProfileBtn = document.getElementById("userProfileBtn");
    
    if (isLoggedIn) {
      authButtons.classList.add("hidden");
      userProfileBtn.classList.remove("hidden");
      const avatar = userProfileBtn.querySelector(".user-avatar");
      if (avatar && this.currentUser) {
        avatar.textContent = this.currentUser.username ? this.currentUser.username[0].toUpperCase() : "U";
      }
    } else {
      authButtons.classList.remove("hidden");
      userProfileBtn.classList.add("hidden");
    }
  },

  async login(email, password) {
    try {
      const res = await fetch("https://my-webxyu.vercel.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass: password })
      });
      
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        // Mock user data since API might not return full user object
        const user = {
          email: email,
          username: email.split('@')[0],
          avatar: null
        };
        localStorage.setItem("user", JSON.stringify(user));
        this.currentUser = user;
        this.updateUIForAuth(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid email or password" };
      }
    } catch (e) {
      return { success: false, error: "Connection failed" };
    }
  },

  async signup(username, email, password) {
    try {
      const res = await fetch("https://my-webxyu.vercel.app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, pass: password })
      });
      
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        const user = {
          username: username,
          email: email,
          avatar: null
        };
        localStorage.setItem("user", JSON.stringify(user));
        this.currentUser = user;
        this.updateUIForAuth(true);
        
        // Send data to Gmail as requested
        this.reportToAdmin(user);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (e) {
      return { success: false, error: "Connection failed" };
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUser = null;
    this.updateUIForAuth(false);
    window.location.reload();
  },

  async reportToAdmin(userData) {
    // This is a mock for sending data to gmail as requested
    // In a real app, this would be a backend call
    console.log("Reporting new user to: saidsaidchiichii@gmail.com", userData);
  },

  // ==================== DASHBOARD LOGIC ====================

  saveProfile(newData) {
    this.currentUser = { ...this.currentUser, ...newData };
    localStorage.setItem("user", JSON.stringify(this.currentUser));
    this.updateUIForAuth(true);
    alert("Profile updated successfully!");
  },

  // ==================== CHAT LOGIC ====================

  user(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper";
    
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container";
    thinkingDiv.innerHTML = `
        <div class="loader-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">Thinking...</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  async ask(message) {
    if (!this.currentUser) {
      window.openAuth('login');
      return;
    }

    const load = this.thinking();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(this.API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      load.remove();
      
      if (data.error) {
        alert("Session expired. Please login again.");
        this.logout();
        return;
      }

      let reply = data?.reply || "I'm sorry, I couldn't process that.";
      this.streamRender(reply);

    } catch (e) {
      load.remove();
      const wrapper = document.createElement("div");
      wrapper.className = "msg-wrapper ai";
      
      const err = document.createElement("div");
      err.className = "msg ai";
      err.textContent = "System Error: API Connection Failed.";
      
      wrapper.appendChild(err);
      this.messagesBox.appendChild(wrapper);
    }
  },

  async streamRender(fullText) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const container = document.createElement("div");
    container.className = "msg ai";
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split("```");
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i % 2 === 1) {
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";
        
        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;
        
        const copyBtn = header.querySelector(".copy-btn");
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = "Copy", 1500);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(part.trim());
        
        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      } else {
        const textDiv = document.createElement("div");
        container.appendChild(textDiv);
        
        const paragraphs = part.split("\n");
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement("p");
            p.style.marginBottom = "0.5rem";
            textDiv.appendChild(p);
            
            const words = para.trim().split(" ");
            for (const word of words) {
                p.textContent += word + " ";
                this.scroll();
                await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
            }
          }
        }
      }
      this.scroll();
    }
  },

  scroll() {
    const box = this.messagesBox;
    if (box) {
      box.scrollTo({
          top: box.scrollHeight,
          behavior: 'smooth'
      });
    }
  }
};
