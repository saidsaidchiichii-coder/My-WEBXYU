import os
from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')

# Initialize clients
# If API keys are missing, the frontend will use the direct generator fallback
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    mode = data.get('mode', 'chat')

    if not user_message:
        return jsonify({"reply": "Please provide a message."}), 400

    try:
        if mode == 'image':
            # 1. Try Prompt Engineering with Groq
            try:
                system_prompt = (
                    "You are a professional prompt engineer. Expand this into a detailed "
                    "100-word image prompt for DALL-E 3: "
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
            except:
                refined_prompt = user_message

            # 2. Try DALL-E 3 Generation
            try:
                image_response = openai_client.images.generate(
                    model="dall-e-3",
                    prompt=refined_prompt,
                    size="1024x1024",
                    n=1,
                )
                image_url = image_response.data[0].url
                return jsonify({"reply": refined_prompt, "image_url": image_url})
            except:
                # If DALL-E fails, tell frontend to use its fallback
                return jsonify({"reply": refined_prompt, "image_url": None})

        else:
            # Standard Chat
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": user_message}]
            )
            return jsonify({"reply": response.choices[0].message.content})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
