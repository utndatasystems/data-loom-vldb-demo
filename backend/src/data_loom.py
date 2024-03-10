import os
from llm import LLM
from session_manager import Session
import json

prompt = """
I have a list of file paths.
Please give me a json file that has a key for each table and an array of associated file names that likely belong to it.
If a file likely belongs to multiple tables or no table at all, list it under 'UNKNOWN'.
Here is an example, given the following file paths:
["students_file_1.csv", "lectures/part1.csv", "lectures/part2.csv", "test.log"]
I would like an output like this:
{
"students": ["students_file_1.csv"],
"lectures": ["lectures/part1.csv", "lectures/part2.csv"],
"UNKNOWN": ["test.log"]
}
Here is the actual input data:
"""


class DataLoom:
    def __init__(self) -> None:
        self.llm = LLM(*LLM.load_keys("secrets.json"))

    def start_session(self, session: Session):
        files = self._get_files(session.uri)
        self._create_initial_tables(files, session)

    def _get_files(self, path):
        if os.path.exists(path):
            return self._get_local_files(path)
        raise Exception(f"Unable to resolve path: {path}")

    def _get_local_files(self, path):
        files = []
        for r, d, f in os.walk(path):
            for file in f:
                files.append(os.path.join(r, file))
        return [iter.replace(path, "") for iter in files]

    def _create_initial_tables(self, files, session):
        input = prompt + '\n' + str(files)
        res = self.llm.chat(input)
        session.add_to_llm_log(input, res)
        session.tables = json.loads(res)
