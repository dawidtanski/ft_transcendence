export interface NavItem{
	label: string;
	href: string;
}

export const navItems: NavItem[] = [
	{ label: "Main page", href: "/" },
	{ label: "Game", href: "/game" },
	{ label: "Sign in/sign out", href: "/sign-in" },
	{ label: "Leaderboards", href: "/leaderboards" },
]

export const userNavItems: NavItem[] = [
	{label: "My Profile", href: "/profile"},
	{label: "My Trophies", href: "/trophies"},
]

export const footerNavItems: NavItem[] = [
	{label: "About", href: "/about"},
	{label: "How to play?", href: "/how-to-play"},
	{label: "App Github", href: "/app-github"},
	{label: "Privacy Policy", href: "/privacy"},
]