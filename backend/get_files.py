import requests
import json
import sqlite3
import time

# We will use the GitHub's trees API
# https://api.github.com/repos/mitre/cti/git/trees/master
# enterprise-attack: https://api.github.com/repos/mitre/cti/git/trees/abc7cc6ab8cd685b3cf73ae19d835f9828cec6bd
# attack-pattern:
DIR_URL = "https://api.github.com/repos/mitre/cti/git/trees/73b36ee6886d871f354c113983860255841430d7"
FILE_URL_PREFIX = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/attack-pattern/"


def create_db_tables(conn: sqlite3.Connection) -> None:
    sql = '''CREATE TABLE IF NOT EXISTS attacks(
                 id TEXT PRIMARY KEY,
                 name TEXT NOT NULL,
                 description TEXT NOT NULL,
                 platforms TEXT NOT NULL,
                 detection TEXT,
                 phase_name TEXT NOT NULL)'''
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()


#                                                 tuple contents:  id|name|desc|plat|detect|phases
def insert_attack_data_to_db(conn: sqlite3.Connection, data: tuple[str, str, str, str, str, str]) -> None:
    sql = '''INSERT INTO attacks(id,name,description,platforms,detection,phase_name)
             VALUES(?,?,?,?,?,?)'''  # To be filled later
    cur = conn.cursor()
    cur.execute(sql, data)
    conn.commit()


def get_files_list() -> list[str]:
    response = requests.get(DIR_URL)
    if response.status_code != 200:  # OK
        print("ERROR fetching files from GitHub!")
        exit(1)

    files = json.loads(response.text)['tree']
    return [x['path'] for x in files]  # List of all files names


#                                  tuple contents:  id|name|desc|plat|detect|phases
def extract_attack_data(raw_response: str) -> tuple[str, str, str, str, str, str]:
    # Convert it to a JSON object
    raw_data = json.loads(raw_response)['objects'][0]

    # Extract phases separately, as there might be several for 1 attack
    raw_phases = raw_data['kill_chain_phases']
    phases = ', '.join([phase['phase_name'] for phase in raw_phases])

    # Same for platforms, which is stored as a list
    platforms = ', '.join(raw_data['x_mitre_platforms'])

    # Extract only necessary fields & combine them to a tuple
    return (raw_data['id'], raw_data['name'], raw_data['description'],
            platforms, raw_data.get('x_mitre_detection', ''), phases)  # detection might not exist, use default


def main():
    try:
        with sqlite3.connect('attacks_data.db') as conn:
            # create_db_tables(conn)

            files = get_files_list()
            total_files = len(files)  # Precalculate
            start = time.time()

            # Iterate over all files, extract & insert each one to the DB
            for i, filename in enumerate(files):
                # Get raw data of current file
                response = requests.get(FILE_URL_PREFIX + filename)

                if response.status_code != 200:  # OK
                    print(f"ERROR fetching file: {filename}")
                    continue  # Skip problematic file

                insert_attack_data_to_db(conn, extract_attack_data(response.text))

                # Print progression
                print(f'{i + 1}/{total_files}')

            end = time.time()
            print(f'\nTook {end - start} seconds to fetch and insert to DB {total_files} attacks.')

    except sqlite3.Error as e:
        print(e)


if __name__ == '__main__':
    main()
