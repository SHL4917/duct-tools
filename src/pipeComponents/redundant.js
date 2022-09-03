import { GenericComponent } from "./genericComponent";

// Declare component types
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
var rectOneToOne = {
  roundIn: false,
  roundOut: false,
  rectIn: true,
  rectOut: true,
  ovalIn: false,
  ovalOut: false,
  oneInput: true,
  oneOutput: true,
  transition: false
};
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

// Commonly Used Functions
const pressureLossFromCoeff = function (data, fields) {
  return fields.lossCoeffMain(data, fields) * fields.velPresIn(data, fields);
};

const entryVelRound = function (data, fields) {
  let ductRadii = data.diameterIn / 2000;
  return data.cmhMainIn / 3600 / (ductRadii ** 2 * 3.14159);
};

const velocityPressureRound = function (data, fields) {
  return (fields.velIn(data, fields) / 4.04) ** 2 * 10;
};

const exitVelRound = function (data, fields) {
  let ductRadii = data.diameterOut / 2000;
  return data.cmhMainOut / 3600 / (ductRadii ** 2 * 3.14159);
};

const velocityPressureRoundOut = function (data, fields) {
  return (fields.velOut(data, fields) / 4.04) ** 2 * 10;
};

// Instantiating Components
let roundDuctStraight = new GenericComponent(
  {
    velIn: entryVelRound,
    velPresIn: velocityPressureRound,
    pressureLoss: function (data, fields) {
      return fields.frictionLoss(data, fields) * data.length;
    },
    frictionLoss: function (data, fields) {
      let ductDia = data.diameterIn;
      let entryVel = fields.velIn(data, fields);
      return (
        67.178 * data.surfaceRoughness * (entryVel ** 1.82 / ductDia ** 1.22)
      );
    }
  },
  roundOneToOne,
  {
    cmhMainIn: true,
    diameterIn: true,
    surfaceRoughness: 0.9,
    velIn: false,
    velPresIn: false,
    length: true
  },
  {
    title: "Circular Duct Section",
    desc: "Placeholder"
  }
);

let ductElbow90 = new GenericComponent(
  {
    velIn: entryVelRound,
    velPresIn: velocityPressureRound,
    lossCoeffMain: function (data, fields) {
      let dia = data.diameter;
      if (dia > 250) {
        return 0.11;
      }
      return 0.35 * Math.exp(-0.00463 * dia);
    },
    pressureLoss: pressureLossFromCoeff
  },
  roundOneToOne,
  {
    cmhMainIn: true,
    diameterIn: true,
    velIn: false,
    velPresIn: false,
    lossCoeffMain: false
  },
  {
    title: "Elbow, Die Stamped, 90 degrees",
    desc: "Placeholder, assumes turn radius to duct diameter as 1.5"
  }
);

let suddenTransition = new GenericComponent(
  {
    velIn: entryVelRound,
    velOut: exitVelRound,
    velPresIn: velocityPressureRound,
    velPresOut: velocityPressureRoundOut,
    pressureLoss: pressureLossFromCoeff,
    lossCoeffMain: function (data, fields) {
      let a = (data.diameterIn / data.diameterOut) ** 2;
      if (a < 1) {
        return (
          0.0472 * a ** 4 - 0.0358 * a ** 3 + 0.7527 * a ** 2 - 1.7645 * a + 1
        );
      }
      return (
        0.0061 * a ** 4 -
        0.1262 * a ** 3 +
        1.2847 * a ** 2 -
        2.1115 * a +
        0.9469
      );
    }
  },
  roundOneToOne,
  {
    cmhMainIn: true,
    diameterIn: true,
    diameterOut: true,
    velIn: false,
    velPresIn: false,
    velOut: false,
    velPresOut: false,
    lossCoeffMain: false
  },
  {
    title: "Sudden Transition, Round to Round",
    desc: "Placeholder, angle fixed at 180 degrees"
  }
);

export { roundDuctStraight, ductElbow90, suddenTransition };
