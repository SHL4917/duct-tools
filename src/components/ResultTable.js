import React, {useState} from "react";

const ResultTable = (props) => {
  const [dropdownStatus, setDropdownStatus] = useState(new Array(props.displayData.length).fill(false));
  

  return (
    <div>{JSON.stringify(props.displayData, null, 2)}</div>
  )
}

export default ResultTable