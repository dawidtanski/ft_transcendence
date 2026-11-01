import React, { JSX } from "react";

interface TableProps<T>{
	headers: string[];
	data: T[];
	renderRow: (item: T, index: number) => React.ReactNode;
	getRowKey: (item: T) => string | number;
}

export default function Table<T>({
	headers, data, renderRow, getRowKey,
}: TableProps<T>): JSX.Element {
  return (
		<table>
			<thead>
				<tr>
					{headers.map(header => (
						<th key={header}>{header}</th>))}
				</tr>
			</thead>
			<tbody>
				{data.map((item, index) => (
					<tr key={getRowKey(item)}>{renderRow(item, index)}</tr>
				))}
			</tbody>
			
		</table>
  );
}