class GenericComponent {
 //Naming for each field or data object:
  /*
  flow rate, main duct in (cmh): cmhMainIn
  flow rate, side duct in (cmh): cmhSideIn
  flow rate, other side duct in (cmh): cmhSideIn2
  flow rate, main duct out (cmh): cmhMainOut
  flow rate, side duct out (cmh): cmhSideOut
  flow rate, other side duct out (cmh): cmhSideOut2
  overall pressure loss (Pa): pressureLossMain
  side pressure loss (Pa): pressureLossSide
  side2 pressure loss (Pa): pressureLossSide2
  friction loss: frictionLoss
  diameter in (mm): diameterIn
  diameter out (mm): diameterOut
  diameter out side (mm): diameterOutSide
  diameter out side 2 (mm): diameterOutSide2
  width in (mm): widthIn
  width out (mm): widthOut
  width out side (mm): widthOutSide
  widh out side 2 (mm): widthOutSide2
  height in (mm): heightIn
  height out (mm): heightOut
  height out side (mm): heightOutSide
  height out side 2 (mm): heightOutSide2
  loss coefficient of component: lossCoeff
  loss coefficient of component side duct: lossCoeffSide
  loss coefficiewnt of componetn other side duct: lossCoeffSide2
  entry velocity (m/s): velIn
  exit velocity (m/s): velOut
  exit velocity side (m/s): velOutSide
  exit velocity side 2 (m/s): velOutSide2
  velocity pressure in (Pa): velPresIn
  velocity pressure out (Pa): velPresOut
  velocity pressure out side (Pa): velPresOutSide
  velocity pressure out side 2 (Pa): velPresOutSide2
  surface roughness: surfaceRoughness
  component length (m): length
  aspect ratio (Longer side over shorter side): aspectRatio
  turn angle (degrees): turnAngle
  turn radius (mm): turnRadius
  */

  constructor(fields, type, reqInput, text = { title: "", desc: "" }) {
    this.fields = fields;
    this.type = type;
    this.reqInput = reqInput;
    this.text = text;

    // Default field values
    this.fieldNames = [
      "cmhMainIn",
      "cmhSideIn",
      "cmhSideIn2",
      "cmhMainOut",
      "cmhSideOut",
      "cmhSideOut2",
      "pressureLossMain",
      "pressureLossSide",
      "pressudeLossSide2",
      "frictionLoss",
      "diameterIn",
      "diameterOut",
      "diameterOutSide",
      "diameterOutSide2",
      "widthIn",
      "widthOut",
      "widthOutSide",
      "widthOutSide2",
      "heightIn",
      "heightOut",
      "heightOutSide",
      "heightOutSide2",
      "lossCoeffMain",
      "lossCoeffSide",
      "lossCoeffSide2",
      "velIn",
      "velOut",
      "velOutSide",
      "velOutSide2",
      "velPresIn",
      "velPresOut",
      "velPresOutSide",
      "velPresOutSide2",
      "surfaceRoughness",
      "length",
      "aspectRatio",
      "turnAngle",
      "turnRadius",
    ];

    // Default type values
    this.typeNames = [
      "roundIn",
      "roundOut",
      "rectIn",
      "rectOut",
      "ovalIn",
      "ovalOut",
      "oneInput",
      "oneOutput",
      "transition",
    ];

    this.validateFields(type, this.typeNames);
    this.validateFields(fields, this.fieldNames);
    this.validateFields(reqInput, this.fieldNames);
    this.validateMethods(fields, reqInput);
  }

  getPressureLoss(data, branch) {
    this.validateFields(data, this.fieldNames);
    return this.fields[branch](data, this.fields);
  }

  validateFields(obj, fieldNames) {
    let arr = Object.keys(obj);
    for (let field of arr) {
      if (!fieldNames.includes(field)) {
        throw new Error(
          `Field ${field} in object arguments is not a valid field!`
        );
      }
    }
  }
  validateMethods(fields, reqInput) {
    let arr = Object.keys(reqInput);
    let fieldArr = Object.keys(fields);
    for (let fieldName of arr) {
      if (!reqInput[fieldName]) {
        if (!fieldArr.includes(fieldName)) {
          throw new Error(
            `Field ${fieldName} has no corresponding calculating method specified!`
          );
        }
      }
    }
  }
}

export { GenericComponent };
