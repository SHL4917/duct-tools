import React from "react";

const Triangle = (props) => {
  let height = props.height ?? 5;
  let width = 2 * height * 0.866;
  //let triangleStyle = `w-0 h-0 border-x-transparent border-t-gray-300 border-x-[${parseInt(height)}px] border-t-[${parseInt(width)}px]`;
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