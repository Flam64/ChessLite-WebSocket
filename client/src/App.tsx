import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => console.log("Connected to WebSocket server modif");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => console.log("WebSocket connection closed");

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => ws.send(input);
    setInput("");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ChessLite WebSocket Test</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
        Send
      </button>

      <ul className="mt-4">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
