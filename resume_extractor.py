from gemini_setup import genai

model = genai.GenerativeModel("gemini-2.5-flash")
response = model.generate_content("Say hello world!")
print(response.text)