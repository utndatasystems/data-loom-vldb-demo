import pickle
import os
from dataclasses import dataclass

CACHE_PATH = "caches/sessions.pkl"


class Session:
    def __init__(self, id: str, uri: str, s3_access_key_id: str, s3_secret_access_key: str):
        self.id = id
        self.uri = uri
        self.s3_access_key_id = s3_access_key_id
        self.s3_secret_access_key = s3_secret_access_key
        self.files = []
        self.tables = []
        self.llm_log = []

    def add_to_llm_log(self, input: str, output: str):
        self.llm_log.append({
            "input": input,
            "output": output
        })


class SessionManager:
    def __init__(self):
        self._load_cache()
        print(f"SessionManager created ({len(self.cache)} cached sessions).")

    def get_session(self, id: str):
        if id in self.cache:
            return self.cache[id]
        return None

    def create_session(self, session: Session):
        session.id = len(self.cache)
        self.cache[session.id] = session
        self._save_cache()

    def update_session(self, session: Session):
        self.cache[session.id] = session
        self._save_cache()

    def _load_cache(self):
        if not os.path.exists(CACHE_PATH):
            self.cache = {}
            return

        with open(CACHE_PATH, 'rb') as file:
            self.cache = pickle.load(file)

    def _save_cache(self):
        with open(CACHE_PATH, 'wb') as file:
            pickle.dump(self.cache, file)
