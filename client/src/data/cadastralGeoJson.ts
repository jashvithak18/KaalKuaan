// Realistic Indian Cadastral Land Parcel GeoJSON for Nalgonda Pilot Region (Ramanapet / Vemulapally)
// Features irregular agricultural field boundaries, survey numbers, irrigation canals, and village roads.

export const cadastralParcelsGeoJson: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        surveyNo: "142/3A",
        village: "Ramanapet",
        mandal: "Vemulapally",
        extentAcres: 2.45,
        landUse: "Dry Cropland (Cotton / Red Gram)",
        hasAnomaly: true,
        wellId: "KK-TS-04281"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2660, 17.0525],
            [79.2705, 17.0532],
            [79.2712, 17.0560],
            [79.2670, 17.0558],
            [79.2660, 17.0525]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "142/3B",
        village: "Ramanapet",
        mandal: "Vemulapally",
        extentAcres: 1.80,
        landUse: "Fallow / Pasture",
        hasAnomaly: false
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2705, 17.0532],
            [79.2745, 17.0538],
            [79.2750, 17.0565],
            [79.2712, 17.0560],
            [79.2705, 17.0532]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "143/1",
        village: "Ramanapet",
        mandal: "Vemulapally",
        extentAcres: 3.10,
        landUse: "Paddy (Canal Fed)",
        hasAnomaly: false
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2670, 17.0558],
            [79.2712, 17.0560],
            [79.2718, 17.0592],
            [79.2665, 17.0588],
            [79.2670, 17.0558]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "89/1B",
        village: "Settipalem",
        mandal: "Miryalaguda",
        extentAcres: 2.20,
        landUse: "Dry Cropland",
        hasAnomaly: true,
        wellId: "KK-TS-04282"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2785, 17.0600],
            [79.2835, 17.0608],
            [79.2842, 17.0645],
            [79.2790, 17.0638],
            [79.2785, 17.0600]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "55/2C",
        village: "Buggabavigudem",
        mandal: "Vemulapally",
        extentAcres: 1.65,
        landUse: "Rocky Scrubland",
        hasAnomaly: true,
        wellId: "KK-TS-04283"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2490, 17.0390],
            [79.2548, 17.0398],
            [79.2552, 17.0435],
            [79.2495, 17.0428],
            [79.2490, 17.0390]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "210/4",
        village: "Thimmapur",
        mandal: "Miryalaguda",
        extentAcres: 4.05,
        landUse: "Orchard (Citrus / Sweet Lime)",
        hasAnomaly: true,
        wellId: "KK-TS-04284"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2960, 17.0750],
            [79.3025, 17.0760],
            [79.3030, 17.0810],
            [79.2968, 17.0805],
            [79.2960, 17.0750]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "17/8",
        village: "Gudivada",
        mandal: "Vemulapally",
        extentAcres: 2.90,
        landUse: "Wet Paddy",
        hasAnomaly: true,
        wellId: "KK-TS-04285"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2360, 17.0290],
            [79.2425, 17.0300],
            [79.2430, 17.0345],
            [79.2368, 17.0340],
            [79.2360, 17.0290]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        surveyNo: "94/2",
        village: "Kondrapole",
        mandal: "Chityal",
        extentAcres: 3.50,
        landUse: "Groundnut / Cotton",
        hasAnomaly: true,
        wellId: "KK-TS-04286"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2420, 17.0860],
            [79.2485, 17.0870],
            [79.2490, 17.0915],
            [79.2428, 17.0910],
            [79.2420, 17.0860]
          ]
        ]
      }
    }
  ]
};

// Village boundary lines (cadastral revenue division boundaries)
export const villageBoundariesGeoJson: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Ramanapet Gram Panchayat Boundary" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2620, 17.0480],
            [79.2780, 17.0500],
            [79.2790, 17.0630],
            [79.2630, 17.0610],
            [79.2620, 17.0480]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Settipalem Gram Panchayat Boundary" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.2760, 17.0570],
            [79.2890, 17.0590],
            [79.2900, 17.0700],
            [79.2770, 17.0680],
            [79.2760, 17.0570]
          ]
        ]
      }
    }
  ]
};

// Irrigation canal and major village roads
export const ruralInfrastructureGeoJson: any = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { type: "Canal", name: "Nagarjunasagar Left Canal Distributary D-14" },
      geometry: {
        type: "LineString",
        coordinates: [
          [79.2300, 17.0350],
          [79.2500, 17.0450],
          [79.2750, 17.0580],
          [79.3050, 17.0750]
        ]
      }
    },
    {
      type: "Feature",
      properties: { type: "Road", name: "Mandal Rural Link Road (Vemulapally-Ramanapet)" },
      geometry: {
        type: "LineString",
        coordinates: [
          [79.2600, 17.0450],
          [79.2680, 17.0540],
          [79.2820, 17.0620],
          [79.3000, 17.0780]
        ]
      }
    }
  ]
};
