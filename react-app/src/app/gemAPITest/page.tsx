"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle PDF upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setFileData(null);
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result?.toString().split(",")[1];
      setFileData(base64String || null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Gemini request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || "Analyze this input.",
          fileData: fileData || null, // send null if no PDF
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResponse(data.text || "No response from Gemini.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to Gemini API.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gemini Resume + Prompt Analyzer</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your question or request (e.g. 'Suggest jobs based on my skills')"
          className="p-3 border border-gray-300 rounded-lg"
          rows={4}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />

        {fileName && (
          <p className="text-sm text-gray-700">Uploaded: {fileName}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Send to Gemini"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg w-full max-w-md">
          {error}
        </div>
      )}

      {/* Response output */}
      {response && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </main>
  );
}
