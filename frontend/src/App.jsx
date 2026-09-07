import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tickets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }

        return response.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="message">Loading tickets...</div>;
  }

  if (error) {
    return <div className="message error">Error: {error}</div>;
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Help Desk</h1>
          <p>Jira, Outlook and Gmail</p>
        </div>

        <span className="ticket-count">
          {tickets.length} tickets
        </span>
      </header>

      <main>
        {tickets.map((ticket) => (
          <div className="ticket" key={`${ticket.source}-${ticket.source_id}`}>
            <div className={`source ${ticket.source}`}>
              {ticket.source}
            </div>

            <div className="ticket-content">
              <div className="ticket-heading">
                <div>
                  <h2>{ticket.title}</h2>

                  <p className="company">
                    {ticket.company}
                  </p>
                </div>

                <span className="status">
                  {ticket.status}
                </span>
              </div>

              <p className="body">
                {ticket.body}
              </p>

              <div className="ticket-footer">
                <div>
                  <span>{ticket.requester}</span>
                  <span>{ticket.source_id}</span>

                  {ticket.priority && (
                    <span>{ticket.priority}</span>
                  )}
                </div>

                <a
                  href={ticket.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open ticket
                </a>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
