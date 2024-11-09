import os
import uuid
import chromadb
import numpy as np
from langchain_chroma import Chroma
from langchain_experimental.open_clip import OpenCLIPEmbeddings
from PIL import Image as _PILImage
import base64
import io
from io import BytesIO
import numpy as np
from PIL import Image
import json


DATA_PATH = "./data"
IMG_PATH = "./data/img/"

K_RETRIEVE = 1

# Create chroma
vectorstore = Chroma(
    collection_name="mm_rag_clip_photos", embedding_function=OpenCLIPEmbeddings()
)

# Get image URIs with .jpg extension only
image_uris = sorted(
    [
        os.path.join(IMG_PATH, image_name)
        for image_name in os.listdir(IMG_PATH)
        if image_name.endswith(".jpeg")
    ]
)

metadata = [
{"description": "this is the car obama drove during his 2012 election. It was said this car was bomb proof and also can convert into a submarine",
 "image_uri": image_uris[0]},
{"description": "This is the chair that lincoln sat in.",
 "image_uri": image_uris[1]},
]

# Add images
vectorstore.add_images(uris=image_uris, metadatas=metadata)

# Add texts
# vectorstore.add_texts(texts=texts)

# Make retriever
retriever = vectorstore.as_retriever(k=K_RETRIEVE)

def resize_base64_image(base64_string, size=(128, 128)):
    """
    Resize an image encoded as a Base64 string.

    Args:
    base64_string (str): Base64 string of the original image.
    size (tuple): Desired size of the image as (width, height).

    Returns:
    str: Base64 string of the resized image.
    """
    # Decode the Base64 string
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data))

    # Resize the image
    resized_img = img.resize(size, Image.LANCZOS)

    # Save the resized image to a bytes buffer
    buffered = io.BytesIO()
    resized_img.save(buffered, format=img.format)

    # Encode the resized image to Base64
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def is_base64(s):
    """Check if a string is Base64 encoded"""
    try:
        return base64.b64encode(base64.b64decode(s)) == s.encode()
    except Exception:
        return False

def retrieve_metadata(doc):
    uri = doc.metadata["image_uri"]
    metadata_path = uri.replace("img", "metadata").replace(".jpeg", ".json")

    data = open(metadata_path, "r")
    data = json.load(data)

    return data

def split_image_text_types(docs):
    """Split numpy array images and texts"""
    images = []
    text = []
    for doc in docs:
        metadata_dict = retrieve_metadata(doc)
        doc = doc.page_content  # Extract Document contents
        if is_base64(doc):
            # Resize image to avoid OAI server error
            images.append(
                resize_base64_image(doc, size=(250, 250))
            )  # base64 encoded str

            # make better in future?
            text.append(str(metadata_dict))
        else:
            text.append(doc)

    print({"images": images, "texts": text})
    return {"images": images, "texts": text}


from operator import itemgetter

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_openai import ChatOpenAI


def prompt_func(data_dict):
    # Joining the context texts into a single string
    formatted_texts = "\n".join(data_dict["context"]["texts"])
    messages = []

    # Adding image(s) to the messages if present
    if data_dict["context"]["images"]:
        image_message = {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{data_dict['context']['images'][0]}"
            },
        }
        messages.append(image_message)

    # Adding the text message for analysis
    text_message = {
        "type": "text",
        "text": (
            "As an expert assistant, your task is to analyze and interpret images, "
            "and answer the user's queries. Alongside the images, you will be "
            "provided with related text to offer context. Both will be retrieved from a vectorstore based "
            "on user-input keywords. Please use your extensive knowledge and analytical skills to provide a "
            "comprehensive summary. You output is spoken so please output in a speaking manner.\n"
            f"User-provided keywords: {data_dict['question']}\n\n"
            "Text and / or tables:\n"
            f"{formatted_texts}"
        ),
    }
    messages.append(text_message)

    return [HumanMessage(content=messages)]


model = ChatOpenAI(temperature=0, model="gpt-4o-mini", max_tokens=1024)

# RAG pipeline
chain = (
    {
        "context": retriever | RunnableLambda(split_image_text_types),
        "question": RunnablePassthrough(),
    }
    | RunnableLambda(prompt_func)
    | model
    | StrOutputParser()
)

from IPython.display import HTML, display


def save_img_base64(img_base64, save_path="saved_image.jpg"):
    """
    Save a base64-encoded image to a file.

    Args:
    img_base64 (str): Base64 string of the image.
    save_path (str): Path where the image will be saved.
    """
    # Decode the base64 string to binary data
    img_data = base64.b64decode(img_base64)
    
    # Open the binary data as an image
    img = Image.open(io.BytesIO(img_data))
    
    # Save the image to the specified path
    img.save(save_path)

# results = vectorstore.similarity_search(
#     query="red vehicle",
#     k = 1
# )

docs = retriever.invoke("Car", k=K_RETRIEVE)
doc = docs[0]
retrieve_metadata(doc)
if is_base64(doc.page_content):
    save_img_base64(doc.page_content)
else:
    print(doc.page_content)

print(chain.invoke("Did obama's car have any special features?"))
