from openai import OpenAI
import pickle
import os
import json

CACHE_PATH = "caches/llm.pkl"


class LLM:
    def __init__(self, organization, api_key):
        self.client = OpenAI(organization=organization, api_key=api_key)
        self._load_cache()
        self.request_count = 0

    def chat(self, prompt, allow_cache=True):
        if allow_cache and prompt in self.cache:
            print("cache hit!")
            return self.cache[prompt]
        print("cache miss ...")

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

    @staticmethod
    def parse_json_from_response(response: str):
        response = response.replace("'", '"')  # LLM tends to return single quotes
        # Sometimes the llm wraps its response in triple backticks (code formatting) -> remove those
        if response.startswith("```\n") and response.endswith("\n```"):
            response = response[4:-4]
        try:
            # Attempt to parse response directly as list of JSON objects
            return json.loads(response)
        except json.JSONDecodeError:
            # If it fails, try to split response by known separator and parse individually
            parts = response.split("\n\n")
            return [json.loads(part) for part in parts if part.strip()]
