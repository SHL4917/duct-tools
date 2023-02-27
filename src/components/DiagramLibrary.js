import React from "react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import * as Diagrams from "../ductDiagramsComponents/index"

const getCompList = (toggleFunc, selectFunc) => {
  let list = []
  let keys = Object.keys(Diagrams)
  keys.forEach((key) => {
    if(selectFunc(key)) {
      list.push(
        <li className="text-black" key={key} onClick={() => toggleFunc(key)}>{key}</li>
      )
    } else {
      list.push(
        <li className="text-gray-300 hover:text-gray-500" key={key} onClick={() => toggleFunc(key)}>{key}</li>
      )
    }
    
  })
  return (
    <ul>
      {list}
    </ul>
  )
}

const DiagramLibrary = (props) => {
  const [displayComp, setDisplayComp] = useState("")

  const closeWindow = () => {
    props.toggle(false);
  };

  const getRender = () => {
    let ToRender = Diagrams[displayComp]
    return ToRender ? <ToRender/> : <div>Nothing!</div>
  }

  const compList = getCompList(setDisplayComp, (key) => {return key == displayComp})

  return (
    <div
      style={{ display: props.display ? "block" : "none" }}
      className="absolute bg-gray-100 top-0 left-0 w-screen h-screen bg-gray-300 bg-opacity-50 z-50"
    >
      <div
        className="flex flex-row bg-gray-100 border-gray-300 border-[1px] rounded-[10px] p-4 w-[1000px] h-[750px] shadow-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60"
      > 
        <div className="overflow-auto">
          {compList}
        </div>
        <div className="border-r-[1px] border-gray-200 h-[100%] mx-2" ></div>
        <div className="width-full grow flex flex-col">
          {getRender()}
          <div className="grow"></div>
          <div
            className="font-medium text-black text-center border-[1px] border-gray-300 text-[12px] p-1 rounded select-none
            hover:border-black grow-0 shrink-0"
            onClick={closeWindow}
          >
            Close
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramLibrary;
