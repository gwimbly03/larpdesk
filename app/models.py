from dataclasses import dataclass
from datetime import datetime


@dataclass
class Ticket:
    id: int
    source: str
    source_id: str

    title: str
    requester: str
    company: str | None
    body: str

    created_at: datetime
    updated_at: datetime

    status: str
    priority: str | None

    source_url: str
