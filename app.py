import os
from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")

# Initialize clients
# If API keys are missing, the frontend will use the direct generator fallback
openai_client = None
groq_client = None

if os.getenv("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if os.getenv("GROQ_API_KEY"):
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    mode = data.get("mode")

    if not user_message:
        return jsonify({"reply": "Please provide a message."}), 400

    try:
        if mode == "image":
            refined_prompt = user_message
            image_url = None

            # 1. Try Prompt Engineering with Groq
            if groq_client:
                try:
                    system_prompt = (
                        "You are a professional prompt engineer for DALL-E 3. Your task is to expand the user's request into a detailed, 100-word image generation prompt. Focus solely on describing the image content. Do not include any conversational text, explanations, or apologies. Just the prompt: "
                    )
                    groq_response = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message}
                        ],
                        max_tokens=200
                    )
                    refined_prompt = groq_response.choices[0].message.content.strip()
                except Exception as e:
                    print(f"Groq prompt engineering failed: {e}")

            # 2. Try DALL-E 3 Generation
            if openai_client:
                try:
                    image_response = openai_client.images.generate(
                        model="dall-e-3",
                        prompt=refined_prompt,
                        size="1024x1024",
                        n=1,
                    )
                    image_url = image_response.data[0].url
                except Exception as e:
                    print(f"DALL-E 3 generation failed: {e}")
            
            return jsonify({"reply": refined_prompt, "image_url": image_url})

        else:
            # Standard Chat
            if groq_client:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": user_message}]
                )
                return jsonify({"reply": response.choices[0].message.content})
            else:
                return jsonify({"reply": "Groq client not initialized. Please check API key."}), 500

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
