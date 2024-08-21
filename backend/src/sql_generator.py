
class SqlGenerator:
    @staticmethod
    def _create_column(col):
        name = col["name"]
        type = col["type"]
        null = "null" if col["null"] else "not null"
        return f'{name} {type} {null}'

    @staticmethod
    def _drop_create_statement(table):
        return f'drop table if exists {table["name"]};'

    @staticmethod
    def _create_table_statement(table):
        attributes = table["attributes"]
        columns = [SqlGenerator._create_column(col) for col in attributes]

        # add unique constraints
        unique_constraints = SqlGenerator._create_unique_constraints(table)

        sql = f'create table {table["name"]} ({", ".join(columns)}{unique_constraints});'
        return sql

    @staticmethod
    def _create_unique_constraints(table):
        """Generates the SQL part for unique constraints."""
        ucs = table.get('ucs', [])
        if not ucs:
            return ''

        # Create string for UNIQUEs
        uc_columns = [f'UNIQUE ({uc.strip("[]")})' for uc in ucs]
        return ", " + ", ".join(uc_columns)

    @staticmethod
    def _load_table_statements(session, table):
        table_name = table["name"]
        path = session.uri
        statements = []
        for file in table["files"]:
            statements.append(f"copy {table_name} from '{path}{file}' CSV;")
        return statements

    @staticmethod
    def create_and_load_table(session, table):
        sql_statements = [
            SqlGenerator._drop_create_statement(table),
            SqlGenerator._create_table_statement(table),
            *SqlGenerator._load_table_statements(session, table),
            f"select count(*) from {table['name']};",
        ]
        return sql_statements
