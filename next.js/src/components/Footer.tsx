import Link from "next/link";
import type { NavItem } from "@/config/navigation";


export default function Footer({links = []}: {links: NavItem[]}) {
  return (
		<footer>
			<nav>
				{links.map((link, index)=>(
					<Link key={index} href={link.href}>
					{link.label}
					</Link>
				))}
			</nav>
		</footer>
  );
}
