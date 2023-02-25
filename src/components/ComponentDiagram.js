import React from "react";
import { useEffect } from "react";
import { useRef } from "react";

const importAll = (r) => {
  let diagrams = {};
  r.keys().map((key, index) => {
    diagrams[key.replace(".svg", "").replace("./", "")] = r(key);
  });
  return diagrams;
};

const diagrams = importAll(
  require.context("../ductDiagrams/", false, /\.(png|jpe?g|svg)$/)
);

const ComponentDiagram = (props) => {
  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  if (!diagrams[props.compName]) {
    props.toggle(false)
  }
  const closeWindow = () => {
    props.toggle(false);
  };

  return (
    <div
      style={{ display: props.display ? "block" : "none" }}
      className="absolute bg-gray-100 top-0 left-0 w-screen h-screen bg-gray-300 bg-opacity-50 z-50"
    >
      <div
        className="bg-gray-100 border-gray-300 border-[1px] rounded-[10px] p-4 shadow-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-60"
      >
        <img src={diagrams[props.compName]} className="scale-[2.5]" />
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
