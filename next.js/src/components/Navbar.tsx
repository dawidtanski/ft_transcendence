"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/config/navigation";

export default function Navbar(){
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(true);

	return (
		<nav className="bg-white border-b border-gray-200 dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* LOGO - MAIN PAGE */}
				<div className="flex-shrink-0 flex items-center">
					<Link href ="/" className="text-xl font-bold text-blue-600 dark:text-white">
					Main Page - Logo
					</Link>
				</div>

				{/* DESKTOP VERSION */}
				<div className="hidden md:flex space-x-8 items-center">
					{navItems.map((item) => {
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white"
                  }`}
					  >
						{item.label}
						</Link>
						)
					})
					}
				</div>
				{/* MOBILE - HAMBURGER BUTTON */}
				<div className="flex items-center md:hidden">
					{/* ACCESIBILITY ARIA */}
					<button
						onClick={()=>setIsOpen(!isOpen)}
						type="button"
						className="text-gray-500 hover:text-gray-600 focus:outline-none"
						aria-label="Toggle menu"
						>
					{/* HAMBURGER ICON */}
					 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                		{isOpen ? (
                  			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                		) : (
                  			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                		)}
              </svg>

					</button>

				</div>
				{/* MOBILE ROLL-UP MENU */}
				{isOpen && (<div className="md:hidden bg-gray-50 dark:bg-gray-800 px-2 pt-2 pb-3 space-y-1">
				{navItems.map((item) => {
            	const isActive = pathname === item.href;
            	return (
              		<Link
                	key={item.href}
                	href={item.href}
                	onClick={() => setIsOpen(false)}
                	className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
				</div>)}
			</div>
		</nav>
	)
}
