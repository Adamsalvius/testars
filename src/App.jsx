import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";



const server = "https://testing-backends.herokuapp.com";
let socket;


function App() {
  const [init, setInit] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [user, setUser] = useState("");
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [date, setDate] = useState();
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState("");

  const messageRef = useRef();
  const getTime = () => {
    const timern = new Date();
    const date =
      timern.getFullYear() + 
      "/" + 
      (timern.getMonth() + 1) + 
      "/" + timern.getDate();
    const time =
      timern.getHours() + ":" + timern.getMinutes() + ":" + timern.getSeconds();
    const dateTime = date + " " + time;
    return dateTime;
  };

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    socket = io(server);

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (data) => {
      console.log(data);
    });

    socket.on("new_client", (data) => {
      console.log(data);
    });

    socket.on("user_created", (data) => {
      setUser(data);
      console.log(`signed in as ${data}`);
    });

    socket.on("user_error", (data) => {
      console.log(data);
    });

    socket.on("user_loggedin", (data) => {
      setUser(data);
      console.log(`Logged in as ${data}`);
    });

    socket.on("error_loggedin", (data) => {
      console.log(data);
    });

    socket.on("chatroom_created", (data) => {
      setRoom(data);
    });

    socket.on("chatroom_err", (data) => {
      console.log(data);
    });

    socket.on("err_delete_chatroom", (data) => {
      console.log(data);
    });
    socket.on("welcome_user", (data) => {
      setMessages(data[0]);
      setRoom(data[1]);
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    socket.on("new_message", (data) => {
      console.log(data);
      setMessages((prevState) => [...prevState, data]);
    });

    return () => socket.off();
  }, []);

  useEffect(() => {
    setDate(getTime());
  }, [messages]);

  useEffect(() => {
    socket.on("all_rooms", (data) => {
      setRooms(data);
    });
  }, [rooms]);

  function handleMessage() {
    const newMessage = {
      date: date,
      message: input,
      room: room,
      user: user,
      userId: socket.id,
    };
    if (input) {
      socket.emit("message", date, input, user, room);
      setMessages([...messages, newMessage]);
      setInput("");
    }
  }

  function login() {
    setInit("login");
  }

  function createUser() {
    setInit("create");
  }

  function addUser() {
    if (username) socket.emit("register_user", username);
  }

  function loginUser() {
    if (username) socket.emit("login_user", username);
  }

  function logoutUser() {
    if (user) {
      setUser("");
      setInit("");
    } else {
      console.log("Please login first");
    }
  }
  function createRoom(roomName) {
    if (roomInput) socket.emit("create_room", roomName);
    setRoomInput("");
  }

  function joinRoom(roomName) {
    if (roomName) socket.emit("join_room", roomName);
    console.log(roomName);
  }

  function leaveRoom(roomName) {
    socket.emit("chatroom_leave", roomName);
    setRoom("");
    setMessages([]);
  }

  function getRooms() {
    socket.emit("get_chatrooms");
  }

  function removeRoom(roomName) {
    socket.emit("delete_chatroom", roomName);
  }

  useEffect(() => {
    getRooms();
  }, [removeRoom]);

  if (!user && !init) {
    return (
      <div className="App">
        <header className="App-header">
          <button className="login" onClick={() => login()}>Login</button>
          <button className="login" onClick={() => createUser()}>Register</button>
        </header>
      </div>
    );
  }

  if (!user && init == "login") {
    return (
      <div className="App">
        <header className="App-header">
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") loginUser();
            }}
            className="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => loginUser()}>Login</button>
        </header>
      </div>
    );
  }
  if (!user && init == "create") {
    return (
      <div className="App">
        <header className="App-header">
          <input
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") addUser();
            }}
            placeholder="Username"
            className="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={() => addUser()}>Register</button>
        </header>
      </div>
    );
  }
  if (user && !room) {
    return (
      <div className="App">
        <header className="App-header">
          <div >
            <h2 className="currentUser">
              welcome! {user}
              <button onClick={() => logoutUser()}>Leave</button>
            </h2>
          </div>
          <div className="control">
            <input
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") joinRoom(roomInput);
              }}
              
              placeholder="Enter roomname"
              className="Roominput"
              value={roomInput}
            
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <button onClick={() => joinRoom(roomInput)}>Join</button>
            <button onClick={() => createRoom(roomInput)}>Create</button>
          </div>
          

          <ul className="currentRooms">
            {rooms.map((room) => {
              return (
                <li key={room.name} className="room">
                  {room.name}{" "}
                  <button onClick={() => removeRoom(room.name)}>🗑️</button>
                </li>
              );
            })}
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        
        <div>
          <h4 className="currentRoom">
            you're in "{room}", {user}
            <button onClick={() => leaveRoom(room)}>Leave</button>
          </h4>
        </div>
        <ul className="messages">
          {messages.map((message) => {
         
            return (
              <li key={message.date} ref={messageRef} className="message">
                <h3>{message.user} wrote:</h3>
                <h1>{message.message}</h1>
                <p>{message.date}</p>
              </li>
            );
          })}
        </ul>

        <div className="messageForm">
          <input
           
            onKeyDown={(e) => {
              if (e.key === "Enter") handleMessage();
            }}
            className="messageInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => handleMessage()}>Send</button>
        </div>
      </header>
    </div>
  );
}

export default App;
