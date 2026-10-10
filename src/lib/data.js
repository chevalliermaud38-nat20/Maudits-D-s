// Modèles de données pour D&D 5.5

export const initialData = {
  sorts: [
    {
      id: 'boule-de-feu-1',
      nom: 'Boule de feu',
      ecole: 'Évocation',
      niveau: '3',
      tempsIncantation: '1 action',
      portee: '36m',
      duree: 'Instantanée',
      composantes: ['V', 'S', 'M'],
      concentration: false,
      rituel: false,
      descriptif: 'Une brillante gerbe de flamme jaillit de votre main. Chaque créature dans un cône de 6m doit faire un jet de sauvegarde de Dextérité. Les créatures qui échouent subissent 8d6 dégâts de feu, et celles qui réussissent en subissent la moitié. Le feu enflamme les objets inflammables dans la zone et endommage les objets qui y sont.'
    },
    {
      id: 'guerison-mineure-1',
      nom: 'Guérison mineure',
      ecole: 'Évocation',
      niveau: '1',
      tempsIncantation: '1 action',
      portee: 'Contact',
      duree: 'Instantanée',
      composantes: ['V', 'S'],
      concentration: false,
      rituel: false,
      descriptif: 'Une créature que vous touchez récupère un nombre de points de vie égal à 1d8 + votre modificateur de caractéristique d\'incantation. Ce sort n\'a aucun effet sur les morts-vivants ou les créatures artificielles.'
    },
    {
      id: 'invisibilite-1',
      nom: 'Invisibilité',
      ecole: 'Illusion',
      niveau: '2',
      tempsIncantation: '1 action',
      portee: 'Contact',
      duree: '1 heure (concentration)',
      composantes: ['V', 'S', 'M'],
      concentration: true,
      rituel: false,
      descriptif: 'Une créature que vous touchez devient invisible jusqu\'à la fin du sort. Tout ce que la créature porte ou transporte est également invisible tant qu\'elle reste à son contact. Le sort se termine si le sujet attaque ou lance un sort.'
    },
    {
      id: 'eclair-1',
      nom: 'Éclair',
      ecole: 'Évocation',
      niveau: '3',
      tempsIncantation: '1 action',
      portee: '36m',
      duree: 'Instantanée',
      composantes: ['V', 'S', 'M'],
      concentration: false,
      rituel: false,
      descriptif: 'Un éclair foudroyant jaillit de votre point de doigt vers un point de votre choix que vous pouvez voir à portée. La créature dans la ligne doit faire un jet de sauvegarde de Dextérité. Un jet de sauvegarde raté inflige 8d6 dégâts de foudre, et un jet réussi la moitié.'
    }
  ],
  monstres: [
    {
      id: 'gobelin-1',
      nom: 'Gobelin',
      type: 'Humanoïde',
      taille: 'Petite',
      ca: '15 (armure de cuir, bouclier)',
      pv: '7 (2d6)',
      alignement: 'Chaotique Mauvais',
      legendaire: false,
      fd: '1/4',
      vitesse: '9m',
      bonusInitiative: 0,
      caracteristiques: { Force: 8, Dextérité: 14, Constitution: 10, Intelligence: 10, Sagesse: 8, Charisme: 8 },
      competences: 'Furtivité +6',
      sens: 'Vision dans le noir 18m, Perception passive 9',
      langues: 'Commun, Gobelin',
      equipement: 'Épée courte, dague, arc court, flèches',
      traits: 'Nimbleness: Le gobelin peut se faufiler à travers des espaces de 1,50 m de large.',
      actions: 'Épée courte: +4 au toucher, 5 (1d6+2) dégâts perforants. Dague: +4 au toucher, 5 (1d4+2) dégâts perforants. Arc court: +4 au toucher, 5 (1d6+2) dégâts perforants.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'loup-1',
      nom: 'Loup',
      type: 'Bête',
      taille: 'Moyenne',
      ca: '13',
      pv: '11 (2d8+2)',
      alignement: 'Neutre',
      legendaire: false,
      fd: '1/4',
      vitesse: '12m',
      bonusInitiative: 2,
      caracteristiques: { Force: 12, Dextérité: 15, Constitution: 12, Intelligence: 3, Sagesse: 12, Charisme: 6 },
      competences: 'Perception +3, Furtivité +4',
      sens: 'Perception passive 13',
      langues: '-',
      equipement: '-',
      traits: 'Odorat et ouïe: Le loup a un avantage aux tests de Sagesse (Perception) basés sur l\'odorat ou l\'ouïe. Tactique de groupe: Le loup a un avantage aux jets d\'attaque contre une créature si au moins un des alliés du loup est à 1,50 m ou moins de la créature et que l\'allié n\'est pas incapable d\'agir.',
      actions: 'Morsure: +4 au toucher, 7 (2d4+2) dégâts perforants. Si la cible est une créature, elle doit réussir un jet de sauvegarde de Force DD 11 ou être tombée à terre.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'squelette-1',
      nom: 'Squelette',
      type: 'Mort-vivant',
      taille: 'Moyenne',
      ca: '13',
      pv: '13 (2d8+4)',
      alignement: 'Loyal Mauvais',
      legendaire: false,
      fd: '1/4',
      vitesse: '9m',
      bonusInitiative: 0,
      caracteristiques: { Force: 10, Dextérité: 14, Constitution: 15, Intelligence: 6, Sagesse: 8, Charisme: 5 },
      competences: '-',
      sens: 'Vision dans le noir 18m, Perception passive 9',
      langues: '-',
      equipement: 'Arme de guerre, armure légère',
      traits: '',
      actions: 'Épée courte: +4 au toucher, 5 (1d6+2) dégâts perforants. Arc court: +4 au toucher, 5 (1d6+2) dégâts perforants.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'zombie-1',
      nom: 'Zombie',
      type: 'Mort-vivant',
      taille: 'Moyenne',
      ca: '8',
      pv: '22 (3d8+9)',
      alignement: 'Neutre Mauvais',
      legendaire: false,
      fd: '1/4',
      vitesse: '6m',
      bonusInitiative: 0,
      caracteristiques: { Force: 13, Dextérité: 6, Constitution: 16, Intelligence: 3, Sagesse: 6, Charisme: 5 },
      competences: '-',
      sens: 'Vision dans le noir 18m, Perception passive 8',
      langues: '-',
      equipement: '-',
      traits: 'Fortune du mort-vivant: Le zombie a un avantage aux jets de sauvegarde contre les effets qui le rendraient charmé, effrayé, paralysé, étourdi, empoisonné ou à terre.',
      actions: 'Attaque de griffes: +3 au toucher, 4 (1d6+1) dégâts contondants.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'orque-1',
      nom: 'Orque',
      type: 'Humanoïde',
      taille: 'Moyenne',
      ca: '13 (armure de cuir cloutée)',
      pv: '15 (2d8+6)',
      alignement: 'Chaotique Mauvais',
      legendaire: false,
      fd: '1/2',
      vitesse: '9m',
      bonusInitiative: 0,
      caracteristiques: { Force: 16, Dextérité: 12, Constitution: 16, Intelligence: 7, Sagesse: 12, Charisme: 7 },
      competences: 'Intimidation +2',
      sens: 'Vision dans le noir 18m, Perception passive 11',
      langues: 'Commun, Orque',
      equipement: 'Grande épée, javelots',
      traits: 'Furie agressive: En tant qu\'action bonus, l\'orque peut se déplacer jusqu\'à sa vitesse vers une créature hostile qu\'il peut voir.',
      actions: 'Grande épée: +5 au toucher, 9 (2d6+3) dégâts tranchants. Javelot: +5 au toucher, 6 (1d6+3) dégâts perforants ou 11 (2d6+3) dégâts perforants si utilisé à deux mains avec une portée de 6/18m.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'ogre-1',
      nom: 'Ogre',
      type: 'Géant',
      taille: 'Grande',
      ca: '11 (armure rembourrée)',
      pv: '59 (7d10+21)',
      alignement: 'Chaotique Mauvais',
      legendaire: false,
      fd: '2',
      vitesse: '9m',
      bonusInitiative: 0,
      caracteristiques: { Force: 19, Dextérité: 8, Constitution: 16, Intelligence: 5, Sagesse: 7, Charisme: 7 },
      competences: '-',
      sens: 'Vision dans le noir 18m, Perception passive 8',
      langues: 'Commun, Géant',
      equipement: 'Grande massue',
      traits: '',
      actions: 'Grande massue: +6 au toucher, 13 (2d8+4) dégâts contondants.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'troll-1',
      nom: 'Troll',
      type: 'Géant',
      taille: 'Grande',
      ca: '15 (armure naturelle)',
      pv: '84 (8d10+40)',
      alignement: 'Chaotique Mauvais',
      legendaire: false,
      fd: '5',
      vitesse: '9m',
      bonusInitiative: 0,
      caracteristiques: { Force: 18, Dextérité: 13, Constitution: 20, Intelligence: 7, Sagesse: 9, Charisme: 7 },
      competences: '-',
      sens: 'Vision dans le noir 18m, Perception passive 9',
      langues: 'Géant',
      equipement: '-',
      traits: 'Régénération: Le troll récupère 10 PV au début de chacun de ses tours. Si le troll subit des dégâts d\'acide ou de feu, ce trait ne fonctionne pas au début du prochain tour du troll. Le troll meurt seulement s\'il commence son tour avec 0 PV et ne se régénère pas.',
      actions: 'Attaque à mains nues: +7 au toucher, 11 (2d6+4) dégâts contondants. Morsure: +7 au toucher, 7 (1d6+4) dégâts perforants.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    },
    {
      id: 'dragon-rouge-jeune-1',
      nom: 'Dragon rouge jeune',
      type: 'Dragon',
      taille: 'Grande',
      ca: '18 (armure naturelle)',
      pv: '119 (14d10+42)',
      alignement: 'Chaotique Mauvais',
      legendaire: false,
      fd: '10',
      vitesse: '12m (18m vol) 9m (nage)',
      bonusInitiative: 2,
      caracteristiques: { Force: 19, Dextérité: 10, Constitution: 17, Intelligence: 14, Sagesse: 11, Charisme: 15 },
      competences: 'Perception +5, Furtivité +2',
      sens: 'Blindvision 18m, Perception passive 15',
      langues: 'Commun, Draconique',
      equipement: '-',
      traits: 'Résistance légendaire (1/jour): Si le dragon échoue à un jet de sauvegarde, il peut choisir de réussir à la place.',
      actions: 'Attaque multiple: Le dragon fait trois attaques: une de morsure et deux de griffes. Morsure: +7 au toucher, 15 (2d10+4) dégâts perforants plus 4 (1d8) dégâts de feu. Griffes: +7 au toucher, 11 (2d6+4) dégâts tranchants. Souffle de feu (Recharge 5-6): Le dragon crache du feu dans un cône de 9m. Chaque créature dans cette zone doit faire un jet de sauvegarde de Dextérité DD 15, subissant 42 (12d6) dégâts de feu en cas d\'échec, ou la moitié en cas de réussite.',
      sortsPrepares: [],
      slotsSorts: {},
      actionsLegendaire: '',
      reactions: ''
    }
  ],
  personnages: [],
  campagnes: [],
  githubConfig: {
    token: '',
    repo: '',
    owner: '',
    filename: 'maudits-des-data.json'
  }
}

// Écoles de magie
export const ecolesMagie = [
  'Abjuration',
  'Évocation',
  'Nécromancie',
  'Illusion',
  'Transmutation',
  'Divination',
  'Enchantement',
  'Conjuration'
]

// Niveaux de sorts
export const niveauxSorts = [
  '0 (Cantrip)',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9'
]

// Composantes de sorts
export const composantesSorts = ['V', 'S', 'M']

// Types de monstres
export const typesMonstres = [
  'Humanoïde',
  'Bête',
  'Monstre construit',
  'Dragon',
  'Élémentaire',
  'Fée',
  'Fiélon',
  'Géant',
  'Mort-vivant',
  'Plante',
  'Slime',
  'Monstruosité'
]

// Tailles de créatures
export const taillesCreature = [
  'Infime',
  'Minuscule',
  'Petite',
  'Moyenne',
  'Grande',
  'Immense',
  'Colossale'
]

// Alignements
export const alignements = [
  'Loyal Bon',
  'Neutre Bon',
  'Chaotique Bon',
  'Loyal Neutre',
  'Neutre',
  'Chaotique Neutre',
  'Loyal Mauvais',
  'Neutre Mauvais',
  'Chaotique Mauvais'
]

// Classes de D&D
export const classesDD = [
  'Barbare',
  'Barde',
  'Clerc',
  'Druide',
  'Ensorceleur',
  'Guerrier',
  'Magicien',
  'Moine',
  'Orc',
  'Paladin',
  'Rôdeur',
  'Roublard',
  'Sorcier'
]

// Caractéristiques
export const caracteristiques = ['Force', 'Dextérité', 'Constitution', 'Intelligence', 'Sagesse', 'Charisme']
