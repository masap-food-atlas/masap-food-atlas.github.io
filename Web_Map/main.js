window.onload = init;
function init(){
  proj4.defs("EPSG:32640","+proj=utm +zone=40 +datum=WGS84 +units=m +no_defs");
  ol.proj.proj4.register(proj4); 
  // const proj_UTM40N = ol.proj.get('EPSG:32640');
  // proj_UTM40N.setWorldExtent([54.0, 0.0, 60.0, 84.0]);
  // proj_UTM40N.setExtent([166021.44, 0.00, 800000, 9329005.18]);
  // Controls
  const zoomToExtentControl = new ol.control.ZoomToExtent();
  /*const zoomLevelElement = document.getElementById('zoom-level');
  const zoomValueControl = new ol.control.Control({
    element: zoomLevelElement,
    className: 'zoom-level',
    render: function(e) {
      var zoomLevel = map.getView().getZoom().toFixed(2);
      document.getElementById('ZoomElement').innerHTML = zoomLevel;
    }
  });*/
  const attributionControl = new ol.control.Attribution({
    collapsible: true
  });

  const mousePositionControl_3857 = new ol.control.MousePosition({
    //coordinateFormat: ol.coordinate.createStringXY(0),
    coordinateFormat: function(coord) {
      return ol.coordinate.format(coord, 'X: {x} m, Y: {y} m', 0);
    },
    className: 'ol-mouse-position' //default
  });
  const mousePositionControl_4326 = new ol.control.MousePosition({
    coordinateFormat: function(coord) {
      return ol.coordinate.toStringHDMS(coord, 1);
    },
    projection: 'EPSG:4326',
    className: 'ol-custom-mouse-positionHDMS',
    //target: document.getElementById('mouse-position'),
    //undefinedHTML: '&nbsp;'
  });
  const scaleLineControl = new ol.control.ScaleLine();
  const zoomSliderControl = new ol.control.ZoomSlider();
  const fullScreenControl = new ol.control.FullScreen();
  const overViewMapControl = new ol.control.OverviewMap({
    collapsible: true,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()      
      })
    ],
    view: new ol.View({
      zoom: 7,
      minZoom: 8,
      rotation: 0.5,
      // projection:'EPSG:32640',
      // projection:'EPSG:4326'
    })
  });

  // Parameters
  extentMap = [2900000,-2500000.4,3200000,-2060308.7];

  // Map object
  const map = new ol.Map({
    view: new ol.View({
      extent: extentMap,
      //extent: ol.proj.transformExtent([55.408203953679255, 57.99200420598309, 56.29979683132314, 57.99200420598309], 'EPSG:4326', 'EPSG:32640')
      //center: ol.proj.fromLonLat([55.765946,58.080916]),
      center: [3061056.7, -2227751.4],
      zoom: 6,
      maxZoom: 17,
      minZoom: 0,
      rotation: 0,
      //projection: 'EPSG:4326',
      // projection:'EPSG:32640'
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    target: 'js-map',
    keyboardEventTarget: document,
    controls: ol.control.defaults({attribution: false}).extend([
      attributionControl,
      mousePositionControl_3857,
      mousePositionControl_4326,
      scaleLineControl,
      zoomToExtentControl,
      zoomSliderControl,
      fullScreenControl,
      overViewMapControl
    ])
  })
  //console.log(map.get('target'));
  //console.log(map.getKeys());

  // *********************************************
  // Overlay (demo)
  // *********************************************
 
 
  // const popupContainerElement = document.getElementById('popup-coordinates');
  // const popup = new ol.Overlay({
  //   element: popupContainerElement,
  //   className: 'popup-coordinates',
  //   //autoPan: true,
  //   positioning: 'top-right'
  // })
  //map.addOverlay(popup);

  function showZoom(e){
    return map.getView().getZoom().toFixed(1);
  }
  function showGeogrCoordinates(e){
    const clickedCoordinate = e.coordinate;
    map.addOverlay(popup);
    popup.setPosition(undefined);
    popup.setPosition(clickedCoordinate);
    //console.log(clickedCoordinate);
    const lonlatCoordinate = ol.proj.toLonLat(clickedCoordinate);
    const outCoordinate = ol.coordinate.toStringHDMS(lonlatCoordinate, 1);
    const pos = outCoordinate.indexOf("N") + 1;
    const latStr = outCoordinate.slice(0, pos);
    const lonStr = outCoordinate.slice(pos);
    const currentZoom = showZoom(e);
    //const currentZoom = map.getView().getZoom().toFixed(2);
    const htmlText = 'Lat: ' + latStr + '<br>' + 'Lon: ' + lonStr + '<br> zoom: ' + currentZoom;
    popupContainerElement.innerHTML = htmlText;
  }

  function showProjCoordinates(e){
    const clickedCoordinate = e.coordinate;
    map.addOverlay(popup);
    popup.setPosition(undefined);
    popup.setPosition(clickedCoordinate);
    const outCoordinate = ol.coordinate.toStringXY(clickedCoordinate, 0);
    //console.log(outCoordinate);
    //const outCoordinate = ol.coordinate.toStringXY(clickedCoordinate, 0);
    //popupContainerElement.innerHTML = outCoordinate;
    const pos = outCoordinate.indexOf(",") + 1;
    const latStr = outCoordinate.slice(0, pos - 1);
    const lonStr = outCoordinate.slice(pos);
    
    //const currentZoom = map.getView().getZoom().toFixed(2);
    const htmlText = 'X: ' + latStr + '<br>' + 'Y: ' + lonStr + '<br> zoom: ' + currentZoom;
    popupContainerElement.innerHTML = htmlText;
  }

  map.on('click', function(e){
    document.addEventListener('keydown', function(event){
      var keyOn = event.key;
      console.log(keyOn);
      switch(keyOn) {
        case 'Control':
          //console.log(keyOn);
          showGeogrCoordinates(e);
          break;
        case 'Shift':
          //console.log(keyOn);
          showProjCoordinates(e);
          break;
        default:
          map.removeOverlay(popup);
          return;
      }
    })
    map.removeOverlay(popup);
    //document.removeEventListener('keydown', function);
    // Здесь нужно _**загасить**_ состояние 'click'..., для обеспечения правильной логики
  })
  
  // *********************************************
  // Interactions
  // *********************************************

  // DragPan interaction
  const dragPanInteraction = new ol.interaction.DragPan;
  map.addInteraction(dragPanInteraction);
  // DragRotate interaction
  const dragRotateInteraction = new ol.interaction.DragRotate({
    condition: ol.events.condition.altKeyOnly
  })
  map.addInteraction(dragRotateInteraction);

  const attributionImageOverlay = new ol.Overlay({
    element: document.getElementById('attribution-image'),
    positioning: 'bottom-right' // Adjust the positioning as needed
  });

// Add the attribution image overlay to the map
  map.addOverlay(attributionImageOverlay);

  // *********************************************
  // Base Layers
  // *********************************************
// Openstreet Map Standard (it was initial for 'map')
const osmStandard = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  title: 'OSMStand'        
})
//map.addLayer(osmStandard);

// Openstreet Map Humanitarian
const osmHumanitarian = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
  }),
  visible: false,
  title: 'OSMHuman'
})
//map.addLayer(osmHumanitarian);

// Bing Maps Aerial (Satellite)
const bingMapsAerial = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: "Al3HzWPy0v1f81GdgIdZzN4ubQBDKkvOFuQ-M6svftP3bhZ8-bBAZWJ_aWqimTPw",
    imagerySet: 'Aerial' // Aerial, AerialWithLabels, Road, CanvasDark, CanvasGrey
  }),
  visible: false,
  title: 'BingMapsSAT'
})
//map.addLayer(bingMapsAerial);

// Bing Maps Aerial (with labels)
const bingMapsAerialLabels = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: "Al3HzWPy0v1f81GdgIdZzN4ubQBDKkvOFuQ-M6svftP3bhZ8-bBAZWJ_aWqimTPw",
    imagerySet: 'AerialWithLabels'
  }),
  visible: false,
  title: 'BingMapsSATLabels'
})
//map.addLayer(bingMapsAerialLabels);

// Bing Maps Road
const bingMapsRoad = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: "Al3HzWPy0v1f81GdgIdZzN4ubQBDKkvOFuQ-M6svftP3bhZ8-bBAZWJ_aWqimTPw",
    imagerySet: 'Road'
  }),
  visible: false,
  title: 'BingMapsRoad'
})
//map.addLayer(bingMapsRoad);

// // Yandex Coordinates projection
// var yaExtent = [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244];
// proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
// ol.proj.proj4.register(proj4);
// ol.proj.get('EPSG:3395').setExtent(yaExtent);

// Yandex Maps Standard Layer
// const yandexMapsStandard = new ol.layer.Tile({
//   source: new ol.source.XYZ({
//     //url: 'http://vec0{1-4}.maps.yandex.net/tiles?l=map&lang=ru_RU&l=s&x={x}&y={y}&z={z}',
//     url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&lang=ru_RU&v=2.26.0&x={x}&y={y}&z={z}',
//     type: 'base',
//     attributions: '© Yandex',
//     projection: 'EPSG:3395',
//     tileGrid: ol.tilegrid.createXYZ({
//       extent: yaExtent
//     }),
//   }),
//   visible: false,
//   title: 'YandexStand'
// })
//map.addLayer(yandexMapsStandard);

// Yandex Maps Satellite Layer
// const yandexSAT = new ol.layer.Tile({
//   source: new ol.source.XYZ({
//     url: 'http://sat0{1-4}.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}',
//     attributions: '© Yandex',
//     projection: 'EPSG:3395',
//     tileGrid: ol.tilegrid.createXYZ({
//       extent: yaExtent
//     }),
//   }),
//   visible: false,
//   title: 'YandexSAT'
// })
//map.addLayer(yandexSAT);

// Stamen Terrain Layer
const stamenTerrain = new ol.layer.Tile({
  source: new ol.source.Stamen({
    layer: 'terrain',
    attributions: '@ Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
  }),
  visible: false,
  title: 'StamenTerrain'
})
//map.addLayer(stamenTerrain);

// Stamen Watercolor Layer
const stamenWatercolor = new ol.layer.Tile({
  source: new ol.source.Stamen({
    layer: 'watercolor',
    attributions: '@ Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
  }),
  visible: false,
  title: 'StamenWatercolor'
})
//map.addLayer(stamenWatercolor);

// Stamen Toner Layer
const stamenToner = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
    attributions: '@ Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
  }),
  visible: false,
  title: 'StamenToner'
})
//map.addLayer(stamenToner);


  // Local BaseMap Layer (GeoServer WMS Layer on 'top')
  const localWMSLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url:"http://ssc.psu.ru:8080/geoserver/st2021/wms",
      //url:"http://ssc.psu.ru:8080/geoserver/common/wms",
      params:{
        LAYERS: 'st2021:grp5_just_OSM',
        FORMAT: 'image/png',
        TRANSPARENT: false
      },
      attributions: '<a href=http://ssc.psu.ru:8080/geoserver/common/>© Perm State University<a/>'
    }),
    visible: false,
    title: 'LocalWMS'
  })
  //map.addLayer(localWMSLayer);

  // Openstreet Map Vector Tile Layer
  const osmVectorTileLayer = new ol.layer.VectorTile({
    source: new ol.source.VectorTile({
      url: 'https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=FfQLTxHMU4i8EsRYDFPd',
      format: new ol.format.MVT(),
      projection: 'EPSG:32640',
      attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    }),
    visible: false,
    maxZoom: 15, //optional (limited by the data provider)
    title: 'OSMVectorTile', 
  
  })
  //const osmVectorTileStyle = 'https://api.maptiler.com/maps/6513dbde-7cfa-472d-b225-669a201c4a11/style.json?key=FfQLTxHMU4i8EsRYDFPd';
  //olms.applyStyle(osmVectorTileLayer, osmVectorTileStyle);
  const osmVectorTileStyles = 'https://api.maptiler.com/maps/6513dbde-7cfa-472d-b225-669a201c4a11/style.json?key=FfQLTxHMU4i8EsRYDFPd';
  fetch(osmVectorTileStyles).then(function(response) {
    response.json().then(function(glStyle) {
      console.log(glStyle);
      olms.applyStyle(osmVectorTileLayer, glStyle, 'c8d958ad-ff6d-4678-9730-893520ecf11a');
    });
  });

  // BaseMaps Layer Group
  const baseMapsLayerGroup = new ol.layer.Group({
    layers: [
      osmStandard, osmHumanitarian, bingMapsAerial, bingMapsAerialLabels, bingMapsRoad, 
      stamenTerrain, stamenWatercolor, stamenToner, localWMSLayer, osmVectorTileLayer
    ]
  })
  map.addLayer(baseMapsLayerGroup);

  // Layer Switcher Logic for Basemaps Layers
  const baseLayerElements = document.querySelectorAll('.sidebar ul li > input[type=radio]')
  // Initialize radio buttons (set the first one to checked)
  baseLayerElements[0].checked = true;
  // Switching
  for(let baseLayerElement of baseLayerElements){
    baseLayerElement.addEventListener('change', function(){
      let baseLayerElementValue = this.value;
      baseMapsLayerGroup.getLayers().forEach(function(element, index, array){
        let baseLayerName = element.get('title');
        element.setVisible(baseLayerName === baseLayerElementValue)
      })
    })
  }

  // *********************************************
  // Thematic Layers
  // *********************************************
  // STYLES
//Sand Dam
  const waterPointMarkerStyle = new ol.style.Icon({
    src: './resources/icons/icon-lblue.png',
    size: [200, 200],
    offset: [0, 0],
    opacity: 1,
    scale: 0.3,
    // color:'red'
    
  })
  const damMarkerStyle = new ol.style.Icon({
    src: './resources/icons/icon-yellow.png',
    size: [200, 200],
    offset: [0.5, 0.5],
    opacity: 1,
    scale: 0.3,
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    // color:'red'
    
  })
  const gardenMarkerStyle = new ol.style.Icon({
    src: './resources/icons/icon-green.png',
    size: [200, 200],
    offset: [0, 0],
    opacity: 1,
    scale: 0.3,
    // color:'red'
    
  });

  const woodlotMarkerStyle = new ol.style.Icon({
    src: './resources/icons/tree.png',
    size: [200, 200],
    offset: [0, 0],
    opacity: 1,
    scale: 0.12,
    color:'lime'
    
  });

  const gabionsMarkerStyle = new ol.style.Icon({
    src: './resources/icons/icon-white.png',
    size: [200, 200],
    offset: [0, 0],
    opacity: 1,
    scale: 0.3,
    // color:'red'
    
  });

  const borholeMarkerStyle = new ol.style.Icon({
    src: './resources/icons/borehole.png',
    size: [200, 200],
    offset: [0, 0],
    opacity: 1,
    scale: 0.1,
    color:'white'
    
  })



  // SUBCATCHMENT STYLE
  var getStyle = function (feature, resolution) {
    if (feature.get('Operational') =='yes') {
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: [50, 200, 90, 1] // semi-transparent red
            }),
            stroke: new ol.style.Stroke({
              color:'black',
              width: 0.2
            }),
        });
    }

   
      
    // else if ...
    else {
        return new ol.style.Style({
          fill: new ol.style.Fill({
            color: [220, 0, 0, 0.0] // semi-transparent red
        }),
        stroke: new ol.style.Stroke({
          color:'black',
          width: 0.2
        }),
        });
    }
};
var getStyle2 = function (feature, resolution) {
  if (feature.get('MEAN_1')>=8) {
      return new ol.style.Style({
          fill: new ol.style.Fill({
              color: [255, 0, 0,0.4], // semi-transparent red
          }),
          stroke: new ol.style.Stroke({
            color:'Black'
          }),          
      });
  }

  if (feature.get('MEAN_1')<=3)  {
      return new ol.style.Style({
          fill: new ol.style.Fill({
              color: [0, 255, 0,0.4] // semi-transparent red
          }),
          stroke: new ol.style.Stroke({
            color:'Black'
          }),             
      });
  }
  // else if ...
  else {
      return new ol.style.Style({
          fill: new ol.style.Fill({
              color: [255, 255, 0,0.4] // semi-transparent yellow
          }),
          stroke: new ol.style.Stroke({
            color:'Black'
          }),
      });
  }
};

  const fillStyle = new ol.style.Fill({
    color: [9, 122, 41, 1]
  })
    // Style for lines
  const strokeStyle = new ol.style.Stroke({
    color: [255, 0, 0, 1],
    width: 1.2,
    lineCap: 'square',
    lineJoin: 'bevel',
    lineDash: [0, 0]
  })

    // Icon Marker Style

  const regularShape = new ol.style.Circle({
    fill: new ol.style.Fill({
      color: [255, 98, 240, 1]
    }),
    stroke: strokeStyle,
    points: 3,
    radius1: 10,
    radius2: 4,
    rotation: 0.5,
    angle: 0,
    scale: 0.5
  })  ;
  const sandDamStyle = new ol.style.Icon({
    src: './resources/icons/dam.png',
    size: [100, 100],
    offset: [0, 0],
    opacity: 1,
    scale: 0.7,
    color: [255, 20, 147, 1]
    
  });
  

 // Dabane Wards
 const wardsGeoJSON = new ol.layer.VectorImage({
  source: new ol.source.Vector({
    url: './resources/shapefiles/semiAridWards.geojson',
    format: new ol.format.GeoJSON(),
    projection: 'EPSG:32735'
  }),
  visible: false,
  title: 'wards',
  style: function (feature, resolution) {
    return [
      getStyle(feature, resolution),
      createLabelStyle(feature, resolution)
    ];
  }
});

function createLabelStyle(feature, resolution) {
  // Extract the 'Names' property from the feature's properties
  const name = feature.get('Names');

  return new ol.style.Style({
    text: new ol.style.Text({
      text: name, // Set the text to the 'Names' attribute
      font: '12px Arial', // Customize the font and size
      fill: new ol.style.Fill({ color: 'black' }), // Set the text color
      stroke: new ol.style.Stroke({ color: 'white', width: 3 }), // Add an outline to the text
      offsetY: -15, // Offset the label up so it doesn't overlap the feature
      textAlign: 'center', // Center the text horizontally
      textBaseline: 'middle' // Center the text vertically
    })
  });
}



  // Zimbabwe Boundary
  const ZimbabweGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/zimBoundary.geojson',
      format: new ol.format.GeoJSON(),
      projection:'EPSG:32735'
    }),
    visible: true,
    title: 'zimbabwe',
    showLabels: true,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.01)'
      }),
      stroke: new ol.style.Stroke({
        color:'red',
        width: 5
      }),
     
    })
  })
  // DabaneDistricts
  const semiAridGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/semiAridDistricts.geojson',
      format: new ol.format.GeoJSON(),
      projection: 'EPSG:32735'
    }),
    visible: true,
    title: 'districts',
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
      }),
      stroke: new ol.style.Stroke({
        color: '#239ed7',
        width: 2
      })
    }),
    // Add the label style function
    renderMode: 'image',
    style: function (feature, resolution) {
      return [
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.4)'
          }),
          stroke: new ol.style.Stroke({
            color: '#239ed7',
            width: 2
          })
        }),
        createLabelStyle(feature, resolution)
      ];
    }
  });
  
  function createLabelStyle(feature, resolution) {
    // Extract the 'Names' property from the feature's properties
    const name = feature.get('Names');
  
    return new ol.style.Style({
      text: new ol.style.Text({
        text: name, // Set the text to the 'Names' attribute
        font: '8px Arial', // Customize the font and size
        fill: new ol.style.Fill({ color: 'black' }), // Set the text color
        stroke: new ol.style.Stroke({ color: 'white', width: 1 }), // Add an outline to the text
        offsetY: -15, // Offset the label up so it doesn't overlap the feature
        textAlign: 'center', // Center the text horizontally
        textBaseline: 'middle' // Center the text vertically
      })
    });
  }

   
  // Dabane Wards


  const wardssGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/wards.geojson',
      format: new ol.format.GeoJSON(),
      projection:'EPSG:32735'
    }),
    visible: true,
    title: 'districtss',
    // style: new ol.style.Style({
    //   fill: fillStyle
    // })
    style: function (feature, resolution) {
      return getStyle2(feature, resolution);
    }
  })

  //----------------------------------------------------------------------------------------------------------------------------------
  //POINT LAYERS


  // Sand Dams layer
  const sandDamsGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/sandDams.geojson',
      format: new ol.format.GeoJSON()
    }),
    visible: false,
    title: 'sandDams',
    style: new ol.style.Style({
      image:damMarkerStyle
    }),
    // Add the label style function
    renderMode: 'image',
    style: function (feature, resolution) {
      return [
        new ol.style.Style({
          image:damMarkerStyle
        }),
        createLabelStyle(feature, resolution)
      ];
    }

  })






  const gardensGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/gardens.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
      image:gardenMarkerStyle
    }),
    visible: false,
    title: 'gardens'
  })


  const woodLotGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/Woodlots.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
      image:woodlotMarkerStyle
    }),
    visible: false,
    title: 'woodlots'
  });

  const boreholeGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './resources/shapefiles/boreholes.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
      image:borholeMarkerStyle
    }),
    visible: false,
    title: 'boreholes'
  })




const waterpointsGeoJSON = new ol.layer.VectorImage({
  source: new ol.source.Vector({
    url: './resources/shapefiles/WaterPoints.geojson',
    format: new ol.format.GeoJSON()
  }),
  style: new ol.style.Style({
    image:waterPointMarkerStyle
  }),
  visible: false,
  title: 'waterPoints'
})


// const gabionsGeoJSON = new ol.layer.VectorImage({
//   source: new ol.source.Vector({
//     url: './resources/shapefiles/gabions.geojson',
//     format: new ol.format.GeoJSON()
//   }),
//   style:
//    new ol.style.Style({
//     image:new ol.style.Circle({
//       fill: new ol.style.Fill({
//         color: 'brown'
//       }),
//       radius: 2.5,
//       stroke: new ol.style.Stroke({
//         color: [0, 0, 0, 1],
//         width: 1
//       }) 
//     })   
//   }),
//   visible: false,
//   title: 'gabions'
// })


const gabionsGeoJSON = new ol.layer.VectorImage({
  source: new ol.source.Vector({
    url: './resources/shapefiles/gabions.geojson',
    format: new ol.format.GeoJSON()
  }),
  style: new ol.style.Style({
    image:gabionsMarkerStyle
  }),
  visible: false,
  title: 'gabions'
})

  // Custom image overlay for attribution

  // // Static Image Layer (observing location Perm-01)
  // const imageFragmentStatic2 = new ol.layer.Image ({
  //   source: new ol.source.ImageStatic ({
  //     url: './data/rasters/soil_risk.tif',
  //     imageExtent: [3081957,-2562334,3559156,-2245167],
  //     attributions: '© Kartolabs'
  //   }),
  //   visible: false,
  //   title: 'hotspots'
  // })

  // Thematic Layers Group
  const layerGroup = new ol.layer.Group({
    layers: [
       ZimbabweGeoJSON,wardsGeoJSON,semiAridGeoJSON,gardensGeoJSON,waterpointsGeoJSON,sandDamsGeoJSON, 
      gabionsGeoJSON,woodLotGeoJSON, boreholeGeoJSON
    ]
  })
  map.addLayer(layerGroup);

  // Layer Switcher Logic for Thematic Layers
  const layerElements = document.querySelectorAll('.sidebar ul li > input[type=checkbox]')
  // Initialize checkboxes (set to unchecked)
  for (var layerElement of layerElements) {
    layerElement.checked = false;
  }
  // Switching
  for(let layerElement of layerElements){
    layerElement.addEventListener('change', function(){
      let layerElementValue = this.value;
      let aLayer;

      layerGroup.getLayers().forEach(function(element, index, array){
        if(layerElementValue === element.get('title')){
          aLayer = element;
        }
      })
      this.checked ? aLayer.setVisible(true) : aLayer.setVisible(false)
    })
  }

  // *********************************************
  // Vector Feature Popup window
  // *********************************************

  // Vector Feature Popup Information
  const popupContainerElement = document.getElementById('popup-coordinates');
  const popup = new ol.Overlay({
    element: popupContainerElement,
  })

  function showGeogrCoordinates(e){
    const clickedCoordinate = e.coordinate;
    map.addOverlay(popup);
    popup.setPosition(undefined);
    popup.setPosition(clickedCoordinate);
    //console.log(clickedCoordinate);
    const lonlatCoordinate = ol.proj.transform(clickedCoordinate, 'EPSG:32640', 'EPSG:4326');
    const outCoordinate = ol.coordinate.toStringHDMS(lonlatCoordinate, 1);
    const pos = outCoordinate.indexOf("N") + 1;
    const latStr = outCoordinate.slice(0, pos);
    const lonStr = outCoordinate.slice(pos);
    const currentZoom = map.getView().getZoom().toFixed(2);
    const htmlText = 'Lat: ' + latStr + '<br>' + 'Lon: ' + lonStr + '<br> zoom: ' + currentZoom;
    popupContainerElement.innerHTML = htmlText;
  }

  function showProjCoordinates(e){
    const clickedCoordinate = e.coordinate;
    map.addOverlay(popup);
    popup.setPosition(undefined);
    popup.setPosition(clickedCoordinate);
    const outCoordinate = ol.coordinate.toStringXY(clickedCoordinate, 0);
    //console.log(outCoordinate);
    //const outCoordinate = ol.coordinate.toStringXY(clickedCoordinate, 0);
    //popupContainerElement.innerHTML = outCoordinate;
    const pos = outCoordinate.indexOf(",") + 1;
    const latStr = outCoordinate.slice(0, pos - 1);
    const lonStr = outCoordinate.slice(pos);
    const currentZoom = map.getView().getZoom().toFixed(2);
    const htmlText = 'X: ' + latStr + '<br>' + 'Y: ' + lonStr + '<br> zoom: ' + currentZoom;
    popupContainerElement.innerHTML = htmlText;
  }
  map.on('click', function(e){
    document.addEventListener('keydown', function(event){
      var keyOn = event.key;
      console.log(keyOn);
      switch(keyOn) {
        case 'Control':
          //console.log(keyOn);
          showGeogrCoordinates(e);
          break;
        case 'Shift':
          //console.log(keyOn);
          showProjCoordinates(e);
          break;
        default:
          map.removeOverlay(popup);
          return;
      }
    })
    map.removeOverlay(popup);
  })
  
    const clickElementsubcatch = document.querySelector('.overlay-container-subcatchment');
    const clickoverlaysubcatch = new ol.Overlay({
      element: clickElementsubcatch
      })
      map.addOverlay(clickoverlaysubcatch);
  
    const overlaysubcatchName = document.getElementById('subcatchment-name-info');
    const overlaysubcatchArea = document.getElementById('subcatchment-area');
    const overlayWardProject = document.getElementById('ward-project');
  
    map.on('click', function(e){
      clickoverlaysubcatch.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
          let clickedCoordinate = e.coordinate;
          let clickedsubcatchName = feature.get('District')
          let clickedsubcatchArea = feature.get('Ward')
          let clickedwardproject = feature.get('Project')
               
          clickoverlaysubcatch.setPosition(clickedCoordinate);
          overlaysubcatchName.innerHTML = 'District: ' + clickedsubcatchName;
          overlaysubcatchArea.innerHTML = 'Ward: ' + clickedsubcatchArea ;
          overlayWardProject.innerHTML = 'Project: ' + clickedwardproject ;
        },
        {
          layerFilter: function(layerCandidate){
            return layerCandidate.get('title') === 'wards';
          }
        })
      })

  
    const clickElementcatchment = document.querySelector('.overlay-container-catchment');
    const clickoverlaycatchment = new ol.Overlay({
      element: clickElementcatchment
      })
      map.addOverlay(clickoverlaycatchment);
  
    const overlayDamName = document.getElementById('Dam-name-info');
    const overlayDamDistrict = document.getElementById('Dam-Dsitrict-info');
    const overlaydamWard = document.getElementById('Dam-Ward-info');
    const overlayDamCatchment = document.getElementById('Dam-catchment-info');
    const overlayDamYear = document.getElementById('Dam-Year-info');
    const overlayDamImage = document.getElementById('dam-image');

  
    map.on('pointermove', function(e){
      clickoverlaycatchment.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
          let clickedCoordinate = e.coordinate;
          let clickedDamName = feature.get('Names')
          let clickedDamDistrict = feature.get('District')     
          let clickedDamWard = feature.get('Ward')
          let clickedDamCatchment = feature.get('Catchment')
          let clickedDamYear = feature.get('Year')
          let clickedDamImageURL = feature.get('imgUrl');

          clickoverlaycatchment.setPosition(clickedCoordinate);
          overlayDamName.innerHTML = clickedDamName + ' Sand Dam';
          overlayDamDistrict.innerHTML = 'District: ' + clickedDamDistrict;
          overlaydamWard.innerHTML = 'Ward:' + clickedDamWard;
          overlayDamCatchment.innerHTML = 'Catchment Area: ' + clickedDamCatchment;
          overlayDamYear.innerHTML = 'Year of Establishment: ' +clickedDamYear ;
          overlayDamImage.src = clickedDamImageURL;

          
        },
        {
          layerFilter: function(layerCandidate){
            return layerCandidate.get('title') === 'sandDams';
          }
        })
      })

const clickElementECW = document.querySelector('.overlay-container-ew');
    const clickoverlayECW = new ol.Overlay({
      element: clickElementECW
      })
      map.addOverlay(clickoverlayECW);
  
    const overlayECWType = document.getElementById('ECW-type-info');
    const overlayECWDistrict = document.getElementById('ECW-district-info');
    const overlayECWWardNumber = document.getElementById('ECW-wardNumber');
    const overlayECWProject = document.getElementById('ECW-project-info');
    // const overlaymeanValue = document.getElementById('local-Mean-Value');
  
    map.on('pointermove', function(e){
      clickoverlayECW.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
          let clickedCoordinate = e.coordinate;
          let clickedECWType = feature.get('Type')
          let clickedECWDistrict = feature.get('District')
          // let clickedmeanValue = feature.get('risk');   
          let clickedECWWardNumber = feature.get('Ward'); 
          let clickedECWProject= feature.get('Project');   
          clickoverlayECW.setPosition(clickedCoordinate);
          overlayECWType.innerHTML = clickedECWType;
          overlayECWDistrict.innerHTML = 'District: ' + clickedECWDistrict;
          // overlaymeanValue.innerHTML = 'Erosion Risk: ' + clickedmeanValue;
          overlayECWWardNumber.innerHTML = 'Ward: ' + clickedECWWardNumber;
          overlayECWProject.innerHTML = 'Project: ' + clickedECWProject; 

        },
        {
          layerFilter: function(layerCandidate){
            return layerCandidate.get('title') === 'gabions';
          }
        })
      })            
  const clickElementgardens = document.querySelector('.overlay-container-gardens');
  const clickoverlaygardens = new ol.Overlay({
    element: clickElementgardens
    })
    map.addOverlay(clickoverlaygardens);

  const overlayGardenName = document.getElementById('garden-name-info');
  const overlayGardenType = document.getElementById('garden-type-info');
  const overlayGardenDistrict = document.getElementById('garden-district-info');
  const overlayGardenWard = document.getElementById('garden-ward-info');
  const overlayGardenProject = document.getElementById('garden-project-info');
  const overlayGardenImage = document.getElementById('garden-image');
  

  map.on('pointermove', function(e){
    clickoverlaygardens.setPosition(undefined);
      map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
        let clickedCoordinate = e.coordinate;
        let clickedGardenName = feature.get('Name')
        let cllickedGardenType = feature.get('Type')  
        let clickedGardenDistict = feature.get('District')
        let cllickedGardenWard = feature.get('Ward')    
        let cllickedGardenProject = feature.get('Project')  
        let clickedGardenImageURL = feature.get('imgUrl');

        clickoverlaygardens.setPosition(clickedCoordinate);
          overlayGardenName.innerHTML = clickedGardenName;
          overlayGardenType.innerHTML = 'Type: ' + cllickedGardenType;
          overlayGardenDistrict.innerHTML = 'District: ' + clickedGardenDistict;
          overlayGardenWard.innerHTML = 'Ward: ' + cllickedGardenWard;
          overlayGardenProject.innerHTML = 'Project: ' + cllickedGardenProject;
          overlayGardenImage.src = clickedGardenImageURL;
      },
      {
        layerFilter: function(layerCandidate){
          return layerCandidate.get('title') === 'gardens';
        }
      })
    });


    


    //Woodlots Popup
    const clickElementwoodlot = document.querySelector('.overlay-container-woodlot');
    const clickoverlaywoodlot = new ol.Overlay({
      element: clickElementwoodlot
      })
      map.addOverlay(clickoverlaywoodlot);
  
    const overlaywoodlotName = document.getElementById('woodlot-name-info');
    const overlaywoodlotSize = document.getElementById('woodlot-size-info');
    const overlaywoodlotDistrict = document.getElementById('woodlot-district-info');
    const overlaywoodlotWard = document.getElementById('woodlot-ward-info');
    const overlaywoodlotDescription = document.getElementById('woodlot-description-info');
    const overlaywoodlotImage = document.getElementById('woodlot-image');
    
  
    map.on('pointermove', function(e){
      clickoverlaywoodlot.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
          let clickedCoordinate = e.coordinate;
          let clickedwoodlotName = feature.get('Names')
          let cllickedwoodlotSize = feature.get('Size (sq m)')  
          let clickedwoodlotDistict = feature.get('District')
          let cllickedwoodlotWard = feature.get('Ward')    
          let cllickedwoodlotDescription = feature.get('Type of trees planted')  
          let clickedwoodlotImageURL = feature.get('imgUrl');
  
          clickoverlaywoodlot.setPosition(clickedCoordinate);
          overlaywoodlotName.innerHTML = clickedwoodlotName;
          overlaywoodlotSize.innerHTML = 'Size: ' + cllickedwoodlotSize;
          overlaywoodlotDistrict.innerHTML = 'District: ' + clickedwoodlotDistict;
          overlaywoodlotWard.innerHTML = 'Ward: ' + cllickedwoodlotWard;
          overlaywoodlotDescription.innerHTML = cllickedwoodlotDescription;
          overlaywoodlotImage.src = clickedwoodlotImageURL;
        },
        {
          layerFilter: function(layerCandidate){
            return layerCandidate.get('title') === 'woodlots';
          }
        })
      })

  //Woodlots Popup
  const clickElementborehole = document.querySelector('.overlay-container-borehole');
  const clickoverlayborehole = new ol.Overlay({
    element: clickElementborehole
    })
    map.addOverlay(clickoverlayborehole);

  const overlayboreholeName = document.getElementById('borehole-name-info');
  const overlayboreholeType = document.getElementById('borehole-size-info');
  const overlayboreholeDistrict = document.getElementById('borehole-district-info');
  const overlayboreholeWard = document.getElementById('borehole-ward-info');
  const overlayboreholeDescription = document.getElementById('borehole-description-info');
  const overlayboreholeImage = document.getElementById('borehole-image');
  

  map.on('pointermove', function(e){
    clickoverlayborehole.setPosition(undefined);
      map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
        let clickedCoordinate = e.coordinate;
        let clickedboreholeName = feature.get('Names')
        let cllickedboreholeType = feature.get('Type of work')  
        let clickedboreholeDistict = feature.get('District')
        let cllickedboreholeWard = feature.get('Ward')    
        let cllickedboreholeDescription = feature.get('Program')  
        let clickedboreholeImageURL = feature.get('imgUrl');

        clickoverlayborehole.setPosition(clickedCoordinate);
        overlayboreholeName.innerHTML = clickedboreholeName;
        overlayboreholeType.innerHTML = 'Type of Work: ' + cllickedboreholeType;
        overlayboreholeDistrict.innerHTML = 'District: ' + clickedboreholeDistict;
        overlayboreholeWard.innerHTML = 'Ward: ' + cllickedboreholeWard;
        overlayboreholeDescription.innerHTML = cllickedboreholeDescription;
        overlayboreholeImage.src = clickedboreholeImageURL;
      },
      {
        layerFilter: function(layerCandidate){
          return layerCandidate.get('title') === 'boreholes';
        }
      })
    })  










    const clickElementSport = document.querySelector('.overlay-container-sport');
    const clickoverlaySport = new ol.Overlay({
    element: clickElementSport
    })
    map.addOverlay(clickoverlaySport);
    const overlaysport = document.getElementById('sport-facility-info');
    map.on('click', function(e){
      clickoverlaySport.setPosition(undefined);
        map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
          let clickedCoordinate = e.coordinate;
          let clickedSport = feature.get('PROVINCE')    
          if(clickedSport != undefined){
            clickoverlaySport.setPosition(clickedCoordinate);
            overlaysport.innerHTML = clickedSport;
         }
        },
        {
          layerFilter: function(layerCandidate){
            return layerCandidate.get('title') === 'wards';
          }
        })
      });
  
    const selectInteractionV2 = new ol.interaction.Select();
    map.addInteraction(selectInteractionV2);
    selectInteractionV2.on('select', function(e){ 
      let selectedFeature = e.selected;   
      if(selectedFeature.length > 0 && selectedFeature[0].getGeometry().getType() === 'MultiPoint'){
        selectedFeature[0].setStyle(
          new ol.style.Style({
            image: new ol.style.Circle({
              fill: new ol.style.Fill({
                color: [255, 0, 0, 1]
              }),
              radius: 10,
              stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1],
                width: 1
              })
            })
          })
        )
      };
      if(selectedFeature.lengt2h > 0 && selectedFeature[0].getGeometry().getType() === 'Polygon'){
        selectedFeature[0].setStyle(
          new ol.style.Style({
              fill: new ol.style.Fill({
                color: [255, 69, 0, 1]
              }),
              radius: 12,
              stroke: new ol.style.Stroke({
                color: [255, 69, 0, 1],
                width: 3
              })
          })
        )
      };
      if(selectedFeature.length > 0 && selectedFeature[0].getGeometry().getType() === 'MultiLineString'){
        selectedFeature[0].setStyle(
          new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: [255, 0, 255, 1],
                width: 3
              })
          })
        )
      };
    }) 

  // *********************************************
  // Additions
  // *********************************************

  // Real extent limits (for vector data, QGIS) Layer
  const extentLimitsGeoJSON = new ol.layer.VectorImage({
    source: new ol.source.Vector({
      url: './data/vectors/real_extent.geojson',
      format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(7, 252, 97, 0.8)',
        width: 5, 
        lineDash: [4, 1, 1, 2],
      })
    }),
    visible: true
  })
  map.addLayer(extentLimitsGeoJSON);

 
}
