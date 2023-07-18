import { Ion, Viewer, createWorldTerrain, UrlTemplateImageryProvider, Rectangle, WebMapServiceImageryProvider, GeographicTilingScheme, CesiumTerrainProvider, IonResource } from "cesium";
import MyUrlTemplateImageryProvider from './MyUrlTemplateImageryProvider'
import "cesium/Widgets/widgets.css";
import "../src/css/main.css"

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMDA1MGMyZS01Mzg4LTRmMDctOTM2MS1iYjRhZDhlZDBlM2EiLCJpZCI6MTEyNjc4LCJpYXQiOjE2NjY4NzU1NTJ9.G3Zt4HeJ-J5ko1wF46c-1vFCgbhMME8xE5k6XTBCskA';


// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
    terrainProvider: createWorldTerrain()
});


// var imageryProvider = new WebMapServiceImageryProvider({
//   url: 'http://localhost:8080/geoserver/testApp/wms?service=WMS&version=1.1.0&request=GetMap&layers=testApp%3ASolani_wgs&bbox=77.71776520201007%2C29.87047265071388%2C78.01616624635821%2C30.279783817740086&width=559&height=768&srs=EPSG%3A4326&styles=&format=image%2Fpng%3B%20mode%3D8bit',
//   layers: 'testApp:Solani_wgs',
//   //tilingScheme: new WebMercatorTilingScheme(),
//   parameters: { 
//     format: 'image/png; mode=8bit',
//     transparent: true,
//     tileWidth: 339,
//     tileHeight: 465
//   },
//   tilingScheme: new GeographicTilingScheme(),
//   crs: 'EPSG:4326',
//   maximumLevel: 9,
//   minimumLevel: 0,
//   //rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
//   rectangle: Rectangle.fromDegrees(77.72, 29.88, 78.03, 30.24)
// });

// Access Natural Earth II imagery, which uses a TMS tiling scheme and Geographic (EPSG:4326) project
// const tms = new Cesium.UrlTemplateImageryProvider({
//   url : Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII') + '/{z}/{x}/{reverseY}.jpg',
//   tilingScheme : new Cesium.GeographicTilingScheme(),
//   maximumLevel : 5
// });

// Access the CartoDB Positron basemap, which uses an OpenStreetMap-like tiling scheme.
// const positron = new Cesium.UrlTemplateImageryProvider({
//   url : 'http://localhost:8080/geoserver/testApp/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=testApp%3ASolani_wgs&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A4326&WIDTH=560&HEIGHT=769&BBOX={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}',
//   credit : 'Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
// });


// Access a Web Map Service (WMS) server.
const wms = new MyUrlTemplateImageryProvider({
  
  url : 'http://localhost:8080/geoserver/testApp/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=testApp%3Asolani12&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&WIDTH=1024&HEIGHT=1024&BBOX={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}',
    rectangle : Cesium.Rectangle.fromDegrees(77.72, 29.88, 78.03, 30.24),
    //   rectangle : Cesium.Rectangle.fromDegrees(77.80, 29.88, 78.03, 30.24)
  // parameters: { 
  //       format: 'image/png; mode=8bit',
  //       transparent: false,
  //       tileWidth: 339,
  //       tileHeight: 465
  //     }
});

// Using custom tags in your template url.
// const custom = new Cesium.UrlTemplateImageryProvider({
//   url : 'http://localhost:8080/geoserver/testApp/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fjpeg&TRANSPARENT=true&STYLES&LAYERS=testApp%3ASolani_wgs&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A4326&WIDTH=560&HEIGHT=769&BBOX={westProjected}%2C{southProjected}%2C{eastProjected}%2C{northProjected}',
//   customTags : {
//       Time: function(imageryProvider, x, y, level) {
//           return '20171231'
//       }
//   }
// });


//var layer = viewer.imageryLayers.addImageryProvider(imageryProvider);

var imageryLayer = viewer.imageryLayers.addImageryProvider(wms);

// // Set the opacity of the imagery layer (optional)
// imageryLayer.alpha = 0.8;

var terrainProvider = new CesiumTerrainProvider({
    url: IonResource.fromAssetId(1),
});
viewer.scene.terrainProvider = terrainProvider;

// Fly to the WMS layer
 viewer.flyTo(imageryLayer);



