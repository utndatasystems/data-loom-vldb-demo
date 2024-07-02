import pandas as pd
import os
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


def _infer_column_names(column_types, table, df, llm: LLM, session: Session, version="small_sample"):
    if version == "init_version":
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
    elif version == "table_names":
        csv = df.to_csv()
        other_tables = session.tables
        prompt = f"""
        I have some csv data relating to "{table["name"]}" with {len(column_types)} columns.
        These are all tables in the database: {[t["name"] for t in other_tables]}.
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
    elif version == "small_sample":
        ## small sample of all tables
        first_row = df.head(2).to_csv(index=False).strip()

        # Collecting first rows from all tables in the session
        first_rows = {}
        uri_path = session.uri

        # List all CSV files in the directory
        csv_files = [f for f in os.listdir(uri_path) if f.endswith('.csv')]
        for csv_file in csv_files:
            table_path = os.path.join(uri_path, csv_file)
            table_df = pd.read_csv(table_path, nrows=1, dtype=str)
            first_rows[csv_file] = table_df.to_csv(index=False).strip()

        prompt = f"""
        I have some csv data relating to "{table["name"]}" with {len(column_types)} columns.
        Using the data, please infer a reasonable column name for each column.
        Do NOT just number the column; try to come up with a name based on the data.

        Example input:

        23,Peter Parker,Spiderman
        42,Clark Kent,Superman

        Expected example output:
        ["age", "name", "superhero"]

        First row of the current table:
        {first_row}

        First rows of all other tables in the session:
        {first_rows}

        Please only print the json array with the {len(column_types)} column names.
        """
    elif version == "big_sample_current_table":
        csv_sample = df.head(12).to_csv(index=False)

        # Collecting first rows from all tables in the session
        first_rows = {}
        uri_path = session.uri

        # List all CSV files in the directory
        csv_files = [f for f in os.listdir(uri_path) if f.endswith('.csv')]
        for csv_file in csv_files:
            table_path = os.path.join(uri_path, csv_file)
            table_df = pd.read_csv(table_path, nrows=1, dtype=str)
            first_rows[csv_file] = table_df.to_csv(index=False).strip()

        prompt = f"""
        I have some csv data relating to "{table["name"]}" with {len(column_types)} columns.
        Using the data, please infer a reasonable column name for each column.
        Do NOT just number the column; try to come up with a name based on the data.

        Example input:

        23,Peter Parker,Spiderman
        42,Clark Kent,Superman

        Expected example output:
        ["age", "name", "superhero"]

        Sample input from current table (first 12 rows):
        {csv_sample}

        First rows of all tables in the session:
        {first_rows}

        Please only print the json array with the {len(column_types)} column names.

        """
    res = llm.chat(prompt)
    print(f"column name inference {prompt}")
    print(f"column name inference {res}")
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
