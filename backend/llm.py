from openai import OpenAI
import pickle
import os

CACHE_PATH = "backend/cache.pkl"


class LLM:
    def __init__(self, organization, api_key):
        self.client = OpenAI(organization=organization, api_key=api_key)
        self._load_cache()
        self.request_count = 0

    def chat(self, prompt, allow_cache=True):
        if allow_cache and prompt in self.cache:
            return self.cache[prompt]

        self.request_count += 1
        chat_completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
        )
        result = chat_completion.choices[0].message.content
        self.cache[prompt] = result
        self._save_cache()
        return result

    def _load_cache(self):
        if not os.path.exists(CACHE_PATH):
            self.cache = {}
            return

        with open(CACHE_PATH, 'rb') as file:
            self.cache = pickle.load(file)

    def _save_cache(self):
        with open(CACHE_PATH, 'wb') as file:
            pickle.dump(self.cache, file)

    def get_request_count(self):
        return self.request_count

    @staticmethod
    def load_keys(path):
        import json
        with open(path) as f:
            data = json.load(f)
            ORG = data["ORG"]
            KEY = data["KEY"]
            return ORG, KEY
