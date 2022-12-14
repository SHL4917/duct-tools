import * as rectComponents from "./rectComponents";

const components = {
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
    "diameterInSide": "Diameter In - Branch 1:",
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
    "velInSide": "Velocity - Branch 1 (m/s) - Main:",
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
    "velPresInSide": false,
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
// loop over to add custom fields!
let keys = Object.keys(components);
let componentDescAll = {...componentDesc.flowRates, ...componentDesc.dimensions, ...componentDesc.others, ...componentDesc.results}
keys.forEach((key) => {
  let fields = Object.keys(components[key].reqInput);
  fields.forEach((field) => {
    if (!componentDescAll[field] && components[key].reqInput[field].newField) {
      componentDesc.others[field] = components[key].reqInput[field].desc;
    }
  })
})

export {
  components,
  componentDesc,
}