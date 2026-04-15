import os
import json
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.')

# Initialize clients
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
    mode = data.get('mode', 'chat') # 'chat' or 'imagine'

    try:
        if mode == 'imagine':
            # 1. Refine prompt using Groq
            refine_prompt = f"Expand the following simple image description into a highly detailed, artistic, 100-word prompt for DALL-E 3. Focus on lighting, texture, style, and composition: {user_message}"
            
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": refine_prompt}]
            )
            detailed_prompt = completion.choices[0].message.content

            # 2. Generate image using DALL-E 3
            response = openai_client.images.generate(
                model="dall-e-3",
                prompt=detailed_prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url
            
            # Return special format for image
            return jsonify({
                "reply": f"Here is the image I generated for: {user_message}\n\n![Generated Image]({image_url})",
                "image_url": image_url
            })
        else:
            # Standard chat mode
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": user_message}]
            )
            reply = completion.choices[0].message.content
            return jsonify({"reply": reply})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
