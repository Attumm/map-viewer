import React, { useEffect, useRef, useState } from 'react';
import { loadModules } from 'esri-loader';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
  const [clickedPoints, setClickedPoints] = useState([]);

  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/Graphic', 'esri/layers/GraphicsLayer'])
      .then(([Map, MapView, Graphic, GraphicsLayer]) => {
        const map = new Map({
          basemap: 'topo-vector'
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [4.895168, 52.370216],
          zoom: 10,
          ui: {
            components: []
          }
        });

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);

        view.on('pointer-move', (event) => {
          const point = view.toMap({ x: event.x, y: event.y });
          setCoordinates({
            lat: point.latitude.toFixed(6),
            lon: point.longitude.toFixed(6)
          });
        });

        view.on('click', (event) => {
          const point = view.toMap({ x: event.x, y: event.y });
          const newPoint = {
            type: 'point',
            longitude: point.longitude,
            latitude: point.latitude
          };

          setClickedPoints(prevPoints => [...prevPoints, newPoint]);

          const graphic = new Graphic({
            geometry: point,
            symbol: {
              type: "simple-marker",
              color: [226, 119, 40],
              outline: {
                color: [255, 255, 255],
                width: 1
              }
            }
          });

          graphicsLayer.add(graphic);
          createPostGISObject(newPoint);
        });
      })
      .catch(err => console.error(err));

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, []);

  const createPostGISObject = (point) => {
    console.log('Creating PostGIS object:', point);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(255,255,255,0.8)', 
        padding: '5px', 
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <div>Lat: {coordinates.lat}, Lon: {coordinates.lon}</div>
        <div>Clicked Points: {clickedPoints.length}</div>
      </div>
    </div>
  );
};

export default MapComponent;
