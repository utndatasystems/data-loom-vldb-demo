import pandas as pd
from llm_interface import LLM
from session_manager import Session


def _is_bool(value):
    return value.lower() in ["true", "false"]


def _is_integer(value):
    try:
        int(value)
        return True
    except:
        return False


def _is_float(value):
    try:
        float(value)
        return True
    except:
        return False


def _is_date(value):
    try:
        pd.to_datetime(value)
        return True
    except:
        return False


def _is_timestamp(value):
    try:
        pd.to_datetime(value)
        return True
    except:
        return False


def _is_null(value):
    return type(value) == float


def get_column_type(column):
    null_count = 0
    types = [
        ["bool", _is_bool, 0],
        ["integer", _is_integer, 0],
        ["float", _is_float, 0],
        ["date", _is_date, 0],
        ["timestamp", _is_timestamp, 0],
    ]

    # Count possible types for each value in column
    for value in column:
        if _is_null(value):
            null_count += 1
            continue

        for iter in types:
            iter[2] += iter[1](value)

    # Pick most restrictive one which can be used for each value in column
    for iter in types:
        if iter[2] == len(column) - null_count:
            return {"name": None, "type": iter[0], "null": null_count > 0}
    return {"name": None, "type": "text", "null": null_count > 0}


def _get_table_schema(df):
    return [get_column_type(list(df[col])) for col in df.columns]


def _attach_column_names(column_types, column_names):
    for i, column in enumerate(column_types):
        column["name"] = "c" + str(column_names[i])


def _infer_column_names(column_types, table, df, llm: LLM, session: Session):
    csv = df.to_csv()
    prompt = f"""
I have some csv data relating to {table["name"]} with {len(column_types)} columns.
Using the data, please infer a reasonable column name for each column.
Do NOT just number the column; try to come up with a name based on the data.

Example input:
```
23,Peter Parker,Spiderman
42,Clark Kent,Superman
```

Expected example output:
```
["age", "name", "superhero"]
```

Please only print the json array with the {len(column_types)} column names.
Actual csv input:
{csv}
"""
    res = llm.chat(prompt)
    session.add_to_llm_log(prompt, res)
    inferred_column_names = LLM.parse_json_from_response(res)
    for idx, column in enumerate(column_types):
        column["name"] = inferred_column_names[idx]


def create_schema(session: Session, table, llm):
    path = session.uri + table["files"][0]
    print(f"work on: {path}")

    df_with_header = pd.read_csv(path, nrows=100, dtype=str)
    with_header = _get_table_schema(df_with_header)
    df_no_header = pd.read_csv(path, nrows=100, dtype=str, header=None)
    no_header = _get_table_schema(df_no_header)

    # Header was defined -> just use these names
    if with_header != no_header:
        _attach_column_names(with_header, df_with_header.columns)
        table["attributes"] = with_header
        return

    _infer_column_names(no_header, table, df_no_header, llm, session)
    table["attributes"] = no_header
