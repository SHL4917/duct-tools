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

let Cr3D1 = new GenericComponent(
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

let Sr5D1 = new GenericComponent(
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

const Sr5D11 = new GenericComponent(
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
  {
    roundIn: false,
    roundOut: true,
    rectIn: true,
    rectOut: true,
    ovalIn: false,
    ovalOut: false,
    oneInput: true,
    oneOutput: false,
    transition: true,
  },
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

const Cr9D1 = new GenericComponent(
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

const Er5D2 = new GenericComponent(
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
    transition: true,
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

const Er3D1 = new GenericComponent(
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

const Sr1D1 = new GenericComponent(
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

const Sr5D5 = new GenericComponent(
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

const Sr4D1 = new GenericComponent(
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
    velOut: function(data, fields) {
      return (
        fields.cmhMainOut(data, fields) / 3600 / (data.widthIn * data.heightOut * 0.001 * 0.001)
      );
    },
    velPresOut: function(data, fields) {
      return 0.5 * 1.2 * fields.velOut(data, fields) ** 2;
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [
        [
          0.0, 1.2e-1, 9.0e-2, 5.0e-2, 5.0e-2, 5.0e-2, 5.0e-2, 6.0e-2, 8.0e-2,
          1.9e-1, 2.9e-1, 3.7e-1, 4.3e-1,
        ],
        [
          0.0, 1.1e-1, 9.0e-2, 5.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 6.0e-2, 7.0e-2,
          1.9e-1, 2.8e-1, 3.6e-1, 4.2e-1,
        ],
        [
          0.0, 1.0e-1, 8.0e-2, 5.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 6.0e-2, 7.0e-2,
          1.8e-1, 2.7e-1, 3.6e-1, 4.1e-1,
        ],
        [
          0.0, 8.0e-2, 9.0e-2, 6.0e-2, 4.0e-2, 4.0e-2, 4.0e-2, 6.0e-2, 7.0e-2,
          1.2e-1, 1.7e-1, 2.0e-1, 2.7e-1,
        ],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
        [
          0.0, 6.4e-1, 9.6e-1, 5.4e-1, 5.2e-1, 6.2e-1, 9.4e-1, 1.4, 1.48, 1.52,
          1.48, 1.44, 1.4,
        ],
        [
          0.0, 4.16, 4.64, 2.72, 3.09, 4.0, 6.72, 9.6, 1.088e1, 1.12e1, 1.12e1,
          1.088e1, 1.056e1,
        ],
        [
          0.0, 1.224e1, 1.008e1, 7.38, 8.1, 1.08e1, 1.728e1, 2.34e1, 2.736e1,
          2.988e1, 2.988e1, 2.934e1, 2.88e1,
        ],
        [
          0.0, 4.05e1, 2.72e1, 2.33e1, 2.51e1, 3.4e1, 5.284e1, 6.9e1, 8.25e1,
          9.35e1, 9.35e1, 9.24e1, 9.13e1,
        ],
        [
          0.0, 1.1264e2, 6.835e1, 6.374e1, 6.784e1, 9.293e1, 1.4213e2, 1.8253e2,
          2.2016e2, 2.5421e2, 2.5421e2, 2.519e2, 2.496e2,
        ],
      ];
      let heightOutoverHeightIn = [0.1, 0.167, 0.25, 0.5, 1, 2, 4, 6, 10, 16];
      let angle = [0, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180];
      return interpolate2D(
        heightOutoverHeightIn,
        angle,
        coeff,
        data.heightOut/data.heightIn,
        data.transitionAngle
      );
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    heightOut: true,
    velIn: false,
    velPresIn: false,
    velOut: false,
    velPresOut: false,
    lossCoeffMain: false,
    pressureLossMain: false,
    transitionAngle: {
      newField: true,
      desc: "Transition Angle (deg): "
    } 
  },
  {
    title: "SR4-1: Transition, Rectangular, Two Sides Parallel",
    desc: "Placeholder! Symmetrical duct, same width, variable height"
  }
)

const Sr5D3 = new GenericComponent(
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
        fields.cmhMainOut(data, fields) / 3600 / (data.widthOutSide * data.heightIn * 0.001 * 0.001)
      );
    },
    velPresOutSide: function(data, fields) {
      return 0.5 * 1.2 * fields.velOutSide(data, fields) ** 2;
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [32.4, 6.4, 2.18, 0.9, 0.4, 0.18, 0.07, 0.03, 0];
      let cmhMainOutOverCmhMainIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      return interpolate1D(
        cmhMainOutOverCmhMainIn,
        coeff,
        fields.cmhMainOut(data, fields)/data.cmhMainIn
      )
    },
    lossCoeffSide: function(data, fields) {
      let coeff = [
        [0.6, 0.52, 0.57, 0.58, 0.64, 0.67, 0.7, 0.71, 0.73],
        [2.24, 0.56, 0.44, 0.45, 0.51, 0.54, 0.58, 0.6, 0.62],
        [5.93, 1.08, 0.52, 0.41, 0.43, 0.46, 0.49, 0.52, 0.54],
        [10.61, 1.89, 0.72, 0.43, 0.34, 0.31, 0.31, 0.33, 0.34],
        [17.7, 3.23, 1.14, 0.59, 0.4, 0.31, 0.3, 0.3, 0.31],
        [26.66, 5.01, 1.75, 0.84, 0.5, 0.36, 0.31, 0.3, 0.3],
        [37.49, 7.22, 2.53, 1.17, 0.66, 0.43, 0.35, 0.32, 0.3],
        [50.2, 9.87, 3.49, 1.61, 0.88, 0.54, 0.41, 0.35, 0.32],
        [64.77, 12.95, 4.63, 2.13, 1.14, 0.69, 0.5, 0.4, 0.35],
      ];
      let widthOutOverWidthIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      let cmhSideOutOverCmhMainIn = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
      return interpolate2D(
        widthOutOverWidthIn,
        cmhSideOutOverCmhMainIn,
        coeff,
        data.widthOutSide/data.widthIn,
        data.cmhSideOut/data.cmhMainIn
      )
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    },
    pressureLossSide: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffSide(data, fields);
    },
  },
  rectOneToMany,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    cmhSideOut: true,
    widthIn: true,
    heightIn: true,
    widthOutSide: true,
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
    title: "SR5-3: Diverging Wye, 45 Degrees",
    desc: "Placeholder! Same height throughout, same width through main"
  }
)

const Sr5D13 = new GenericComponent(
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
        fields.cmhMainOut(data, fields) / 3600 / (data.widthOut * data.heightOut * 0.001 * 0.001)
      );
    },
    velOutSide: function(data, fields) {
      return (
        data.cmhSideOut / 3600 / (data.widthOutSide * data.heightOutSide * 0.001 * 0.001)
      );
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [
        [4.0e-2, 1.0e-2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [9.8e-1, 4.0e-2, 1.0e-2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [3.48, 3.1e-1, 4.0e-2, 1.0e-2, 0.0, 0.0, 0.0, 0.0, 0.0],
        [7.55, 9.8e-1, 1.8e-1, 4.0e-2, 2.0e-2, 0.0, 0.0, 0.0, 0.0],
        [1.318e1, 2.03, 4.9e-1, 1.3e-1, 4.0e-2, 0.0, 1.0e-2, 0.0, 0.0],
        [2.038e1, 3.48, 9.8e-1, 3.1e-1, 1.0e-1, 4.0e-2, 2.0e-2, 1.0e-2, 0.0],
        [2.915e1, 5.32, 1.64, 6.0e-1, 2.3e-1, 9.0e-2, 4.0e-2, 2.0e-2, 1.0e-2],
        [3.948e1, 7.55, 2.47, 9.8e-1, 4.2e-1, 1.8e-1, 8.0e-2, 4.0e-2, 2.0e-2],
        [5.137e1, 1.017e1, 3.48, 1.46, 6.7e-1, 3.1e-1, 1.5e-1, 7.0e-2, 4.0e-2],
      ];
      return interpolate2D(
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        coeff,
        (data.widthOut * data.heightOut)/(data.widthIn * data.heightIn),
        fields.cmhMainOut(data, fields)/data.cmhMainIn
      )
    },
    lossCoeffSide: function(data, fields) {
      let coeff = [[ 0.32,  0.33,  0.32,  0.34,  0.32,  0.37,  0.38,  0.39,  0.4 ],
      [ 0.31,  0.32,  0.41,  0.34,  0.32,  0.32,  0.33,  0.34,  0.35],
      [ 1.86,  1.65,  0.73,  0.47,  0.37,  0.34,  0.32,  0.32,  0.32],
      [ 3.56,  3.1 ,  1.28,  0.73,  0.51,  0.41,  0.36,  0.34,  0.32],
      [ 5.74,  4.93,  2.07,  1.12,  0.73,  0.54,  0.44,  0.38,  0.35],
      [ 8.48,  7.24,  3.1 ,  1.65,  1.03,  0.73,  0.56,  0.47,  0.41],
      [11.75, 10.  ,  4.32,  3.31,  1.42,  0.98,  0.73,  0.58,  0.49],
      [15.57, 13.22,  5.74,  3.1 ,  1.9 ,  1.28,  0.94,  0.73,  0.6 ],
      [19.92, 16.9 ,  7.38,  4.02,  2.46,  1.65,  1.19,  0.91,  0.73]];
      return interpolate2D(
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
        coeff,
        (data.widthOutSide * data.heightOutSide)/(data.widthIn * data.heightIn),
        data.cmhSideOut/data.cmhMainIn
      )
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    },
    pressureLossSide: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffSide(data, fields);
    }
  },
  rectOneToMany,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    cmhSideOut: true,
    widthIn: true,
    heightIn: true,
    widthOut: true,
    heightOut: true,
    widthOutSide: true,
    heightOutSide: true,
    velIn: false,
    velOut: false,
    velOutSide: false,
    velPresIn: false,
    lossCoeffMain: false,
    lossCoeffSide: false,
    pressureLossMain: false,
    pressureLossSide: false,
  },
  {
    title: "SR5-13: Diverging Tee, 45 Degree Entry",
    desc: "Placeholder! Assumes tee transition of 0.25 tee exit width"
  }
);

const Cr3D6 = new GenericComponent(
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
      let angle = data.turnAngle % 360
      let coeff = [[0.08, 0.08, 0.08, 0.07, 0.07, 0.07, 0.06, 0.06, 0.05, 0.05, 0.05],
      [0.18, 0.17, 0.17, 0.16, 0.15, 0.15, 0.13, 0.13, 0.12, 0.12, 0.11],
      [0.38, 0.37, 0.36, 0.34, 0.33, 0.31, 0.28, 0.27, 0.26, 0.25, 0.24],
      [0.6 , 0.59, 0.57, 0.55, 0.52, 0.49, 0.46, 0.43, 0.41, 0.39, 0.38],
      [0.89, 0.87, 0.84, 0.81, 0.77, 0.73, 0.67, 0.63, 0.61, 0.58, 0.57],
      [1.3 , 1.27, 1.23, 1.18, 1.13, 1.07, 0.98, 0.92, 0.89, 0.85, 0.83]];
      return interpolate2D(
        [20, 30, 45, 60, 75, 90],
        [0.25, 0.50, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 8],
        coeff,
        angle,
        data.heightIn/data.widthIn,
      )
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    turnAngle: true,
    velIn: false,
    velPresIn: false,
    lossCoeffMain: false,
    pressureLossMain: false,
  },
  {
    title: "CR3-6: Elbow, Mitered",
    desc: "Constant width and height, variable turn angle from 20-90deg, w.r.t. incoming flow"
  }
)

const Cr3D9 = new GenericComponent(
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
      return 0.11;
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
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
  },
  {
    title: "CR3-9: Elbow, Mitered, 90 Degrees, 40mm-Spaced Vanes (Single-Thickness)",
    desc: "Const loss coefficient of 0.11"
  }
)

const Cr3D12 = new GenericComponent(
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
      return 0.33;
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
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
  },
  {
    title: "CR3-12: Elbow, Mitered, 90 Degrees, 80mm-Spaced Vanes (Single-Thickness)",
    desc: "Const loss coefficient of 0.33"
  }
)

const Cr3D15 = new GenericComponent(
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
      return 0.25;
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
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
  },
  {
    title: "CR3-15: Elbow, Mitered, 90 Degrees, 60mm-Spaced Vanes (Double-Thickness)",
    desc: "Const loss coefficient of 0.25"
  }
)

const Cr3D16 = new GenericComponent(
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
      return 0.41;
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    }
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
  },
  {
    title: "CR3-16: Elbow, Mitered, 90 Degrees, 80mm-Spaced Vanes (Double-Thickness)",
    desc: "Const loss coefficient of 0.41"
  }
)

const Cr3D17 = new GenericComponent(
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
      let hydraulicD = 0.001 * 2 * (data.widthIn * data.heightIn) / (data.widthIn + data.heightIn);
      let reynolds = (1.2 * fields.velIn(data, fields) * hydraulicD) / 18.32;
      let correctionFactor = interpolate1D(
        [10, 20, 30, 40, 60, 80, 100, 140, 500],
        [1.4, 1.26, 1.19, 1.14, 1.09, 1.06, 1.04, 1, 1],
        reynolds/1000
      );
      let coeff = [
        [
          0, 0.68, 0.99, 1.77, 2.89, 3.97, 4.41, 4.6, 4.64, 4.6, 3.39, 3.03,
          2.7,
        ],
        [
          0, 0.66, 0.96, 1.72, 2.81, 3.86, 4.29, 4.47, 4.52, 4.47, 3.3, 2.94,
          2.62,
        ],
        [
          0, 0.64, 0.94, 1.67, 2.74, 3.75, 4.17, 4.35, 4.39, 4.35, 3.2, 2.86,
          2.55,
        ],
        [
          0, 0.62, 0.9, 1.61, 2.63, 3.61, 4.01, 4.18, 4.22, 4.18, 3.08, 2.75,
          2.45,
        ],
        [
          0, 0.59, 0.86, 1.53, 2.5, 3.43, 3.81, 3.97, 4.01, 3.97, 2.93, 2.61,
          2.33,
        ],
        [
          0, 0.56, 0.81, 1.45, 2.37, 3.25, 3.61, 3.76, 3.8, 3.76, 2.77, 2.48,
          2.21,
        ],
        [0, 0.51, 0.75, 1.34, 2.18, 3, 3.33, 3.47, 3.5, 3.47, 2.56, 2.28, 2.03],
        [
          0, 0.48, 0.7, 1.26, 2.05, 2.82, 3.13, 3.26, 3.29, 3.26, 2.4, 2.15,
          1.91,
        ],
        [
          0, 0.45, 0.65, 1.16, 1.89, 2.6, 2.89, 3.01, 3.04, 3.01, 2.22, 1.98,
          1.76,
        ],
        [
          0, 0.43, 0.63, 1.13, 1.84, 2.53, 2.81, 2.93, 2.95, 2.93, 2.16, 1.93,
          1.72,
        ],
      ];
      return correctionFactor * interpolate2D(
        [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8],
        [0, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 4, 8, 10],
        coeff,
        data.heightIn/data.widthIn,
        data.length/data.widthIn
      )
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    length: true,
    velIn: false,
    velPresIn: false,
    lossCoeffMain: false,
    pressureLossMain: false,
  },
  {
    title: "CR3-17: Elbow, Z-Shaped",
    desc: "Constant cross sectional shape, length refers to drop-length"
  }
)

const Sr3D1 = new GenericComponent(
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
    velOut: function(data, fields) {
      return (
        data.cmhMainIn / 3600 / (data.widthOut * data.heightIn * 0.001 * 0.001)
      );
    },
    lossCoeffMain: function(data, fields) {
      let coeff = [[0.63, 0.92, 1.24, 1.64, 2.14, 2.71, 4.24],
      [0.61, 0.87, 1.15, 1.47, 1.86, 2.3 , 3.36],
      [0.53, 0.7 , 0.9 , 1.17, 1.49, 1.84, 2.64],
      [0.54, 0.67, 0.79, 0.99, 1.23, 1.54, 2.2 ]];
      return interpolate2D(
        [0.25, 1, 4, 100],
        [0.6, 0.8, 1, 1.2, 1.4, 1.6, 2],
        coeff,
        data.heightIn/data.widthIn,
        data.widthOut/data.widthIn
      )
    },
    pressureLossMain: function(data, fields) {
      return fields.velPresIn(data, fields) * fields.lossCoeffMain(data, fields);
    },
  },
  rectOneToOne,
  {
    cmhMainIn: true,
    cmhMainOut: false,
    widthIn: true,
    heightIn: true,
    widthOut: true,
    velIn: false,
    velPresIn: false,
    velOut: false,
    lossCoeffMain: false,
    pressureLossMain: false,
  },
  {
    title: "SR3-1: Elbow. 90deg, Variable Inlet and Outlet Areas",
    desc: "Constant height, variable width"
  }
)

export {
  straightRectDuct,
  Cr3D1,
  Sr5D1,
  Sr5D11,
  Cr9D1,
  Er5D2,
  Er3D1,
  Sr1D1,
  Sr5D5,
  Sr4D1,
  Sr5D3,
  Sr5D13,
  Cr3D6,
  Cr3D9,
  Cr3D12,
  Cr3D15,
  Cr3D16,
  Cr3D17,
  Sr3D1,
};
