import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const nameRef = useRef(null);
  const roomRef = useRef(null);
  const isMobile = window.innerWidth < 768;
  const joinSound = useRef(new Audio("/sounds/join.mp3"));

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  useEffect(() => {
    if (!joined) {
      nameRef.current?.focus();
    }
  }, [joined]);  
  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);

      // 🔊 Play sound only for system join messages
      if (data.name === "System" && data.message.includes("joined")) {
        joinSound.current.play().catch(() => {});
      }
    });

    socket.on("roomUsers", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("message");
      socket.off("roomUsers");
    };
  }, []);

  const joinRoom = () => {
    if (!name.trim() || !room.trim()) return;
    socket.emit("joinRoom", { name, room });
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      name,
      room,
      message
    });

    setMessage("");
  };

  return (
    <div style={styles.page}>
      {!joined ? (
        /* JOIN SCREEN */
        <div style={styles.joinWrapper}>
          <div style={styles.card}>
            <h2 style={styles.title}>Join Chat Room</h2>

            <input
              ref={nameRef}
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  roomRef.current.focus();
                }
              }}
            />
            <input
            ref={roomRef}
            style={styles.input}
            placeholder="Session Code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                joinRoom();
              }
            }}
          />
            <button style={styles.joinButton} onClick={joinRoom}>
              Join Room
            </button>
          </div>
        </div>
      ) : (
        /* CHAT SCREEN */
        <div
          style={{
            ...styles.chatContainer,
            ...(isMobile ? styles.mobileChatContainer : {})
          }}
        >
          {/* USERS SIDEBAR */}
          <div style={isMobile ? styles.mobileSidebar : styles.sidebar}>
            <div style={styles.roomHeader}>Room: {room}</div>
            <h4>Users</h4>
            {users.map((u) => (
              <p key={u.id}>👤 {u.name}</p>
            ))}
          </div>

          {/* CHAT AREA */}
          <div style={styles.chatBox}>
            <div style={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={
                    msg.name === "System"
                      ? styles.systemMessage
                      : styles.message
                  }
                >
                  {msg.name === "System" ? (
                    <i>{msg.message}</i>
                  ) : (
                    <>
                      <b>{msg.name}:</b> {msg.message}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.inputRow}>
              <input
                style={styles.input}
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button style={styles.button} onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "#f4f6f8"
  },

  /* JOIN SCREEN */
  joinWrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 350,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },

  title: {
    color:"#607B8F",
    textAlign: "center",
    marginBottom: 10
  },

  joinButton: {
    marginTop: 10,
    padding: "12px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer"
  },

  /* CHAT LAYOUT */
  chatContainer: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "#fff"
  },

  sidebar: {
    width: 240,
    padding: 15,
    background: "#1e293b",
    color: "#fff"
  },

  mobileChatContainer: {
    flexDirection: "column"
  },

  mobileSidebar: {
    width: "100%",
    padding: 10,
    background: "#1e293b",
    color: "#fff"
  },

  roomHeader: {
    fontWeight: "bold",
    marginBottom: 10
  },

  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  messages: {
    flex: 1,
    padding: 15,
    overflowY: "auto"
  },

  message: {
    marginBottom: 8,
    color: "#000"
  },

  systemMessage: {
    marginBottom: 8,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center"
  },

  inputRow: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ddd",
    gap: 8
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14
  },

  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer"
  }
};

export default App;
