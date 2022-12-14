import { GenericComponent } from "./GenericComponent";
import {
  interpolate2D,
  interpolate1D,
  interpolate3D,
} from "../functions/utils";

var rectOneToOne = {
  roundIn: false,
  roundOut: false,
  rectIn: true,
  rectOut: true,
  ovalIn: false,
  ovalOut: false,
  oneInput: true,
  oneOutput: true,
  transition: false,
};
var rectOneToMany = {
  roundIn: false,
  roundOut: false,
  rectIn: true,
  rectOut: true,
  ovalIn: false,
  ovalOut: false,
  oneInput: true,
  oneOutput: false,
  transition: false,
};
var rectManyToOne = {
  roundIn: false,
  roundOut: false,
  rectIn: true,
  rectOut: true,
  ovalIn: false,
  ovalOut: false,
  oneInput: false,
  oneOutput: true,
  transition: false,
};

let straightRectDuct = new GenericComponent(
  {
    cmhMainOut: function (data, fields) {
      return data.cmhMainIn;
    },
    aspectRatio: function (data, fields) {
      return data.widthIn > data.heightIn
        ? data.widthIn / data.heightIn
        : data.heightIn / data.widthIn;
    },
    diameterIn: function (data, fields) {
      return (
        (1.3 * (data.widthIn * data.heightIn) ** 0.625) /
        (data.widthIn + data.heightIn) ** 0.25
      );
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    frictionLoss: function (data, fields) {
      //=IF(G9=0,0,67.178*K9*(L9^1.82/G9^1.22))
      return (
        (67.178 * 0.9 * fields.velIn(data, fields) ** 1.82) /
        fields.diameterIn(data, fields) ** 1.22
      );
    },
    pressureLossMain: function (data, fields) {
      return data.length * fields.frictionLoss(data, fields);
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    aspectRatio: false,
    velIn: false,
    velPresIn: false,
    frictionLoss: false,
    length: true,
    pressureLossMain: false,
    diameterIn: false,
  },
  {
    title: "Duct Section, Rect",
    desc: "Assumes an internal surface roughness of 0.9, equivalent diameter via Huebscher's method, density of air as 1.2 kg/m3",
  }
);

let CR3d1 = new GenericComponent(
  {
    cmhMainOut: function (data, fields) {
      return data.cmhMainIn;
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    pressureLossMain: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    lossCoeffMain: function (data, fields) {
      let angleArray = [0, 20, 30, 45, 60, 75, 90, 110, 130, 150, 180];
      let angleData = [0, 0.31, 0.45, 0.6, 0.78, 0.9, 1, 1.13, 1.2, 1.28, 1.4];
      let radOverWidth = [0.5, 0.75, 1, 1.5, 2];
      let heightOverWidth = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 8];
      let coeffData = [
        [1.53, 1.38, 1.29, 1.18, 1.06, 1, 1, 1.06, 1.12, 1.16, 1.18],
        [0.57, 0.52, 0.48, 0.44, 0.4, 0.39, 0.39, 0.4, 0.42, 0.43, 0.44],
        [0.27, 0.25, 0.23, 0.21, 0.19, 0.18, 0.18, 0.19, 0.2, 0.21, 0.21],
        [0.22, 0.2, 0.19, 0.17, 0.15, 0.14, 0.14, 0.15, 0.16, 0.17, 0.17],
        [0.2, 0.18, 0.16, 0.15, 0.14, 0.13, 0.13, 0.14, 0.14, 0.15, 0.15],
      ];
      let coeff = interpolate2D(
        radOverWidth,
        heightOverWidth,
        coeffData,
        data.turnRadius / data.widthIn,
        data.heightIn / data.widthIn
      );
      let k = interpolate1D(angleArray, angleData, data.turnAngle);
      return coeff * k;
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    velIn: false,
    velPresIn: false,
    pressureLossMain: false,
    lossCoeffMain: false,
    turnAngle: true,
    turnRadius: true,
  },
  {
    title: "CR3-1: Rectangular Elbow, Smooth Radius, Without Vanes",
    desc: "Placeholder lol, should do turn radius = width",
  }
);

let SR5d1 = new GenericComponent(
  {
    cmhSideOut: function (data, fields) {
      return data.cmhMainIn - data.cmhMainOut;
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velOut: function (data, fields) {
      return (
        data.cmhMainOut / 3600 / (data.widthOut * data.heightIn * 0.001 * 0.001)
      );
    },
    velOutSide: function (data, fields) {
      return (
        fields.cmhSideOut(data, fields) /
        3600 /
        (data.widthOutSide * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    velPresOut: function (data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    velPresOutSide: function (data, fields) {
      return 0.5 * 1.2 * fields.velOutSide(data, fields) ** 2;
    },
    lossCoeffMain: function (data, fields) {
      let areaBranchOverIn = [0.25, 0.5, 1];
      let areaStraightOverIn = [0.5, 0.75, 1];
      let flowStraightOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let coeffData = [
        [
          [8.75, 1.913e1, 4.6e1],
          [1.62, 3.38, 9.5],
          [5.0e-1, 1.0, 3.22],
          [1.7e-1, 2.8e-1, 1.31],
          [5.0e-2, 5.0e-2, 5.2e-1],
          [0.0, -2.0e-2, 1.4e-1],
          [-2.0e-2, -2.0e-2, -2.0e-2],
          [-2.0e-2, 0.0, -5.0e-2],
          [0.0, 6.0e-2, -1.0e-2],
        ],

        [
          [7.5, 2.081e1, 3.5e1],
          [1.12, 3.23, 6.75],
          [2.5e-1, 7.5e-1, 2.11],
          [6.0e-2, 1.4e-1, 7.5e-1],
          [5.0e-2, -2.0e-2, 2.4e-1],
          [9.0e-2, -5.0e-2, 0.0],
          [1.4e-1, -5.0e-2, -1.0e-1],
          [1.9e-1, -2.0e-2, -9.0e-2],
          [2.2e-1, 3.0e-2, -4.0e-2],
        ],

        [
          [5.0, 1.688e1, 3.8e1],
          [6.2e-1, 2.81, 7.5],
          [1.7e-1, 6.3e-1, 2.44],
          [8.0e-2, 1.1e-1, 8.1e-1],
          [8.0e-2, -2.0e-2, 2.4e-1],
          [9.0e-2, -5.0e-2, -3.0e-2],
          [1.2e-1, 1.0e-2, -8.0e-2],
          [1.5e-1, 0.0, -6.0e-2],
          [1.9e-1, 7.0e-2, -2.0e-2],
        ],
      ];
      return interpolate3D(
        areaBranchOverIn,
        flowStraightOverIn,
        areaStraightOverIn,
        coeffData,
        data.widthOutSide / data.widthIn,
        data.cmhMainOut / data.cmhMainIn,
        data.widthOut / data.widthIn
      );
    },
    lossCoeffSide: function (data, fields) {
      let areaBranchOverIn = [0.25, 0.5, 1];
      let areaStraightOverIn = [0.5, 0.75, 1];
      let flowBranchOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let coeffData = [
        [
          [3.44, 2.19, 3.44],
          [0.7, 0.55, 0.78],
          [0.3, 0.35, 0.42],
          [0.2, 0.31, 0.33],
          [0.17, 0.33, 0.3],
          [0.16, 0.35, 0.31],
          [0.16, 0.36, 0.4],
          [0.17, 0.37, 0.42],
          [0.18, 0.39, 0.46],
        ],

        [
          [11, 13, 15.5],
          [2.37, 2.5, 3],
          [1.06, 0.89, 1.11],
          [0.64, 0.47, 0.62],
          [0.52, 0.34, 0.48],
          [0.47, 0.31, 0.42],
          [0.47, 0.32, 0.4],
          [0.47, 0.36, 0.42],
          [0.48, 0.43, 0.46],
        ],

        [
          [60, 70, 67],
          [13, 15, 13.75],
          [4.78, 5.67, 5.11],
          [2.06, 2.62, 2.31],
          [0.96, 1.36, 1.28],
          [0.47, 0.78, 0.81],
          [0.31, 0.53, 0.59],
          [0.27, 0.41, 0.47],
          [0.26, 0.36, 0.46],
        ],
      ];
      return interpolate3D(
        areaBranchOverIn,
        flowBranchOverIn,
        areaStraightOverIn,
        coeffData,
        data.widthOutSide / data.widthIn,
        fields.cmhSideOut(data, fields) / data.cmhMainIn,
        data.widthOut / data.widthIn
      );
    },
    pressureLossMain: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    pressureLossSide: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffSide(data, fields)
      );
    },
  },
  rectOneToMany,
  {
    cmhMainIn: true,
    cmhMainOut: true,
    cmhSideOut: false,
    widthIn: true,
    widthOut: true,
    widthOutSide: true,
    heightIn: true,
    velIn: false,
    velOut: false,
    velOutSide: false,
    velPresIn: false,
    velPresOut: false,
    velPresOutSide: false,
    lossCoeffMain: false,
    lossCoeffSide: false,
    pressureLossMain: false,
    pressureLossSide: false,
  },
  {
    title: "SR5-1: Rectangular Smooth Wye, 90deg diverging",
    desc: "Placeholder lol, height is constant throughout",
  }
);

const SR5d11 = new GenericComponent(
  {
    cmhSideOut: function (data, fields) {
      return data.cmhMainIn - data.cmhMainOut;
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velOut: function (data, fields) {
      return (
        data.cmhMainOut /
        3600 /
        (data.widthOut * data.heightOut * 0.001 * 0.001)
      );
    },
    velOutSide: function (data, fields) {
      return (
        fields.cmhSideOut(data, fields) /
        3600 /
        (3.141593 * (data.diameterOutSide * 0.01) ** 2)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    velPresOut: function (data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    velPresOutSide: function (data, fields) {
      return 0.5 * 1.2 * fields.velOutSide(data, fields) ** 2;
    },
    lossCoeffMain: function (data, fields) {
      let coeffData = [
        [
          4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2,
          4.0e-2,
        ],
        [
          9.8e-1, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2,
          4.0e-2,
        ],
        [3.48, 3.1e-1, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2],
        [7.55, 9.8e-1, 1.8e-1, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2],
        [1.318e1, 2.03, 4.9e-1, 1.3e-1, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2],
        [2.038e1, 3.48, 9.8e-1, 3.1e-1, 1.0e-1, 4.0e-2, 4.0e-2, 4.0e-2, 4.0e-2],
        [2.915e1, 5.32, 1.64, 6.0e-1, 2.3e-1, 9.0e-2, 4.0e-2, 4.0e-2, 4.0e-2],
        [3.948e1, 7.55, 2.47, 9.8e-1, 4.2e-1, 1.8e-1, 8.0e-2, 4.0e-2, 4.0e-2],
        [5.137e1, 1.017e1, 3.48, 1.46, 6.7e-1, 3.1e-1, 1.5e-1, 7.0e-2, 4.0e-2],
      ];
      let areaStraightOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let cmhStraightOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      return interpolate2D(
        areaStraightOverIn,
        cmhStraightOverIn,
        coeffData,
        (data.widthOut * data.heightOut) / (data.widthIn * data.heightIn),
        data.cmhMainOut / data.cmhMainIn
      );
    },
    lossCoeffSide: function (data, fields) {
      let coeffData = [
        [1.58, 0.94, 0.83, 0.79, 0.77, 0.76, 0.76, 0.76, 0.75],
        [4.2, 1.58, 1.1, 0.94, 0.87, 0.83, 0.8, 0.79, 0.78],
        [8.63, 2.67, 1.58, 1.2, 1.03, 0.94, 0.88, 0.85, 0.83],
        [14.85, 4.2, 2.25, 1.58, 1.27, 1.1, 1, 0.94, 0.9],
        [22.87, 6.19, 3.13, 2.07, 1.58, 1.32, 1.16, 1.06, 0.99],
        [32.68, 8.63, 4.2, 2.67, 1.96, 1.58, 1.35, 1.2, 1.1],
        [44.3, 11.51, 5.48, 3.38, 2.41, 1.89, 1.58, 1.38, 1.24],
        [57.71, 14.85, 6.95, 4.2, 2.94, 2.25, 1.84, 1.58, 1.4],
        [72.92, 18.63, 8.63, 5.14, 3.53, 2.67, 2.14, 1.81, 1.58],
      ];
      let areaSideOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let cmhSideOverIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      return interpolate2D(
        areaSideOverIn,
        cmhSideOverIn,
        coeffData,
        (3.141592 * data.diameterOutSide ** 2) / (data.widthIn * data.heightIn),
        fields.cmhSideOut(data, fields) / data.cmhMainIn
      );
    },
    pressureLossMain: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    pressureLossSide: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffSide(data, fields)
      );
    },
  },
  rectOneToMany,
  {
    cmhMainIn: true,
    cmhMainOut: true,
    cmhSideOut: false,
    widthIn: true,
    widthOut: true,
    heightIn: true,
    heightOut: true,
    diameterOutSide: true,
    velIn: false,
    velOut: false,
    velOutSide: false,
    velPresIn: false,
    velPresOut: false,
    velPresOutSide: false,
    lossCoeffMain: false,
    lossCoeffSide: false,
    pressureLossMain: false,
    pressureLossSide: false,
  },
  {
    title: "SR5-11: Tee, Rectangular Main to Round Tap, Diverging",
    desc: "Placeholder lol, 90deg angle",
  }
);

const CR9d1 = new GenericComponent(
  {
    cmhMainOut: function (data, fields) {
      return data.cmhMainIn;
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    lossCoeffMain: function (data, fields) {
      let coeffData = [
        [4.0e-2, 3.0e-1, 1.1, 3.0, 8.0, 2.3e1, 6.0e1, 1.0e2, 1.9e2, 9.999e3],
        [4.0e-2, 3.0e-1, 1.1, 3.0, 8.0, 2.3e1, 6.0e1, 1.0e2, 1.9e2, 9.999e3],
        [4.0e-2, 3.0e-1, 1.1, 3.0, 8.0, 2.3e1, 6.0e1, 1.0e2, 1.9e2, 9.999e3],
        [
          4.0e-2, 3.5e-1, 1.25, 3.6, 1.0e1, 2.9e1, 8.0e1, 1.55e2, 2.3e2,
          9.999e3,
        ],
        [
          4.0e-2, 3.5e-1, 1.25, 3.6, 1.0e1, 2.9e1, 8.0e1, 1.55e2, 2.3e2,
          9.999e3,
        ],
      ];
      let heightOverWidth = [0.1, 0.5, 1, 1.5, 2];
      let damperAngle = [0, 10, 20, 30, 40, 50, 60, 75, 70, 90];
      return interpolate2D(
        heightOverWidth,
        damperAngle,
        coeffData,
        data.heightIn / data.widthIn,
        data.turnAngle
      );
    },
    pressureLossMain: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    velIn: false,
    velPresIn: false,
    lossCoeffMain: false,
    pressureLossMain: false,
    turnAngle: true,
  },
  {
    title: "CR9-1: Damper, Butterfly",
    desc: "Placeholder, rect duct, 90deg is fully shut, 0deg is fully open.",
  }
);

const ER5d2 = new GenericComponent(
  {
    cmhMainOut: function (data, fields) {
      return data.cmhMainIn + data.cmhSideIn;
    },
    velIn: function (data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velOut: function (data, fields) {
      return (
        fields.cmhMainOut(data, fields) /
        3600 /
        (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velInSide: function (data, fields) {
      return (
        data.cmhSideIn /
        3600 /
        (data.diameterInSide * data.diameterInSide * 0.0005 * 0.0005 * 3.14159)
      );
    },
    velPresIn: function (data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    velPresOut: function (data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    velPresInSide: function (data, fields) {
      return 0.5 * 1.2 * fields.velInSide(data, fields) ** 2;
    },
    lossCoeffSide: function (data, fields) {
      let coeffData = [
        -14, -2.38, 0.5, 0.65, 1.03, 1.17, 1.19, 1.33, 1.51, 1.44,
      ];
      let cmhSideOverOut = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      return interpolate1D(
        cmhSideOverOut,
        coeffData,
        data.cmhSideIn / fields.cmhMainOut(data, fields)
      );
    },
    lossCoeffMain: function (data, fields) {
      let coeffData = [
        22.15, 11.91, 6.54, 3.74, 2.23, 1.33, 0.76, 0.38, 0.1, 0,
      ];
      let cmhMainOverOut = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      return interpolate1D(
        cmhMainOverOut,
        coeffData,
        data.cmhMainIn / fields.cmhMainOut(data, fields)
      );
    },
    pressureLossMain: function (data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    pressureLossSide: function (data, fields) {
      return (
        fields.velPresInSide(data, fields) * fields.lossCoeffSide(data, fields)
      );
    },
  },
  {
    roundIn: true,
    roundOut: false,
    rectIn: true,
    rectOut: true,
    ovalIn: false,
    ovalOut: false,
    oneInput: false,
    oneOutput: true,
    transition: false,
  },
  {
    cmhMainIn: true,
    cmhMainOut: false,
    cmhSideIn: true,
    velIn: false,
    velOut: false,
    velInSide: false,
    velPresIn: false,
    velPresOut: false,
    velPresInSide: false,
    widthIn: true,
    heightIn: true,
    diameterInSide: true,
    lossCoeffMain: false,
    lossCoeffSide: false,
    pressureLossMain: false,
    pressureLossSide: false,
  },
  {
    title: "ER5-2: Tee, Round Tap to Rectangular Main, Converging",
    desc: "Placeholder!",
  }
);

const ER3d1 = new GenericComponent(
  {
    cmhMainOut: function(data, fields) {
      return data.cmhMainIn;
    },
    velIn: function(data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function(data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [
        [1.76, 1.43, 1.24, 1.14, 1.09, 1.06, 1.06],
        [1.7, 1.36, 1.15, 1.02, 0.95, 0.9, 0.84],
        [1.46, 1.1, 0.9, 0.81, 0.76, 0.72, 0.66],
        [1.5, 1.04, 0.79, 0.69, 0.63, 0.6, 0.55],
      ];
      let heightOverWidth = [0.25, 1, 4, 100];
      let widthInOverWidthOut = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 2.0];
      return interpolate2D(
        heightOverWidth,
        widthInOverWidthOut,
        coeff,
        data.heightIn/data.widthIn,
        data.widthOut/data.widthIn
      )
    },
    pressureLossMain: function(data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    velOut: function(data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthOut * data.heightIn * 0.001 * 0.001)
      );
    }
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    velIn: false,
    velPresIn: false,
    velOut: false,
    widthIn: true,
    heightIn: true,
    widthOut: true,
    lossCoeffMain: false,
    pressureLossMain: false,
  },
  {
    title: "ER3-1: Elbow, 90Deg, Variable Inlet/Outlet Areas",
    desc: "Placeholder! Same height for inlet and outlet"
  }
)

const SR1d1 = new GenericComponent(
  {
    cmhMainOut: function(data, fields) {
      return data.cmhMainIn;
    },
    velOut: function(data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthOut * data.heightOut * 0.001 * 0.001)
      );
    },
    velPresOut: function(data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
        [0.5, 0.47, 0.45, 0.43, 0.41, 0.4, 0.42, 0.45, 0.5],
        [0.5, 0.45, 0.41, 0.36, 0.33, 0.3, 0.35, 0.42, 0.5],
        [0.5, 0.42, 0.35, 0.3, 0.26, 0.23, 0.3, 0.4, 0.5],
        [0.5, 0.39, 0.32, 0.25, 0.22, 0.18, 0.27, 0.38, 0.5],
        [0.5, 0.37, 0.27, 0.2, 0.16, 0.15, 0.25, 0.37, 0.5],
        [0.5, 0.27, 0.18, 0.13, 0.11, 0.12, 0.23, 0.36, 0.5],
      ];
      let hydraulicDOut = (2 * data.widthOut * data.heightOut)/(data.widthOut + data.heightOut);
      let lOverD = [0, 0.025, 0.05, 0.075, 0.1, 0.15, 0.6];
      let angle = [0, 10, 20, 30, 40, 60, 100, 140, 180];
      return interpolate2D(
        lOverD,
        angle,
        coeff,
        data.contractionLength/hydraulicDOut,
        data.contractionAngle
      )
    },
    pressureLossMain: function(data, fields) {
      return (
        fields.velPresOut(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    velOut: false,
    velPresOut: false,
    widthOut: true,
    heightOut: true,
    contractionAngle: {
      newField: true,
      desc: "Contraction Angle (Deg): ",
    },
    contractionLength: {
      newField: true,
      desc: "Contraction Length (Deg): ",
    },
    lossCoeffMain: false,
    pressureLossMain: false,
  },
  {
    title: "SR1-1: Sudden Contraction, Plenum to Rectangular",
    desc: "Placeholder!"
  }
)

const SR5d5 = new GenericComponent(
  {
    cmhMainOut: function(data, fields) {
      return data.cmhMainIn - data.cmhSideOut;
    },
    velIn: function(data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresIn: function(data, fields) {
      return 0.5 * 1.2 * fields.velIn(data, fields) ** 2;
    },
    velOut: function(data, fields) {
      return (
        fields.cmhMainOut(data, fields) / 3600 / (data.widthIn * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresOut: function(data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    velOutSide: function(data, fields) {
      return (
        data.cmhSideOut / 3600 / (data.widthOutSide * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresOutSide: function(data, fields) {
      return 0.5 * 1.2 * fields.velOutSide(data, fields) ** 2;
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [32.40, 6.40, 2.18, 0.90, 0.40, 0.18, 0.07, 0.03, 0];
      let cmhMainOutOverCmhIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1];
      return interpolate1D(
        cmhMainOutOverCmhIn,
        coeff,
        fields.cmhMainOut(data, fields) / data.cmhMainIn
      )
    },
    lossCoeffSide: function(data, fields) {
      let coeff = [
        [2.06, 1.2, 0.99, 0.87, 0.88, 0.87, 0.87, 0.86, 0.86],
        [5.15, 1.92, 1.29, 1.03, 0.99, 0.94, 0.92, 0.9, 0.89],
        [10.3, 3.12, 1.78, 1.28, 1.16, 1.06, 1.01, 0.97, 0.94],
        [15.9, 4.35, 2.24, 1.48, 1.11, 0.88, 0.8, 0.75, 0.72],
        [24.31, 6.31, 3.04, 1.9, 1.35, 1.03, 0.91, 0.83, 0.78],
        [34.6, 8.7, 4.03, 2.41, 1.65, 1.22, 1.04, 0.94, 0.87],
        [46.75, 11.53, 5.19, 3.01, 2, 1.44, 1.2, 1.06, 0.96],
        [60.78, 14.79, 6.53, 3.7, 2.4, 1.69, 1.38, 1.2, 1.07],
        [76.67, 18.49, 8.05, 4.49, 2.86, 1.98, 1.59, 1.36, 1.2],
      ];
      let areaBranchOverAreaIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let cmhBranchOverCmhIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      return interpolate2D(
        areaBranchOverAreaIn,
        cmhBranchOverCmhIn,
        coeff,
        data.widthOutSide/data.widthIn,
        data.cmhSideOut/data.cmhMainIn
      )
    },
    pressureLossMain: function(data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields)
      );
    },
    pressureLossSide: function(data, fields) {
      return (
        fields.velPresIn(data, fields) * fields.lossCoeffSide(data, fields)
      );
    }
  },
  rectOneToMany,
  {
    widthIn: true,
    heightIn: true,
    widthOutSide: true,
    velIn: false,
    velPresIn: false,
    velOut: false,
    velPresOut: false,
    velOutSide: false,
    velPresOutSide: false,
    cmhMainIn: true,
    cmhMainOut: false,
    cmhSideOut: true,    
    lossCoeffMain: false,
    pressureLossMain: false,
    lossCoeffSide: false,
    pressureLossSide: false,
  },
  {
    title: "SR5-5: Tee, diverging",
    desc: "Placeholder! As + Ab > Ac, As = Ac, width and height in and out through main is the same, height out through branch is the same"
  }
)

export {
  straightRectDuct,
  CR3d1,
  SR5d1,
  SR5d11,
  CR9d1,
  ER5d2,
  ER3d1,
  SR1d1,
  SR5d5
};
