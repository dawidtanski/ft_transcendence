import Table from "./Table";
import { getBestUsers } from "@/db/queries/users";

export default function Leaderboards() {
  return (
		<>
		<Table()/>
		</>
  );
}