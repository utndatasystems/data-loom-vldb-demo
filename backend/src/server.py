from bottle import Bottle, hook, response, run, route, request, template
from session_manager import SessionManager, Session
from data_loom import DataLoom
from sql_generator import SqlGenerator
from database import Database
import json
import time
import pandas as pd

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
    session = Session(None, uri, s3_access_key_id, s3_secret_access_key)
    session_manager.create_session(session)

    try:
        data_loom.do_table_discovery(session)
        data_loom.do_table_schema_inference(session)
        session_manager.update_session(session)

        response.content_type = 'application/json'
        return {"session_id": session.id}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@app.route('/rest/get-session/<session_id:int>', method=['GET'])
def get_session(session_id):

    try:
        session = session_manager.get_session(session_id)
        response.content_type = 'application/json'
        return {"session": json.dumps(vars(session))}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@app.route('/rest/load-table/<session_id:int>', method=['POST'])
def load_table(session_id):
    data = request.json
    table_name = data['table_name']
    database_name = data['database_name']
    assert table_name != None
    assert database_name != None

    try:
        session = session_manager.get_session(session_id)
        table = session.find_table(table_name)
        sql_statements = SqlGenerator.create_and_load_table(session, table)
        Database.create(database_name).run_queries(sql_statements)
        response.content_type = 'application/json'
        table["loaded"] = "yes"
        session_manager.update_session(session)
        return {"session": json.dumps(vars(session))}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@app.route('/rest/create-sql/<session_id:int>', method=['POST'])
def load_table(session_id):
    data = request.json
    table_name = data['table_name']
    assert table_name != None

    try:
        session = session_manager.get_session(session_id)
        table = session.find_table(table_name)
        sql_statements = SqlGenerator.create_and_load_table(session, table)
        response.content_type = 'application/json'
        return {"sql": '\n'.join(sql_statements)}
    except Exception as e:
        print(e)
        return {"error": str(e)}


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
        return {"query_result": str(e), "query_ms": 0}


@app.route('/rest/update-session/<session_id:int>', method=['POST'])
def update_session(session_id):
    data = request.json
    tables = data['tables']
    assert tables != None

    try:
        session = session_manager.get_session(session_id)
        session.tables = tables
        session_manager.update_session(session)
        response.content_type = 'application/json'
        return {"session": json.dumps(vars(session))}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@app.route('/rest/get-file-preview/<session_id:int>', method=['POST'])
def run_query(session_id):
    data = request.json
    file_path = data['file_path']
    assert file_path != None

    try:
        session = session_manager.get_session(session_id)
        df = pd.read_csv(session.uri + file_path, nrows=10, header=None)
        strange_array = df.values
        proper_array = []
        for iter in strange_array:
            proper_array.append(list(iter))
        return {"file_preview": proper_array}
    except Exception as e:
        print(e)
        return {"error": str(e)}


# !!! Needs to go last
@app.route('/', method='OPTIONS')
@app.route('/<path:path>', method=['OPTIONS', "GET", "POST"])
def options_handler(path=None):
    return {"error": "route not found"}


run(app, host='localhost', port=23001, debug=True)
