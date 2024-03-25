import os
from llm_interface import LLM
from session_manager import Session
import csv_schema_inference as csv_schema_inference
import json

prompt = """
I have a list of files.
Please give me a json file that has a key for each table and an array of associated file names and a certainty (0.0-1.0) of how confident are you about the entry is correct.
If a file likely belongs to no table, list it under 'UNKNOWN'.
This could be because the name or the file ending indicates that it is not a relational table file.
Here is an example, given the following file paths:
["students_file_1.csv", "lectures/part1.csv", "lectures/part2.csv", "README.md"]
I would like an output like this:
[
{"name": "students", "files": ["students_file_1.csv"], "certainty": 0.9},
{"name": "lectures", "files": ["lectures/part1.csv", "lectures/part2.csv"], "certainty": 0.7},
{"name": "UNKNOWN", "files": ["README.md"], "certainty": 0.8}
]
Here is the actual input data:
"""


class DataLoom:
    def __init__(self) -> None:
        self.llm = LLM(*LLM.load_keys("secrets.json"))

    def do_table_discovery(self, session: Session):
        session.files = self._get_files(session.uri)
        self._create_initial_tables(session)

    def do_table_schema_inference(self, session: Session):
        for table in session.tables:
            if table["name"] == "UNKNOWN":
                table["attributes"] = []
                continue
            csv_schema_inference.create_schema(session, table, self.llm)

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

    def _create_initial_tables(self, session: Session):
        input = prompt + '\n' + str(session.files)
        res = self.llm.chat(input)
        session.add_to_llm_log(input, res)
        tables = json.loads(res)

        for table in tables:
            table["reviewed"] = False
            table["loaded"] = "no"

        # Find the UNKNOWN table
        unknown_table = None
        for table in tables:
            if table["name"] == "UNKNOWN":
                unknown_table = table
                break
        session.unknown_files = unknown_table["files"] if unknown_table else []
        session.tables = [iter for iter in tables if iter["name"] != "UNKNOWN"]
