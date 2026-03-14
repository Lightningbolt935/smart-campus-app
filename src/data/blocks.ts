export type Category = 'academic' | 'lab' | 'facility' | 'food' | 'hostel' | 'sports' | 'gate';

export type Block = {
  id: string;
  name: string;
  short: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
};

export const BLOCKS: Block[] = [
  { id: 'main_gate', name: 'Main Campus Gate',                    short: 'GATE',   category: 'gate',     lat: 12.821172, lng: 80.037893, description: 'Main entrance from GST Road' },
  { id: 'arch_gate', name: 'Arch Gate',                           short: 'ARCH G', category: 'gate',     lat: 12.822998, lng: 80.041261, description: 'Iconic arch entrance gate' },
  { id: 'tp1',       name: 'Tech Park Tower I',                   short: 'TP-I',   category: 'academic', lat: 12.824760, lng: 80.045193, description: 'CSE, IT & Computing Depts' },
  { id: 'tp2',       name: 'Tech Park Tower II',                  short: 'TP-II',  category: 'academic', lat: 12.824595, lng: 80.045874, description: 'ECE, EEE Departments' },
  { id: 'ub',        name: 'University Building',                  short: 'UB',     category: 'academic', lat: 12.823594, lng: 80.042616, description: 'Academic, VC & Registrar offices' },
  { id: 'crc',       name: 'Class Room Complex',                  short: 'CRC',    category: 'academic', lat: 12.820402, lng: 80.037989, description: 'Lecture halls & classrooms' },
  { id: 'civil',     name: 'Civil Engineering Block',             short: 'CIVIL',  category: 'academic', lat: 12.820171, lng: 80.038536, description: 'Civil & Structural Engg' },
  { id: 'auto',      name: 'Automobile Engineering Block',        short: 'AUTO',   category: 'academic', lat: 12.820309, lng: 80.039336, description: 'Automobile Engineering' },
  { id: 'arch',      name: 'School of Architecture & Interior',   short: 'ARCH',   category: 'academic', lat: 12.824106, lng: 80.044202, description: 'Architecture & Interior Design' },
  { id: 'mbo',       name: 'Faculty of Management (MBO)',         short: 'MBA',    category: 'academic', lat: 12.823708, lng: 80.044223, description: 'MBA & Management Studies' },
  { id: 'mca',       name: 'Mechanical Block A',                  short: 'MC-A',   category: 'academic', lat: 12.820521, lng: 80.039156, description: 'Mechanical Engg Block A' },
  { id: 'mhg',       name: 'Mechanical Hangar',                   short: 'M-HGR',  category: 'lab',      lat: 12.820528, lng: 80.040002, description: 'Heavy machinery & workshop' },
  { id: 'hitech',    name: 'Hi-Tech Block',                       short: 'HITECH', category: 'lab',      lat: 12.820995, lng: 80.038911, description: 'Advanced computing & R&D labs' },
  { id: 'bel',       name: 'Basic Engineering Lab',               short: 'BEL',    category: 'lab',      lat: 12.823165, lng: 80.043492, description: 'First year engineering labs' },
  { id: 'fab',       name: 'Fab Lab',                             short: 'FAB',    category: 'lab',      lat: 12.822390, lng: 80.045563, description: 'Fabrication & prototyping lab' },
  { id: 'cvr',       name: 'Sir C.V. Raman Research Park',        short: 'CVR',    category: 'lab',      lat: 12.824925, lng: 80.044418, description: 'Innovation & research park' },
  { id: 'tpg',       name: 'Dr. T.P. Ganesan Auditorium',        short: 'AUDIT',  category: 'facility', lat: 12.824436, lng: 80.046502, description: 'Main campus auditorium' },
  { id: 'vfs',       name: 'Vendhar Food Street',                 short: 'VFS',    category: 'food',     lat: 12.823776, lng: 80.045528, description: 'Campus food street' },
  { id: 'java',      name: 'Java Canteen',                        short: 'JAVA',   category: 'food',     lat: 12.823081, lng: 80.044580, description: 'Popular campus cafe' },
  { id: 'aqc',       name: 'Aquatic Complex',                     short: 'POOL',   category: 'sports',   lat: 12.825128, lng: 80.050677, description: 'Olympic swimming pool' },
  { id: 'dhyan',     name: 'Dhyan Chand Indoor Stadium',          short: 'STAD',   category: 'sports',   lat: 12.825056, lng: 80.048836, description: 'Main indoor stadium' },
];

