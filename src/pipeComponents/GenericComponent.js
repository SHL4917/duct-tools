class GenericComponent {

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
      "diameterInSide",
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
      "velInSide",
      "velOut",
      "velOutSide",
      "velOutSide2",
      "velPresIn",
      "velPresInSide",
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
