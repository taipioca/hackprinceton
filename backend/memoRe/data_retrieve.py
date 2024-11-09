import os
import json
from .utils import GPT_prompt, EMPATH_TONE
import requests

class DataRetriever:
    def __init__(self, debug=False):
        self.people_database = {}
        self.object_database = {}
        self.debug = debug

        if self.debug:
            print("============================DEBUG MODE ON============================")

    def retrieve_memory(self, query):
        """
        query is a name for the dictionary, will return:
        str: summary to do text to speech on
        list: list of images paths
        """

        
        url = 'http://localhost:5000/get_memory'
        params = {
                'name': query 
            }

        response = requests.get(url, params=params)
        response = response.json()

        print(response)

        name = "" 
        all_memories = response["memories"]
        all_img_base64 = response["images"]
        memory_type = response["object_type"]

        system_prompt = f"""{EMPATH_TONE}\nYou are an assistant designed to help dementia patients recall memories. 
                           When provided with a {memory_type}'s name , along with related memory fragments,
                           your task is to create a cohesive story from these fragments.
                           This story should help the patient remember details about the {memory_type}."""

        prompt = f"The name of the {memory_type} is: {query}\n\nHere are the memory fragments:\n"
        for memory in all_memories:
            prompt += memory + "\n"

        generated_story = GPT_prompt(system_prompt=system_prompt, query=prompt)
 
        if self.debug:
            print("------RETRIEVE PROMPT------")
            print(prompt)
            print("------RETRIEVED INFO------")
            print(f"All retrieved memory fragments for {query}:", str(all_memories))
            print(f"Generated story {query}:", generated_story)
        
        return generated_story, all_img_base64

if __name__ == "__main__":
    dr = DataRetriever(debug=True)
    dr.retrieve_memory("Leann")
