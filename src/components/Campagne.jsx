import { useState } from 'react'
import { Plus, Edit, Play, Trash2, ChevronRight, ChevronDown, Users, Sword } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select, SelectItem } from './ui/Select'
import { Textarea } from './ui/Textarea'
import { RichTextarea } from './ui/RichTextarea'
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Checkbox } from './ui/Checkbox'
import { formatMarkdown } from '../lib/utils'

export function Campagne({ campagnes, personnages, monstres, sorts, onAdd, onUpdate, onDelete, onAddPersoToCampagne, onAddRencontre, onAddMonstreToRencontre }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCampagne, setSelectedCampagne] = useState(null)
  const [selectedRencontre, setSelectedRencontre] = useState(null)
  const [dialogMode, setDialogMode] = useState('campagne') // 'campagne', 'rencontre', 'combat', 'viewRencontre', 'categorie', 'initiative'
  const [formData, setFormData] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})
  const [combatData, setCombatData] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list', 'detail' ou 'combat'
  const [detailTab, setDetailTab] = useState('personnages') // 'personnages' ou 'rencontres'
  const [selectedMonstres, setSelectedMonstres] = useState([]) // Pour le formulaire de rencontre
  const [initiativeData, setInitiativeData] = useState({}) // Pour stocker les initiatives des joueurs

  const openCampagneDialog = () => {
    setDialogMode('campagne')
    setFormData({ nom: '', description: '' })
    setDialogOpen(true)
  }

  const openCampagneDetail = (campagne) => {
    setSelectedCampagne(campagne)
    setViewMode('detail')
    setDetailTab('rencontres')
    // Ouvrir toutes les catégories par défaut
    const categories = [...new Set(campagne.rencontres.map(r => r.categorie))]
    const initialExpanded = {}
    categories.forEach(cat => {
      initialExpanded[`${campagne.id}-${cat}`] = true
    })
    setExpandedCategories(initialExpanded)
  }

  const backToList = () => {
    setSelectedCampagne(null)
    setViewMode('list')
  }

  const exitCombat = () => {
    setCombatData(null)
    setViewMode('detail')
  }

  const deleteRencontre = (rencontreId) => {
    if (confirm('Supprimer cette rencontre ?')) {
      const updatedRencontres = selectedCampagne.rencontres.filter(r => r.id !== rencontreId)
      const updatedCampagne = { ...selectedCampagne, rencontres: updatedRencontres }
      onUpdate(selectedCampagne.id, updatedCampagne)
      setSelectedCampagne(updatedCampagne)
    }
  }

  const openRencontreDialog = (campagne) => {
    setSelectedCampagne(campagne)
    setSelectedRencontre(null)
    setDialogMode('rencontre')
    setSelectedMonstres([])
    // Récupérer les catégories existantes
    const categories = [...new Set(campagne.rencontres.map(r => r.categorie))]
    setFormData({ categorie: categories.length > 0 ? categories[0] : '', nom: '', description: '', monstreSearch: '', monstreQuantite: 1 })
    setDialogOpen(true)
  }

  const openCategorieDialog = () => {
    setDialogMode('categorie')
    setFormData({ categorie: '' })
    setDialogOpen(true)
  }

  const deleteCategorie = (categorie) => {
    if (confirm(`Supprimer la catégorie "${categorie}" et toutes ses rencontres ?`)) {
      const updatedRencontres = selectedCampagne.rencontres.filter(r => r.categorie !== categorie)
      const updatedCampagne = { ...selectedCampagne, rencontres: updatedRencontres }
      onUpdate(selectedCampagne.id, updatedCampagne)
      setSelectedCampagne(updatedCampagne)
    }
  }

  const addMonstreToForm = (monstreId, quantite) => {
    setSelectedMonstres([...selectedMonstres, { monstreId, quantite: parseInt(quantite) }])
  }

  const removeMonstreFromForm = (index) => {
    setSelectedMonstres(selectedMonstres.filter((_, i) => i !== index))
  }

  const openAddMonstreDialog = (campagne, rencontre) => {
    setSelectedCampagne(campagne)
    setSelectedRencontre(rencontre)
    setDialogMode('addMonstre')
    setFormData({ monstreId: '', quantite: 1 })
    setDialogOpen(true)
  }

  const openViewRencontreDialog = (campagne, rencontre) => {
    setSelectedCampagne(campagne)
    setSelectedRencontre(rencontre)
    setDialogMode('editRencontre')
    // Récupérer les catégories existantes
    const categories = [...new Set(campagne.rencontres.map(r => r.categorie))]
    setFormData({
      nom: rencontre.nom,
      categorie: rencontre.categorie,
      description: rencontre.description,
      categories
    })
    setDialogOpen(true)
  }

  const openCombatDialog = (campagne, rencontre) => {
    setSelectedCampagne(campagne)
    setSelectedRencontre(rencontre)
    // Initialiser les données d'initiative pour les joueurs
    const init = {}
    campagne.personnages.forEach(p => {
      init[p.id] = ''
    })
    setInitiativeData(init)
    setDialogMode('initiative')
    setDialogOpen(true)
  }

  const startCombat = () => {
    // Calculer les initiatives des monstres
    const monstresCombat = selectedRencontre.monstres.map(m => {
      const monstreTemplate = monstres.find(mon => mon.id === m.monstreId)
      // Même initiative pour toutes les instances du même monstre
      const initiativeMonstre = Math.floor(Math.random() * 20) + 1 + (monstreTemplate?.bonusInitiative || 0)
      return {
        ...m,
        monstreTemplate,
        instances: Array.from({ length: m.quantite }).map((_, i) => ({
          id: `${m.monstreId}-${i}`,
          initiative: initiativeMonstre,
          pvActuels: monstreTemplate?.pv || 0,
          commentaire: '',
          slotsUtilises: {},
          conditions: [],
          deathSaves: { successes: 0, failures: 0 }
        }))
      }
    })

    // Exclure les joueurs avec initiative 0
    const joueursActifs = selectedCampagne.personnages.filter(p => parseInt(initiativeData[p.id]) > 0)

    const combatInit = {
      rencontre: selectedRencontre,
      joueursParticipants: joueursActifs.map(p => ({
        ...p,
        initiative: parseInt(initiativeData[p.id]) || 0,
        pvActuels: p.pvActuels,
        slotsUtilises: {},
        conditions: [],
        deathSaves: { successes: 0, failures: 0 }
      })),
      monstresCombat,
      tourActuel: 0,
      round: 1
    }
    setCombatData(combatInit)
    setDialogOpen(false)
    setViewMode('combat')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (dialogMode === 'campagne') {
      onAdd({ ...formData, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, personnages: [], rencontres: [] })
    } else if (dialogMode === 'rencontre') {
      const newRencontre = { ...formData, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, monstres: selectedMonstres }
      onAddRencontre(selectedCampagne.id, newRencontre)
      setSelectedCampagne({ ...selectedCampagne, rencontres: [...selectedCampagne.rencontres, newRencontre] })
    } else if (dialogMode === 'editRencontre') {
      const updatedRencontre = { ...selectedRencontre, nom: formData.nom, categorie: formData.categorie, description: formData.description }
      onUpdate(selectedCampagne.id, { ...selectedCampagne, rencontres: selectedCampagne.rencontres.map(r => r.id === selectedRencontre.id ? updatedRencontre : r) })
      setSelectedCampagne({ ...selectedCampagne, rencontres: selectedCampagne.rencontres.map(r => r.id === selectedRencontre.id ? updatedRencontre : r) })
      setSelectedRencontre(updatedRencontre)
    } else if (dialogMode === 'addPerso') {
      onAddPersoToCampagne(selectedCampagne.id, formData.personnageId)
      const perso = personnages.find(p => p.id === formData.personnageId)
      setSelectedCampagne({ ...selectedCampagne, personnages: [...selectedCampagne.personnages, perso] })
    } else if (dialogMode === 'addMonstre') {
      onAddMonstreToRencontre(selectedCampagne.id, selectedRencontre.id, formData.monstreId, formData.quantite)
      const updatedRencontre = {
        ...selectedRencontre,
        monstres: [...selectedRencontre.monstres, { monstreId: formData.monstreId, quantite: formData.quantite }]
      }
      setSelectedRencontre(updatedRencontre)
      setSelectedCampagne({ ...selectedCampagne, rencontres: selectedCampagne.rencontres.map(r => r.id === selectedRencontre.id ? updatedRencontre : r) })
    }
    setDialogOpen(false)
  }

  const toggleCategory = (campagneId, categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [`${campagneId}-${categoryName}`]: !prev[`${campagneId}-${categoryName}`]
    }))
  }

  const lancerInitiativeMonstres = () => {
    if (!combatData) return

    const newCombatData = { ...combatData }
    newCombatData.monstresCombat = newCombatData.monstresCombat.map(mc => ({
      ...mc,
      instances: mc.instances.map(instance => ({
        ...instance,
        initiative: Math.floor(Math.random() * 20) + 1 + (mc.monstreTemplate?.bonusInitiative || 0)
      }))
    }))
    setCombatData(newCombatData)
  }

  const updateJoueurInitiative = (joueurId, value) => {
    const newJoueurs = combatData.joueursParticipants.map(j =>
      j.id === joueurId ? { ...j, initiative: parseInt(value) || 0 } : j
    )
    setCombatData({ ...combatData, joueursParticipants: newJoueurs })
  }

  const getOrdreInitiative = () => {
    if (!combatData) return []
    
    const allCombatants = [
      ...combatData.joueursParticipants.map(j => ({ ...j, type: 'joueur' })),
      ...combatData.monstresCombat.flatMap(mc => 
        mc.instances.map(instance => ({ ...instance, type: 'monstre', monstreTemplate: mc.monstreTemplate, nomMonstre: mc.monstreTemplate?.nom, quantite: mc.quantite }))
      )
    ]
    
    return allCombatants.sort((a, b) => b.initiative - a.initiative)
  }

  const getOrdreInitiativeActif = () => {
    if (!combatData) return []
    const allCombatants = [
      ...combatData.joueursParticipants.map(j => ({ ...j, type: 'joueur' })),
      ...combatData.monstresCombat.flatMap(mc =>
        mc.instances.map(instance => ({ ...instance, type: 'monstre', monstreTemplate: mc.monstreTemplate, nomMonstre: mc.monstreTemplate?.nom, quantite: mc.quantite }))
      )
    ]

    // Filtrer seulement les monstres à 0 PV (les joueurs restent pour jets de sauvegarde contre la mort)
    return allCombatants.filter(c => c.type === 'joueur' || parseInt(c.pvActuels) > 0).sort((a, b) => b.initiative - a.initiative)
  }

  const updatePV = (combatant, delta) => {  
    const pvMax = parseInt(combatant.type === 'joueur' ? combatant.pvMax : combatant.monstreTemplate?.pv) || 0  
    const anciensPV = parseInt(combatant.pvActuels) || 0  
    const nouveauxPV = Math.max(0, anciensPV + delta)
    const fatigueBonus = (combatant.type === 'joueur' && anciensPV === 0 && nouveauxPV > 0) ? 1 : 0  
    const changes = {   
      pvActuels: nouveauxPV,  
      fatigue: (combatant.fatigue || 0) + fatigueBonus  
    }  
    
    // En péril : coché automatiquement sous 50 % des PV max  
    const conditions = combatant.conditions || []  
    const enPeril = pvMax > 0 && nouveauxPV < pvMax / 2  
    if (enPeril && !conditions.includes('En péril')) {  
      changes.conditions = [...conditions, 'En péril']  
    } else if (!enPeril && conditions.includes('En péril')) {  
      changes.conditions = conditions.filter(c => c !== 'En péril')  
    }  
    
  // +1 fatigue si le joueur était à 0 PV et est soigné  
      if (fatigueBonus > 0 && !(combatant.conditions || []).includes('Épuisement')) {  
      changes.conditions = [...(changes.conditions || combatant.conditions || []), 'Épuisement']  
    }  
  
    if (delta < 0) {  
      const degats = -delta  
      // Concentration : JS Con DD 10 ou moitié des dégâts (arrondi inf.), max 30 — un jet par source  
      if (combatant.concentration?.active) {  
        changes.concentrationDD = Math.min(30, Math.max(10, Math.floor(degats / 2)))  
      }  
      if (combatant.type === 'joueur') {  
        // Dégâts à 0 PV : +1 échec de sauvegarde contre la mort  
        if (anciensPV <= 0) {  
          const ds = combatant.deathSaves || { successes: 0, failures: 0 }  
          changes.deathSaves = { ...ds, failures: Math.min(3, ds.failures + 1) }  
        }  
        // Mort instantanée : dégâts restants après 0 PV >= PV max  
        if (degats - anciensPV >= pvMax) {  
          changes.deathSaves = { successes: 0, failures: 3 }  
        }  
      }  
    }  
  
    // Soins depuis 0 PV : réinitialiser les jets contre la mort  
    if (delta > 0 && combatant.type === 'joueur' && anciensPV <= 0 && nouveauxPV > 0) {  
      changes.deathSaves = { successes: 0, failures: 0 }  
    }  
  
    updateCombatant(combatant, changes)  
  }  

  const [selectedIds, setSelectedIds] = useState([])  
  const [degatsInput, setDegatsInput] = useState('')  
  const [soinInput, setSoinInput] = useState('')  
  const [degatsMulti, setDegatsMulti] = useState('')  
  const [soinMulti, setSoinMulti] = useState('')  
  
  const toggleSelectCombatant = (id) => {  
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])  
  }  
  
  const applyPVMultiple = (delta) => {  
    if (selectedIds.length === 0) return  
    const newJoueurs = combatData.joueursParticipants.map(j =>  
      selectedIds.includes(j.id) ? { ...j, pvActuels: Math.max(0, (parseInt(j.pvActuels) || 0) + delta) } : j  
    )  
    const newMonstres = combatData.monstresCombat.map(mc => ({  
      ...mc,  
      instances: mc.instances.map(inst =>  
        selectedIds.includes(inst.id) ? { ...inst, pvActuels: Math.max(0, (parseInt(inst.pvActuels) || 0) + delta) } : inst  
      )  
    }))  
    setCombatData({ ...combatData, joueursParticipants: newJoueurs, monstresCombat: newMonstres })  
    if (selectedCombatant && selectedIds.includes(selectedCombatant?.id)) {  
      setSelectedCombatant({ ...selectedCombatant, pvActuels: Math.max(0, (parseInt(selectedCombatant?.pvActuels) || 0) + delta) })  
    }  
  }  
  
  const updateCombatant = (combatant, changes) => {  
    if (combatant.type === 'joueur') {  
      const newJoueurs = combatData.joueursParticipants.map(j =>  
        j.id === combatant.id ? { ...j, ...changes } : j  
      )  
      setCombatData({ ...combatData, joueursParticipants: newJoueurs })  
    } else {  
      const newMonstres = combatData.monstresCombat.map(mc => ({  
        ...mc,  
        instances: mc.instances.map(inst =>  
          inst.id === combatant.id ? { ...inst, ...changes } : inst  
        )  
      }))  
      setCombatData({ ...combatData, monstresCombat: newMonstres })  
    }  
    if (selectedCombatant && selectedCombatant?.id === combatant.id) {  
      setSelectedCombatant({ ...selectedCombatant, ...changes })  
    }  
  }  
  
  const setFatigue = (combatant, val) => {  
    const fatigue = Math.max(0, Math.min(6, val))  
    const conditions = combatant.conditions || []  
    const changes = { fatigue }  
    if (fatigue >= 1 && !conditions.includes('Épuisement')) {  
      changes.conditions = [...conditions, 'Épuisement']  
    } else if (fatigue === 0 && conditions.includes('Épuisement')) {  
      changes.conditions = conditions.filter(c => c !== 'Épuisement')  
    }  
    updateCombatant(combatant, changes)  
  }    
  const perdreConcentration = (combatant) => {  
    updateCombatant(combatant, { concentration: { active: false, sort: '' }, concentrationDD: null })  
  }  
  
  const [chronoTexte, setChronoTexte] = useState('')  
  const [chronoRounds, setChronoRounds] = useState('')  
  
  const ajouterChronometre = (combatant) => {  
    const rounds = parseInt(chronoRounds)  
    if (!chronoTexte.trim() || !rounds || rounds <= 0) return  
    const chronometres = [...(combatant.chronometres || []), { id: Date.now(), texte: chronoTexte.trim(), rounds }]  
    updateCombatant(combatant, { chronometres })  
    setChronoTexte('')  
    setChronoRounds('')  
  }  
  
  const supprimerChronometre = (combatant, chronoId) => {  
    updateCombatant(combatant, { chronometres: (combatant.chronometres || []).filter(ch => ch.id !== chronoId) })  
  }  
  
  const rappelsConditions = {  
    'À terre': ["Mêlée à 1,50 m contre lui : Avantage", "Attaque à distance contre lui : Désavantage", "Se relever coûte la moitié de la Vitesse"],  
    'Aveuglé': ["Attaques contre lui : Avantage", "Ses attaques : Désavantage"],  
    'Effrayé': ["Désavantage aux attaques et tests si la source de peur est visible"],  
    'Agrippé': ["Vitesse 0"],  
    'Entravé': ["Vitesse 0", "Attaques contre lui : Avantage", "Ses attaques : Désavantage", "Désavantage aux JS Dextérité"],  
    'Paralysé': ["Neutralisé", "Vitesse 0", "Échec auto aux JS Force/Dextérité", "Attaques contre lui : Avantage", "Coups critiques au contact"],  
    'Étourdi': ["Neutralisé", "Vitesse 0", "Échec auto aux JS Force/Dextérité", "Attaques contre lui : Avantage"],  
    'Empoisonné': ["Désavantage aux attaques et tests de caractéristique"],  
    'Invisible': ["Attaques contre lui : Désavantage", "Ses attaques : Avantage"],  
    'Pétrifié': ["Neutralisé", "Résistance à tous les dégâts", "Immunité poison/maladie", "Échec auto aux JS Force/Dextérité"],  
    'Inconscient': ["Neutralisé", "À terre", "Attaques contre lui : Avantage", "Coups critiques au contact"],  
    'Charmé': ["Ne peut pas attaquer son charmeur ni lui nuire"],  
    'Assourdi': ["Échec auto aux tests nécessitant l'ouïe"],  
    'Incapacité': ["Pas d'action, d'action bonus ni de réaction"],  
    'Concentration': ["En cas de dégâts : JS Constitution DD 10 ou moitié des dégâts (le plus élevé, max 30)"],  
    'En péril': ["PV sous 50 % — situation critique"],  
    'Épuisement': ["−2 aux tests de d20 et −1,50 m de Vitesse par niveau — mort au niveau 6"]  
  }  
  
  const toggleSlot = (combatant, niveau) => {  
    const slots = combatant.slotsUtilises || {}
    const niveauKey = niveau.toString()
    const currentUsed = slots[niveauKey] || 0
    const maxSlots = (combatant.slotsSorts || combatant.monstreTemplate?.slotsSorts)?.[niveauKey] || 0  
    
    if (currentUsed < maxSlots) {
      slots[niveauKey] = currentUsed + 1
    } else if (currentUsed > 0) {
      slots[niveauKey] = currentUsed - 1
    }
    
    if (combatant.type === 'joueur') {
      const newJoueurs = combatData.joueursParticipants.map(j => 
        j.id === combatant.id ? { ...j, slotsUtilises: slots } : j
      )
      setCombatData({ ...combatData, joueursParticipants: newJoueurs })
    } else {
      const newMonstres = combatData.monstresCombat.map(mc => ({
        ...mc,
        instances: mc.instances.map(inst => 
          inst.id === combatant.id ? { ...inst, slotsUtilises: slots } : inst
        )
      }))
      setCombatData({ ...combatData, monstresCombat: newMonstres })
    }
  }

  const updateCommentaireMonstre = (instanceId, commentaire) => {
    const newMonstres = combatData.monstresCombat.map(mc => ({
      ...mc,
      instances: mc.instances.map(inst => 
        inst.id === instanceId ? { ...inst, commentaire } : inst
      )
    }))
    setCombatData({ ...combatData, monstresCombat: newMonstres })
  }

  const conditionsData = [  
    { nom: 'Aveuglé', consequences: "Ne voit plus — échec automatique aux tests nécessitant la vue — attaques contre lui avec Avantage — ses attaques avec Désavantage", sortir: "Durée de l'effet — dissipation de la magie ou soin si prévu" },  
    { nom: 'Charmé', consequences: "Ne peut pas attaquer le charmeur ni lui infliger d'effet nuisible — charmeur avec Avantage aux tests sociaux contre lui", sortir: "Durée de l'effet — réussir le JS ou rompre l'effet si le sort le permet" },  
    { nom: 'Assourdi', consequences: "N'entend plus — échec automatique aux tests nécessitant l'ouïe", sortir: "Durée de l'effet — dissipation ou soin si prévu" },  
    { nom: 'Épuisement', consequences: "Par niveau : −2 à tous les tests de d20 et −1,50 m de vitesse — mort au niveau 6", sortir: "Repos long : retire 1 niveau — certains effets peuvent en retirer davantage" },  
    { nom: 'Effrayé', consequences: "Désavantage aux tests de caractéristique et jets d'attaque si la source est visible — ne peut pas s'en rapprocher volontairement", sortir: "Durée de l'effet — JS ou disparition de la source si l'effet le prévoit" },  
    { nom: 'Agrippé', consequences: "Vitesse à 0 — Désavantage aux attaques contre toute cible autre que l'agrippeur", sortir: "Action : test d'Athlétisme ou d'Acrobaties contre le DD d'évasion — l'agrippeur neutralisé — sortir de sa portée" },  
    { nom: 'Incapacité', consequences: "Pas d'action, d'action bonus ni de réaction — concentration interrompue", sortir: "Durée de l'effet — soin ou dissipation si prévu" },  
    { nom: 'Invisible', consequences: "Impossible à voir sans capacité spéciale — attaques contre lui avec Désavantage — ses attaques avec Avantage — Avantage à l'initiative si invisible au jet", sortir: "Durée de l'effet — effet qui révèle ou met fin à l'invisibilité" },  
    { nom: 'Paralysé', consequences: "Incapacité — vitesse à 0 — échec automatique aux JS Force et Dextérité — attaques contre lui avec Avantage — coups critiques automatiques à 1,50 m", sortir: "Durée de l'effet — JS ou soin si le sort le permet" },  
    { nom: 'Pétrifié', consequences: "Transformé en matière inerte — incapacité — vitesse à 0 — résistance à tous les dégâts — échec automatique aux JS Force et Dextérité — attaques contre lui avec Avantage", sortir: "Durée de l'effet — magie ou sort qui met fin à la pétrification" },  
    { nom: 'Empoisonné', consequences: "Désavantage aux jets d'attaque et tests de caractéristique", sortir: "Durée du poison — antidote, soin ou sort adapté" },  
    { nom: 'À terre', consequences: "Déplacement limité à ramper — attaques avec Désavantage — attaques à 1,50 m contre lui avec Avantage, au-delà avec Désavantage", sortir: "Se relever : dépenser la moitié de sa vitesse" },  
    { nom: 'Entravé', consequences: "Vitesse à 0 — attaques contre lui avec Avantage — ses attaques avec Désavantage — Désavantage aux JS Dextérité", sortir: "Action ou test pour se libérer selon la source — aide extérieure — durée de l'effet" },  
    { nom: 'Étourdi', consequences: "Incapacité — échec automatique aux JS Force et Dextérité — attaques contre lui avec Avantage", sortir: "Durée de l'effet — JS ou soin si prévu" },  
    { nom: 'Inconscient', consequences: "Incapacité et à terre — vitesse à 0 — lâche ce qu'il tient — échec automatique aux JS Force et Dextérité — attaques contre lui avec Avantage — coups critiques automatiques à 1,50 m", sortir: "Récupérer des PV — aide médicale ou effet qui réveille — durée prévue par la source" },  
    { nom: 'Concentration', consequences: "Maintien d'un sort de concentration — en cas de dégâts : JS Constitution (DD 10 ou moitié des dégâts, le plus élevé) ou le sort prend fin — une seule concentration à la fois", sortir: "Fin volontaire (gratuit, à tout moment) — échec au JS Constitution après dégâts — Incapacité ou mort — lancer un autre sort de concentration" },  
    { nom: 'En péril', consequences: "PV à 0 ou situation critique — effectue des jets de sauvegarde contre la mort à son tour (3 réussites : stabilisé — 3 échecs : mort) — coup critique à 1,50 m compte double", sortir: "Récupérer des PV — être stabilisé (soins, JS Médecine) — 3 réussites aux jets de sauvegarde contre la mort" }  
  ]  
  const toggleCondition = (combatant, condition) => {
    const conditions = combatant.conditions || []
    const newConditions = conditions.includes(condition)
      ? conditions.filter(c => c !== condition)
      : [...conditions, condition]
    
    if (combatant.type === 'joueur') {
      const newJoueurs = combatData.joueursParticipants.map(j => 
        j.id === combatant.id ? { ...j, conditions: newConditions } : j
      )
      const newCombatData = { ...combatData, joueursParticipants: newJoueurs }
      setCombatData(newCombatData)
      // Mettre à jour selectedCombatant pour refléter le changement immédiatement
      if (selectedCombatant && selectedCombatant?.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, conditions: newConditions })
      }
    } else {
      const newMonstres = combatData.monstresCombat.map(mc => ({
        ...mc,
        instances: mc.instances.map(inst => 
          inst.id === combatant.id ? { ...inst, conditions: newConditions } : inst
        )
      }))
      const newCombatData = { ...combatData, monstresCombat: newMonstres }
      setCombatData(newCombatData)
      // Mettre à jour selectedCombatant pour refléter le changement immédiatement
      if (selectedCombatant && selectedCombatant?.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, conditions: newConditions })
      }
    }
  }

  const toggleDeathSave = (combatant, type) => {
    const deathSaves = combatant.deathSaves || { successes: 0, failures: 0 }
    const newDeathSaves = { ...deathSaves }
    
    if (type === 'success') {
      newDeathSaves.successes = (newDeathSaves.successes + 1) % 4
    } else {
      newDeathSaves.failures = (newDeathSaves.failures + 1) % 4
    }
    
    if (combatant.type === 'joueur') {
      const newJoueurs = combatData.joueursParticipants.map(j => 
        j.id === combatant.id ? { ...j, deathSaves: newDeathSaves } : j
      )
      const newCombatData = { ...combatData, joueursParticipants: newJoueurs }
      setCombatData(newCombatData)
      if (selectedCombatant && selectedCombatant?.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, deathSaves: newDeathSaves })
      }
    } else {
      const newMonstres = combatData.monstresCombat.map(mc => ({
        ...mc,
        instances: mc.instances.map(inst => 
          inst.id === combatant.id ? { ...inst, deathSaves: newDeathSaves } : inst
        )
      }))
      const newCombatData = { ...combatData, monstresCombat: newMonstres }
      setCombatData(newCombatData)
      if (selectedCombatant && selectedCombatant?.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, deathSaves: newDeathSaves })
      }
    }
  }

  const nextTurn = () => {
    if (!combatData) return
    const ordre = getOrdreInitiativeActif()
    if (ordre.length === 0) return

    const newTour = (combatData.tourActuel + 1) % ordre.length  
    if (newTour === 0) {  
      // Nouveau round : décompter les chronomètres de tous les combattants  
      const decrementer = (c) => c.chronometres?.length  
        ? { ...c, chronometres: c.chronometres.map(ch => ({ ...ch, rounds: ch.rounds - 1 })).filter(ch => ch.rounds > 0) }  
        : c  
      const newJoueurs = combatData.joueursParticipants.map(decrementer)  
      const newMonstres = combatData.monstresCombat.map(mc => ({  
        ...mc,  
        instances: mc.instances.map(decrementer)  
      }))  
      setCombatData({ ...combatData, tourActuel: newTour, round: combatData.round + 1, joueursParticipants: newJoueurs, monstresCombat: newMonstres })  
    } else {  
      setCombatData({ ...combatData, tourActuel: newTour })  
    }  
    // Sélectionner automatiquement le combattant actif
    setSelectedCombatant(ordre[newTour])
  }

  const prevTurn = () => {
    if (!combatData) return
    const ordre = getOrdreInitiativeActif()
    if (ordre.length === 0) return

    const newTour = combatData.tourActuel === 0 ? ordre.length - 1 : combatData.tourActuel - 1
    if (newTour === ordre.length - 1 && combatData.round > 1) {
      setCombatData({ ...combatData, tourActuel: newTour, round: combatData.round - 1 })
    } else {
      setCombatData({ ...combatData, tourActuel: newTour })
    }
  }

  const [selectedCombatant, setSelectedCombatant] = useState(null)  
  const [sortDialogOpen, setSortDialogOpen] = useState(false)  
  const [selectedSort, setSelectedSort] = useState(null)  
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false)  
  const [selectedCondition, setSelectedCondition] = useState(null)  
  
  const openConditionDialog = (condition) => {  
    setSelectedCondition(condition)  
    setConditionDialogOpen(true)  
  }  
  
  const [calcOpen, setCalcOpen] = useState(false)  
  const [calcExpr, setCalcExpr] = useState('')  
  const [calcResult, setCalcResult] = useState(null)  
  
  const calcAppend = (char) => {  
    setCalcExpr(prev => prev + char)  
    setCalcResult(null)  
  }  
  
  const calcClear = () => {  
    setCalcExpr('')  
    setCalcResult(null)  
  }  
  
  const calcCompute = () => {  
    if (/^[0-9+\-*/.() ]+$/.test(calcExpr) && calcExpr.trim() !== '') {  
      try {  
        const res = Function('"use strict"; return (' + calcExpr + ')')()  
        setCalcResult(Number.isFinite(res) ? String(Math.round(res * 100) / 100) : 'Erreur')  
      } catch {  
        setCalcResult('Erreur')  
      }  
    } else {  
      setCalcResult('Erreur')  
    }  
  }  
  
  const labelNiveauSort = (niveau) => {  
    if (niveau === '0 (Cantrip)' || niveau === '0') return 'Sorts mineurs'  
    if (niveau === '1') return '1er niveau'  
    return `${niveau}e niveau`  
  }  
  
  const grouperSortsParNiveau = (sortIds) => {  
    const ordre = ['0 (Cantrip)', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']  
    const groupes = {}  
    sortIds.forEach(sortId => {  
      const sort = sorts?.find(s => s.id === sortId) || { nom: 'Sort inconnu', niveau: '?', tempsIncantation: '', rituel: false, concentration: false }  
      const niv = sort.niveau || '?'  
      if (!groupes[niv]) groupes[niv] = []  
      groupes[niv].push({ ...sort, id: sortId })  
    })  
    return Object.keys(groupes)  
      .sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b))  
      .map(niv => ({  
        niveau: niv,  
        sorts: groupes[niv].sort((a, b) => a.nom.localeCompare(b.nom))  
      }))  
  }  
  
  const getSlotsSorts = (combatant) => combatant?.slotsSorts || combatant?.monstreTemplate?.slotsSorts || null    
  const renderSortsParNiveau = (sortIds) => (  
    <div className="mt-2 space-y-1">  
      {grouperSortsParNiveau(sortIds).map(groupe => (  
        <div key={groupe.niveau} className="text-sm">  
          <span className="font-semibold">{labelNiveauSort(groupe.niveau)} : </span>  
          {groupe.sorts.map((sort, index) => (  
            <span key={sort.id}>  
              {index > 0 && ', '}  
              <span  
                className="cursor-pointer underline decoration-dotted hover:text-primary"  
                onClick={() => openSortDialog(sort.id)}  
              >  
                {sort.nom}  
              </span>  
              <span className="text-muted-foreground">  
                {' '}({sort.tempsIncantation}{sort.rituel && ' | Rituel'}{sort.concentration && ' ; Concentration'})  
              </span>  
            </span>  
          ))}  
        </div>  
      ))}  
    </div>  
  )  

  const openSortDialog = (sortId) => {
    const sort = sorts?.find(s => s.id === sortId)
    if (sort) {
      setSelectedSort(sort)
      setSortDialogOpen(true)
    }
  }

  return (
    <div className="space-y-4">
      {viewMode === 'combat' && combatData ? (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <header className="border-b bg-card px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={exitCombat}>
                  ← Retour
                </Button>
                <h2 className="text-xl font-bold">Combat: {combatData.rencontre.nom}</h2>
              </div>
              <div className="flex gap-2 items-center">  
                <div className="text-lg font-bold">Round {combatData.round}</div>  
                <Button variant="outline" onClick={() => setCalcOpen(o => !o)}>  
                  Calculatrice  
                </Button>  
                <Button variant="outline" onClick={prevTurn}>← Tour précédent</Button>  
                <Button variant="outline" onClick={nextTurn}>Tour suivant →</Button>  
              </div>  
            </div>
            {combatData.rencontre.description && (
              <div className="text-sm text-muted-foreground bg-secondary p-2 rounded">
                {combatData.rencontre.description}
              </div>
            )}
          </header>

          <main className="flex-1 flex overflow-hidden">
            <div className="w-1/3 border-r p-4 overflow-y-auto">
              <h3 className="font-semibold mb-2">Ordre d'initiative</h3>  
              <div className="mb-3 p-2 bg-secondary rounded space-y-2">  
                <div className="flex gap-1 items-center">  
                  <Input type="number" min="0" placeholder="Dégâts" className="h-8 text-xs" value={degatsMulti} onChange={(e) => setDegatsMulti(e.target.value)} />  
                  <Button size="sm" variant="destructive" disabled={selectedIds.length === 0 || !degatsMulti} onClick={() => { applyPVMultiple(-parseInt(degatsMulti)); setDegatsMulti('') }}>  
                    Dégâts groupés  
                  </Button>  
                </div>  
                <div className="flex gap-1 items-center">  
                  <Input type="number" min="0" placeholder="Soins" className="h-8 text-xs" value={soinMulti} onChange={(e) => setSoinMulti(e.target.value)} />  
                  <Button size="sm" disabled={selectedIds.length === 0 || !soinMulti} onClick={() => { applyPVMultiple(parseInt(soinMulti)); setSoinMulti('') }}>  
                    Soins groupés  
                  </Button>  
                </div>  
                {selectedIds.length > 0 && (  
                  <div className="text-xs text-muted-foreground">  
                    {selectedIds.length} combattant(s) sélectionné(s){' '}  
                    <button className="underline" onClick={() => setSelectedIds([])}>Tout désélectionner</button>  
                  </div>  
                )}  
              </div>  
              <div className="space-y-2">  
                {getOrdreInitiative().map((combatant, idx) => {
                  const isDead = parseInt(combatant.pvActuels) <= 0
                  const ordreActif = getOrdreInitiativeActif()
                  const actifIndex = ordreActif.findIndex(c => c.id === combatant.id)
                  const isCurrentTurn = actifIndex === combatData.tourActuel  
                  const pvMax = combatant.type === 'joueur' ? combatant.pvMax : combatant.monstreTemplate?.pv  
                  const pvAct = parseInt(combatant.pvActuels) || 0  
                  const pvMaxNum = parseInt(pvMax) || 0  
                  const pvPct = pvMaxNum > 0 ? Math.min(100, Math.max(0, (pvAct / pvMaxNum) * 100)) : 0  
                  const pvBarColor = pvPct > 66 ? 'bg-green-500' : pvPct > 33 ? 'bg-orange-500' : 'bg-red-500'  
  
                  return (                      <div
                      key={combatant.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        isDead
                          ? 'bg-gray-200 opacity-50'
                          : isCurrentTurn && combatant.type === 'joueur' && parseInt(combatant.pvActuels) <= 0
                          ? 'bg-gray-300 border-2 border-gray-500'
                          : isCurrentTurn
                          ? 'bg-green-100 border-2 border-green-500'
                          : combatant.type === 'joueur'
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                      onClick={() => setSelectedCombatant(combatant)}
                    >
                      <div className="flex items-center gap-2">  
                        <span onClick={(e) => e.stopPropagation()}>  
                          <Checkbox  
                            checked={selectedIds.includes(combatant.id)}  
                            onChange={() => toggleSelectCombatant(combatant.id)}  
                          />  
                        </span>  
                        <span className="font-bold text-sm w-6 text-center shrink-0">{combatant.initiative}</span>  
                        <div className="flex-1 min-w-0">  
                          <div className="font-bold text-sm truncate">  
                            {combatant.type === 'joueur' ? combatant.nom : combatant.nomMonstre}  
                          </div>  
                          <div className="text-xs text-muted-foreground">  
                            CA : {combatant.type === 'joueur' ? combatant.ca : combatant.monstreTemplate?.ca}  
                          </div>  
                        </div>  
                        <div className="w-24 shrink-0">  
                          <div className="text-xs text-right mb-0.5">PV : {pvAct}/{pvMaxNum}</div>  
                          <div className="h-2 bg-gray-300 rounded overflow-hidden">  
                            <div className={`h-full ${pvBarColor} transition-all`} style={{ width: `${pvPct}%` }} />  
                          </div>  
                        </div>  
                      </div>  
                    {combatant.conditions && combatant.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {combatant.conditions.map(cond => (
                            <span key={cond} className="text-xs bg-yellow-100 px-1 rounded">{cond}</span>
                          ))}
                        </div>
                      )}
                      {combatant.type === 'monstre' && (
                        <Input
                          className="mt-1 text-xs"
                          placeholder="Commentaire (couleur figurine...)"
                          value={combatant.commentaire}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateCommentaireMonstre(combatant.id, e.target.value)
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">  
              <h3 className="font-semibold mb-2">Fiche du combattant</h3>  
              {selectedCombatant ? (  
                <div className="p-4 bg-secondary rounded max-h-[75vh] overflow-y-auto">  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">  
  
                    {/* ===== COLONNE 1 ===== */}  
                    <div className="space-y-3">  
                      <div className="bg-card border rounded-lg p-3 shadow-sm">  
                        <h4 className="font-bold text-lg">  
                          {selectedCombatant?.type === 'joueur' ? selectedCombatant?.nom : selectedCombatant?.nomMonstre}  
                        </h4>  
                        <div className="text-sm text-muted-foreground">  
                          {selectedCombatant?.type === 'joueur'  
                            ? `${selectedCombatant?.classe} — Niv ${selectedCombatant?.niveau}`  
                            : `${selectedCombatant?.monstreTemplate?.type || ''} — FD ${selectedCombatant?.monstreTemplate?.fd ?? ''}`}  
                        </div>  
                        <div className="flex gap-4 mt-2 text-sm font-medium">  
                          <span>🛡️ {selectedCombatant?.type === 'joueur' ? selectedCombatant?.ca : selectedCombatant?.monstreTemplate?.ca}</span>  
                          <span>👢 {selectedCombatant?.type === 'joueur' ? selectedCombatant?.vitesse : selectedCombatant?.monstreTemplate?.vitesse}</span>  
                        </div>  
                      </div>  
  
                      {selectedCombatant?.conditions?.includes('En péril') && parseInt(selectedCombatant?.pvActuels) > 0 && (  
                        <div className="p-2 rounded-lg bg-orange-100 border border-orange-400 text-sm font-semibold text-orange-800">  
                          ⚠ EN PÉRIL — PV sous 50 %  
                        </div>  
                      )}  
  
                      <div className="bg-card border rounded-lg p-3 shadow-sm">  
                        <Label className="font-semibold">PV : {selectedCombatant?.pvActuels}/{selectedCombatant?.type === 'joueur' ? selectedCombatant?.pvMax : selectedCombatant?.monstreTemplate?.pv}</Label>  
                        <div className="flex gap-2 mt-2 flex-wrap">  
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => updatePV(selectedCombatant, -1)}>-1</Button>  
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => updatePV(selectedCombatant, -5)}>-5</Button>  
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updatePV(selectedCombatant, 1)}>+1</Button>  
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updatePV(selectedCombatant, 5)}>+5</Button>  
                        </div>  
                        <div className="flex gap-2 mt-2 items-center flex-wrap">  
                          <Input type="number" min="0" className="w-14 h-8 px-1" value={degatsInput} onChange={(e) => setDegatsInput(e.target.value)} />    
                          <Button size="sm" variant="destructive" disabled={!degatsInput} onClick={() => { updatePV(selectedCombatant, -parseInt(degatsInput)); setDegatsInput('') }}>Dégâts</Button>  
                          <Input type="number" min="0" className="w-14 h-8 px-1" value={soinInput} onChange={(e) => setSoinInput(e.target.value)} />  >  
                          <Button size="sm" disabled={!soinInput} onClick={() => { updatePV(selectedCombatant, parseInt(soinInput)); setSoinInput('') }}>Soins</Button>  
                        </div>  
                      </div>  
                      
                        {selectedCombatant?.type === 'joueur' && parseInt(selectedCombatant?.pvActuels) <= 0 && (  
                        <div className="p-2 rounded-lg bg-red-100 border-2 border-red-500">  
                          <div className="font-bold text-red-800 text-sm">INCONSCIENT – Jets contre la mort</div>  
                          <div className="text-xs text-red-700 mt-1">  
                            1d20 au début de chaque tour : 1 = 2 échecs · 20 = récupère 1 PV. Dégâts à 0 PV = +1 échec (+2 si critique).  
                          </div>  
                          {(selectedCombatant?.deathSaves?.failures || 0) >= 3 && <div className="mt-1 font-bold text-red-900">MORT</div>}  
                          {(selectedCombatant?.deathSaves?.successes || 0) >= 3 && (selectedCombatant?.deathSaves?.failures || 0) < 3 && <div className="mt-1 font-bold text-green-700">STABLE</div>}  
                          <div className="flex gap-4 mt-2">  
                            <div>  
                              <Label className="text-xs text-green-600">Succès ({selectedCombatant?.deathSaves?.successes || 0}/3)</Label>  
                              <div className="flex gap-1 mt-1">  
                                {[0, 1, 2].map(i => (  
                                  <Checkbox key={i} checked={i < (selectedCombatant?.deathSaves?.successes || 0)} onChange={() => toggleDeathSave(selectedCombatant, 'success')} />  
                                ))}  
                              </div>  
                            </div>  
                            <div>  
                              <Label className="text-xs text-red-600">Échecs ({selectedCombatant?.deathSaves?.failures || 0}/3)</Label>  
                              <div className="flex gap-1 mt-1">  
                                {[0, 1, 2].map(i => (  
                                  <Checkbox key={i} checked={i < (selectedCombatant?.deathSaves?.failures || 0)} onChange={() => toggleDeathSave(selectedCombatant, 'failure')} />  
                                ))}  
                              </div>  
                            </div>  
                          </div>  
                        </div>  
                      )}  
                      
                      <div className="p-2 rounded-lg bg-purple-50 border border-purple-300">  
                        <label className="flex items-center gap-2 text-sm font-semibold text-purple-800">  
                          <Checkbox  
                            checked={selectedCombatant?.concentration?.active || false}  
                            onChange={(e) => updateCombatant(selectedCombatant, { concentration: { active: e.target.checked, sort: selectedCombatant?.concentration?.sort || '' }, concentrationDD: null })}  
                          />  
                          Concentration  
                        </label>  
                        {selectedCombatant?.concentration?.active && (  
                          <div className="mt-2 space-y-2">  
                            <Input  
                              className="h-7 text-xs"  
                              placeholder="Sort concentré (ex : Hâte)"  
                              value={selectedCombatant?.concentration?.sort || ''}  
                              onChange={(e) => updateCombatant(selectedCombatant, { concentration: { ...selectedCombatant?.concentration, sort: e.target.value } })}  
                            />  
                            <p className="text-xs text-purple-700">Dégâts subis → JS Constitution DD 10 ou moitié des dégâts (le plus élevé, max 30). Un jet par source de dégâts.</p>  
                            {selectedCombatant?.concentrationDD && (  
                              <div className="p-2 bg-purple-100 border border-purple-400 rounded text-xs">  
                                <span className="font-bold">JS Constitution DD {selectedCombatant?.concentrationDD}</span>  
                                <div className="flex gap-2 mt-1">  
                                  <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updateCombatant(selectedCombatant, { concentrationDD: null })}>Réussite</Button>  
                                  <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => perdreConcentration(selectedCombatant)}>Échec</Button>  
                                </div>  
                              </div>  
                            )}  
                          </div>  
                        )}  
                      </div>  
                    
  
                      {selectedCombatant?.type === 'joueur' && (  
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-300">  
                          <div className="flex items-center justify-between">  
                            <Label className="text-sm font-semibold text-amber-800">Fatigue : {selectedCombatant?.fatigue || 0}/6</Label>  
                            <div className="flex gap-1">  
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setFatigue(selectedCombatant, (selectedCombatant?.fatigue || 0) - 1)}>−</Button>  
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setFatigue(selectedCombatant, (selectedCombatant?.fatigue || 0) + 1)}>+</Button>  
                            </div>  
                          </div>  
                          {(selectedCombatant?.fatigue || 0) > 0 && (  
                            <div className="text-xs mt-1 font-semibold text-amber-800">  
                              Pénalités actuelles : −{(selectedCombatant?.fatigue || 0) * 2} aux d20 · −{(selectedCombatant?.fatigue || 0) * 1.5} m Vitesse  
                              {(selectedCombatant?.fatigue || 0) >= 6 && <span className="text-red-700"> — MORT</span>}  
                            </div>  
                          )}  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.sens && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Sens</Label>  
                          <p className="text-sm mt-1">{selectedCombatant?.monstreTemplate.sens}</p>  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.langues && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Langues</Label>  
                          <p className="text-sm mt-1">{selectedCombatant?.monstreTemplate.langues}</p>  
                        </div>  
                      )}  
                     {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.traits && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Traits</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.monstreTemplate.traits) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'joueur' && selectedCombatant?.traits && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Traits</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.traits) }} />  
                        </div>  
                      )}  
                    </div>  
  
                    {/* ===== COLONNE 2 ===== */}  
                    <div className="space-y-3">  
                      <div className="bg-card border rounded-lg p-3 shadow-sm">  
                        <Label className="font-semibold">Caractéristiques</Label>  
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm">  
                          {Object.entries(selectedCombatant?.type === 'joueur' ? selectedCombatant?.caracteristiques : selectedCombatant?.monstreTemplate?.caracteristiques || {}).map(([key, value]) => {  
                            const bonus = Math.floor((value - 10) / 2)  
                            return (  
                              <div key={key} className="text-center p-2 bg-background rounded">  
                                <div className="font-medium text-xs">{key.slice(0, 3).toUpperCase()}</div>  
                                <div className="font-bold">{value} <span className="text-xs text-muted-foreground">({bonus >= 0 ? `+${bonus}` : bonus})</span></div>  
                              </div>  
                            )  
                          })}  
                        </div>  
                      </div>  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.actions && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Actions</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.monstreTemplate.actions) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.actionsLegendaire && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Actions légendaires</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.monstreTemplate.actionsLegendaire) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.reactions && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Réactions</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.monstreTemplate.reactions) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.competences && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Compétences</Label>  
                          <p className="text-sm mt-1">{selectedCombatant?.monstreTemplate.competences}</p>  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'joueur' && selectedCombatant?.competences && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Compétences</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.competences) }} />    
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'joueur' && selectedCombatant?.equipement && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Équipement</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.equipement) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.equipement && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Équipement</Label>  
                          <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant?.monstreTemplate.equipement) }} />  
                        </div>  
                      )}  
                      {selectedCombatant?.sortsConnus && selectedCombatant?.sortsConnus.length > 0 && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Sorts connus</Label>  
                          {renderSortsParNiveau(selectedCombatant?.sortsConnus)}  
                        </div>  
                      )}  
                      {selectedCombatant?.type === 'monstre' && selectedCombatant?.monstreTemplate?.sortsPrepares && selectedCombatant?.monstreTemplate.sortsPrepares.length > 0 && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Sorts préparés</Label>  
                          {renderSortsParNiveau(selectedCombatant?.monstreTemplate.sortsPrepares)}  
                        </div>  
                      )}  
                    </div>  
  
                    {/* ===== COLONNE 3 ===== */}  
                    <div className="space-y-3">  
                      {getSlotsSorts(selectedCombatant) && Object.keys(getSlotsSorts(selectedCombatant)).some(k => getSlotsSorts(selectedCombatant)[k] > 0) && (  
                        <div className="bg-card border rounded-lg p-3 shadow-sm">  
                          <Label className="font-semibold">Slots de sorts</Label>  
                          <div className="grid grid-cols-4 gap-2 mt-2">  
                            {Object.entries(getSlotsSorts(selectedCombatant)).map(([niveau, max]) => max > 0 && (  
                              <div key={niveau} className="text-center">  
                                <Label className="text-xs">Niv {niveau}</Label>  
                                <div className="flex gap-1 justify-center mt-1">  
                                  {Array.from({ length: max }).map((_, i) => (  
                                    <Checkbox key={i} checked={i < (selectedCombatant?.slotsUtilises?.[niveau] || 0)} onChange={() => toggleSlot(selectedCombatant, niveau)} />  
                                  ))}  
                                </div>  
                              </div>  
                            ))}  
                          </div>  
                        </div>  
                      )}  
  
                      <div className="bg-card border rounded-lg p-3 shadow-sm">  
                        <Label className="font-semibold">Chronomètres</Label>  
                        {selectedCombatant?.chronometres?.length > 0 && (  
                          <div className="mt-1 space-y-1">  
                            {selectedCombatant?.chronometres.map(ch => (  
                              <div key={ch.id} className="flex items-center justify-between text-xs bg-teal-50 border border-teal-200 rounded px-2 py-1">  
                                <span>{ch.texte}</span>  
                                <span className="flex items-center gap-2">  
                                  <span className="font-bold text-teal-800">{ch.rounds} round{ch.rounds > 1 ? 's' : ''}</span>  
                                  <button className="text-red-600 hover:text-red-800" onClick={() => supprimerChronometre(selectedCombatant, ch.id)}>✕</button>  
                                </span>  
                              </div>  
                            ))}  
                          </div>  
                        )}  
                        <div className="flex gap-1 mt-2">  
                          <Input className="h-7 text-xs flex-1" placeholder="Effet (ex : Agrandissement)" value={chronoTexte} onChange={(e) => setChronoTexte(e.target.value)} />  
                          <Input className="h-7 text-xs w-16" type="number" min="1" placeholder="Rounds" value={chronoRounds} onChange={(e) => setChronoRounds(e.target.value)} />  
                          <Button size="sm" className="h-7" disabled={!chronoTexte.trim() || !chronoRounds} onClick={() => ajouterChronometre(selectedCombatant)}>+</Button>  
                        </div>  
                      </div>  
  
                      <div className="bg-card border rounded-lg p-3 shadow-sm">  
                        <Label className="font-semibold">Conditions</Label>  
                        {selectedCombatant?.conditions?.length > 0 && (() => {  
                          const rappels = [...new Set(selectedCombatant?.conditions?.flatMap(c => rappelsConditions[c] || []))]  
                          return rappels.length > 0 && (  
                            <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-300">  
                              <ul className="text-xs text-blue-900 list-disc pl-4 space-y-0.5">  
                                {rappels.map((r, i) => <li key={i}>{r}</li>)}  
                              </ul>  
                            </div>  
                          )  
                        })()}  
                        <div className="flex flex-wrap gap-2 mt-2">  
                          {conditionsData.map(condition => (  
                            <label key={condition.nom} className="flex items-center gap-1 text-xs">  
                              <Checkbox  
                                checked={selectedCombatant?.conditions?.includes(condition.nom) || false}  
                                onChange={() => toggleCondition(selectedCombatant, condition.nom)}  
                              />  
                              <span  
                                className="cursor-pointer underline decoration-dotted hover:text-primary"  
                                onClick={(e) => { e.preventDefault(); openConditionDialog(condition) }}  
                              >  
                                {condition.nom}  
                              </span>  
                            </label>  
                          ))}  
                        </div>  
                      </div>  
                    </div>  
  
                  </div>  
                </div>  
              ) : (  
                <div className="p-4 bg-secondary rounded text-center text-muted-foreground">  
                  Cliquez sur un combattant pour voir sa fiche  
                </div>  
              )}  
            </div>  
    
          <Dialog open={sortDialogOpen} onOpenChange={setSortDialogOpen}>
            <DialogHeader>
              <DialogTitle>Détail du sort</DialogTitle>
            </DialogHeader>
            <DialogContent>
              {selectedSort && (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{selectedSort.nom}</h3>
                  <p><strong>École:</strong> {selectedSort.ecole}</p>
                  <p><strong>Niveau:</strong> {selectedSort.niveau}</p>
                  <p><strong>Temps d'incantation:</strong> {selectedSort.tempsIncantation}</p>
                  <p><strong>Portée:</strong> {selectedSort.portee}</p>
                  <p><strong>Durée:</strong> {selectedSort.duree}</p>
                  <p><strong>Composantes:</strong> {selectedSort.composantes?.join(', ') || '-'}</p>
                  {selectedSort.concentration && <p><strong>Concentration:</strong> Oui</p>}
                  {selectedSort.rituel && <p><strong>Rituel:</strong> Oui</p>}
                  <p><strong>Descriptif:</strong></p>  
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedSort.descriptif || '') }} />  
                </div>
              )}
            </DialogContent>
          </Dialog>  
  
          <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>  
            <DialogHeader>  
              <DialogTitle>{selectedCondition?.nom}</DialogTitle>  
            </DialogHeader>  
            <DialogContent>  
              {selectedCondition && (  
                <div className="space-y-3">  
                  <div>  
                    <p className="font-semibold">Conséquences :</p>  
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCondition.consequences || '') }} />  
                  </div>  
                  <div>  
                    <p className="font-semibold">Comment en sortir :</p>  
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCondition.sortir || '') }} />  
                  </div>  
                </div>  
              )}  
            </DialogContent>  
          </Dialog>  
  
          {calcOpen && (  
            <div className="absolute bottom-4 right-4 w-56 bg-card border rounded-lg shadow-lg p-3 z-50">  
              <div className="flex justify-between items-center mb-2">  
                <span className="font-semibold text-sm">Calculatrice</span>  
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setCalcOpen(false)}>✕</button>  
              </div>  
              <div className="bg-background border rounded px-2 py-1 mb-2 text-right font-mono text-sm min-h-[2rem]">  
                {calcExpr || '0'}  
                {calcResult !== null && <div className="font-bold text-primary">= {calcResult}</div>}  
              </div>  
              <div className="grid grid-cols-4 gap-1">  
                {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','(',')','+'].map(c => (  
                  <Button key={c} variant="outline" size="sm" onClick={() => calcAppend(c)}>{c}</Button>  
                ))}  
                <Button variant="outline" size="sm" onClick={calcClear}>C</Button>  
                <Button variant="outline" size="sm" onClick={() => setCalcExpr(prev => prev.slice(0, -1))}>⌫</Button>  
                <Button size="sm" className="col-span-2" onClick={calcCompute}>=</Button>  
              </div>  
            </div>  
          )}
          </main>
        </div>
      ) : viewMode === 'list' ? (
      <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-bold">Campagnes</h2>
            <Button onClick={openCampagneDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle campagne
            </Button>
          </div>

          <div className="space-y-4">
            {campagnes.map(campagne => (
              <Card key={campagne.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle onClick={() => openCampagneDetail(campagne)}>{campagne.nom}</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Supprimer la campagne "${campagne.nom}" ?`)) {
                          onDelete(campagne.id)
                        }
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" onClick={() => openCampagneDetail(campagne)} />
                    </div>
                  </div>
                  {campagne.description && <p className="text-sm text-muted-foreground" onClick={() => openCampagneDetail(campagne)}>{campagne.description}</p>}
                </CardHeader>
                <CardContent onClick={() => openCampagneDetail(campagne)}>
                  <div>
                    <h3 className="font-semibold mb-2">Personnages ({campagne.personnages.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {campagne.personnages.map(perso => (
                        <span key={perso.id} className="text-sm bg-secondary px-2 py-1 rounded">
                          {perso.nom} ({perso.classe} {perso.niveau})
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={backToList}>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
              <h2 className="text-2xl font-bold">{selectedCampagne?.nom}</h2>
            </div>
          </div>

          <div className="flex gap-2 border-b">
            <Button
              variant={detailTab === 'personnages' ? 'default' : 'ghost'}
              onClick={() => setDetailTab('personnages')}
            >
              <Users className="w-4 h-4 mr-2" />
              Personnages
            </Button>
            <Button
              variant={detailTab === 'rencontres' ? 'default' : 'ghost'}
              onClick={() => setDetailTab('rencontres')}
            >
              <Sword className="w-4 h-4 mr-2" />
              Rencontres
            </Button>
          </div>

          {detailTab === 'personnages' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setDialogMode('addPerso')
                  setFormData({ persoId: '' })
                  setDialogOpen(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un personnage
                </Button>
              </div>
              <div className="space-y-2">
                {selectedCampagne?.personnages.map(perso => (
                  <div key={perso.id} className="p-3 bg-secondary rounded">
                    <div className="font-medium">{perso.nom}</div>
                    <div className="text-sm text-muted-foreground">{perso.classe} {perso.niveau} | PV: {perso.pvActuels}/{perso.pvMax}</div>
                  </div>
                ))}
                {selectedCampagne?.personnages.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun personnage dans cette campagne</p>
                )}
              </div>
            </div>
          )}

          {detailTab === 'rencontres' && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={openCategorieDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle catégorie
                </Button>
                <Button onClick={() => openRencontreDialog(selectedCampagne)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle rencontre
                </Button>
              </div>
              {selectedCampagne?.rencontres.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune rencontre</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(
                    selectedCampagne.rencontres.reduce((acc, r) => {
                      if (!acc[r.categorie]) acc[r.categorie] = []
                      acc[r.categorie].push(r)
                      return acc
                    }, {})
                  ).map(([categorie, rencontres]) => (
                    <div key={categorie}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCategory(selectedCampagne.id, categorie)}
                          className="flex items-center gap-2 font-semibold text-sm"
                        >
                          {expandedCategories[`${selectedCampagne.id}-${categorie}`] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {categorie} ({rencontres.length})
                        </button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategorie(categorie)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {expandedCategories[`${selectedCampagne.id}-${categorie}`] && (
                        <div className="ml-4 space-y-2 mt-2">
                          {rencontres.map(rencontre => (
                            <div key={rencontre.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{rencontre.nom}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {rencontre.monstres.map((m, idx) => {
                                      const monstre = monstres.find(mon => mon.id === m.monstreId)
                                      return `${monstre?.nom || 'Inconnu'} (x${m.quantite})${idx < rencontre.monstres.length - 1 ? ', ' : ''}`
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openViewRencontreDialog(selectedCampagne, rencontre)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openAddMonstreDialog(selectedCampagne, rencontre)}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteRencontre(rencontre.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={() => openCombatDialog(selectedCampagne, rencontre)}>
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {dialogMode === 'campagne' ? 'Nouvelle campagne' :
             dialogMode === 'rencontre' ? 'Nouvelle rencontre' :
             dialogMode === 'addPerso' ? 'Ajouter un personnage' :
             dialogMode === 'addMonstre' ? 'Ajouter des monstres' :
             dialogMode === 'editRencontre' ? 'Modifier la rencontre' :
             dialogMode === 'categorie' ? 'Nouvelle catégorie' :
             dialogMode === 'initiative' ? 'Initiative des joueurs' :
             'Combat'}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {dialogMode === 'campagne' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom de la campagne</Label>
                <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          )}

          {dialogMode === 'rencontre' && (
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Catégorie</Label>
                <Select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} required>
                  {selectedCampagne && [...new Set(selectedCampagne.rencontres.map(r => r.categorie))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Nom de la rencontre</Label>
                <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              
              <div className="border-t pt-4">
                <Label className="font-semibold">Ajouter des monstres</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Rechercher un monstre..."
                    value={formData.monstreSearch}
                    onChange={(e) => setFormData({ ...formData, monstreSearch: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Qté"
                    value={formData.monstreQuantite}
                    onChange={(e) => setFormData({ ...formData, monstreQuantite: e.target.value })}
                    min="1"
                    className="w-20"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (formData.monstreSearch && formData.monstreQuantite) {
                        addMonstreToForm(formData.monstreSearch, formData.monstreQuantite)
                        setFormData({ ...formData, monstreSearch: '', monstreQuantite: 1 })
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.monstreSearch && (
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                    {monstres
                      .filter(m => m.nom.toLowerCase().includes(formData.monstreSearch.toLowerCase()))
                      .slice(0, 5)
                      .map(monstre => (
                        <div
                          key={monstre.id}
                          className="p-2 hover:bg-secondary cursor-pointer rounded"
                          onClick={() => {
                            addMonstreToForm(monstre.id, formData.monstreQuantite)
                            setFormData({ ...formData, monstreSearch: '', monstreQuantite: 1 })
                          }}
                        >
                          <div className="font-medium">{monstre.nom}</div>
                          <div className="text-xs text-muted-foreground">FD: {monstre.fd} | CA: {monstre.ca}</div>
                        </div>
                      ))}
                  </div>
                )}

                {selectedMonstres.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Monstres ajoutés ({selectedMonstres.length})</Label>
                    {selectedMonstres.map((m, idx) => {
                      const monstre = monstres.find(mon => mon.id === m.monstreId)
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-secondary rounded">
                          <div>
                            <div className="font-medium">{monstre?.nom || 'Monstre inconnu'}</div>
                            <div className="text-xs text-muted-foreground">Quantité: {m.quantite}</div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeMonstreFromForm(idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setSelectedMonstres([])
                }}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          )}

          {dialogMode === 'addPerso' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              onAddPersoToCampagne(selectedCampagne.id, formData.persoId)
              const perso = personnages.find(p => p.id === formData.persoId)
              if (perso) {
                setSelectedCampagne({ ...selectedCampagne, personnages: [...selectedCampagne.personnages, perso] })
              }
              setDialogOpen(false)
            }} className="space-y-4">
              <div>
                <Label>Personnage</Label>
                <Select value={formData.persoId} onChange={(e) => setFormData({ ...formData, persoId: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {personnages.filter(p => !selectedCampagne.personnages.find(cp => cp.id === p.id)).map(perso => (
                    <option key={perso.id} value={perso.id}>{perso.nom} ({perso.classe} {perso.niveau})</option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          )}

          {dialogMode === 'addMonstre' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              onAddMonstreToRencontre(selectedCampagne.id, selectedRencontre.id, {
                monstreId: formData.monstreId,
                quantite: parseInt(formData.quantite)
              })
              const updatedRencontres = selectedCampagne.rencontres.map(r => 
                r.id === selectedRencontre.id 
                  ? { ...r, monstres: [...r.monstres, { monstreId: formData.monstreId, quantite: parseInt(formData.quantite) }] }
                  : r
              )
              setSelectedCampagne({ ...selectedCampagne, rencontres: updatedRencontres })
              setSelectedRencontre({ ...selectedRencontre, monstres: [...selectedRencontre.monstres, { monstreId: formData.monstreId, quantite: parseInt(formData.quantite) }] })
              setDialogOpen(false)
            }} className="space-y-4">
              <div>
                <Label>Monstre</Label>
                <Select value={formData.monstreId} onChange={(e) => setFormData({ ...formData, monstreId: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {monstres.map(monstre => (
                    <option key={monstre.id} value={monstre.id}>{monstre.nom} (FD: {monstre.fd})</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Quantité</Label>
                <Input type="number" value={formData.quantite} onChange={(e) => setFormData({ ...formData, quantite: e.target.value })} min="1" required />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          )}

          {dialogMode === 'editRencontre' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom de la rencontre</Label>
                <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}>
                  {formData.categories?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
                <Input
                  className="mt-2"
                  placeholder="Ou nouvelle catégorie..."
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          )}

          {dialogMode === 'categorie' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              // Créer une rencontre avec la catégorie et un nom par défaut
              const newRencontre = {
                ...formData,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                nom: 'Nouvelle rencontre',
                description: '',
                monstres: []
              }
              onAddRencontre(selectedCampagne.id, newRencontre)
              setSelectedCampagne({ ...selectedCampagne, rencontres: [...selectedCampagne.rencontres, newRencontre] })
              setDialogOpen(false)
            }} className="space-y-4">
              <div>
                <Label>Nom de la catégorie</Label>
                <Input value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} placeholder="ex: Donjon, Ville, Forêt" required />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          )}

          {dialogMode === 'initiative' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Entrez l'initiative de chaque joueur. Les monstres lanceront automatiquement leurs dés.</p>
              <div className="space-y-3">
                {selectedCampagne?.personnages.map(perso => (
                  <div key={perso.id} className="flex items-center justify-between p-3 bg-secondary rounded">
                    <div>
                      <div className="font-medium">{perso.nom}</div>
                      <div className="text-sm text-muted-foreground">{perso.classe} {perso.niveau}</div>
                    </div>
                    <Input
                      type="number"
                      className="w-24"
                      placeholder="Init"
                      value={initiativeData[perso.id] || ''}
                      onChange={(e) => setInitiativeData({ ...initiativeData, [perso.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={startCombat}>Commencer le combat</Button>
              </div>
            </div>
          )}

          {dialogMode === 'viewRencontre' && selectedRencontre && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-bold">{selectedRencontre.nom}</h3>
                <p className="text-sm text-muted-foreground">{selectedRencontre.categorie}</p>
              </div>
              {selectedRencontre.description && (
                <div>
                  <Label>Description</Label>
                  <p className="mt-1 text-sm">{selectedRencontre.description}</p>
                </div>
              )}
              <div>
                <Label>Monstres ({selectedRencontre.monstres.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedRencontre.monstres.map((m, idx) => {
                    const monstre = monstres.find(mon => mon.id === m.monstreId)
                    return (
                      <div key={idx} className="p-3 bg-secondary rounded">
                        <div className="font-medium">{monstre?.nom || 'Monstre inconnu'}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantité: {m.quantite} | FD: {monstre?.fd} | CA: {monstre?.ca} | PV: {monstre?.pv}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Fermer</Button>
                <Button type="button" onClick={() => openCombatDialog(selectedCampagne, selectedRencontre)}>
                  <Play className="w-4 h-4 mr-2" />
                  Lancer le combat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>  
      </Dialog>  
    </div>  
  )  
}  
