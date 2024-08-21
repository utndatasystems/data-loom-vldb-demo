from bottle import Bottle, hook, response, run, route, request, template
from session_manager import SessionManager, Session
from data_loom import DataLoom
from sql_generator import SqlGenerator
from database import Database
import json
import time
import os
import re
import subprocess
import pandas as pd


# Check on required .jar files for profiling
def jar_files_check():
    required_files = [
        'profiling/metanome-cli-1.1.0.jar',
        'profiling/pyro-distro-1.0-SNAPSHOT-distro.jar'
    ]

    missing_files = [f for f in required_files if not os.path.isfile(f)]

    if missing_files:
        print("Warning: Required .jar files for profiling are missing!!!")
        print("Please run `./download.sh` to download them.")


jar_files_check()

app = Bottle()
data_loom = DataLoom()
session_manager = SessionManager()

_allow_origin = 'http://localhost:3000'
_allow_methods = 'PUT, GET, POST, DELETE, OPTIONS'
_allow_headers = 'Authorization, Origin, Accept, Content-Type, X-Requested-With'


@app.hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = _allow_origin
    response.headers['Access-Control-Allow-Methods'] = _allow_methods
    response.headers['Access-Control-Allow-Headers'] = _allow_headers
    response.headers['Access-Control-Allow-Credentials'] = 'true'


@app.route('/rest/create-session', method=['POST'])
def create_session():
    data = request.json
    uri = data['uri']
    assert uri != None
    s3_access_key_id = data['s3_access_key_id']
    s3_secret_access_key = data['s3_secret_access_key']

    # Create session
    session = Session(None, uri, s3_access_key_id, s3_secret_access_key)
    session_manager.create_session(session)
    print("created session: " + str(session.id))

    # Do schema inference
    data_loom.do_table_discovery(session)
    data_loom.do_table_schema_inference(session)
    session_manager.update_session(session)

    # Reply
    response.content_type = 'application/json'
    return {"session_id": session.id}


@app.route('/rest/get-session/<session_id:int>', method=['GET'])
def get_session(session_id):
    session = session_manager.get_session(session_id)
    response.content_type = 'application/json'
    return {"session": json.dumps(vars(session))}


@app.route('/rest/load-table/<session_id:int>', method=['POST'])
def load_table(session_id):
    data = request.json
    table_name = data['table_name']
    database_name = data['database_name']
    assert table_name != None
    assert database_name != None

    # Create sql code
    session = session_manager.get_session(session_id)
    table = session.find_table(table_name)
    sql_statements = SqlGenerator.create_and_load_table(session, table)

    # Run sql on database, this might actually fail
    try:
        Database.create(database_name).run_queries(sql_statements)
    except Exception as e:
        print(e)
        return {"error": str(e)}

    # Send updated session (table loaded = true)
    response.content_type = 'application/json'
    table["loaded"] = "yes"
    session_manager.update_session(session)
    return {"session": json.dumps(vars(session))}


@app.route('/rest/create-sql/<session_id:int>', method=['POST'])
def create_sql(session_id):
    data = request.json
    table_name = data['table_name']
    assert table_name != None

    session = session_manager.get_session(session_id)
    table = session.find_table(table_name)
    sql_statements = SqlGenerator.create_and_load_table(session, table)
    response.content_type = 'application/json'
    return {"sql": '\n'.join(sql_statements)}


@app.route('/rest/run-query/<session_id:int>', method=['POST'])
def run_query(session_id):
    data = request.json
    query = data['query']
    database_name = data['database_name']
    assert query != None
    assert database_name != None

    try:
        db = Database.create(database_name)

        start = time.time()
        df = db.run_query(query)
        end = time.time()
        query_ms = (end - start) * 1000

        # Hack for nanook
        if type(df) == str:
            return {"query_result": df, "query_ms": query_ms}

        # For postgres and duckdb
        query_result = {}
        query_result["column_names"] = list(df.columns)
        rows = []
        for index, row in df.iterrows():
            rows.append([str(iter) for iter in row])
        query_result["rows"] = rows

        response.content_type = 'application/json'
        return {"query_result": query_result, "query_ms": query_ms}
    except Exception as e:
        print(e)
        # Just show the error to the user
        # return {"query_result": str(e), "query_ms": 0}

        # Get session and table schema
        session = session_manager.get_session(session_id)
        schema = [{"name": table["name"], "attributes": table["attributes"]} for table in session.tables]
        print(f"Schema: {schema}")

        # prompt for LLM
        prompt = f"""An error occurred while executing the following query:\n{query}\n\nError: {str(e)}\n\nHere is the schema of the tables:\n{json.dumps(schema, indent=2)}\n\nPlease provide suggestions on how to fix the query."""

        # LLM suggestion
        llm_suggestion = data_loom.llm.chat(prompt)

        response.content_type = 'application/json'
        return {"query_result": str(e), "query_ms": 0, "llm_suggestion": llm_suggestion}


@app.route('/rest/update-session/<session_id:int>', method=['POST'])
def update_session(session_id):
    data = request.json
    tables = data['tables']
    unknown_files = data['unknown_files']
    assert tables != None
    assert unknown_files != None

    # Update the session (table and file list for now)
    session = session_manager.get_session(session_id)
    session.tables = tables
    session.unknown_files = unknown_files
    session_manager.update_session(session)
    response.content_type = 'application/json'
    return {"session": json.dumps(vars(session))}


@app.route('/rest/get-file-preview/<session_id:int>', method=['POST'])
def get_file_preview(session_id):
    data = request.json
    file_path = data['file_path']
    assert file_path != None

    session = session_manager.get_session(session_id)

    # Read file, this might fail
    try:
        df = pd.read_csv(session.uri + file_path, nrows=10, header=None)
    except Exception as e:
        print(e)
        return {"error": str(e)}

    # Convert read file to python array
    pandas_array = df.values
    python_array = []
    for iter in pandas_array:
        python_array.append(list(iter))
    return {"file_preview": python_array}


@app.route('/rest/update-session-with-llm/<session_id:int>', method=['POST'])
def update_session_with_llm(session_id):
    data = request.json
    question = data['question']
    mode = data['mode']
    table_idx = data.get('table_idx', None)

    assert question is not None
    assert mode is not None

    # Perform llm action on the session
    session = session_manager.get_session(session_id)
    if mode == "table-local":
        assert table_idx is not None
        data_loom.do_update_with_question(session, question, table_idx)
    elif mode == "schema-wide":
        data_loom.do_update_with_questions(session, question)
    else:
        return {"error": "Invalid mode"}

    # Send result
    session_manager.update_session(session)
    response.content_type = 'application/json'
    return {"session": json.dumps(vars(session))}


@app.route('/rest/query-read-only/<session_id:int>', method=['POST'])
def query_read_only(session_id):
    data = request.json
    question = data['question']

    assert question is not None

    session = session_manager.get_session(session_id)

    # Combine into single prompt
    all_tables = [{"name": table["name"], "attributes": table["attributes"]}
                  for table in session.tables]
    combined_prompt = f"""Here are the tables:\n{json.dumps(all_tables)}\n\n{
        question}\nPlease provide an answer without any JSON formatting or updates."""

    # Prompt the llm
    res = data_loom.llm.chat(combined_prompt)
    res = res.replace("'", '"')

    response.content_type = 'application/json'
    return {"llm_answer": res}


@app.route('/rest/run-profiling/<session_id:int>', method=['POST'])
def run_profiling(session_id):
    data = request.json
    table_name = data.get('table_name', None)
    separator = data.get('separator', ',')
    target = data.get('target', 'single')
    algorithm = data.get('algorithm', 'default_algorithm')

    session = session_manager.get_session(session_id)

    parent_dir = os.path.dirname(session.uri)

    # TODO: Define other algorithms
    algorithm_mapping = {
        'default_algorithm': {
            'class': 'de.hpi.isg.pyro.algorithms.ADuccDfd',
            'jar_path': os.path.join(parent_dir, "backend/profiling/pyro-distro-1.0-SNAPSHOT-distro.jar")
        }
    }

    if algorithm not in algorithm_mapping:
        return {"error": "Invalid algorithm specified."}

    selected_algorithm_class = algorithm_mapping[algorithm]['class']
    selected_jar_path = algorithm_mapping[algorithm]['jar_path']

    profiling_results = {}

    # single table or all tables
    if target == 'single':
        tables_to_profile = [session.find_table(table_name)]
    elif target == 'all':
        tables_to_profile = session.tables
    else:
        return {"error": "Invalid target specified."}

    for table in tables_to_profile:
        if not table:
            continue
        table_name = table['name']
        file_path = os.path.join(session.uri, table_name + ".csv")

        cli_path = os.path.join(parent_dir, "backend/profiling/metanome-cli-1.1.0.jar")

        # Profiling command to use selected algorithm
        profiling_command = f'java -Dtinylog.level=trace -cp "{cli_path}":"{selected_jar_path}" de.metanome.cli.App -a {selected_algorithm_class} --files "{file_path}" -o print --file-key "inputFile" --separator "{separator}"'

        try:
            profiling_result = subprocess.check_output(profiling_command, shell=True, universal_newlines=True)
            profiling_results[table_name] = parse_profiling_result(profiling_result)
        except subprocess.CalledProcessError as e:
            profiling_results[table_name] = {"error": str(e), "output": e.output}

    if target == 'all':
        session.profiling_status[algorithm] = True
        session_manager.update_session(session)

    response.content_type = 'application/json'
    return {"profiling_results": profiling_results}


def parse_profiling_result(result):
    ucs = []
    fds = []

    for line in result.splitlines():
        line = line.strip()
        if line.startswith('['):
            if '->' in line:
                fds.append(line.strip())
            else:
                # For UCs, construct string
                columns = re.findall(r'\[(.*?)\]', line)
                if columns:
                    for column in columns:
                        fully_qualified_name = f"[{column}]"
                        ucs.append(fully_qualified_name)

    return {"ucs": ucs, "fds": fds}


# !!! Needs to go last
@app.route('/', method='OPTIONS')
@app.route('/<path:path>', method=['OPTIONS', "GET", "POST"])
def options_handler(path=None):
    return {"error": "route not found"}


run(app, host='localhost', port=23001, debug=True)
