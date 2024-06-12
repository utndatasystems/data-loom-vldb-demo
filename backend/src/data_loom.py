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
        tables = LLM.parse_json_from_response(res)

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

    def do_update_with_question(self, session, question, table_idx):
        table = session.tables[table_idx]

        # Assemble question for the llm
        table_for_llm = {"name": table["name"], "attributes": table["attributes"]}
        prompt = f"""Here is a SQL table with a name and a list of attributes/columns in JSON:\n{json.dumps(table_for_llm)}\n\n{question}\nIn your answer, only print the new JSON."""

        # Prompt the llm
        res = self.llm.chat(prompt)
        res = res.replace("'", '"')  # LLM tends to return single quotes
        new_table = LLM.parse_json_from_response(res)

        # Write result back to session
        table["name"] = new_table["name"]
        table["attributes"] = new_table["attributes"]

    def do_update_with_questions(self, session, question):
        # Combine into single prompt
        all_tables = [{"name": table["name"], "attributes": table["attributes"]} for table in session.tables]
        combined_prompt = f"""Here are the tables:\n{json.dumps(all_tables)}\n\n{question}\nIn your answer, please provide a JSON array of objects, each corresponding to a table, in the format of each table."""
        # print(f"Prompt: {combined_prompt}")

        # Prompt the llm
        res = self.llm.chat(combined_prompt)
        res = res.replace("'", '"')

        # Parse response
        responses = LLM.parse_json_from_response(res)
        if isinstance(responses, dict):
            responses = [responses]
        elif not isinstance(responses, list):
            raise ValueError("LLM response is not a list or dict of JSON objects")

        # Write result back to session
        for idx, new_table in enumerate(responses):
            session.tables[idx]["name"] = new_table["name"]
            session.tables[idx]["attributes"] = new_table["attributes"]
