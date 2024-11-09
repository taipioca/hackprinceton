import os
import json
from .utils import GPT_prompt, EMPATH_TONE

DATA_PATH = "./data/memory_objs"

class DataRetriever:
    def __init__(self, debug=False):
        self.people_database = {}
        self.object_database = {}
        self.debug = debug

        if self.debug:
            print("============================DEBUG MODE ON============================")

    def update_database(self):
        """
        For all objects in memory, store in lookup table 
        """

        for f in os.listdir(DATA_PATH):
            full_path = os.path.join(DATA_PATH, f)
            curr_file = open(full_path, "r")
            curr_mem_obj = json.load(curr_file)
            
            if (curr_mem_obj["type"].lower() == "object"): 
                self.object_database[curr_mem_obj["name"]] = {}
                self.object_database[curr_mem_obj["name"]]["memories"] = curr_mem_obj["memories"]
                self.object_database[curr_mem_obj["name"]]["images"] = curr_mem_obj["images"]
            elif(curr_mem_obj["type"].lower() == "person"):
                self.people_database[curr_mem_obj["name"]] = {} 
                self.people_database[curr_mem_obj["name"]]["memories"] = curr_mem_obj["memories"]
                self.people_database[curr_mem_obj["name"]]["images"] = curr_mem_obj["images"]
            else:
                raise Exception(f"DATABASE LOAD ERROR: File {f} is not of type objcet or person!")

        if self.debug:
            print("========PEOPLE DATABASE========")
            print(self.people_database)
            print("========ObJECTS DATABASE========")
            print(self.object_database)

    def retrieve_memory(self, query):
        """
        query is a name for the dictionary, will return:
        str: summary to do text to speech on
        list: list of images paths
        """

        name = "" 
        all_memories = None 
        all_img_paths = None
        memory_type = "" 

        if query in self.people_database:
            all_memories = self.people_database[query]["memories"]
            all_img_paths = self.people_database[query]["images"]
            memory_type = "person"
        elif query in self.object_database:
            all_memories = self.people_database[query]["memories"]
            all_img_paths = self.people_database[query]["images"]
            memory_type = "object"
        else:
            raise Exception(f"DATABASE RETRIEVAL ERROR: Query {query} not found in people or object database!")

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
            print(f"All retrieved image paths for {query}:", str(all_img_paths))
            print(f"All retrieved memory fragments for {query}:", str(all_memories))
            print(f"Generated story {query}:", generated_story)

        return generated_story, all_img_paths

if __name__ == "__main__":
    dr = DataRetriever(debug=True)
    dr.update_database()
    dr.retrieve_memory("Edward Sun")
