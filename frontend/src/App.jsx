import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [sourceFilter, setSourceFilter] = useState("all");

  const [tickets, setTickets] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTicket, setSelectedTicket] = useState(null);

  // =========================================================
  // Fetch Tickets
  // =========================================================

  const fetchTickets = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetch(`${API_URL}/tickets`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch tickets: ${response.status}`
        );
      }

      const data = await response.json();

      setTickets(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // Fetch Users
  // =========================================================

  const fetchAssignees = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status}`
        );
      }

      const data = await response.json();

      setAssignees(data);
    } catch (error) {
      console.error(
        "Could not load users:",
        error
      );
    }
  };

  // =========================================================
  // Fetch Statuses
  // =========================================================

  const fetchStatuses = async () => {
    try {
      const response = await fetch(
        `${API_URL}/statuses`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch statuses: ${response.status}`
        );
      }

      const data = await response.json();

      setStatuses(data);
    } catch (error) {
      console.error(
        "Could not load statuses:",
        error
      );
    }
  };

  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {
    fetchTickets();
    fetchAssignees();
    fetchStatuses();
  }, []);

  // =========================================================
  // Ticket Filtering
  // =========================================================

  const filteredTickets =
    sourceFilter === "all"
      ? tickets
      : tickets.filter(
          (ticket) =>
            ticket.source?.toLowerCase() === sourceFilter
        );

  // =========================================================
  // Assignment
  // =========================================================

  const handleAssignment = async (
    ticket,
    assigneeId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: ticket.source,
            source_id: ticket.source_id,
            user_id: assigneeId || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save assignment"
        );
      }

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) => {
          const isSameTicket =
            currentTicket.source === ticket.source &&
            currentTicket.source_id === ticket.source_id;

          if (!isSameTicket) {
            return currentTicket;
          }

          return {
            ...currentTicket,
            assigned_to: assigneeId || null,
          };
        })
      );

      if (
        selectedTicket &&
        selectedTicket.source === ticket.source &&
        selectedTicket.source_id === ticket.source_id
      ) {
        setSelectedTicket({
          ...selectedTicket,
          assigned_to: assigneeId || null,
        });
      }
    } catch (error) {
      console.error(
        "Could not assign ticket:",
        error
      );
    }
  };

  // =========================================================
  // Status
  // =========================================================

  const handleStatusChange = async (
    ticket,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/statuses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source: ticket.source,
            source_id: ticket.source_id,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to save ticket status"
        );
      }

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) => {
          const isSameTicket =
            currentTicket.source === ticket.source &&
            currentTicket.source_id === ticket.source_id;

          if (!isSameTicket) {
            return currentTicket;
          }

          return {
            ...currentTicket,
            status: newStatus,
          };
        })
      );

      if (
        selectedTicket &&
        selectedTicket.source === ticket.source &&
        selectedTicket.source_id === ticket.source_id
      ) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error(
        "Could not update ticket status:",
        error
      );
    }
  };

  // =========================================================
  // Helpers
  // =========================================================

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) {
      return "Unassigned";
    }

    const assignee = assignees.find(
      (person) => person.id === assigneeId
    );

    return assignee
      ? assignee.name
      : "Unknown";
  };

  const getStatusName = (statusId) => {
    const status = statuses.find(
      (item) => item.id === statusId
    );

    return status
      ? status.name
      : statusId || "Unknown";
  };

  // =========================================================
  // Loading Screen
  // =========================================================

  if (loading) {
    return (
      <div className="message">
        Loading tickets...
      </div>
    );
  }

  // =========================================================
  // App
  // =========================================================

  return (
    <div className="app">
      <header>
        <div>
          <h1>LarpDesk</h1>

          <p>
            A unified view of Jira, Outlook and Gmail
          </p>
        </div>

        <div className="header-actions">
          <div className="source-filter">
            <label htmlFor="source-filter">
              Sort by
            </label>

            <select
              id="source-filter"
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value)
              }
            >
              <option value="all">
                All
              </option>

              <option value="jira">
                Jira
              </option>

              <option value="outlook">
                Outlook
              </option>

              <option value="gmail">
                Gmail
              </option>
            </select>
          </div>

          <button
            className="refresh-button"
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <span className="ticket-count">
            {filteredTickets.length}{" "}
            {filteredTickets.length === 1
              ? "ticket"
              : "tickets"}
          </span>
        </div>
      </header>

      {error && (
        <div className="message error">
          Error: {error}

          <button
            className="retry-button"
            onClick={() => fetchTickets()}
          >
            Try again
          </button>
        </div>
      )}

      <main>
        {filteredTickets.length === 0 ? (
          <div className="message">
            No tickets found.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              className="ticket"
              key={`${ticket.source}-${ticket.source_id}`}
            >
              <div
                className={`source ${ticket.source}`}
              >
                {ticket.source}
              </div>

              <div className="ticket-content">
                <div className="ticket-heading">
                  <div>
                    <h2>
                      {ticket.title}
                    </h2>

                    <p className="company">
                      {ticket.company ||
                        "Unknown company"}
                    </p>
                  </div>

                  <div className="status-control">
                    <label
                      htmlFor={`status-${ticket.source}-${ticket.source_id}`}
                    >
                      Status
                    </label>

                    <select
                      id={`status-${ticket.source}-${ticket.source_id}`}
                      value={ticket.status}
                      onChange={(event) =>
                        handleStatusChange(
                          ticket,
                          event.target.value
                        )
                      }
                    >
                      {statuses.map((status) => (
                        <option
                          key={status.id}
                          value={status.id}
                        >
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="body">
                  {ticket.body}
                </p>

                <div className="ticket-footer">
                  <div className="ticket-info">
                    <span>
                      {ticket.requester}
                    </span>

                    <span>
                      {ticket.source_id}
                    </span>

                    {ticket.priority && (
                      <span>
                        {ticket.priority}
                      </span>
                    )}

                    <span className="assigned-name">
                      Assigned:{" "}
                      {getAssigneeName(
                        ticket.assigned_to
                      )}
                    </span>
                  </div>

                  <div className="ticket-actions">
                    <div className="assignment-control">
                      <label
                        htmlFor={`assign-${ticket.source}-${ticket.source_id}`}
                      >
                        Assign
                      </label>

                      <select
                        id={`assign-${ticket.source}-${ticket.source_id}`}
                        value={
                          ticket.assigned_to || ""
                        }
                        onChange={(event) =>
                          handleAssignment(
                            ticket,
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Unassigned
                        </option>

                        {assignees.map(
                          (person) => (
                            <option
                              key={person.id}
                              value={person.id}
                            >
                              {person.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <button
                      className="details-button"
                      onClick={() =>
                        setSelectedTicket(ticket)
                      }
                    >
                      View details
                    </button>

                    <a
                      href={ticket.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="open-ticket"
                    >
                      Open ticket
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {selectedTicket && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedTicket(null)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span
                  className={`modal-source ${selectedTicket.source}`}
                >
                  {selectedTicket.source}
                </span>

                <h2>
                  {selectedTicket.title}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedTicket(null)
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-info">
              <div>
                <span className="info-label">
                  Requester
                </span>

                <span>
                  {selectedTicket.requester ||
                    "Unknown"}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Company
                </span>

                <span>
                  {selectedTicket.company ||
                    "Unknown"}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Source
                </span>

                <span>
                  {selectedTicket.source ||
                    "Unknown"}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Status
                </span>

                <span>
                  {getStatusName(
                    selectedTicket.status
                  )}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Priority
                </span>

                <span>
                  {selectedTicket.priority ||
                    "None"}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Ticket ID
                </span>

                <span>
                  {selectedTicket.source_id}
                </span>
              </div>

              <div>
                <span className="info-label">
                  Assigned To
                </span>

                <span>
                  {getAssigneeName(
                    selectedTicket.assigned_to
                  )}
                </span>
              </div>

              {selectedTicket.created_at && (
                <div>
                  <span className="info-label">
                    Created
                  </span>

                  <span>
                    {new Date(
                      selectedTicket.created_at
                    ).toLocaleString()}
                  </span>
                </div>
              )}

              {selectedTicket.updated_at && (
                <div>
                  <span className="info-label">
                    Updated
                  </span>

                  <span>
                    {new Date(
                      selectedTicket.updated_at
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-description">
              <h3>
                Description
              </h3>

              <p>
                {selectedTicket.body ||
                  "No description available."}
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                Close
              </button>

              <a
                href={
                  selectedTicket.source_url
                }
                target="_blank"
                rel="noreferrer"
                className="modal-open-ticket"
              >
                Open ticket
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
