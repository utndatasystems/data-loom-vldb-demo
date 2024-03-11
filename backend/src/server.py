from bottle import Bottle, hook, response, run, route, request, template
from session_manager import SessionManager, Session
from data_loom import DataLoom
import json

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
    except Exception as e:
        session.error = str(e)

    session_manager.update_session(session)
    print(f"created session: {session.id}")
    response.content_type = 'application/json'
    return {"session_id": session.id}


@app.route('/rest/get-session/<session_id:int>', method=['GET'])
def get_session(session_id):
    session = session_manager.get_session(session_id)
    response.content_type = 'application/json'
    return {"session": json.dumps(vars(session))}


# Needs to go last
@app.route('/', method='OPTIONS')
@app.route('/<path:path>', method=['OPTIONS', "GET", "POST"])
def options_handler(path=None):
    return


run(app, host='localhost', port=23001, debug=True)
