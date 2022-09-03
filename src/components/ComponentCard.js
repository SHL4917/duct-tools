import React from "react";
import ComponentForm from "./ComponentForm";


const ComponentCard = (props) => {

  if (props.cardName == null) {
    return <div></div>;
  }

  return (
      <ComponentForm cardName={props.cardName} />
  );
};

export default ComponentCard;
