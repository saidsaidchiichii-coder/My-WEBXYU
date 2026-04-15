import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Initialize API Clients
# Ensure GROQ_API_KEY and OPENAI_API_KEY are set in the environment
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
    mode = data.get('mode', 'chat') # 'chat' or 'image'

    try:
        if mode == 'image':
            # 1. Use Groq to refine the prompt
            refine_prompt = f"Act as a professional prompt engineer. Expand the following simple image request into a 100-word highly detailed, artistic, and descriptive prompt for DALL-E 3. Focus on lighting, style, composition, and mood. Request: {user_message}"
            
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": refine_prompt}],
                temperature=0.7,
            )
            refined_prompt = completion.choices[0].message.content
            
            # 2. Generate Image with DALL-E 3
            response = openai_client.images.generate(
                model="dall-e-3",
                prompt=refined_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            # Return both the refined prompt and the image URL
            return jsonify({
                "reply": f"**Refined Prompt:** {refined_prompt}\n\n![Generated Image]({image_url})",
                "image_url": image_url
            })
        else:
            # Standard Chat Mode
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": user_message}],
                temperature=0.7,
            )
            return jsonify({"reply": completion.choices[0].message.content})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
