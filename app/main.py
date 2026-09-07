import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.connectors.gmail import get_gmail_tickets
from app.database import (
    get_assignment,
    get_ticket_status,
    init_db,
    set_assignment,
    set_ticket_status,
)

BASE_DIR = Path(__file__).resolve().parent


# =========================================================
# Request Models
# =========================================================

class AssignmentRequest(BaseModel):
    source: str
    source_id: str
    user_id: str | None = None

class StatusRequest(BaseModel):
    source: str
    source_id: str
    status: str

# =========================================================
# Application Startup
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(
    title="LarpDesk",
    description="Unified help desk dashboard for Jira, Outlook and Gmail",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# Routes
# =========================================================

@app.get("/")
async def home():
    return {
        "application": "LarpDesk",
        "status": "running",
    }

@app.get("/tickets")
def get_tickets():
    tickets = get_gmail_tickets()

    for ticket in tickets:
        ticket.assigned_to = get_assignment(
            ticket.source,
            ticket.source_id,
        )

        saved_status = get_ticket_status(
            ticket.source,
            ticket.source_id,
        )

        ticket.status = saved_status or "new"

    return tickets

@app.get("/users")
async def get_users():
    users_file = BASE_DIR / "data" / "users.json"

    with users_file.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


@app.post("/assignments")
async def assign_ticket(
    assignment: AssignmentRequest,
):
    set_assignment(
        assignment.source,
        assignment.source_id,
        assignment.user_id,
    )

    return {
        "success": True,
        "source": assignment.source,
        "source_id": assignment.source_id,
        "user_id": assignment.user_id,
    }

@app.get("/statuses")
async def get_statuses():
    statuses_file = BASE_DIR / "data" / "status.json"

    with statuses_file.open(
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)

@app.post("/statuses")
async def update_ticket_status(
    status_update: StatusRequest,
):
    set_ticket_status(
        status_update.source,
        status_update.source_id,
        status_update.status,
    )

    return {
        "success": True,
        "source": status_update.source,
        "source_id": status_update.source_id,
        "status": status_update.status,
    }
