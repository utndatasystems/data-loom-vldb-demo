import os


def get_files(path):
    # Returns array with all file names in given directory
    return os.listdir(path)


def get_initial_schema(path):
    """
       I have the following list of file paths.
       Please give me a json file that has a key for each table and an array of associated file names.
       Example: {"table_1": ["table_1_file_1.csv", "table_2_file_2.csv"], "table_2": "table_2/part1.csv"}
    """

    ['orders.csv',
     'partsupp.csv',
     'part.csv',
     'supplier.csv',
     'nation.csv',
     'customer.csv',
     'lineitem/part_1.csv',
     'lineitem/part_2.csv',
     'README.md',
     'region.csv']

    {
        "orders": ["orders.csv"],
        "partsupp": ["partsupp.csv"],
        "part": ["part.csv"],
        "supplier": ["supplier.csv"],
        "nation": ["nation.csv"],
        "customer": ["customer.csv"],
        "lineitem": ["lineitem/part_1.csv", "lineitem/part_2.csv"],
        "region": ["region.csv"]
    }
