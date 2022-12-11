import React from "react";
import { useState } from "react";
import * as trialComponents from "../pipeComponents/trialComponents";
import {components} from "../pipeComponents/components";

const ComponentList = (props) => {
  let keyList = Object.keys(components);
  let renderCard = (e) => {
    let cardName = e.target.getAttribute('keyval');
    props.selectCard(cardName);
  }
  // Have to pass two {key} values to the list as the key attribute is react's internal one, cannot be accessed
  // Custom keyVal attribute enables access of the key (AKA component name)
  return (
    <ul>
      {keyList.map((key) => (
        <li key={key} keyval={key} className="transition-colors rounded p-[4px] font-light text-[12px] hover:bg-orange-300 hover:text-white" onClick={renderCard}>
          {components[key].text.title}
        </li>
      ))}
    </ul>
  );
};

export default ComponentList;
