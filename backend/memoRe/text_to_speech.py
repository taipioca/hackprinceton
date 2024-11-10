from pathlib import Path
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64
import sqlite3
from elevenlabs import play, save
from elevenlabs.client import ElevenLabs

# Load environment variables from the .env file
load_dotenv()

# Retrieve API keys from environment
openai_client = OpenAI()
eleven_client = ElevenLabs(api_key=os.getenv("ELEVEN_API_KEY"))

OUTPUT_PATH = "./data/speech"

class TTS:
    @staticmethod
    def generate_openai_speech_file(text="", filename="default.mp3", voice="nova"):
        speech_file_path = os.path.join(OUTPUT_PATH, filename) 

        with openai_client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice=voice,
            input=text,
        ) as response:
            response.stream_to_file(speech_file_path)

    @staticmethod
    def generate_eleven_speech_file(text="", filename="default.mp3", voice="Jessica"):
        speech_file_path = os.path.join(OUTPUT_PATH, filename) 
            
        audio = eleven_client.generate(
            text=text,
            voice=voice,
            model="eleven_multilingual_v2"
        )

        save(audio, speech_file_path)
        with open(speech_file_path, "rb") as mp3_file:
            encoded_mp3 = base64.b64encode(mp3_file.read()).decode('utf-8')

        conn = sqlite3.connect('memories.db')
        c = conn.cursor()

        # Check if an MP3 file with the same filename exists
        c.execute('SELECT id FROM audio_files WHERE filename = ?', (filename,))
        existing_audio = c.fetchone()

        if existing_audio:
            # If it exists, update the existing entry
            c.execute('''
                UPDATE audio_files
                SET encoded_mp3 = ?
                WHERE filename = ?
            ''', (encoded_mp3, filename))
        else:
            # If not, insert a new entry
            c.execute('''
                INSERT INTO audio_files (filename, encoded_mp3)
                VALUES (?, ?)
            ''', (filename, encoded_mp3))

        conn.commit()
        conn.close()

        return {"status": "success", "message": f"MP3 file '{filename}' saved successfully!"}

    @staticmethod
    def generate_eleven_speech(text="", filename="default.mp3", voice="Jessica"):
            
        audio = eleven_client.generate(
            text=text,
            voice=voice,
            model="eleven_multilingual_v2"
        )

        play(audio)


if __name__ == "__main__":
    # TTS.generate_openai_speech_file("I hope you're pleased with yourselves. We could all have been killed — or worse, expelled. Now if you don't mind, I'm going to bed.")
    TTS.generate_eleven_speech_file("I hope you're pleased with yourselves. We could all have been killed — or worse, expelled. Now if you don't mind, I'm going to bed.")
