"use client";
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion } from "framer-motion";
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData=[
  {name: "United States of America", users: 120, sellers: 30},
  {name: "India", users: 100, sellers: 30},
  {name: "Germany", users: 85, sellers: 15},
  {name: "Paris", users: 110, sellers: 10},
  {name: "Vietnam", users: 180, sellers: 40},
]

const getColor = (countryName: string) => {
  const country=countryData.find(c => c.name===countryName);
  if(!country) return "#1e293b";
  const total=country.users+country.sellers;
  if (total > 100) return "#22c55e";
  if(total>0) return "#3b82f6";
  return "#1e293b";
}

const GeoGraphicalMap=() => {
  const [hovered, setHovered]=useState<{
    name: string;
    users: number;
    sellers: number;
  }|null>(null);

  const [tooltipPosition, setTooltipPosition]=useState({x: 0, y: 0});

  return (
    <div className='relative w-full px-0 py-5 overflow-visible'>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{scale: 230, center: [0, 10]}}
        width={1400}
        height={500}
        viewBox="0 0 1400 500"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: "100%",
          height: "35vh",
          background: "transparent",
          margin: 0,
          padding: 0,
          display: "block",
        }}
      >
        <Geographies geography={geoUrl}>
          {({geographies}) =>
            geographies.map((geo) => {
              const countryName=geo.properties.name;
              const match=countryData.find(c => c.name===countryName);
              const baseColor=getColor(countryName);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(e) => {
                    setTooltipPosition({x: e.pageX, y: e.pageY});
                    setHovered({
                      name: countryName,
                      users: match? match.users : 0,
                      sellers: match? match.sellers : 0,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPosition({x: e.pageX, y: e.pageY});
                  }}
                  onMouseLeave={() => setHovered(null)}
                  fill={baseColor}
                  stroke='#334155'
                  style={{
                    default: {
                      outline: "none",
                      transition: 'fill 0.3s ease-in-out',
                    },
                    hover: {
                      fill: match? baseColor:"#facc15",
                      outline: "none",
                      transition: 'fill 0.3s ease-in-out',
                    },
                    pressed: { fill: '#ef4444', outline: "none" },
                  }}
                />
              )
            })}
        </Geographies>
      </ComposableMap>

      {/* Tooltip with animation */}
      {hovered && (
        <motion.div
          key={hovered.name}
          initial={{opacity: 0, scale: 0.95}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0.95}}
          transition={{duration: 0.15, ease: "easeOut"}}
          className="fixed bg-gray-800 text-white text-xs p-2 !rounded shadow-lg pointer-events-none z-50"
          style={{
            top: tooltipPosition.y,
            left: tooltipPosition.x,
          }}
        >
          <strong>{hovered.name}</strong>
          <br />
          Users: <strong className='text-green-400'>{hovered.users}</strong>
          <br />
          Sellers: <strong className='text-yellow-400'>{hovered.sellers}</strong>
        </motion.div>
      )}
    </div>
  )
}

export default GeoGraphicalMap;
