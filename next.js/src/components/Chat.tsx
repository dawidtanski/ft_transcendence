"use client";

import { useState } from "react";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-controls="chat-panel"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 min-h-11 min-w-11 touch-manipulation rounded-lg bg-purple-600 p-3 text-white"
      >
        Chats
      </button>

      {isOpen && (
        <aside
          id="chat-panel"
          aria-label="DM"
          className="fixed right-0 top-0 z-50 flex h-dvh w-full flex-col bg-gray-900 p-4 text-white sm:w-96"
        >
          <header className="flex items-center justify-between">
            <h2>Messages</h2>

            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg"
            >
              ✕
            </button>
          </header>

          <input
            type="search"
            aria-label="Find friend"
            placeholder="Find friend"
            className="mt-4 rounded bg-gray-800 p-2"
          />

          <div className="mt-4 flex-1 overflow-y-auto">
            Here will be dialog list
          </div>
        </aside>
      )}
    </>
  );
}
