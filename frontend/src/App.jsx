import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {
  const [chatLoading, setChatLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [notification, setNotification] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [insights, setInsights] = useState("");
  const [openActivity, setOpenActivity] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am FinGuard AI Assistant. Ask me about fraud risks."
    }
  ]);

  const [activities, setActivities] = useState([
  {
    time: new Date().toLocaleTimeString(),
    event: "FinGuard Agent Initialized"
  }
  ]);  
  const [loading, setLoading] = useState(true);
  const [lastAlertId, setLastAlertId] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch Dashboard Stats

  const fetchStats = async () => {

    try {

      const response = await axios.get("https://finguard-agent.onrender.com/dashboard-stats");

      setStats(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  // Fetch Alerts

  const fetchAlerts = async () => {

    try {

      const response = await axios.get(
        "https://finguard-agent.onrender.com/alerts"
      );

      setAlerts(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  // Fetch Transactions

  const fetchTransactions = async () => {

    try {

      const response = await axios.get(
        "https://finguard-agent.onrender.com/transactions"
      );

      setTransactions(response.data);

      setLoading(false);

    } catch (error) {

      console.log(error);

    }
  };

  const sendMessage = async () => {

  if (!chatInput) return;

  const userMessage = {
    role: "user",
    text: chatInput
  };

  setChatMessages((prev) => [...prev, userMessage]);
 addActivity(`💬 User asked: ${chatInput}`);

  try {
    setChatLoading(true);
    const response = await axios.post(
      "https://finguard-agent.onrender.com",
      {
        message: chatInput
      }
    );

    const aiMessage = {
      role: "assistant",
      text: response.data.response
    };

    setChatMessages((prev) => [...prev, aiMessage]);
    addActivity("🤖 AI assistent responded");
    setChatLoading(false);

  } catch (error) {

    console.log(error);
    setChatLoading(false);
  }

  setChatInput("");
  };

   // Fetch AI nsights
  const fetchInsights = async () => {

  setInsightsLoading(true);

  try {

    const res = await fetch(
      "https://finguard-agent.onrender.com"
    );

    const data = await res.json();

    setInsights(data.insights);
    addActivity("📄AI Security report generated");

  } catch (error) {

    console.error(error);

  } finally {

    setInsightsLoading(false);

  }

  };
  const addActivity = (event) => {

    setActivities(prev => [
      {
        time: new Date().toLocaleTimeString(),
        event
      },
      ...prev.slice(0, 19)
    ]);

  };
  // Auto Refresh Every 5 Seconds

  useEffect(() => {

    fetchStats();
    fetchAlerts();
    fetchTransactions();
    fetchInsights();

    const interval = setInterval(() => {

      fetchStats();
      fetchAlerts();
      fetchTransactions();

    }, 5000);
    
    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

  chatEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });

  }, [chatMessages]);
  useEffect(() => {

  if (alerts.length === 0) return;

  const newestAlert = alerts[0];

  if (
    lastAlertId &&
    newestAlert._id !== lastAlertId
  ) {

    setNotification(
      `🚨 ${newestAlert.message}`
    );

    addActivity(
      `🚨 ${newestAlert.message}`
    );

    setTimeout(() => {

      setNotification("");

    }, 5000);

  }

  setLastAlertId(newestAlert._id);

  }, [alerts]);
  const fraudActivities = activities.filter(
  activity =>
    activity.event.toLowerCase().includes("fraud") ||
    activity.event.toLowerCase().includes("risk") ||
    activity.event.toLowerCase().includes("detected")
);

const blockActivities = activities.filter(
  activity =>
    activity.event.toLowerCase().includes("block") ||
    activity.event.toLowerCase().includes("blocked")
);

const reportActivities = activities.filter(
  activity =>
    activity.event.toLowerCase().includes("report")
);
  // Loading Screen

  if (loading) {

    return (

      <div className="dashboard">

        <div className="loading-screen">
          <h1>🛡️ FinGuard Agent</h1>
          <p>Loading Dashboard...</p>
        </div>
      </div>

    );
  }

  const filteredTransactions =
    riskFilter === "ALL"
      ? transactions
      : transactions.filter(
          (t) =>
            t.risk_analysis?.risk_level === riskFilter
        );

  
  // Chart Data

  const chartData = stats ? [

    {
      name: "High Risk",
      value: stats.high_risk_transactions
    },

    {
      name: "Blocked",
      value: stats.blocked_transactions
    },

    {
      name: "Alerts",
      value: stats.total_alerts
    }

  ] : [];

  return (

    <div className="dashboard">

      <div className="header">
        <h1>🛡️ FinGuard-Agent</h1>
        <p>AI-Powered Banking Fraud Detection & Response Platform</p>
        <div className="live-badge">● LIVE MONITORING</div>
      </div>

      {/* Notification */}

      {notification && (

        <div className="notification">

          {notification}

        </div>

      )}

      {/* Stats Cards */}

      {stats && (

        <div className="cards">

          <div className="card">

            <h2>Total Transactions</h2>

            <p>{stats.total_transactions}</p>

          </div>

          <div className="card">

            <h2>Total Alerts</h2>

            <p>{stats.total_alerts}</p>

          </div>

          <div className="card">

            <h2>High Risk Transactions</h2>

            <p>{stats.high_risk_transactions}</p>

          </div>

          <div className="card">

            <h2>Blocked Transactions</h2>

            <p>{stats.blocked_transactions}</p>

          </div>

        </div>

      )}

      
      <div className="status-row">

        <div className="card latest-alert">

          <h2>🚨 Latest Alert</h2>

          {alerts.length > 0 ? (
            <>
              <p>
                Severity: <strong>{alerts[0].severity}</strong>
              </p>

              <p>{alerts[0].message}</p>
            </>
          ) : (
            <p>No alerts available</p>
          )}

        </div>

        <div className="card system-status">

          <h2>🟢 System Status</h2>

          <p
            style={{
              color: "#22c55e",
              fontWeight: "bold"
            }}
          >
            All Services Operational
          </p>

        </div>

      </div>
      
      {/* Analytics Chart */}

      <div className="chart-section">

        <h2>Fraud Analytics</h2>

        <ResponsiveContainer width="100%" height={400}>

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}`}
            >

              <Cell fill="#dc2626" />
              <Cell fill="#f59e0b" />
              <Cell fill="#2563eb" />

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Fraud Simulation */}

      <div className="card" style={{ marginTop: "40px" }}>

        <h2>Test Fraud Detection</h2>

        <button

          onClick={async () => {

            try {

              const response = await axios.post(
                "https://finguard-agent.onrender.com",
                {
                  amount: 95000,
                  new_device: true,
                  foreign_transaction: true,
                  failed_attempts: 5,
                  odd_hour: true
                }
              );

              console.log(response.data);

              setNotification(
                "🚨 High Risk Fraud Transaction Detected!"
              );
              addActivity(
                "🚨 High-risk transaction detected"
              );
              addActivity(
                "🛑 High-risk transaction auto-blocked"
              );

              setTimeout(() => {

                setNotification("");

              }, 4000);

              fetchStats();
              fetchAlerts();
              fetchTransactions();

            } catch (error) {

              console.log(error);

              alert("Error running analysis");

            }
          }}

          style={{
            padding: "12px 25px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >

          Simulate Fraud Transaction

        </button>

      </div>

     {/* Alerts Table */}

      <div className="alerts-wrapper">

        <div className="section-header">

         <h2>
            Fraud Alerts
            <span className="record-count">
              ({alerts.length} Records)
            </span>
          </h2>
        </div>

        <div className="alerts-scroll">

          <table>

            <thead>

              <tr>
                <th>Severity</th>
                <th>Message</th>
                <th>Alert ID</th>
                <th>Time</th>
              </tr>

            </thead>

            <tbody>

              {alerts.map((alert) => (

                <tr key={alert._id}>

                  <td>{alert.severity}</td>

                  <td>{alert.message}</td>

                  <td>{alert._id}</td>

                  <td>
                    {alert.timestamp
                      ? new Date(alert.timestamp).toLocaleString()
                      : "N/A"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Transactions Table with dropdown */}
  
      <div className="transactions-wrapper">

      <div className="transactions-header">

        <h2>
          Transaction Monitoring
          <span className="record-count">
            ({filteredTransactions.length} Records)
          </span>
        </h2>

        <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
          <option value="ALL">
            All Transactions
          </option>

          <option value="HIGH">
            High Risk
          </option>

          <option value="MEDIUM">
            Medium Risk
          </option>

          <option value="LOW">
            Low Risk
          </option>

        </select>

      </div>

      <div className="transactions-section">


        <table>

          <thead>

            <tr>

              <th>Amount</th>
              <th>Risk Level</th>
              <th>Action Taken</th>
              <th>Alert Severity</th>
              <th>AI Analysis</th>
              <th>Timestamp</th>

            </tr>

          </thead>

          <tbody>

            {filteredTransactions.map((transaction) => (

              <tr key={transaction._id}>

                <td>

                  ₹ {transaction.transaction?.amount || 0}

                </td>

                <td>

                  <span className={`badge ${
                    transaction.risk_analysis?.risk_level === "HIGH"
                      ? "high"
                      : transaction.risk_analysis?.risk_level === "MEDIUM"
                      ? "medium"
                      : "low"
                  }`}>

                    {transaction.risk_analysis?.risk_level || "LOW"}

                  </span>

                </td>

                <td>

                  {transaction.action?.action ||transaction.action_taken?.action || "NOT NEEDED"}

                </td>

                <td>

                  <span className={`badge ${
                    transaction.alert?.severity === "CRITICAL"
                      ? "high"
                      : "low"
                  }`}>

                    {transaction.alert?.severity || "LOW"}

                  </span>

                </td>

                <td
                  className="ai-cell"
                  onClick={() => setSelectedTransaction(transaction)}
                >

                  <div>
                    <strong>Risk:</strong>{" "}
                    {transaction.ai_analysis?.fraud_probability || "N/A"}
                  </div>

                  <div>
                    <strong>Action:</strong>{" "}
                    {transaction.ai_analysis?.recommended_action || "N/A"}
                  </div>

                </td>
                <td>
                  {transaction.timestamp
                    ? new Date(transaction.timestamp).toLocaleString()
                    : "N/A"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>
        </div>    
      </div>
              {/* AI insights generator button */}
      <div style={{ marginTop: "30px", marginBottom: "20px" }}>
        <button
          onClick={fetchInsights}
          className="refresh-btn"
        >
          🔄 Generate New Report
        </button>
      </div>

      {/* AI SecurityInsights */}
      
      <div className="insights-card">
        <h2 className="insights-title">
          🧠 AI Security Intelligence
        </h2>

        <div className="insights-content">

          {insightsLoading ? (

            <div className="loading-insights">

              <h3>🤖 Generating Security Report...</h3>

              <p>
                Analyzing transactions, alerts and fraud trends...
              </p>

            </div>

          ) : (

            <pre
              style={{
                whiteSpace: "pre-wrap",
                textAlign: "left",
                lineHeight: "1.8"
              }}
            >
              {insights || "Click Generate Report"}
            </pre>

          )}

        </div>
          
      </div>

      {/* Agent Status Card */}

        <div className="agent-status-card">

                  <h2>🤖 FinGuard Agent Status</h2>

                  <div className="agent-status-grid">

                    <div className="status-item">
                      <span>Status</span>
                      <strong className="status-active">
                        ACTIVE
                      </strong>
                    </div>

                    <div className="status-item">
                      <span>Tools Connected</span>
                      <strong>
                        4
                      </strong>
                    </div>

                    <div className="status-item">
                      <span>Transactions</span>
                      <strong>
                        {stats?.total_transactions || 0}
                      </strong>
                    </div>

                    <div className="status-item">
                      <span>Alerts</span>
                      <strong>
                        {stats?.total_alerts || 0}
                      </strong>
                    </div>

                    <div className="status-item">
                      <span>High Risk</span>
                      <strong className="status-danger">
                        {stats?.high_risk_transactions || 0}
                      </strong>
                    </div>

                    <div className="status-item">
                      <span>Blocked</span>
                      <strong>
                        {stats?.blocked_transactions || 0}
                      </strong>
                    </div>

                  </div>

                </div>  

       {/* Agent Activity Feed */}

        <div className="activity-card">

          <h2>⚡ Agent Activity</h2>

          <div className="activity-group">

            <div
              className="activity-header"
              onClick={() =>
                setOpenActivity(
                  openActivity === "all" ? null : "all"
                )
              }
            >
              {openActivity === "all" ? "▼" : "▶"} 📋 Activity Timeline ({activities.length})
            </div>

            {openActivity === "all" && (

              <div
                className="activity-list"
                style={{
                  maxHeight: "320px",
                  overflowY: "auto"
                }}
              >

                {activities.map((activity, index) => (

                  <div
                    key={index}
                    className="activity-item"
                  >

                    <span className="activity-time">
                      {activity.time}
                    </span>

                    <span className="activity-event">
                      {activity.event}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      {/* AI Chatbot */}

        <div className="chatbot-section">

          <h2>FinGuard AI Assistant</h2>

          <div className="chat-box">

            {chatMessages.map((msg, index) => (

              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }
              >

                {msg.text}

              </div>

            ))}
            {chatLoading && (

              <div className="assistant-message">

                🤖 FinGuard Agent is analyzing...

              </div>

            )}
            <div ref={chatEndRef}></div>

          </div>

          <div className="chat-input-area">

            <input
              type="text"
              placeholder="Ask about fraud detection..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />

            <button onClick={sendMessage}>

              Send

            </button>

          </div>

        </div>

      {/* AI Modal */}

      {selectedTransaction && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>AI Fraud Analysis</h2>

            <p>

              <strong>Fraud Probability:</strong>{" "}

              {selectedTransaction.ai_analysis?.fraud_probability}

            </p>

            <p>

              <strong>Recommended Action:</strong>{" "}

              {selectedTransaction.ai_analysis?.recommended_action}

            </p>

            <p>

              <strong>Risk Level:</strong>{" "}

              {selectedTransaction.risk_analysis?.risk_level}

            </p>

            <p>

              <strong>Alert Severity:</strong>{" "}

              {selectedTransaction.alert?.severity}

            </p>

            <p>

              <strong>Transaction Amount:</strong>{" "}

              ₹ {selectedTransaction.transaction?.amount}

            </p>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="close-btn"
            >

              Close

            </button>

          </div>

        </div>

      )}

       {/* Footer */}
      <div className="footer">

        FinGuard-Agent © 2026

        <br />

        AI-Powered Banking Security Platform

      </div>

    </div>

  );
}

export default App;