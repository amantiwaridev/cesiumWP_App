import { Cartesian2, Cartesian3, Cartographic , Check, combine, Credit, defaultValue, defined, deprecationWarning, DeveloperError, Event, GeographicProjection, Math as CesiumMath, Rectangle, Resource, WebMercatorTilingScheme, ImageryProvider} from "cesium";

// import Cartesian2 from "../Core/Cartesian2.js";
// import Cartesian3 from "../Core/Cartesian3.js";
// import Cartographic from "../Core/Cartographic.js";
// import Check from "../Core/Check.js";
// import combine from "../Core/combine.js";
// import Credit from "../Core/Credit.js";
// import defaultValue from "../Core/defaultValue.js";
// import defined from "../Core/defined.js";
// import deprecationWarning from "../Core/deprecationWarning.js";
// import DeveloperError from "../Core/DeveloperError.js";
// import Event from "../Core/Event.js";
// import GeographicProjection from "../Core/GeographicProjection.js";
// import CesiumMath from "../Core/Math.js";
// import Rectangle from "../Core/Rectangle.js";
// import Resource from "../Core/Resource.js";
// import WebMercatorTilingScheme from "../Core/WebMercatorTilingScheme.js";
// import ImageryProvider from "./ImageryProvider.js";


//Cesium webApp codes

// import { Ion, Viewer, createWorldTerrain, MyUrlTemplateImageryProvider, WebMapServiceImageryProvider, GeographicTilingScheme, CesiumTerrainProvider, IonResource } from "cesium";
// import "cesium/Widgets/widgets.css";
// import "../src/css/main.css"

// // Your access token can be found at: https://cesium.com/ion/tokens.
// // This is the default access token
// Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDA1MGMyZS01Mzg4LTRmMDctOTM2MS1iYjRhZDhlZDBlM2EiLCJpZCI6MTEyNjc4LCJpYXQiOjE2NjY4NzU1NTJ9.G3Zt4HeJ-J5ko1wF46c-1vFCgbhMME8xE5k6XTBCskA';


// // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
// const viewer = new Viewer('cesiumContainer', {
//     terrainProvider: createWorldTerrain()
// });


// // Access a Web Map Service (WMS) server.
// const wms = new Cesium.MyUrlTemplateImageryProvider({
//     url : 'http://localhost:8080/geoserver/testApp/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=testApp%3ASolani_wgs&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&WIDTH=1024&HEIGHT=1024&BBOX={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}',
//     rectangle : Cesium.Rectangle.fromDegrees(77.72, 29.88, 78.03, 30.24)
//     // parameters: { 
//     //       format: 'image/png; mode=8bit',
//     //       transparent: false,
//     //       tileWidth: 339,
//     //       tileHeight: 465
//     //     }
//   });

  
// var imageryLayer = viewer.imageryLayers.addImageryProvider(wms);

//   // // Set the opacity of the imagery layer (optional)
//   // imageryLayer.alpha = 0.8;
  
// var terrainProvider = new CesiumTerrainProvider({
//     url: IonResource.fromAssetId(1),
//   });
// viewer.scene.terrainProvider = terrainProvider;
  
//   // Fly to the WMS layer
// viewer.flyTo(imageryLayer);
 

const CalcFlowAcc = (elevationData) => {
  let DIRECTION_CODES = [
      [8, 1, 2], //[-1-1, -1+0 -1+1]
      [7, 0, 3], //[+0-1, +0+0 +0+1]
      [6, 5, 4]  //[+1-1, +1+0 +1+1]
  ];
  
  let CODES = [
      [4, 5, 6],
      [3, 0, 7],
      [2, 1, 8]
  ];
  
  let REVCODES = {
      1: [-1, 0],
      2: [-1, 1],
      3: [0, 1],
      4: [1, 1],
      5: [1, 0],
      6: [1, -1],
      7: [0, -1],
      8: [-1, -1],
      0: [0, 0],
  };
  
  let rows = elevationData.length;
  let cols = elevationData[0].length;
  const flowDir = [];
  for (let row = 0; row < rows; row++) {
      flowDir[row] = [];
      for (let col = 0; col < cols; col++) {
          let minElev = Number.MAX_VALUE, minRow = -1, minCol = -1;
          for (let windowRow = -1; windowRow <= 1; windowRow++) {
              for (let windowCol = -1; windowCol <= 1; windowCol++) {
                  if (windowRow === 0 && windowCol === 0) continue;
                  const curRow = row + windowRow, curCol = col + windowCol;
                  if (
                      curRow >= 0 &&
                      curRow < rows &&
                      curCol >= 0 &&
                      curCol < cols
                  ) {
                      const curElev = elevationData[curRow][curCol];
                      if (curElev < minElev) {
                          minElev = curElev;
                          minRow = curRow;
                          minCol = curCol;
                      }
                  }
              }
          }
          if (minElev < elevationData[row][col]) {
              const dRow = minRow - row + 1, dCol = minCol - col + 1;
              flowDir[row][col] = DIRECTION_CODES[dRow][dCol];
          } else {
              flowDir[row][col] = 0;
          }
      }
  }
  
  
  
  
  let flowDirection = flowDir;
  rows = flowDirection.length;
  cols = flowDirection[0].length;
  const nidp = [], flowAccumulation = [];
  for (let row = 0; row < rows; row++) {
      flowAccumulation[row] = [];
      for (let col = 0; col < cols; col++) {
          flowAccumulation[row][col] = 1;
      }
  }
  for (let row = 0; row < rows; row++) {
      nidp[row] = [];
      for (let col = 0; col < cols; col++) {
          nidp[row][col] = 0;
          for (let windowRow = -1; windowRow <= 1; windowRow++) {
              for (let windowCol = -1; windowCol <= 1; windowCol++) {
                  if (windowRow === 0 && windowCol === 0) continue;
                  const curRow = row + windowRow, curCol = col + windowCol;
                  if (
                      curRow >= 0 &&
                      curRow < rows &&
                      curCol >= 0 &&
                      curCol < cols
                  ) {
                      if (CODES[windowRow + 1][windowCol + 1] === flowDirection[curRow][curCol]) {
                          nidp[row][col]++;
                      }
                  }
              }
          }
      }
  }
  for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
          if (nidp[row][col] === 0) {
              let crow = row, ccol = col, nAcc = 0;
              do {
                  flowAccumulation[crow][ccol] += nAcc;
                  nAcc = flowAccumulation[crow][ccol]
                  if (nidp[crow][ccol] > 1) {
                      nidp[crow][ccol]--;
                      break;
                  }
                  let nextCellIndex = REVCODES[flowDirection[crow][ccol]];
                  if (flowDirection[crow][ccol] === 0) {
                      break;
                  }
                  crow = crow + nextCellIndex[0];
                  ccol = ccol + nextCellIndex[1];
              } while (
                  crow >= 0 &&
                  crow < rows &&
                  ccol >= 0 &&
                  ccol < cols
              );
          }
      }
  }

  return flowAccumulation;
}


const templateRegex = /{[^}]+}/g;

const tags = {
  x: xTag,
  y: yTag,
  z: zTag,
  s: sTag,
  reverseX: reverseXTag,
  reverseY: reverseYTag,
  reverseZ: reverseZTag,
  westDegrees: westDegreesTag,
  southDegrees: southDegreesTag,
  eastDegrees: eastDegreesTag,
  northDegrees: northDegreesTag,
  westProjected: westProjectedTag,
  southProjected: southProjectedTag,
  eastProjected: eastProjectedTag,
  northProjected: northProjectedTag,
  width: widthTag,
  height: heightTag,
};

const pickFeaturesTags = combine(tags, {
  i: iTag,
  j: jTag,
  reverseI: reverseITag,
  reverseJ: reverseJTag,
  longitudeDegrees: longitudeDegreesTag,
  latitudeDegrees: latitudeDegreesTag,
  longitudeProjected: longitudeProjectedTag,
  latitudeProjected: latitudeProjectedTag,
  format: formatTag,
});


function MyUrlTemplateImageryProvider(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  this._errorEvent = new Event();

  if (defined(options.then)) {
    this._reinitialize(options);
    return;
  }

  //>>includeStart('debug', pragmas.debug);
  Check.defined("options.url", options.url);
  //>>includeEnd('debug');

  const resource = Resource.createIfNeeded(options.url);
  const pickFeaturesResource = Resource.createIfNeeded(options.pickFeaturesUrl);

  this._resource = resource;
  this._urlSchemeZeroPadding = options.urlSchemeZeroPadding;
  this._getFeatureInfoFormats = options.getFeatureInfoFormats;
  this._pickFeaturesResource = pickFeaturesResource;

  let subdomains = options.subdomains;
  if (Array.isArray(subdomains)) {
    subdomains = subdomains.slice();
  } else if (defined(subdomains) && subdomains.length > 0) {
    subdomains = subdomains.split("");
  } else {
    subdomains = ["a", "b", "c"];
  }
  this._subdomains = subdomains;

  this._tileWidth = defaultValue(options.tileWidth, 1024);
  this._tileHeight = defaultValue(options.tileHeight, 1024);
  this._minimumLevel = defaultValue(options.minimumLevel, 0);
  this._maximumLevel = options.maximumLevel;
  this._tilingScheme = defaultValue(
    options.tilingScheme,
    new WebMercatorTilingScheme({ ellipsoid: options.ellipsoid })
  );

  this._rectangle = defaultValue(
    options.rectangle,
    this._tilingScheme.rectangle
  );
  this._rectangle = Rectangle.intersection(
    this._rectangle,
    this._tilingScheme.rectangle
  );

  this._tileDiscardPolicy = options.tileDiscardPolicy;

  let credit = options.credit;
  if (typeof credit === "string") {
    credit = new Credit(credit);
  }
  this._credit = credit;
  this._hasAlphaChannel = defaultValue(options.hasAlphaChannel, true);

  const customTags = options.customTags;
  const allTags = combine(tags, customTags);
  const allPickFeaturesTags = combine(pickFeaturesTags, customTags);
  this._tags = allTags;
  this._pickFeaturesTags = allPickFeaturesTags;

  this._readyPromise = Promise.resolve(true);
  this._ready = true;

  this._defaultAlpha = undefined;
  this._defaultNightAlpha = undefined;
  this._defaultDayAlpha = undefined;
  this._defaultBrightness = undefined;
  this._defaultContrast = undefined;
  this._defaultHue = undefined;
  this._defaultSaturation = undefined;
  this._defaultGamma = undefined;
  this._defaultMinificationFilter = undefined;
  this._defaultMagnificationFilter = undefined;

  
  this.enablePickFeatures = defaultValue(options.enablePickFeatures, true);
}

Object.defineProperties(MyUrlTemplateImageryProvider.prototype, {
  
  url: {
    get: function () {
      return this._resource.url;
    },
  },

  urlSchemeZeroPadding: {
    get: function () {
      return this._urlSchemeZeroPadding;
    },
  },

  
  pickFeaturesUrl: {
    get: function () {
      return this._pickFeaturesResource.url;
    },
  },

  
  proxy: {
    get: function () {
      return this._resource.proxy;
    },
  },

  
  tileWidth: {
    get: function () {
      return this._tileWidth;
    },
  },

  
  tileHeight: {
    get: function () {
      return this._tileHeight;
    },
  },

  
  maximumLevel: {
    get: function () {
      return this._maximumLevel;
    },
  },

  
  minimumLevel: {
    get: function () {
      return this._minimumLevel;
    },
  },

  
  tilingScheme: {
    get: function () {
      return this._tilingScheme;
    },
  },

  
  rectangle: {
    get: function () {
      return this._rectangle;
    },
  },

  
  tileDiscardPolicy: {
    get: function () {
      return this._tileDiscardPolicy;
    },
  },

  
  errorEvent: {
    get: function () {
      return this._errorEvent;
    },
  },

  
  ready: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.ready",
        "MyUrlTemplateImageryProvider.ready was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107."
      );
      return this._ready && defined(this._resource);
    },
  },

  
  readyPromise: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.readyPromise",
        "MyUrlTemplateImageryProvider.readyPromise was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107."
      );
      return this._readyPromise;
    },
  },

  
  credit: {
    get: function () {
      return this._credit;
    },
  },

  
  hasAlphaChannel: {
    get: function () {
      return this._hasAlphaChannel;
    },
  },

  
  defaultAlpha: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultAlpha",
        "MyUrlTemplateImageryProvider.defaultAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.alpha instead."
      );
      return this._defaultAlpha;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultAlpha",
        "MyUrlTemplateImageryProvider.defaultAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.alpha instead."
      );
      this._defaultAlpha = value;
    },
  },

  
  defaultNightAlpha: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultNightAlpha",
        "MyUrlTemplateImageryProvider.defaultNightAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.nightAlpha instead."
      );
      return this._defaultNightAlpha;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultNightAlpha",
        "MyUrlTemplateImageryProvider.defaultNightAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.nightAlpha instead."
      );
      this._defaultNightAlpha = value;
    },
  },

  
  defaultDayAlpha: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultDayAlpha",
        "MyUrlTemplateImageryProvider.defaultDayAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.dayAlpha instead."
      );
      return this._defaultDayAlpha;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultDayAlpha",
        "MyUrlTemplateImageryProvider.defaultDayAlpha was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.dayAlpha instead."
      );
      this._defaultDayAlpha = value;
    },
  },

  
  defaultBrightness: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultBrightness",
        "MyUrlTemplateImageryProvider.defaultBrightness was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.brightness instead."
      );
      return this._defaultBrightness;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultBrightness",
        "MyUrlTemplateImageryProvider.defaultBrightness was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.brightness instead."
      );
      this._defaultBrightness = value;
    },
  },

  
  defaultContrast: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultContrast",
        "MyUrlTemplateImageryProvider.defaultContrast was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.contrast instead."
      );
      return this._defaultContrast;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultContrast",
        "MyUrlTemplateImageryProvider.defaultContrast was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.contrast instead."
      );
      this._defaultContrast = value;
    },
  },

  
  defaultHue: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultHue",
        "MyUrlTemplateImageryProvider.defaultHue was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.hue instead."
      );
      return this._defaultHue;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultHue",
        "MyUrlTemplateImageryProvider.defaultHue was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.hue instead."
      );
      this._defaultHue = value;
    },
  },

  
  defaultSaturation: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultSaturation",
        "MyUrlTemplateImageryProvider.defaultSaturation was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.saturation instead."
      );
      return this._defaultSaturation;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultSaturation",
        "MyUrlTemplateImageryProvider.defaultSaturation was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.saturation instead."
      );
      this._defaultSaturation = value;
    },
  },

  
  defaultGamma: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultGamma",
        "MyUrlTemplateImageryProvider.defaultGamma was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.gamma instead."
      );
      return this._defaultGamma;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultGamma",
        "MyUrlTemplateImageryProvider.defaultGamma was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.gamma instead."
      );
      this._defaultGamma = value;
    },
  },

  
  defaultMinificationFilter: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultMinificationFilter",
        "MyUrlTemplateImageryProvider.defaultMinificationFilter was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.minificationFilter instead."
      );
      return this._defaultMinificationFilter;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultMinificationFilter",
        "MyUrlTemplateImageryProvider.defaultMinificationFilter was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.minificationFilter instead."
      );
      this._defaultMinificationFilter = value;
    },
  },

  
  defaultMagnificationFilter: {
    get: function () {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultMagnificationFilter",
        "MyUrlTemplateImageryProvider.defaultMagnificationFilter was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.magnificationFilter instead."
      );
      return this._defaultMagnificationFilter;
    },
    set: function (value) {
      deprecationWarning(
        "MyUrlTemplateImageryProvider.defaultMagnificationFilter",
        "MyUrlTemplateImageryProvider.defaultMagnificationFilter was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107.  Use ImageryLayer.magnificationFilter instead."
      );
      this._defaultMagnificationFilter = value;
    },
  },
});


MyUrlTemplateImageryProvider.prototype.reinitialize = function (options) {
  deprecationWarning(
    "MyUrlTemplateImageryProvider.reinitialize",
    "MyUrlTemplateImageryProvider.reinitialize was deprecated in CesiumJS 1.104.  It will be removed in CesiumJS 1.107."
  );

  return this._reinitialize(options);
};


MyUrlTemplateImageryProvider.prototype._reinitialize = function (options) {
  const that = this;

  that._readyPromise = Promise.resolve(options).then(function (properties) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(properties)) {
      throw new DeveloperError("options is required.");
    }
    if (!defined(properties.url)) {
      throw new DeveloperError("options.url is required.");
    }
    //>>includeEnd('debug');

    const customTags = properties.customTags;
    const allTags = combine(tags, customTags);
    const allPickFeaturesTags = combine(pickFeaturesTags, customTags);
    const resource = Resource.createIfNeeded(properties.url);
    const pickFeaturesResource = Resource.createIfNeeded(
      properties.pickFeaturesUrl
    );

    that.enablePickFeatures = defaultValue(
      properties.enablePickFeatures,
      that.enablePickFeatures
    );
    that._urlSchemeZeroPadding = defaultValue(
      properties.urlSchemeZeroPadding,
      that.urlSchemeZeroPadding
    );
    that._tileDiscardPolicy = properties.tileDiscardPolicy;
    that._getFeatureInfoFormats = properties.getFeatureInfoFormats;

    that._subdomains = properties.subdomains;
    if (Array.isArray(that._subdomains)) {
      that._subdomains = that._subdomains.slice();
    } else if (defined(that._subdomains) && that._subdomains.length > 0) {
      that._subdomains = that._subdomains.split("");
    } else {
      that._subdomains = ["a", "b", "c"];
    }

    that._tileWidth = defaultValue(properties.tileWidth, 1024);
    that._tileHeight = defaultValue(properties.tileHeight, 1024);
    that._minimumLevel = defaultValue(properties.minimumLevel, 0);
    that._maximumLevel = properties.maximumLevel;
    that._tilingScheme = defaultValue(
      properties.tilingScheme,
      new WebMercatorTilingScheme({ ellipsoid: properties.ellipsoid })
    );
    that._rectangle = defaultValue(
      properties.rectangle,
      that._tilingScheme.rectangle
    );
    that._rectangle = Rectangle.intersection(
      that._rectangle,
      that._tilingScheme.rectangle
    );
    that._hasAlphaChannel = defaultValue(properties.hasAlphaChannel, true);

    let credit = properties.credit;
    if (typeof credit === "string") {
      credit = new Credit(credit);
    }
    that._credit = credit;

    that._resource = resource;
    that._tags = allTags;
    that._pickFeaturesResource = pickFeaturesResource;
    that._pickFeaturesTags = allPickFeaturesTags;
    that._ready = true;

    return true;
  });
};


MyUrlTemplateImageryProvider.prototype.getTileCredits = function (x, y, level) {
  return undefined;
};


MyUrlTemplateImageryProvider.prototype.requestImage = function (
  x,
  y,
  level,
  request
) {
  let imagePromise = ImageryProvider.loadImage(
    this,
    buildImageResource(this, x, y, level, request)
  );
  if(!defined(imagePromise)) {
      return imagePromise;
  }

  var that = this;
  return imagePromise.then(function(image) {
    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext('2d');
    ctx.translate(0, 1024);
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, image.width, image.height);
    let idata = imageData.data; 
    let data = [];
    for(let i=0; i< idata.length; i+=4) {
      if(i%(4*1024)===0){
        data.push([])
      }
      data[Math.floor(i/(4*1024))].push(
        idata[i] * 1024 + idata[i + 1]
      );
    }
    // console.log(data)
    data = CalcFlowAcc(data);

    let mn, mx;
    for(let i=0; i< data.length; i++) {
      for(let j=0; j< data[i].length; j++) {
        let value = data[i][j]
        if(mn === undefined || value < mn) {
          mn = value;
        }
        if(mx === undefined || value > mx) {
          mx = value;
        }
      }
    }

    let buffer = new Uint8ClampedArray(1024*1024*4);
    for(let i=0; i< data.length; i++) {
      for(let j=0; j< data[i].length; j++) {
        let index = i*1024*4 + j*4;
        let value = (data[i][j]-mn)/(mx-mn) *256;
        buffer[index] = value;
        buffer[index + 1] = value;
        buffer[index + 2] = value;
        buffer[index + 3] = value>0?255:0;
      }
    }
    let canvas2 = document.createElement('canvas');
    canvas2.width = image.width;
    canvas2.height = image.height;
    let ctx2 = canvas.getContext('2d');
    let imgData2 = ctx2.createImageData(image.width, image.height);
    imgData2.data.set(buffer);
    ctx2.putImageData(imgData2, 0, 0);
    // console.log(data);
    // console.log(canvas2.toDataURL())
    return imgData2;
  })
  // return when(imagePromise, function(image) {
  //     return image;
  // });
};


MyUrlTemplateImageryProvider.prototype.pickFeatures = function (
  x,
  y,
  level,
  longitude,
  latitude
) {
  if (
    !this.enablePickFeatures ||
    !defined(this._pickFeaturesResource) ||
    this._getFeatureInfoFormats.length === 0
  ) {
    return undefined;
  }

  let formatIndex = 0;

  const that = this;

  function handleResponse(format, data) {
    return format.callback(data);
  }

  function doRequest() {
    if (formatIndex >= that._getFeatureInfoFormats.length) {
      // No valid formats, so no features picked.
      return Promise.resolve([]);
    }

    const format = that._getFeatureInfoFormats[formatIndex];
    const resource = buildPickFeaturesResource(
      that,
      x,
      y,
      level,
      longitude,
      latitude,
      format.format
    );

    ++formatIndex;

    if (format.type === "json") {
      return resource.fetchJson().then(format.callback).catch(doRequest);
    } else if (format.type === "xml") {
      return resource.fetchXML().then(format.callback).catch(doRequest);
    } else if (format.type === "text" || format.type === "html") {
      return resource.fetchText().then(format.callback).catch(doRequest);
    }
    return resource
      .fetch({
        responseType: format.format,
      })
      .then(handleResponse.bind(undefined, format))
      .catch(doRequest);
  }

  return doRequest();
};

let degreesScratchComputed = false;
const degreesScratch = new Rectangle();
let projectedScratchComputed = false;
const projectedScratch = new Rectangle();

function buildImageResource(imageryProvider, x, y, level, request) {
  degreesScratchComputed = false;
  projectedScratchComputed = false;

  const resource = imageryProvider._resource;
  const url = resource.getUrlComponent(true);
  const allTags = imageryProvider._tags;
  const templateValues = {};

  const match = url.match(templateRegex);
  if (defined(match)) {
    match.forEach(function (tag) {
      const key = tag.substring(1, tag.length - 1); //strip {}
      if (defined(allTags[key])) {
        templateValues[key] = allTags[key](imageryProvider, x, y, level);
      }
    });
  }

  return resource.getDerivedResource({
    request: request,
    templateValues: templateValues,
  });
}

let ijScratchComputed = false;
const ijScratch = new Cartesian2();
let longitudeLatitudeProjectedScratchComputed = false;

function buildPickFeaturesResource(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  degreesScratchComputed = false;
  projectedScratchComputed = false;
  ijScratchComputed = false;
  longitudeLatitudeProjectedScratchComputed = false;

  const resource = imageryProvider._pickFeaturesResource;
  const url = resource.getUrlComponent(true);
  const allTags = imageryProvider._pickFeaturesTags;
  const templateValues = {};
  const match = url.match(templateRegex);
  if (defined(match)) {
    match.forEach(function (tag) {
      const key = tag.substring(1, tag.length - 1); //strip {}
      if (defined(allTags[key])) {
        templateValues[key] = allTags[key](
          imageryProvider,
          x,
          y,
          level,
          longitude,
          latitude,
          format
        );
      }
    });
  }

  return resource.getDerivedResource({
    templateValues: templateValues,
  });
}

function padWithZerosIfNecessary(imageryProvider, key, value) {
  if (
    imageryProvider &&
    imageryProvider.urlSchemeZeroPadding &&
    imageryProvider.urlSchemeZeroPadding.hasOwnProperty(key)
  ) {
    const paddingTemplate = imageryProvider.urlSchemeZeroPadding[key];
    if (typeof paddingTemplate === "string") {
      const paddingTemplateWidth = paddingTemplate.length;
      if (paddingTemplateWidth > 1) {
        value =
          value.length >= paddingTemplateWidth
            ? value
            : new Array(
                paddingTemplateWidth - value.toString().length + 1
              ).join("0") + value;
      }
    }
  }
  return value;
}

function xTag(imageryProvider, x, y, level) {
  return padWithZerosIfNecessary(imageryProvider, "{x}", x);
}

function reverseXTag(imageryProvider, x, y, level) {
  const reverseX =
    imageryProvider.tilingScheme.getNumberOfXTilesAtLevel(level) - x - 1;
  return padWithZerosIfNecessary(imageryProvider, "{reverseX}", reverseX);
}

function yTag(imageryProvider, x, y, level) {
  return padWithZerosIfNecessary(imageryProvider, "{y}", y);
}

function reverseYTag(imageryProvider, x, y, level) {
  const reverseY =
    imageryProvider.tilingScheme.getNumberOfYTilesAtLevel(level) - y - 1;
  return padWithZerosIfNecessary(imageryProvider, "{reverseY}", reverseY);
}

function reverseZTag(imageryProvider, x, y, level) {
  const maximumLevel = imageryProvider.maximumLevel;
  const reverseZ =
    defined(maximumLevel) && level < maximumLevel
      ? maximumLevel - level - 1
      : level;
  return padWithZerosIfNecessary(imageryProvider, "{reverseZ}", reverseZ);
}

function zTag(imageryProvider, x, y, level) {
  return padWithZerosIfNecessary(imageryProvider, "{z}", level);
}

function sTag(imageryProvider, x, y, level) {
  const index = (x + y + level) % imageryProvider._subdomains.length;
  return imageryProvider._subdomains[index];
}

function computeDegrees(imageryProvider, x, y, level) {
  if (degreesScratchComputed) {
    return;
  }

  imageryProvider.tilingScheme.tileXYToRectangle(x, y, level, degreesScratch);
  degreesScratch.west = CesiumMath.toDegrees(degreesScratch.west);
  degreesScratch.south = CesiumMath.toDegrees(degreesScratch.south);
  degreesScratch.east = CesiumMath.toDegrees(degreesScratch.east);
  degreesScratch.north = CesiumMath.toDegrees(degreesScratch.north);

  degreesScratchComputed = true;
}

function westDegreesTag(imageryProvider, x, y, level) {
  computeDegrees(imageryProvider, x, y, level);
  return degreesScratch.west;
}

function southDegreesTag(imageryProvider, x, y, level) {
  computeDegrees(imageryProvider, x, y, level);
  return degreesScratch.south;
}

function eastDegreesTag(imageryProvider, x, y, level) {
  computeDegrees(imageryProvider, x, y, level);
  return degreesScratch.east;
}

function northDegreesTag(imageryProvider, x, y, level) {
  computeDegrees(imageryProvider, x, y, level);
  return degreesScratch.north;
}

function computeProjected(imageryProvider, x, y, level) {
  if (projectedScratchComputed) {
    return;
  }

  imageryProvider.tilingScheme.tileXYToNativeRectangle(
    x,
    y,
    level,
    projectedScratch
  );

  projectedScratchComputed = true;
}

function westProjectedTag(imageryProvider, x, y, level) {
  computeProjected(imageryProvider, x, y, level);
  return projectedScratch.west;
}

function southProjectedTag(imageryProvider, x, y, level) {
  computeProjected(imageryProvider, x, y, level);
  return projectedScratch.south;
}

function eastProjectedTag(imageryProvider, x, y, level) {
  computeProjected(imageryProvider, x, y, level);
  return projectedScratch.east;
}

function northProjectedTag(imageryProvider, x, y, level) {
  computeProjected(imageryProvider, x, y, level);
  return projectedScratch.north;
}

function widthTag(imageryProvider, x, y, level) {
  return imageryProvider.tileWidth;
}

function heightTag(imageryProvider, x, y, level) {
  return imageryProvider.tileHeight;
}

function iTag(imageryProvider, x, y, level, longitude, latitude, format) {
  computeIJ(imageryProvider, x, y, level, longitude, latitude);
  return ijScratch.x;
}

function jTag(imageryProvider, x, y, level, longitude, latitude, format) {
  computeIJ(imageryProvider, x, y, level, longitude, latitude);
  return ijScratch.y;
}

function reverseITag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  computeIJ(imageryProvider, x, y, level, longitude, latitude);
  return imageryProvider.tileWidth - ijScratch.x - 1;
}

function reverseJTag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  computeIJ(imageryProvider, x, y, level, longitude, latitude);
  return imageryProvider.tileHeight - ijScratch.y - 1;
}

const rectangleScratch = new Rectangle();
const longitudeLatitudeProjectedScratch = new Cartesian3();

function computeIJ(imageryProvider, x, y, level, longitude, latitude, format) {
  if (ijScratchComputed) {
    return;
  }

  computeLongitudeLatitudeProjected(
    imageryProvider,
    x,
    y,
    level,
    longitude,
    latitude
  );
  const projected = longitudeLatitudeProjectedScratch;

  const rectangle = imageryProvider.tilingScheme.tileXYToNativeRectangle(
    x,
    y,
    level,
    rectangleScratch
  );
  ijScratch.x =
    ((imageryProvider.tileWidth * (projected.x - rectangle.west)) /
      rectangle.width) |
    0;
  ijScratch.y =
    ((imageryProvider.tileHeight * (rectangle.north - projected.y)) /
      rectangle.height) |
    0;
  ijScratchComputed = true;
}

function longitudeDegreesTag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  return CesiumMath.toDegrees(longitude);
}

function latitudeDegreesTag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  return CesiumMath.toDegrees(latitude);
}

function longitudeProjectedTag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  computeLongitudeLatitudeProjected(
    imageryProvider,
    x,
    y,
    level,
    longitude,
    latitude
  );
  return longitudeLatitudeProjectedScratch.x;
}

function latitudeProjectedTag(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  computeLongitudeLatitudeProjected(
    imageryProvider,
    x,
    y,
    level,
    longitude,
    latitude
  );
  return longitudeLatitudeProjectedScratch.y;
}

const cartographicScratch = new Cartographic();

function computeLongitudeLatitudeProjected(
  imageryProvider,
  x,
  y,
  level,
  longitude,
  latitude,
  format
) {
  if (longitudeLatitudeProjectedScratchComputed) {
    return;
  }

  if (imageryProvider.tilingScheme.projection instanceof GeographicProjection) {
    longitudeLatitudeProjectedScratch.x = CesiumMath.toDegrees(longitude);
    longitudeLatitudeProjectedScratch.y = CesiumMath.toDegrees(latitude);
  } else {
    const cartographic = cartographicScratch;
    cartographic.longitude = longitude;
    cartographic.latitude = latitude;
    imageryProvider.tilingScheme.projection.project(
      cartographic,
      longitudeLatitudeProjectedScratch
    );
  }

  longitudeLatitudeProjectedScratchComputed = true;
}

function formatTag(imageryProvider, x, y, level, longitude, latitude, format) {
  return format;
}
export default MyUrlTemplateImageryProvider;