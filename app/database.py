import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "helpdesk.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS assignments (
                source TEXT NOT NULL,
                source_id TEXT NOT NULL,
                user_id TEXT,
                PRIMARY KEY (source, source_id)
            )
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS ticket_statuses (
                source TEXT NOT NULL,
                source_id TEXT NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (source, source_id)
            )
            """
        )

def set_ticket_status(
    source: str,
    source_id: str,
    status: str,
):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO ticket_statuses (
                source,
                source_id,
                status
            )
            VALUES (?, ?, ?)
            ON CONFLICT(source, source_id)
            DO UPDATE SET status = excluded.status
            """,
            (
                source,
                source_id,
                status,
            ),
        )


def get_ticket_status(
    source: str,
    source_id: str,
):
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT status
            FROM ticket_statuses
            WHERE source = ?
            AND source_id = ?
            """,
            (
                source,
                source_id,
            ),
        ).fetchone()

    if row:
        return row[0]

    return None

def set_assignment(source: str, source_id: str, user_id: str | None):
    with get_connection() as connection:
        if user_id:
            connection.execute(
                """
                INSERT INTO assignments (
                    source,
                    source_id,
                    user_id
                )
                VALUES (?, ?, ?)
                ON CONFLICT(source, source_id)
                DO UPDATE SET user_id = excluded.user_id
                """,
                (source, source_id, user_id),
            )
        else:
            connection.execute(
                """
                DELETE FROM assignments
                WHERE source = ?
                AND source_id = ?
                """,
                (source, source_id),
            )


def get_assignment(source: str, source_id: str):
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT user_id
            FROM assignments
            WHERE source = ?
            AND source_id = ?
            """,
            (source, source_id),
        ).fetchone()

    if row:
        return row[0]

    return None
