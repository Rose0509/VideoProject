import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [joinId, setJoinId] = useState('');
  const navigate = useNavigate();

  const handleCreateCall = () => {
    const newCallId = `call-${Math.random().toString(36).substring(2, 11)}`;
    navigate(`/call/${newCallId}`);
  };

  const handleJoinCall = (e) => {
    e.preventDefault();
    if (joinId.trim()) {
      navigate(`/call/${joinId.trim()}`);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
        <span className="text-blue-600">Appel Vidéo WebRTC</span>
      </h1>
      <p className="text-gray-600 mb-8">
        Démarrez un nouvel appel ou rejoignez une conversation existante.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Option pour créer un appel */}
        <div className="p-6 border rounded-lg w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Démarrer un nouvel appel</h2>
          <p className="text-gray-500 mb-4">Créez un lien unique à partager avec vos correspondants.</p>
          <button
            onClick={handleCreateCall}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
          >
            Créer un appel
          </button>
        </div>

        {/* Option pour rejoindre un appel */}
        <div className="p-6 border rounded-lg w-full md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Rejoindre un appel</h2>
          <form onSubmit={handleJoinCall} className="flex flex-col gap-4">
            <input type="text" value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Entrez l'ID de l'appel" className="p-3 border rounded-md w-full" />
            <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition duration-300">
              Rejoindre
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;