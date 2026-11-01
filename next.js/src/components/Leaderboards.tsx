import Table from "./Table";
import { getBestUsers } from "@/db/queries/users";

export default async function Leaderboards() {
	const users = await getBestUsers();
  return (
		<Table
		headers={["Rank", "Player", "Score",]}
		data={users}
		getRowKey={(user) => user.id }
		renderRow={(user, index) => (
			<>
				<td>{index + 1}</td>
				<td>{user.nickname}</td>
				<td>{user.points}</td>
			</>
		)}
		/>
  );
}