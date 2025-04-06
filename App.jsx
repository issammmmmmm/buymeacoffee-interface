import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI } from "./abi/buymeacoffee.js";

const contractAddress = "0xc6BeBD9431F4782A912a653cD432Cc2bFfD6c431";

function App() {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(addr);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const instance = new ethers.Contract(contractAddress, contractABI, signer);

      setContract(instance);
      console.log("✅ Wallet connected:", addr);
    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      setError("Connection failed.");
    }
  };

  const sendTip = async () => {
    try {
      if (!contract || !name || !message) {
        alert("All fields required!");
        return;
      }

      const tx = await contract.buyCoffee(name, message, {
        value: ethers.parseEther("0.001"),
      });

      await tx.wait();
      setName("");
      setMessage("");
      await loadMemos();
      console.log("✅ Tip sent");
    } catch (err) {
      console.error("❌ Error sending tip:", err);
      setError("Transaction failed.");
    }
  };

  const loadMemos = async () => {
    try {
      if (!contract) return;
      const data = await contract.getMemos();
      console.log("📥 Memos loaded:", data);
      setMemos(data);
    } catch (err) {
      console.error("❌ Failed to load memos:", err);
      setError("Failed to load messages.");
    }
  };

  useEffect(() => {
    if (contract) {
      console.log("⏳ Contract ready, loading memos...");
      loadMemos();
    }
  }, [contract]);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Buy Me A Coffee ☕</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!wallet ? (
        <button onClick={connectWallet}>🔌 Connect Wallet</button>
      ) : (
        <>
          <p>Connected as: {wallet}</p>

          <h3>Send a Tip</h3>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{ width: "300px" }}
          />
          <br />
          <button onClick={sendTip}>☕ Send 0.001 ETH</button>

          <h3 style={{ marginTop: "2rem" }}>Memos:</h3>
          {Array.isArray(memos) && memos.length > 0 ? (
            [...memos]
              .reverse()
              .map((m, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ccc",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>{m.name}</strong> said:
                  <br />
                  <em>{m.message}</em>
                  <br />
                  <small>From: {m.from}</small>
                </div>
              ))
          ) : (
            <p>No messages yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;