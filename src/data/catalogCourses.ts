export interface CatalogCourse {
  title: string
  category: string
  image: string
}

const images = {
  machinery:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=85',
  height:
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85',
  safety:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85',
  warehouse:
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=85',
  food: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85',
  telco:
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=85',
  online:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
}

export const catalogCategories = [
  'Todos',
  'Maquinaria industrial',
  'Trabajos en altura',
  'Espacios confinados',
  'Formación TELCO',
  'Trekform online',
  'Construcción (TPC) / Metal (TPM)',
  'Prevención',
  'Logística',
  'Hostelería',
]

export const catalogCourses: CatalogCourse[] = [
  {
    title: 'Curso de equipos de protección individual (EPI)',
    category: 'Prevención',
    image: images.safety,
  },
  {
    title: 'Curso de operario almacén + carnet carretillas',
    category: 'Logística',
    image: images.warehouse,
  },
  { title: 'Curso de lucha contra incendios', category: 'Prevención', image: images.safety },
  {
    title: 'Curso de seguridad de trabajos en altura',
    category: 'Trabajos en altura',
    image: images.height,
  },
  { title: 'Curso de picking y radiofrecuencia', category: 'Logística', image: images.warehouse },
  {
    title: 'Curso de manipulador de alimentos (Empresas)',
    category: 'Hostelería',
    image: images.food,
  },
  { title: 'Curso de riesgos eléctricos TELCO', category: 'Formación TELCO', image: images.telco },
  { title: 'Curso de trabajos verticales', category: 'Trabajos en altura', image: images.height },
  {
    title: 'Curso de plataformas elevadoras (PEMP)',
    category: 'Maquinaria industrial',
    image: images.machinery,
  },
  { title: 'Curso de prevención riesgo químico', category: 'Prevención', image: images.safety },
  { title: 'Curso de operaciones TELCO', category: 'Formación TELCO', image: images.telco },
  {
    title: 'Curso de operario de puente grúa',
    category: 'Maquinaria industrial',
    image: images.machinery,
  },
  { title: 'Curso de manipulación manual de cargas', category: 'Prevención', image: images.safety },
  { title: 'Curso de operario de almacén', category: 'Logística', image: images.warehouse },
  { title: 'Curso básico de primeros auxilios', category: 'Prevención', image: images.safety },
  {
    title: 'Curso de operario de carretilla trilateral',
    category: 'Maquinaria industrial',
    image: images.machinery,
  },
  { title: 'Curso de trabajos altura TELCO I', category: 'Formación TELCO', image: images.telco },
  {
    title: 'Curso de manipulador de alimentos online',
    category: 'Trekform online',
    image: images.online,
  },
  { title: 'Curso de trabajos altura TELCO II', category: 'Formación TELCO', image: images.telco },
  {
    title: 'Curso de trabajos en altura para poda de árboles',
    category: 'Trabajos en altura',
    image: images.height,
  },
  {
    title: 'Curso de operario de dumper',
    category: 'Maquinaria industrial',
    image: images.machinery,
  },
  { title: 'Curso DEA + SVB continuado', category: 'Prevención', image: images.safety },
  { title: 'Curso de operario de recogepedidos', category: 'Logística', image: images.warehouse },
  {
    title: 'Curso de ciberseguridad (IFCT135PO)',
    category: 'Trekform online',
    image: images.online,
  },
]
