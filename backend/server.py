from bottle import Bottle, hook, response, run, route

app = Bottle()

_allow_origin = 'http://localhost:3000'
_allow_methods = 'PUT, GET, POST, DELETE, OPTIONS'
_allow_headers = 'Authorization, Origin, Accept, Content-Type, X-Requested-With'


@app.hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = _allow_origin
    response.headers['Access-Control-Allow-Methods'] = _allow_methods
    response.headers['Access-Control-Allow-Headers'] = _allow_headers
    response.headers['Access-Control-Allow-Credentials'] = 'true'


@app.route('/', method='OPTIONS')
@app.route('/<path:path>', method=['OPTIONS', "GET", "POST"])
def options_handler(path=None):
    return


@app.route('/rest/infer-schema', method=['GET', 'POST'])
def hello():
    response.content_type = 'application/json'
    return {"test": "hello my world!"}


run(app, host='localhost', port=23001, debug=True)
