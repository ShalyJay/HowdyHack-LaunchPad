"use client";
import { useState } from "react";

export default function Home() {
  const [fileData, setFileData] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result?.toString().split(",")[1];
      setFileData(base64String || null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require at least one input (PDF or skills)
    if (!fileData && !skills.trim()) {
      alert("Please upload a PDF or enter skills (or both)!");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      // OLD VERSION (requires @google/generative-ai package):
      /* const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, fileData, skills }),
      });*/

      // NEW VERSION (REST API - no package needed):
      const prompt = "Analyze the resume and skills provided. List main skills and experience.";
      const res = await fetch("/api/gemini-rest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, fileData, skills }),
      });

      const data = await res.json();
      setResponse(data.text || data.error || "No response");
    } catch (error) {
      console.error(error);
      setResponse("Error connecting to Gemini API route.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gemini PDF Analyzer</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume (PDF) - Optional
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          {fileName && (
            <p className="text-gray-700 text-sm mt-1">Uploaded: {fileName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Skills - Optional
          </label>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., Python, JavaScript, React, Machine Learning..."
            className="p-3 border border-gray-300 rounded-lg w-full"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Send to Gemini"}
        </button>
      </form>

      {response && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </main>
  );
}