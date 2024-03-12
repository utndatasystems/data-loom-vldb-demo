import pandas as pd
import psycopg2 as pg
import os
import re
import sys
import subprocess


class Nanook:
    def __init__(self, nanook_binary):
        self.binary = nanook_binary
        self.sub_process = subprocess.Popen([nanook_binary],
                                            stdin=subprocess.PIPE,
                                            stdout=subprocess.PIPE,
                                            stderr=subprocess.PIPE,
                                            text=True)
        print("bin: " + nanook_binary)

        # "2" because "END-OF-COMMAND" occurs twice in output
        self.run_query("set terminator 'END-OF-COMMAND';", 2)

    def _has_statement_end(self, line):
        return "END-OF-COMMAND" in line

    def run_query(self, sql, expected_statement_count=1):
        assert '"' not in sql

        # Pipe input to nanook
        print(f">>>>>>>\n{sql}\n>>>>>>>")
        self.sub_process.stdin.write(sql + "\n")
        self.sub_process.stdin.flush()

        # Read full output
        output = ""
        while True:
            if self.sub_process.poll() is not None:
                print(output)
                raise Exception("Nanook process crashed.")

            line = self.sub_process.stdout.readline()
            if self._has_statement_end(line):
                expected_statement_count -= 1
            output = output + line
            if expected_statement_count == 0:
                break
        print(f"<<<<<<<\n{output}\n<<<<<<<")

        # Check for error and return
        if "ERROR" in output:
            raise Exception(output)
        return output


class PsqlConnection:
    def __init__(self, user=None, host=None, port=None, password=None, database=None):
        self.db_name = database
        self.connection = pg.connect(
            user=user, host=host, port=port, password=password, database=database
        )
        self.connection.set_session(autocommit=True)

    def run_queries(self, sql_statements):
        for sql in sql_statements:
            print(f"running: {sql}")
            self.run_query(sql)

    def run_query(self, sql, leak_exception=False):
        cursor = self.connection.cursor()
        try:
            cursor.execute(sql)
            if cursor.description is None:
                return pd.DataFrame()
            rows = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            return pd.DataFrame(data=rows, columns=column_names)
        except Exception as e:
            if leak_exception:
                raise e
            else:
                print("SQL exception")
                print(e)
                print(sql)
        finally:
            cursor.close()


class Database:
    @staticmethod
    def create():
      #   return Nanook("./bin/nanook")
        return PsqlConnection("alex", "", "5432", "", "postgres")

    def run_query(self, sql):
        raise NotImplementedError("Database::run(self, sql)")
