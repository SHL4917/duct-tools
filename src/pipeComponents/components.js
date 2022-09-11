import * as trialComponents from "./trialComponents";
import * as rectComponents from "./rectComponents";

const components = {
  ...trialComponents,
  ...rectComponents,
}

const componentDesc = {
  flowRates: {
    "cmhMainIn": "In - Main:",
    "cmhSideIn": "In - Branch 1:",
    "cmhSideIn2": "In - Branch 2:",
    "cmhMainOut": "Out - Main:",
    "cmhSideOut": "Out - Branch 1:",
    "cmhSideOut2": "Out - Branch 2:",
  },
  dimensions: {
    "diameterIn": "Diameter In:",
    "diameterOut": "Diameter Out - Main:",
    "diameterOutSide": "Diameter Out - Branch 1:",
    "diameterOutSide2": "Diameter Out - Branch 2:",
    "widthIn": "Width In - Main:",
    "widthOut": "Width Out - Main:",
    "widthOutSide": "Width Out - Branch 1:",
    "widthOutSide2": "Width Out - Branch 2:",
    "heightIn": "Height In - Main:",
    "heightOut": "Height Out - Main:",
    "heightOutSide": "Height Out - Branch 1:",
    "heightOutSide2": "Height Out - Branch 2:",
  },
  others: {
    "frictionLoss": "Friction Loss (Unit lol):",
    "velIn": "Velocity In (m/s) - Main:",
    "velOut": "Velocity Out (m/s) - Main:",
    "velOutSide": "Velocity Out (m/s) - Branch 1:",
    "velOutSide2": "Velocity Out (m/s): - Branch 2:",
    "surfaceRoughness": "Surface Roughness:",
    "length": "Length (m):",
    "aspectRatio": "Aspect Ratio:",
    "turnAngle": "Turn Angle (Deg):",
    "turnRadius": "Turn Radius (mm):",
    "lossCoeffMain": false,
    "lossCoeffSide": false,
    "lossCoeffSide2": false,
    "velPresIn": false,
    "velPresOut": false,
    "velPresOutSide": false,
    "velPresOutSide2": false,
  },
  results: {
    "pressureLossMain": "Pressure Loss (Pa) - Main:",
    "pressureLossSide": "Pressure Loss (Pa) - Branch 1:",
    "pressudeLossSide2": "Pressure Loss (Pa) - Branch 2:",
  },
}

export {
  components,
  componentDesc,
}