from datetime import datetime, timezone
from html import unescape
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN,
    GMAIL_ACCOUNT,
)

from app.models import Ticket


SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]


def get_header(headers, name):
    for header in headers:
        if header["name"].lower() == name.lower():
            return header["value"]

    return None


def get_gmail_tickets() -> list[Ticket]:

    credentials = Credentials(
        token=None,
        refresh_token=GOOGLE_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )

    credentials.refresh(Request())

    service = build(
        "gmail",
        "v1",
        credentials=credentials,
    )

    result = (
        service.users()
        .messages()
        .list(
            userId="me",
            labelIds=["INBOX"],
            maxResults=10,
        )
        .execute()
    )

    messages = result.get("messages", [])

    tickets = []

    for index, message in enumerate(messages, start=1):

        email = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=message["id"],
                format="metadata",
                metadataHeaders=[
                    "From",
                    "Subject",
                ],
            )
            .execute()
        )

        headers = email["payload"]["headers"]

        subject = get_header(headers, "Subject") or "No Subject"
        sender = get_header(headers, "From") or "Unknown"

        created_at = datetime.fromtimestamp(
            int(email["internalDate"]) / 1000,
            tz=timezone.utc,
        )

        tickets.append(
            Ticket(
                id=index,
                source="gmail",
                source_id=email["id"],
                title=subject,
                requester=sender,
                company=None,
                body=unescape(email.get("snippet", "")),
                created_at=created_at,
                updated_at=created_at,
                status="new",
                priority=None,
                source_url=f"https://mail.google.com/mail/u/0/#inbox/{email['id']}",
            )
        )

    return tickets
