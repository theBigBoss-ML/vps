export interface PostalCode {
  id: string;
  postalCode: string;
  state: string;
  lga: string;
  area: string;
  locality: string;
  street?: string;
}

export const defaultPostalCodes: PostalCode[] = [
  // Lagos Island LGA
  { id: '1', postalCode: '100001', state: 'Lagos', lga: 'Lagos Island', area: 'Lagos Island', locality: 'Marina' },
  { id: '2', postalCode: '100211', state: 'Lagos', lga: 'Lagos Island', area: 'Lagos Island', locality: 'Broad Street' },
  { id: '3', postalCode: '100212', state: 'Lagos', lga: 'Lagos Island', area: 'Lagos Island', locality: 'Onikan' },
  { id: '4', postalCode: '100213', state: 'Lagos', lga: 'Lagos Island', area: 'Lagos Island', locality: 'Idumota' },
  { id: '5', postalCode: '100214', state: 'Lagos', lga: 'Lagos Island', area: 'Lagos Island', locality: 'Balogun' },
  
  // Eti-Osa LGA - Victoria Island
  { id: '6', postalCode: '101241', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Ahmadu Bello Way' },
  { id: '7', postalCode: '101242', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Adeola Odeku' },
  { id: '8', postalCode: '101243', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Kofo Abayomi' },
  { id: '9', postalCode: '106104', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Bar Beach' },
  
  // Eti-Osa LGA - Ikoyi
  { id: '10', postalCode: '101233', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikoyi', locality: 'Awolowo Road' },
  { id: '11', postalCode: '101234', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikoyi', locality: 'Bourdillon' },
  { id: '12', postalCode: '101235', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikoyi', locality: 'Osborne' },
  { id: '13', postalCode: '106101', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikoyi', locality: 'Queens Drive' },
  { id: '14', postalCode: '106102', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikoyi', locality: 'Falomo' },
  
  // Eti-Osa LGA - Lekki
  { id: '15', postalCode: '105101', state: 'Lagos', lga: 'Eti-Osa', area: 'Lekki Phase 1', locality: 'Admiralty Way' },
  { id: '16', postalCode: '105102', state: 'Lagos', lga: 'Eti-Osa', area: 'Lekki Phase 1', locality: 'Freedom Way' },
  { id: '17', postalCode: '106103', state: 'Lagos', lga: 'Eti-Osa', area: 'Lekki', locality: 'Lekki Expressway' },
  { id: '18', postalCode: '105104', state: 'Lagos', lga: 'Eti-Osa', area: 'VGC', locality: 'Victoria Garden City' },
  { id: '19', postalCode: '105105', state: 'Lagos', lga: 'Eti-Osa', area: 'Ajah', locality: 'Ajah Market' },
  { id: '20', postalCode: '105106', state: 'Lagos', lga: 'Eti-Osa', area: 'Ajah', locality: 'Abraham Adesanya' },
  
  // Ikeja LGA
  { id: '21', postalCode: '100271', state: 'Lagos', lga: 'Ikeja', area: 'Ikeja', locality: 'Secretariat' },
  { id: '22', postalCode: '100272', state: 'Lagos', lga: 'Ikeja', area: 'Ikeja GRA', locality: 'GRA Ikeja' },
  { id: '23', postalCode: '100281', state: 'Lagos', lga: 'Ikeja', area: 'Allen Avenue', locality: 'Allen' },
  { id: '24', postalCode: '100282', state: 'Lagos', lga: 'Ikeja', area: 'Computer Village', locality: 'Otigba' },
  { id: '25', postalCode: '100283', state: 'Lagos', lga: 'Ikeja', area: 'Alausa', locality: 'Lagos State Secretariat' },
  { id: '26', postalCode: '100253', state: 'Lagos', lga: 'Ikeja', area: 'Opebi', locality: 'Opebi Road' },
  { id: '27', postalCode: '100254', state: 'Lagos', lga: 'Ikeja', area: 'Maryland', locality: 'Maryland Estate' },
  { id: '28', postalCode: '100263', state: 'Lagos', lga: 'Ikeja', area: 'Ikeja', locality: 'Murtala Muhammed Airport' },
  
  // Surulere LGA
  { id: '29', postalCode: '101283', state: 'Lagos', lga: 'Surulere', area: 'Surulere', locality: 'Adeniran Ogunsanya' },
  { id: '30', postalCode: '101284', state: 'Lagos', lga: 'Surulere', area: 'Surulere', locality: 'National Stadium' },
  { id: '31', postalCode: '101285', state: 'Lagos', lga: 'Surulere', area: 'Surulere', locality: 'Bode Thomas' },
  { id: '32', postalCode: '101286', state: 'Lagos', lga: 'Surulere', area: 'Ojuelegba', locality: 'Ojuelegba' },
  
  // Lagos Mainland LGA - Yaba
  { id: '33', postalCode: '101245', state: 'Lagos', lga: 'Lagos Mainland', area: 'Yaba', locality: 'Yaba Market' },
  { id: '34', postalCode: '101246', state: 'Lagos', lga: 'Lagos Mainland', area: 'Yaba', locality: 'Herbert Macaulay' },
  { id: '35', postalCode: '101247', state: 'Lagos', lga: 'Lagos Mainland', area: 'Akoka', locality: 'University of Lagos' },
  { id: '36', postalCode: '101248', state: 'Lagos', lga: 'Lagos Mainland', area: 'Sabo', locality: 'Sabo Yaba' },
  { id: '37', postalCode: '100223', state: 'Lagos', lga: 'Lagos Mainland', area: 'Ebute Metta', locality: 'Oyingbo' },
  
  // Apapa LGA
  { id: '38', postalCode: '102273', state: 'Lagos', lga: 'Apapa', area: 'Apapa', locality: 'Wharf Road' },
  { id: '39', postalCode: '102274', state: 'Lagos', lga: 'Apapa', area: 'Apapa', locality: 'GRA Apapa' },
  { id: '40', postalCode: '102275', state: 'Lagos', lga: 'Apapa', area: 'Apapa', locality: 'Tin Can Island' },
  
  // Ajeromi-Ifelodun LGA
  { id: '41', postalCode: '102101', state: 'Lagos', lga: 'Ajeromi-Ifelodun', area: 'Ajegunle', locality: 'Ajegunle' },
  { id: '42', postalCode: '102102', state: 'Lagos', lga: 'Ajeromi-Ifelodun', area: 'Olodi', locality: 'Olodi Apapa' },
  
  // Amuwo-Odofin LGA
  { id: '43', postalCode: '102102', state: 'Lagos', lga: 'Amuwo-Odofin', area: 'Festac', locality: 'Festac Town' },
  { id: '44', postalCode: '102103', state: 'Lagos', lga: 'Amuwo-Odofin', area: 'Mile 2', locality: 'Mile 2' },
  { id: '45', postalCode: '102104', state: 'Lagos', lga: 'Amuwo-Odofin', area: 'Satellite Town', locality: 'Satellite Town' },
  
  // Mushin LGA
  { id: '46', postalCode: '100253', state: 'Lagos', lga: 'Mushin', area: 'Mushin', locality: 'Mushin Market' },
  { id: '47', postalCode: '100254', state: 'Lagos', lga: 'Mushin', area: 'Idi Araba', locality: 'LUTH' },
  { id: '48', postalCode: '100255', state: 'Lagos', lga: 'Mushin', area: 'Palm Avenue', locality: 'Palm Avenue' },
  
  // Oshodi-Isolo LGA
  { id: '49', postalCode: '100261', state: 'Lagos', lga: 'Oshodi-Isolo', area: 'Oshodi', locality: 'Oshodi Market' },
  { id: '50', postalCode: '100262', state: 'Lagos', lga: 'Oshodi-Isolo', area: 'Isolo', locality: 'Isolo Industrial' },
  { id: '51', postalCode: '100263', state: 'Lagos', lga: 'Oshodi-Isolo', area: 'Ajao Estate', locality: 'Ajao Estate' },
  { id: '52', postalCode: '100264', state: 'Lagos', lga: 'Oshodi-Isolo', area: 'Mafoluku', locality: 'Mafoluku' },
  
  // Agege LGA
  { id: '53', postalCode: '100283', state: 'Lagos', lga: 'Agege', area: 'Agege', locality: 'Agege Stadium' },
  { id: '54', postalCode: '100284', state: 'Lagos', lga: 'Agege', area: 'Pen Cinema', locality: 'Pen Cinema' },
  { id: '55', postalCode: '100285', state: 'Lagos', lga: 'Agege', area: 'Ogba', locality: 'Ogba' },
  
  // Kosofe LGA
  { id: '56', postalCode: '100242', state: 'Lagos', lga: 'Kosofe', area: 'Ketu', locality: 'Ketu' },
  { id: '57', postalCode: '100243', state: 'Lagos', lga: 'Kosofe', area: 'Ogudu', locality: 'Ogudu' },
  { id: '58', postalCode: '100244', state: 'Lagos', lga: 'Kosofe', area: 'Ojota', locality: 'Ojota' },
  { id: '59', postalCode: '100245', state: 'Lagos', lga: 'Kosofe', area: 'Ikosi', locality: 'Ikosi Ketu' },
  
  // Ikorodu LGA
  { id: '60', postalCode: '104101', state: 'Lagos', lga: 'Ikorodu', area: 'Ikorodu', locality: 'Ikorodu Town' },
  { id: '61', postalCode: '104102', state: 'Lagos', lga: 'Ikorodu', area: 'Ikorodu', locality: 'Ikorodu BRT' },
  { id: '62', postalCode: '104103', state: 'Lagos', lga: 'Ikorodu', area: 'Ijede', locality: 'Ijede' },
  { id: '63', postalCode: '104104', state: 'Lagos', lga: 'Ikorodu', area: 'Imota', locality: 'Imota' },
  
  // Epe LGA
  { id: '64', postalCode: '106221', state: 'Lagos', lga: 'Epe', area: 'Epe', locality: 'Epe Town' },
  { id: '65', postalCode: '106222', state: 'Lagos', lga: 'Epe', area: 'Epe', locality: 'Epe Market' },
  { id: '66', postalCode: '106223', state: 'Lagos', lga: 'Epe', area: 'Eredo', locality: 'Eredo' },
  
  // Badagry LGA
  { id: '67', postalCode: '103101', state: 'Lagos', lga: 'Badagry', area: 'Badagry', locality: 'Badagry Town' },
  { id: '68', postalCode: '103102', state: 'Lagos', lga: 'Badagry', area: 'Badagry', locality: 'Badagry Beach' },
  { id: '69', postalCode: '103103', state: 'Lagos', lga: 'Badagry', area: 'Seme', locality: 'Seme Border' },
  
  // Alimosho LGA
  { id: '70', postalCode: '100275', state: 'Lagos', lga: 'Alimosho', area: 'Egbeda', locality: 'Egbeda' },
  { id: '71', postalCode: '100276', state: 'Lagos', lga: 'Alimosho', area: 'Idimu', locality: 'Idimu' },
  { id: '72', postalCode: '100277', state: 'Lagos', lga: 'Alimosho', area: 'Ipaja', locality: 'Ipaja' },
  { id: '73', postalCode: '100278', state: 'Lagos', lga: 'Alimosho', area: 'Igando', locality: 'Igando' },
  { id: '74', postalCode: '100279', state: 'Lagos', lga: 'Alimosho', area: 'Ikotun', locality: 'Ikotun' },
  
  // Ifako-Ijaiye LGA
  { id: '75', postalCode: '100286', state: 'Lagos', lga: 'Ifako-Ijaiye', area: 'Ifako', locality: 'Ifako' },
  { id: '76', postalCode: '100287', state: 'Lagos', lga: 'Ifako-Ijaiye', area: 'Ojokoro', locality: 'Ojokoro' },
  { id: '77', postalCode: '100288', state: 'Lagos', lga: 'Ifako-Ijaiye', area: 'Ijaiye', locality: 'Ijaiye' },
  
  // Somolu LGA
  { id: '78', postalCode: '100233', state: 'Lagos', lga: 'Somolu', area: 'Somolu', locality: 'Somolu' },
  { id: '79', postalCode: '100234', state: 'Lagos', lga: 'Somolu', area: 'Bariga', locality: 'Bariga' },
  { id: '80', postalCode: '100235', state: 'Lagos', lga: 'Somolu', area: 'Gbagada', locality: 'Gbagada' },
  
  // Shomolu additional
  { id: '81', postalCode: '100236', state: 'Lagos', lga: 'Somolu', area: 'Gbagada Phase 2', locality: 'Gbagada Estate' },
  
  // More Victoria Island
  { id: '82', postalCode: '101244', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Landmark' },
  { id: '83', postalCode: '101245', state: 'Lagos', lga: 'Eti-Osa', area: 'Victoria Island', locality: 'Oniru' },
  
  // More Lekki
  { id: '84', postalCode: '105107', state: 'Lagos', lga: 'Eti-Osa', area: 'Lekki Phase 2', locality: 'Chevron' },
  { id: '85', postalCode: '105108', state: 'Lagos', lga: 'Eti-Osa', area: 'Ikate', locality: 'Ikate Elegushi' },
  
  // Magodo
  { id: '86', postalCode: '100236', state: 'Lagos', lga: 'Kosofe', area: 'Magodo', locality: 'Magodo Phase 1' },
  { id: '87', postalCode: '100237', state: 'Lagos', lga: 'Kosofe', area: 'Magodo', locality: 'Magodo Phase 2' },
  
  // Anthony
  { id: '88', postalCode: '100232', state: 'Lagos', lga: 'Kosofe', area: 'Anthony', locality: 'Anthony Village' },
  
  // More Surulere
  { id: '89', postalCode: '101287', state: 'Lagos', lga: 'Surulere', area: 'Masha', locality: 'Masha' },
  { id: '90', postalCode: '101288', state: 'Lagos', lga: 'Surulere', area: 'Lawanson', locality: 'Lawanson' },
  
  // Orile
  { id: '91', postalCode: '102111', state: 'Lagos', lga: 'Ajeromi-Ifelodun', area: 'Orile', locality: 'Orile Iganmu' },
  
  // Obalende
  { id: '92', postalCode: '101231', state: 'Lagos', lga: 'Lagos Island', area: 'Obalende', locality: 'Obalende' },
  
  // CMS
  { id: '93', postalCode: '100215', state: 'Lagos', lga: 'Lagos Island', area: 'CMS', locality: 'Church Missionary Society' },
  
  // More Ikeja
  { id: '94', postalCode: '100255', state: 'Lagos', lga: 'Ikeja', area: 'Oregun', locality: 'Oregun' },
  { id: '95', postalCode: '100256', state: 'Lagos', lga: 'Ikeja', area: 'Kudirat Abiola Way', locality: 'Kudirat Abiola' },
  
  // Ilupeju
  { id: '96', postalCode: '100252', state: 'Lagos', lga: 'Ikeja', area: 'Ilupeju', locality: 'Ilupeju Industrial' },
  
  // Palmgrove
  { id: '97', postalCode: '100251', state: 'Lagos', lga: 'Somolu', area: 'Palmgrove', locality: 'Palmgrove Estate' },
  
  // Fadeyi
  { id: '98', postalCode: '100242', state: 'Lagos', lga: 'Somolu', area: 'Fadeyi', locality: 'Fadeyi' },
  
  // Jibowu
  { id: '99', postalCode: '100241', state: 'Lagos', lga: 'Lagos Mainland', area: 'Jibowu', locality: 'Jibowu' },
  
  // Third Mainland
  { id: '100', postalCode: '100249', state: 'Lagos', lga: 'Lagos Mainland', area: 'Third Mainland', locality: 'Third Mainland Bridge' },
];
