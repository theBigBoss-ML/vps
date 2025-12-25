export interface TestCoordinate {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  area: string;
  lga: string;
  type: 'commercial' | 'residential' | 'mixed';
}

export const defaultTestCoordinates: TestCoordinate[] = [
  // Victoria Island
  { id: '1', name: 'Eko Hotel & Suites', latitude: 6.4281, longitude: 3.4219, area: 'Victoria Island', lga: 'Eti-Osa', type: 'commercial' },
  { id: '2', name: 'Bar Beach Victoria Island', latitude: 6.4217, longitude: 3.4156, area: 'Victoria Island', lga: 'Eti-Osa', type: 'mixed' },
  { id: '3', name: 'Landmark Beach', latitude: 6.4236, longitude: 3.4698, area: 'Victoria Island', lga: 'Eti-Osa', type: 'commercial' },
  { id: '4', name: 'Mega Plaza VI', latitude: 6.4312, longitude: 3.4201, area: 'Victoria Island', lga: 'Eti-Osa', type: 'commercial' },
  { id: '5', name: 'Silverbird Galleria', latitude: 6.4318, longitude: 3.4256, area: 'Victoria Island', lga: 'Eti-Osa', type: 'commercial' },
  
  // Ikeja
  { id: '6', name: 'Computer Village Entrance', latitude: 6.6167, longitude: 3.3502, area: 'Computer Village', lga: 'Ikeja', type: 'commercial' },
  { id: '7', name: 'Ikeja City Mall', latitude: 6.6079, longitude: 3.3481, area: 'Alausa', lga: 'Ikeja', type: 'commercial' },
  { id: '8', name: 'Allen Avenue Junction', latitude: 6.6024, longitude: 3.3544, area: 'Allen Avenue', lga: 'Ikeja', type: 'commercial' },
  { id: '9', name: 'Ikeja GRA', latitude: 6.5856, longitude: 3.3411, area: 'GRA Ikeja', lga: 'Ikeja', type: 'residential' },
  { id: '10', name: 'Murtala Muhammed Airport', latitude: 6.5774, longitude: 3.3213, area: 'Airport', lga: 'Ikeja', type: 'commercial' },
  { id: '11', name: 'Opebi Link Road', latitude: 6.5948, longitude: 3.3612, area: 'Opebi', lga: 'Ikeja', type: 'commercial' },
  { id: '12', name: 'Maryland Mall', latitude: 6.5654, longitude: 3.3659, area: 'Maryland', lga: 'Ikeja', type: 'commercial' },
  
  // Lekki
  { id: '13', name: 'Lekki Phase 1 Gate', latitude: 6.4474, longitude: 3.4707, area: 'Lekki Phase 1', lga: 'Eti-Osa', type: 'residential' },
  { id: '14', name: 'Circle Mall Lekki', latitude: 6.4389, longitude: 3.4512, area: 'Lekki Phase 1', lga: 'Eti-Osa', type: 'commercial' },
  { id: '15', name: 'Lekki Conservation Centre', latitude: 6.4367, longitude: 3.5412, area: 'Lekki', lga: 'Eti-Osa', type: 'mixed' },
  { id: '16', name: 'Chevron Roundabout', latitude: 6.4452, longitude: 3.5167, area: 'Lekki', lga: 'Eti-Osa', type: 'commercial' },
  { id: '17', name: 'Ajah Under Bridge', latitude: 6.4634, longitude: 3.5678, area: 'Ajah', lga: 'Eti-Osa', type: 'commercial' },
  { id: '18', name: 'VGC Gate', latitude: 6.4512, longitude: 3.5234, area: 'Victoria Garden City', lga: 'Eti-Osa', type: 'residential' },
  
  // Lagos Island
  { id: '19', name: 'Balogun Market', latitude: 6.4550, longitude: 3.3897, area: 'Lagos Island', lga: 'Lagos Island', type: 'commercial' },
  { id: '20', name: 'Idumota Market', latitude: 6.4578, longitude: 3.3912, area: 'Lagos Island', lga: 'Lagos Island', type: 'commercial' },
  { id: '21', name: 'Marina Lagos', latitude: 6.4489, longitude: 3.3978, area: 'Marina', lga: 'Lagos Island', type: 'commercial' },
  { id: '22', name: 'TBS Complex', latitude: 6.4445, longitude: 3.4012, area: 'Onikan', lga: 'Lagos Island', type: 'commercial' },
  { id: '23', name: 'National Museum', latitude: 6.4456, longitude: 3.3989, area: 'Onikan', lga: 'Lagos Island', type: 'mixed' },
  
  // Ikoyi
  { id: '24', name: 'Ikoyi Club', latitude: 6.4523, longitude: 3.4334, area: 'Ikoyi', lga: 'Eti-Osa', type: 'mixed' },
  { id: '25', name: 'Falomo Shopping Centre', latitude: 6.4445, longitude: 3.4267, area: 'Ikoyi', lga: 'Eti-Osa', type: 'commercial' },
  { id: '26', name: 'Awolowo Road Ikoyi', latitude: 6.4512, longitude: 3.4356, area: 'Ikoyi', lga: 'Eti-Osa', type: 'residential' },
  
  // Surulere
  { id: '27', name: 'National Stadium Surulere', latitude: 6.4969, longitude: 3.3539, area: 'Surulere', lga: 'Surulere', type: 'mixed' },
  { id: '28', name: 'Adeniran Ogunsanya Street', latitude: 6.4934, longitude: 3.3512, area: 'Surulere', lga: 'Surulere', type: 'commercial' },
  { id: '29', name: 'Ojuelegba Under Bridge', latitude: 6.5089, longitude: 3.3656, area: 'Ojuelegba', lga: 'Surulere', type: 'commercial' },
  { id: '30', name: 'Bode Thomas Street', latitude: 6.4898, longitude: 3.3534, area: 'Surulere', lga: 'Surulere', type: 'commercial' },
  
  // Yaba
  { id: '31', name: 'Yaba Market', latitude: 6.5157, longitude: 3.3762, area: 'Yaba', lga: 'Lagos Mainland', type: 'commercial' },
  { id: '32', name: 'UNILAG Main Gate', latitude: 6.5158, longitude: 3.3895, area: 'Akoka', lga: 'Lagos Mainland', type: 'mixed' },
  { id: '33', name: 'Sabo Yaba', latitude: 6.5089, longitude: 3.3789, area: 'Yaba', lga: 'Lagos Mainland', type: 'commercial' },
  { id: '34', name: 'Herbert Macaulay Way', latitude: 6.5112, longitude: 3.3745, area: 'Yaba', lga: 'Lagos Mainland', type: 'commercial' },
  
  // Apapa
  { id: '35', name: 'Apapa Wharf', latitude: 6.4456, longitude: 3.3678, area: 'Apapa', lga: 'Apapa', type: 'commercial' },
  { id: '36', name: 'Tin Can Island', latitude: 6.4234, longitude: 3.3389, area: 'Apapa', lga: 'Apapa', type: 'commercial' },
  { id: '37', name: 'Ajegunle', latitude: 6.4567, longitude: 3.3456, area: 'Ajegunle', lga: 'Ajeromi-Ifelodun', type: 'residential' },
  
  // Festac
  { id: '38', name: 'Festac Town', latitude: 6.4634, longitude: 3.2834, area: 'Festac', lga: 'Amuwo-Odofin', type: 'residential' },
  { id: '39', name: 'Mile 2 Bus Stop', latitude: 6.4512, longitude: 3.3123, area: 'Mile 2', lga: 'Amuwo-Odofin', type: 'commercial' },
  
  // Mushin
  { id: '40', name: 'Mushin Market', latitude: 6.5312, longitude: 3.3534, area: 'Mushin', lga: 'Mushin', type: 'commercial' },
  { id: '41', name: 'Idi Araba', latitude: 6.5234, longitude: 3.3612, area: 'Mushin', lga: 'Mushin', type: 'mixed' },
  
  // Oshodi
  { id: '42', name: 'Oshodi Market', latitude: 6.5567, longitude: 3.3412, area: 'Oshodi', lga: 'Oshodi-Isolo', type: 'commercial' },
  { id: '43', name: 'MMIA Car Park', latitude: 6.5734, longitude: 3.3234, area: 'Oshodi', lga: 'Oshodi-Isolo', type: 'commercial' },
  
  // Agege
  { id: '44', name: 'Agege Stadium', latitude: 6.6234, longitude: 3.3267, area: 'Agege', lga: 'Agege', type: 'mixed' },
  { id: '45', name: 'Pen Cinema', latitude: 6.6189, longitude: 3.3312, area: 'Agege', lga: 'Agege', type: 'commercial' },
  
  // Ikorodu
  { id: '46', name: 'Ikorodu BRT Terminal', latitude: 6.6189, longitude: 3.5012, area: 'Ikorodu', lga: 'Ikorodu', type: 'commercial' },
  { id: '47', name: 'Ikorodu Market', latitude: 6.6156, longitude: 3.5089, area: 'Ikorodu', lga: 'Ikorodu', type: 'commercial' },
  
  // Epe
  { id: '48', name: 'Epe Market', latitude: 6.5845, longitude: 3.9867, area: 'Epe', lga: 'Epe', type: 'commercial' },
  
  // Badagry
  { id: '49', name: 'Badagry Beach', latitude: 6.4167, longitude: 2.8833, area: 'Badagry', lga: 'Badagry', type: 'mixed' },
  
  // Isolo
  { id: '50', name: 'Isolo Industrial Estate', latitude: 6.5234, longitude: 3.3156, area: 'Isolo', lga: 'Oshodi-Isolo', type: 'commercial' },
];
