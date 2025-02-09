// src/pages/Profile.js
import { useState } from 'react';
import Layout from '../components/Layout';

export default function Profile() {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Security Analyst'
  });

  const handleUpdate = () => {
    setUserData((prev) => ({
      ...prev,
      email: 'updated.email@example.com'
    }));
  };

  return (
    <Layout title="Profile — SecuFlow" description="Welcome to your profile.">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl">Name: {userData.name}</h2>
          <h2 className="text-xl">Email: {userData.email}</h2>
          <h2 className="text-xl">Role: {userData.role}</h2>
        </div>
        <button onClick={handleUpdate} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Update Info
        </button>
      </div>
    </Layout>
  );
}
