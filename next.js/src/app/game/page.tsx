"use client"
import Game from "@/components/Game";

export default function GamePage() {
  return (
		<>
			
		<div className="grid grid-cols-1 lg:grid-cols-5 h-screen w-full text-white">
			{/* LEFT COLUMN  - SIDEBAR WITH LEADERBOARDS*/}
				<aside className="lg:col-span-1 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
					<h2 className="text-xl font-bold mb-4">🔥 Highlights</h2>
				</aside>
			{/* CENTRE - THE GAME ITSELF */}
			<main className="lg:col-span-3 flex flex-col items-center justify-center p-6 bg-gray-950">
				<div className="w-full aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center border border-purple-500">
				<span className="text-purple-400 font-mono">[ Game window ]</span>
				</div>
				<h1 className="text-2xl font-bold mt-4">Game name</h1>
			</main>
			{/* RIGHT COLUMN - SIDEBAR WITH CHAT */}
			<aside className="lg:col-span-1 bg-gray-800 p-4 border-l border-gray-700 flex flex-col justify-between">
				<div>
					<h2 className="text-xl font-bold mb-4">💬 Chat</h2>
				</div>
			</aside>
		</div>
		</>
  );
}