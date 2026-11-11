'client'
import React from 'react';

export default function Page() {
  // Erzeugt das korrekte Format (YYYY-MM-DDTHH:mm) für das datetime-local Input-Feld
  const now = new Date();
  const formattedDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Neuen Gegenstand melden</h1>
      
      <form className="space-y-4">
        {/* Hier stehen deine anderen Formularfelder... */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum und Uhrzeit
          </label>
          <input
            type="datetime-local"
            name="incidentDate"
            defaultValue={formattedDate}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-900 text-white p-2 rounded-md hover:bg-blue-800 transition"
        >
          Absenden
        </button>
      </form>
    </div>
  );
}