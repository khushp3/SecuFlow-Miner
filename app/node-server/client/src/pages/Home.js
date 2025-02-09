// src/pages/Home.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const navigate = useNavigate();

  const handleGenerateReport = () => {
    // Navigate to the Dashboard page and pass the userInput as state
    navigate('/dashboard', { state: { userInput } });
  };

  return (
    <Layout title="Home — SecuFlow" description="Welcome to SecuFlow.">
      <div className="flex flex-col items-center justify-center min-h-[900px] p-4">
        <h1 className="text-2xl font-bold mb-4">Enter Repository Name</h1>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter repository name"
          className="w-full max-w-md mb-4 p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleGenerateReport}
          className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-md w-full max-w-md transition-all font-semibold"
        >
          Generate Report
        </button>
      </div>
    </Layout>
  );
}
