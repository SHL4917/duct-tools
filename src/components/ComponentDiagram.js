import React from "react";
import { useState } from "react";
import { useRef } from "react";
import * as Diagrams from "../ductDiagramsComponents/index"

const ComponentDiagram = (props) => {
  
  if (!Diagrams[props.compName]) {
    props.toggle(false)
    console.log("No Diagram!")
    console.log(props.compName)
  }
  const closeWindow = () => {
    props.toggle(false);
  };

  let ToRender = Diagrams[props.compName]

  return (
    <div
      style={{ display: props.display ? "block" : "none" }}
      className="absolute bg-gray-100 top-0 left-0 w-screen h-screen bg-gray-300 bg-opacity-50 z-50"
    >
      <div
        className="bg-gray-100 border-gray-300 border-[1px] rounded-[10px] p-4 w-[800px] h-fit shadow-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60"
      >
        <ToRender />
        <div
          className="font-medium text-black text-center border-[1px] border-gray-300 text-[12px] p-1 rounded select-none
          hover:border-black grow-0"
          onClick={closeWindow}
        >
          Close
        </div>
      </div>
    </div>
  );
};

export default ComponentDiagram;
