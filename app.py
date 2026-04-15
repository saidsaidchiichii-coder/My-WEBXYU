import os
from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')

# Initialize clients
# Make sure to set OPENAI_API_KEY and GROQ_API_KEY in your .env file
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
            # 1. Prompt Engineering with Groq (llama-3.3-70b-versatile)
            # This turns a simple prompt into a professional one for DALL-E 3
            system_prompt = (
                "You are a professional prompt engineer for AI image generation. "
                "Your task is to take a simple user description and expand it into a highly detailed, "
                "artistic, and professional prompt for DALL-E 3. Focus on lighting, artistic style, "
                "camera angles, and intricate details. Keep the final prompt around 100 words."
            )
            
            groq_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Expand this into a detailed image prompt: {user_message}"}
                ],
                max_tokens=200
            )
            refined_prompt = groq_response.choices[0].message.content.strip()

            # 2. Generate Image with DALL-E 3 using the refined prompt
            image_response = openai_client.images.generate(
                model="dall-e-3",
                prompt=refined_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = image_response.data[0].url

            return jsonify({
                "reply": refined_prompt,
                "image_url": image_url
            })

        else:
            # Standard Chat Mode using Groq
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": user_message}
                ]
            )
            reply = response.choices[0].message.content
            return jsonify({"reply": reply})

    except Exception as e:
        print(f"Error: {str(e)}")
        # If there's an error (like missing API key), return a helpful message
        return jsonify({"reply": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    # Running on port 5000 as specified in the requirements
    app.run(debug=True, port=5000)
