import pandas as pd
import psycopg2 as pg
import os
import re
import sys
import subprocess
import duckdb


class Nanook:
    def __init__(self):
        # Set environment variable to find nanook binary
        os.environ["DYLD_LIBRARY_PATH"] = os.environ.get(
            "DYLD_LIBRARY_PATH", "") + ":/Users/alex/workspace/nanook/bin"

        self.binary = '/Users/alex/workspace/nanook/bin/nanook'
        self.sub_process = subprocess.Popen([self.binary],
                                            stdin=subprocess.PIPE,
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.PIPE,
                                            text=True)

        # "2" because "END-OF-COMMAND" occurs twice in output
        self.run_query("set terminator 'END-OF-COMMAND';", 2)

    def _has_statement_end(self, line):
        return "END-OF-COMMAND" in line

    def run_queries(self, sql_statements):
        res = ""
        for sql in sql_statements:
            print(f"running: {sql}")
            res += str(self.run_query(sql)) + '\n'
        return res

    def run_query(self, sql, expected_statement_count=None):
        assert '"' not in sql
        if expected_statement_count is None:
            expected_statement_count = sql.count(";")

        # Pipe input to nanook
        self.sub_process.stdin.write(sql + "\n")
        self.sub_process.stdin.flush()

        # Read full output
        output = ""
        while True:
            if self.sub_process.poll() is not None:
                raise Exception("Nanook process crashed.")

            line = self.sub_process.stdout.readline()
            if self._has_statement_end(line):
                expected_statement_count -= 1

            # Only last command output is counted
            if expected_statement_count == 1:
                output = output + line

            if expected_statement_count == 0:
                break

        # Check for error and return
        if "ERROR" in output:
            raise Exception(output)
        output = output.replace("END-OF-COMMAND", "")
        output = output.replace(":>", "")
        return output


class PsqlConnection:
    def __init__(self, user=None, host=None, port=None, password=None, database=None):
        self.db_name = database
        self.connection = pg.connect(
            user=user, host=host, port=port, password=password, database=database
        )
        self.connection.set_session(autocommit=True)

    def run_queries(self, sql_statements):
        res = ""
        for sql in sql_statements:
            print(f"running: {sql}")
            res += str(self.run_query(sql)) + '\n'
        return res

    def run_query(self, sql):
        cursor = self.connection.cursor()
        try:
            cursor.execute(sql)
            if cursor.description is None:
                return pd.DataFrame()
            rows = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            df = pd.DataFrame(data=rows, columns=column_names)
            return df
        finally:
            cursor.close()


class DuckDbConnection:

    def __init__(self):
        self.con = duckdb.connect(database=':memory:', read_only=False)

    def run_queries(self, sql_statements):
        res = ""
        for sql in sql_statements:
            print(f"running: {sql}")
            res += str(self.run_query(sql)) + '\n'
        return res

    def run_query(self, sql):
        return self.con.execute(sql).fetchdf()


nanook_process = None
duckdb_instance = None


class Database:
    @staticmethod
    def create(database_name):
        global nanook_process
        global duckdb_instance
        if database_name == "postgresql":
            return PsqlConnection("alex", "", "5432", "", "dataloom")
        if database_name == "nanook":
            if nanook_process is None:
                nanook_process = Nanook()
            return nanook_process
        if database_name == "duckdb":
            if duckdb_instance is None:
                duckdb_instance = DuckDbConnection()
            return duckdb_instance
        else:
            raise Exception(f"Database {database_name} not supported.")
