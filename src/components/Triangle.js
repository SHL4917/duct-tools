import React from "react";

const Triangle = (props) => {
  let triangleStyle = `w-0 h-0 border-x-transparent border-x-[4px]`;

  if (props.up) {
    triangleStyle +=  " border-b-white border-b-[6px]"
  } else {
    triangleStyle += " border-t-white border-t-[6px]"
  }

  return(
    <div className={triangleStyle} onClick={props.onClick}></div>
  );
}

export default Triangle;