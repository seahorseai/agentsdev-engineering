import { useState } from "react";
import ReactDOM from "react-dom/client";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { StateGraph } from "@langchain/langgraph/web";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Agent output will appear here...");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    try {
      setLoading(true);
      setOutput("Initializing AI model (this may take a few minutes on first run)...");

      // 1️⃣ Initialize WebLLM engine with correct model ID
      const engine = await CreateWebWorkerMLCEngine(
        new Worker(new URL("./worker.js", import.meta.url), { type: "module" }),
        "Llama-3.2-1B-Instruct-q4f16_1-MLC" // Using a smaller, faster model
      );

      setOutput("Model loaded! Processing your request...");

      const llm = async (prompt) => {
        const result = await engine.chat.completions.create({
          messages: [{ role: "user", content: prompt }]
        });
        return result.choices[0].message.content;
      };

      // 2️⃣ Create LangGraph agent
      const graph = new StateGraph({
        channels: { input: "string", output: "string" }
      });

      graph.addNode("reason", async (state) => {
        const res = await llm(`You are a helpful agent. Task: ${state.input}`);
        return { output: res };
      });

      graph.setEntryPoint("reason");
      const agent = graph.compile();

      // 3️⃣ Invoke agent
      setOutput("Generating response...");
      const result = await agent.invoke({ input });
      setOutput(result.output);
    } catch (error) {
      setOutput(`Error: ${error.message}\n\n${error.stack}`);
      console.error("Full error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Browser AI Agent</h1>
      <textarea
        rows={4}
        style={{ width: "100%", marginBottom: 10 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your task for the agent..."
      />
      <button onClick={runAgent} disabled={loading || !input.trim()}>
        {loading ? "Processing..." : "Run Agent"}
      </button>
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: 10, minHeight: 100 }}>
        {output}
      </div>
      
      <div style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
        <strong>Note:</strong> First run downloads the model (~1-2GB). Try simple queries like "What is 2+2?" or "Tell me a joke"
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);