import { GenericComponent } from "./GenericComponent";

 //Naming for each field or data object:
  /*
  flow rate, main duct in (cmh): cmhMainIn
  flow rate, side duct in (cmh): cmhSideIn
  flow rate, other side duct in (cmh): cmhSideIn2
  flow rate, main duct out (cmh): cmhMainOut
  flow rate, side duct out (cmh): cmhSideOut
  flow rate, other side duct out (cmh): cmhSideOut2
  overall pressure loss (Pa): pressureLoss
  friction loss: frictionLoss
  diameter in (mm): diameterIn
  diameter out (mm): diameterOut
  width in (mm): widthIn
  width out (mm): widthOut
  height in (mm): heightIn
  height out (mm): heightOut
  loss coefficient of component: lossCoeff
  loss coefficient of component side duct: lossCoeffSide
  loss coefficiewnt of componetn other side duct: lossCoeffSide2
  entry velocity (m/s): velIn
  exit velocity (m/s): velOut
  velocity pressure in (Pa): velPresIn
  velocity pressure out (Pa): velPresOut
  surface roughness: surfaceRoughness
  component length (m): length
  */

 var roundOneToOne = {
  roundIn: true,
  roundOut: true,
  rectIn: false,
  rectOut: false,
  ovalIn: false,
  ovalOut: false,
  oneInput: true,
  oneOutput: true,
  transition: false
};
var roundOneToTwo = {
  roundIn: true,
  roundOut: true,
  rectIn: false,
  rectOut: false,
  ovalIn: false,
  ovalOut: false,
  oneInput: true,
  oneOutput: false,
  transition: false
};
var roundTwoToOne = {
  roundIn: true,
  roundOut: true,
  rectIn: false,
  rectOut: false,
  ovalIn: false,
  ovalOut: false,
  oneInput: false,
  oneOutput: true,
  transition: false
}

// Instantiating fake components;

let straightPipe = new GenericComponent(
  {
    cmhMainOut: function(data, fields) {
      return data.cmhMainIn;
    },
  },
  roundOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
  },
  {
    title: "Round Straight Duct (Placeholder)",
    desc: "Placeholder description",
  }
);

let divergingPipe = new GenericComponent(
  {
    cmhSideOut: function(data, fields) {
      return data.cmhMainIn - data.cmhMainOut;
    }
  },
  roundOneToTwo,
  {
    cmhMainIn: true,
    cmhMainOut: true,
    cmhSideOut: false,
  },
  {
    title: "Round Diverging Duct (Placeholder)",
    desc: "Placeholder description",
  }
);

let convergingPipe = new GenericComponent(
  {
    cmhMainOut: function(data, fields) {
      return data.cmhMainIn + data.cmhSideIn;
    }
  },
  roundTwoToOne,
  {
    cmhMainIn: true,
    cmhSideIn: true,
    cmhMainOut: false,
  },
  {
    title: "Round Converging Duct (Placeholder)",
    desc: "Placeholder description",
  }
);

let divergingPipe2 = new GenericComponent(
  {
    cmhSideOut2: function(data, fields) {
      return data.cmhMainIn - data.cmhMainOut - data.cmhSideOut;
    }
  },
  roundOneToTwo,
  {
    cmhMainIn: true,
    cmhMainOut: true,
    cmhSideOut: true,
    cmhSideOut2: false,
  },
  {
    title: "Round Diverging Duct 2 (Placeholder)",
    desc: "Placeholder description",
  }
);

export {straightPipe, divergingPipe, divergingPipe2, convergingPipe};