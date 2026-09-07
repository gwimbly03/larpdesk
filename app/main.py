from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import Ticket


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


tickets = [
    Ticket(
        id=1,
        source="jira",
        source_id="TEST-1",
        title="VPN not working",
        requester="John Smith",
        company="Acme Corp",
        body="User cannot connect to the VPN.",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        status="new",
        priority="high",
        source_url="https://example.com",
    ),
    Ticket(
        id=2,
        source="outlook",
        source_id="email-123",
        title="Printer issue",
        requester="Jane Doe",
        company="Example Ltd",
        body="The office printer is not responding.",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        status="new",
        priority=None,
        source_url="https://example.com",
    ),
]


@app.get("/")
async def home():
    return {
        "application": "Help Desk Dashboard",
        "status": "running",
    }


@app.get("/tickets")
async def get_tickets():
    return tickets
