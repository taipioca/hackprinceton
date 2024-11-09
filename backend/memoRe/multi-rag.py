import os
import uuid
import chromadb
import numpy as np
from langchain_chroma import Chroma
from langchain_experimental.open_clip import OpenCLIPEmbeddings
from PIL import Image as _PILImage
import io
from io import BytesIO
import numpy as np
from PIL import Image
import json
from operator import itemgetter
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_openai import ChatOpenAI
from utils import is_base64, resize_base64_image, save_img_base64


DATA_PATH = "./data"
IMG_PATH = "./data/img/"

K_RETRIEVE = 1

class PretendMultiRetriever:
    def __init__(self, k_retrieve):
        # Create chroma
        self.vectorstore = Chroma(
            collection_name="mm_rag_clip_photos", embedding_function=OpenCLIPEmbeddings()
        )
        self.retriever = None
        self.model = ChatOpenAI(temperature=0, model="gpt-4o-mini", max_tokens=1024)
        self.chain = (
            {
                "context": self.retriever | RunnableLambda(self.split_image_text_types),
                "question": RunnablePassthrough(),
            }
            | RunnableLambda(self.prompt_func)
            | self.model
            | StrOutputParser()
        )


        self.store_data()

    def store_data(self):

        # Get image URIs with .jpg extension only
        image_uris = sorted(
            [
                os.path.join(IMG_PATH, image_name)
                for image_name in os.listdir(IMG_PATH)
                if image_name.endswith(".jpeg")
            ]
        )

        metadata = [
            self.get_meta_data(image_uri)
            for image_uri in image_uris
        ]

        self.vectorstore.add_images(uris=image_uris, metadatas=metadata)

        self.retriever = self.vectorstore.as_retriever(k=K_RETRIEVE)

    def get_meta_data(self, image_uri):
        metadata = open(os.path.join(image_uri).replace("img", "metadata").replace(".jpeg", ".json"))
        metadata = json.load(metadata)

        metadata["image_uri"] = image_uri
        
        return metadata  

    def retrieve_description(self, doc):
        uri = doc.metadata["image_uri"]
        description_path = uri.replace("img", "description").replace(".jpeg", ".json")

        data = open(description_path, "r")
        data = json.load(data)

        return data

    def split_image_text_types(self, docs):
        images = []
        text = []
        for doc in docs:
            metadata_dict = self.retrieve_description(doc)
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

    def prompt_func(self, data_dict):
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

    def retrieve(self, query, k=K_RETRIEVE):

        return 


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
