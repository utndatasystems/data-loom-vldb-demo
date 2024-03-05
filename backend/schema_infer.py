import os
from llm import LLM

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


def get_local_files(path):
    files = []
    for r, d, f in os.walk(path):
        for file in f:
            files.append(os.path.join(r, file))
    return [iter.replace(path, "") for iter in files]


def create_initial_tables(llm: LLM, path: str, quiet=True):
    files = get_local_files(path)
    input = prompt + '\n' + str(files)
    if not quiet:
        print(input)
        print("---------")
    return llm.chat(input)
