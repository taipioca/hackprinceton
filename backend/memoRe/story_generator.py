import os
import json
from .utils import GPT_prompt, EMPATH_TONE
import requests

class StoryGenerator:
    def __init__(self, debug=False):
        self.debug = debug

        if self.debug:
            print("============================DEBUG MODE ON============================")

    def generate_story(self, data_json):

        name = data_json["name"]
        all_memories = data_json["memories"]
        memory_type = data_json["object_type"]

        system_prompt = f"""{EMPATH_TONE}\nYou are an assistant designed to help dementia patients recall memories. 
                           When provided with a {memory_type}'s name , along with related memory fragments,
                           your task is to create a cohesive story from these fragments.
                           This story should help the patient remember details about the {memory_type}. Be concise and limit your story to around 4 sentances or so."""

        prompt = f"The name of the {memory_type} is: {name}\n\nHere are the memory fragments:\n"
        for memory in all_memories:
            prompt += memory + "\n"

        generated_story = GPT_prompt(system_prompt=system_prompt, query=prompt)
 
        if self.debug:
            print("------RETRIEVE PROMPT------")
            print(prompt)
            print("------RETRIEVED INFO------")
            print(f"All retrieved memory fragments for {name}:", str(all_memories))
            print(f"Generated story {name}:", generated_story)
        
        return generated_story 

if __name__ == "__main__":
    dr = StoryGenerator(debug=True)
    dr.retrieve_memory("Leann")
