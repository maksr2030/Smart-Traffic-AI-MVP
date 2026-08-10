export const SAMPLE_DATA = {
  roads: [
    { id: 'R1', ar: 'طريق الملك فهد', en: 'King Fahd Road', density: 86, speed: 26, weather: 'rain', incident: true },
    { id: 'R2', ar: 'طريق المدينة', en: 'Madinah Road', density: 63, speed: 47, weather: 'clear', incident: false },
    { id: 'R3', ar: 'طريق مكة', en: 'Makkah Road', density: 39, speed: 72, weather: 'clear', incident: false },
    { id: 'R4', ar: 'طريق الأمير سلطان', en: 'Prince Sultan Road', density: 74, speed: 35, weather: 'fog', incident: false }
  ],
  drivers: [
    { id: 'D1', speed: 132, hardBrakes: 2, location: 'R1' },
    { id: 'D2', speed: 88, hardBrakes: 7, location: 'R2' },
    { id: 'D3', speed: 78, hardBrakes: 1, location: 'R3' }
  ],
  vehicles: [
    { id: 'AV-01', road: 'R1', battery: 78 },
    { id: 'AV-02', road: 'R2', battery: 62 }
  ],
  intersections: [
    { id: 'I1', ar: 'تقاطع الملك فهد', en: 'King Fahd Intersection', density: 88 },
    { id: 'I2', ar: 'تقاطع المدينة', en: 'Madinah Intersection', density: 58 },
    { id: 'I3', ar: 'تقاطع مكة', en: 'Makkah Intersection', density: 35 }
  ]
};

export const DATA_CLASSIFICATION = Object.freeze({
  source: 'SIMULATED_INTERNAL',
  live: false,
  fieldValidated: false,
  description: 'Synthetic demonstration data generated for the public MVP.'
});
