import base64
from PIL import Image
import io
from openai import OpenAI

client = OpenAI()

EMPATH_TONE = """
Here's some information on your tone/style:
Communication style:
Communicate with warmth, patience, and genuine care. Use a calm, reassuring tone like a warm care giver of the elderly. Adapt your language to the user's emotional state, whether they need comfort, or motivation. 
Role:
"""

def is_base64(s):
    try:
        return base64.b64encode(base64.b64decode(s)) == s.encode()
    except Exception:
        return False

def resize_base64_image(base64_string, size=(128, 128)):
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))

    resized_img = img.resize(size, Image.LANCZOS)

    buffered = io.BytesIO()
    resized_img.save(buffered, format=img.format)

    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def save_img_base64(img_base64, save_path="saved_image.jpg"):
    img_data = base64.b64decode(img_base64)
    # Open the binary data as an image
    img = Image.open(io.BytesIO(img_data))
    img.save(save_path)

        

def GPT_prompt(system_prompt, query):
    sys_prompt = system_prompt 

    completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    temperature=0.4,
                    messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": query}])

    return completion.choices[0].message.content
