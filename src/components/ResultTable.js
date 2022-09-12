import React, {useState} from "react";
import {useTable, useExpanded} from 'react-table';

const parentRowCSS = 'px-1 py-1';
const childRowCSS = 'px-1 py-1 bg-gray-200/20 text-[12px] text-ellipsis text-gray-500';

const Table = ({columns: userColumns, data}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: {expanded},
  } = useTable(
    {
      columns: userColumns,
      data,
    },
    useExpanded
  );

  return(
    <table className="grow font-light text-[13px] border-collapse table-auto text-left overflow-hidden" {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th 
                className="font-medium text-left border-y-[1px] border-gray-200 py-2 px-1 bg-gray-200/20" 
                {...column.getHeaderProps()}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);     
          return(
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td 
                  className={row.depth == 0? parentRowCSS : childRowCSS} 
                  {...cell.getCellProps()}
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

const ResultTable = (props) => {
  const columns = React.useMemo(
    () => [
      {
        id: 'expander',
        // Header: ({getToggleAllRowsExpandedProps, isAllRowsExpanded}) => (
        //   <span {...getToggleAllRowsExpandedProps()}>

        //   </span>
        // ),
        Header: () => null,
        Cell: ({row}) => (row.canExpand? (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                paddingLeft: `${row.depth * 2}rem`,
              },
            })}
            className="font-medium text-gray-300 select-none"
            >
              {row.isExpanded? "v" : ">"}
            </span>
        ) : null),
      },
      {
        Header: 'Path / Node Number',
        columns: [
          {
            Header: '',
            accessor: 'nodeID',
          }
        ],
      },
      {
        Header: 'Component Type',
        columns: [
          {
            Header: '',
            accessor: 'comp',
          }
        ],
      },
      {
        Header: 'Entry',
        columns: [
          {
            Header: 'Branch',
            accessor: 'in',
          },
          {
            Header: 'FlowRate (CMH)',
            accessor: 'inCMH',
          },
        ]
      },
      {
        Header: 'Exit',
        columns: [
          {
            Header: 'Branch',
            accessor: 'out',
          },
          {
            Header: 'FlowRate (CMH)',
            accessor: 'outCMH',
          },
        ]
      },
      {
        Header: 'Pressure Drop (Pa)',
        columns: [
          {
            Header: '',
            accessor: 'pressureDrop',
          }
        ],
      },
    ]
  )
  
  return (
      <Table columns={columns} data={props.displayData} />
  )
}

export default ResultTable