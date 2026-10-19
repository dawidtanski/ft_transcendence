export interface NavItem{
	label: string;
	href: string;
}

export const navItems: NavItem[] = [
	{ label: "Main page", href: "/" },
	{ label: "Sign in/sign out", href: "/sign-in" },
	{ label: "Leaderboards", href: "/leaderboards" },
	{ label: "Game", href: "/game" },
]

export const userNavItems: NavItem[] = [
	{label: "My Profile", href: "/profile"},
	{label: "My Trophies", href: "/trophies"},
]