import os
import google.generativeai as genai
from dotenv import load_dotenv

#from openai import OpenAI

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

# response = client.chat.completions.create(
#     model = ,
#     messages = [
#         {"role": "user", "content": "Say hello world"}
#     ]
# )

# print(response.choices[0].message.content)