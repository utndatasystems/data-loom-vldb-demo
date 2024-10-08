import config from './config.js';


export const DEPLOY = config.deploy;
const IP = config.host;
const PORT = config.port;
const PROTOCOL = config.protocol;

function buildRestUri(endpoint, param = "") {
    return PROTOCOL + "://" + IP + ((PORT > 0 ? ":" + PORT : "")) + "/rest/" + endpoint + ((param === "") ? "" : "/" + param);
}

if (config.logging) {
    console.log("DEPLOY: " + DEPLOY);
    console.log("REST API: " + buildRestUri("endpoint"));
}

export var changeDisplayedPage = { callback: null };

// Documentation for fetch API
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

function do_request(method, url, data, next) {
    return fetch(url, {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: (DEPLOY ? "same-origin" : "cors"), // no-cors, cors, *same-origin
        credentials: "include", // include, *same-origin, omit
        body: JSON.stringify(data), // body data type must match "Content-Type" header
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => {
        // Allow ok and teapots!
        // We do not use status codes to indicate in-game errors, but a json object:
        // {success: true|false, error: "description"}
        if (response.status === 200 || response.status === 418) {
            return response.json();
        }

        // Give out some nicer error messages for known errors
        if (response.status === 401) {
            throw new Error('Session expired, not logged in!');
        }
        throw new Error('Bad status code from server: ' + response.status);
    }).then((myJson) => {
        return next(myJson);
    }).catch((err) => {
        if (!err) {
            err = "Unknown error.";
        }
        console.log("Error: " + err.message);
        if (err.message === "Failed to fetch") {
            changeDisplayedPage.callback("Can not reach server!"); // This might just be a server crash
        } else {
            changeDisplayedPage.callback(err.message);
        }

        // Throw again for good measure: this way we see the stack trace in the log
        if (config.debug) {
            throw err;
        }
    });
}

export function create_session(uri, s3_access_key_id, s3_secret_access_key, next) {
    do_request("POST", buildRestUri("create-session"), {
        uri: uri,
        s3_access_key_id: s3_access_key_id,
        s3_secret_access_key: s3_secret_access_key,
    }, next);
}

export function get_session(session_id, next) {
    do_request("GET", buildRestUri("get-session", session_id), undefined, next);
}

export function load_table(session_id, database_name, table_name, next) {
    do_request("POST", buildRestUri("load-table", session_id), {
        database_name: database_name,
        table_name: table_name,
    }, next);
}

export function create_sql(session_id, table_name, next) {
    do_request("POST", buildRestUri("create-sql", session_id), {
        table_name: table_name,
    }, next);
}

export function run_query(session_id, database_name, query, next) {
    do_request("POST", buildRestUri("run-query", session_id), {
        database_name: database_name,
        query: query,
    }, next);
}

export function get_file_preview(session_id, file_path, next) {
    do_request("POST", buildRestUri("get-file-preview", session_id), {
        file_path: file_path,
    }, next);
}

export function updateSessionWithLlm(session_id, question, table_idx, mode, next) {
    do_request("POST", buildRestUri("update-session-with-llm", session_id), {
        question: question,
        table_idx: table_idx,
        mode: mode
    }, next);
}

export function queryReadOnly(session_id, question, next) {
    do_request("POST", buildRestUri("query-read-only", session_id), {
        question: question
    }, next);
}

export function updateSession(session_id, tables, unknown_files, next) {
    do_request("POST", buildRestUri("update-session", session_id), {
        tables: tables,
        unknown_files: unknown_files,
    }, next);
}

export function run_profiling(session_id, table_name, separator = ",", target = "single", algorithm="default_algorithm", next) {
    do_request("POST", buildRestUri("run-profiling", session_id), {
        table_name: table_name,
        separator: separator,
        target: target,
        algorithm: algorithm,
    }, next);
}

