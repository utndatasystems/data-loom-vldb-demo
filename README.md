### Data Loom

---

#### Introduction

Schema discovery and data loading is an essential part of any data analysis pipeline. In the rapidly evolving fields of machine learning and business intelligence, this task has become frequent yet often underestimated.

Introducing DataLoom, a web-based prototype that automates the tedious aspects of this process using Large Language Models, while leveraging traditional algorithms for well-understood problems, thus streamlining the schema discovery and data loading experience.

---

#### Setup

1. Run `requirements.txt` in the backend folder for backend python files.

   ```
   pip install -r /path/to/requirements.txt
   ```
2. Run in */backend* and */frontend*:

   ```
   npm install
   ```
3. Add a  `secrets.json` with your OpenAI token to the backend folder.

   Format of the `secrets.json` file:

   ```
   {
       "ORG": "",
       "KEY": ""
    }
   ```
4. Run the following command to download the required `.jar` files for profiling.

   ```
   ./download.sh
   ```

#### Running

Start backend (run in `./backend/`):

```
./node_modules/nodemon/bin/nodemon.js -w src --exec python3 src/server.py
```

Start frontend (run in `./frontend/`):

```
npm start
```

#### Adding new Datasets

1. Add data files/folders locally.
2. Add the path to your data files/folders to `data-paths.json` in *frontend/src/*
