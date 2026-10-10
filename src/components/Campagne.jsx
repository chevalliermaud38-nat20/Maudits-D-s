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
    if (combatant.type === 'joueur') {
      const newJoueurs = combatData.joueursParticipants.map(j => 
        j.id === combatant.id ? { ...j, pvActuels: Math.max(0, (parseInt(j.pvActuels) || 0) + delta) } : j
      )
      const newCombatData = { ...combatData, joueursParticipants: newJoueurs }
      setCombatData(newCombatData)
      // Mettre à jour selectedCombatant pour refléter le changement immédiatement
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, pvActuels: Math.max(0, (parseInt(selectedCombatant.pvActuels) || 0) + delta) })
      }
    } else {
      const newMonstres = combatData.monstresCombat.map(mc => ({
        ...mc,
        instances: mc.instances.map(inst => 
          inst.id === combatant.id ? { ...inst, pvActuels: Math.max(0, (parseInt(inst.pvActuels) || 0) + delta) } : inst
        )
      }))
      const newCombatData = { ...combatData, monstresCombat: newMonstres }
      setCombatData(newCombatData)
      // Mettre à jour selectedCombatant pour refléter le changement immédiatement
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
        setSelectedCombatant({ ...selectedCombatant, pvActuels: Math.max(0, (parseInt(selectedCombatant.pvActuels) || 0) + delta) })
      }
    }
  }

  const toggleSlot = (combatant, niveau) => {
    const slots = combatant.slotsUtilises || {}
    const niveauKey = niveau.toString()
    const currentUsed = slots[niveauKey] || 0
    const maxSlots = combatant.slotsSorts?.[niveauKey] || 0
    
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

  const conditionsList = ['Étourdi', 'À terre', 'Paralysé', 'Charmé', 'Effrayé', 'Empoisonné', 'Invisible', 'Restrained', 'Épuisé']

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
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
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
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
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
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
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
      if (selectedCombatant && selectedCombatant.id === combatant.id) {
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
      setCombatData({ ...combatData, tourActuel: newTour, round: combatData.round + 1 })
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
              <div className="space-y-2">
                {getOrdreInitiative().map((combatant, idx) => {
                  const isDead = parseInt(combatant.pvActuels) <= 0
                  const ordreActif = getOrdreInitiativeActif()
                  const actifIndex = ordreActif.findIndex(c => c.id === combatant.id)
                  const isCurrentTurn = actifIndex === combatData.tourActuel

                  return (
                    <div
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
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">
                          {combatant.type === 'joueur' ? combatant.nom : combatant.nomMonstre}
                        </span>
                        <span className="font-bold text-sm">{combatant.initiative}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>CA: {combatant.type === 'joueur' ? combatant.ca : combatant.monstreTemplate?.ca}</span>
                        <span>PV: {combatant.pvActuels}</span>
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
                <div className="space-y-3 p-4 bg-secondary rounded max-h-[70vh] overflow-y-auto">
                  <div>
                    <h4 className="font-bold text-lg">
                      {selectedCombatant.type === 'joueur' ? selectedCombatant.nom : `${selectedCombatant.nomMonstre}`}
                    </h4>
                    {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate && (
                      <div className="text-sm text-muted-foreground mt-1">
                        CA: {selectedCombatant.monstreTemplate.ca} | FD: {selectedCombatant.monstreTemplate.fd} | {selectedCombatant.monstreTemplate.type}
                      </div>
                    )}
                    {selectedCombatant.type === 'joueur' && (
                      <div className="text-sm text-muted-foreground mt-1">
                        CA: {selectedCombatant.ca} | {selectedCombatant.classe} {selectedCombatant.niveau}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>PV: {selectedCombatant.pvActuels}/{selectedCombatant.type === 'joueur' ? selectedCombatant.pvMax : selectedCombatant.monstreTemplate?.pv}</Label>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" onClick={() => updatePV(selectedCombatant, -1)}>-1</Button>
                      <Button size="sm" onClick={() => updatePV(selectedCombatant, -5)}>-5</Button>
                      <Button size="sm" onClick={() => updatePV(selectedCombatant, 1)}>+1</Button>
                      <Button size="sm" onClick={() => updatePV(selectedCombatant, 5)}>+5</Button>
                    </div>
                  </div>

                  {parseInt(selectedCombatant.pvActuels) <= 0 && (
                    <div>
                      <Label>Jets de sauvegarde contre la mort</Label>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <Label className="text-xs text-green-600">Succès ({selectedCombatant.deathSaves?.successes || 0}/3)</Label>
                          <div className="flex gap-1 mt-1">
                            {[0, 1, 2].map(i => (
                              <Checkbox
                                key={i}
                                checked={i < (selectedCombatant.deathSaves?.successes || 0)}
                                onChange={() => toggleDeathSave(selectedCombatant, 'success')}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-red-600">Échecs ({selectedCombatant.deathSaves?.failures || 0}/3)</Label>
                          <div className="flex gap-1 mt-1">
                            {[0, 1, 2].map(i => (
                              <Checkbox
                                key={i}
                                checked={i < (selectedCombatant.deathSaves?.failures || 0)}
                                onChange={() => toggleDeathSave(selectedCombatant, 'failure')}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Vitesse</Label>
                    <p className="text-sm mt-1">{selectedCombatant.type === 'joueur' ? selectedCombatant.vitesse : selectedCombatant.monstreTemplate?.vitesse}</p>
                  </div>

                  <div>
                    <Label>Caractéristiques</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      {Object.entries(selectedCombatant.type === 'joueur' ? selectedCombatant.caracteristiques : selectedCombatant.monstreTemplate?.caracteristiques || {}).map(([key, value]) => {
                        const bonus = Math.floor((value - 10) / 2)
                        return (
                          <div key={key} className="text-center p-2 bg-background rounded">
                            <div className="font-medium">{key}</div>
                            <div className="text-lg font-bold">{value}</div>
                            <div className="text-xs text-muted-foreground">{bonus >= 0 ? `+${bonus}` : bonus}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.traits && (
                    <div>
                      <Label>Traits</Label>
                      <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant.monstreTemplate.traits) }} />
                    </div>
                  )}

                  {selectedCombatant.type === 'joueur' && selectedCombatant.traits && (
                    <div>
                      <Label>Traits</Label>
                      <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant.traits) }} />
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.actions && (
                    <div>
                      <Label>Actions</Label>
                      <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant.monstreTemplate.actions) }} />
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.actionsLegendaire && (
                    <div>
                      <Label>Actions légendaires</Label>
                      <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant.monstreTemplate.actionsLegendaire) }} />
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.reactions && (
                    <div>
                      <Label>Réactions</Label>
                      <div className="text-sm mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedCombatant.monstreTemplate.reactions) }} />
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.sens && (
                    <div>
                      <Label>Sens</Label>
                      <p className="text-sm mt-1">{selectedCombatant.monstreTemplate.sens}</p>
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.langues && (
                    <div>
                      <Label>Langues</Label>
                      <p className="text-sm mt-1">{selectedCombatant.monstreTemplate.langues}</p>
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.competences && (
                    <div>
                      <Label>Compétences</Label>
                      <p className="text-sm mt-1">{selectedCombatant.monstreTemplate.competences}</p>
                    </div>
                  )}

                  {selectedCombatant.type === 'joueur' && selectedCombatant.competences && (
                    <div>
                      <Label>Compétences</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedCombatant.competences}</p>
                    </div>
                  )}

                  {selectedCombatant.type === 'joueur' && selectedCombatant.equipement && (
                    <div>
                      <Label>Équipement</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedCombatant.equipement}</p>
                    </div>
                  )}

                  {selectedCombatant.slotsSorts && Object.keys(selectedCombatant.slotsSorts).some(k => selectedCombatant.slotsSorts[k] > 0) && (
                    <div>
                      <Label>Slots de sorts</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {Object.entries(selectedCombatant.slotsSorts).map(([niveau, max]) => max > 0 && (
                          <div key={niveau} className="text-center">
                            <Label className="text-xs">Niv {niveau}</Label>
                            <div className="flex gap-1 justify-center mt-1">
                              {Array.from({ length: max }).map((_, i) => (
                                <Checkbox
                                  key={i}
                                  checked={i < (selectedCombatant.slotsUtilises?.[niveau] || 0)}
                                  onChange={() => toggleSlot(selectedCombatant, niveau)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Conditions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {conditionsList.map(condition => (
                        <label key={condition} className="flex items-center gap-1 text-xs">
                          <Checkbox
                            checked={selectedCombatant.conditions?.includes(condition) || false}
                            onChange={() => toggleCondition(selectedCombatant, condition)}
                          />
                          {condition}
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedCombatant.sortsConnus && selectedCombatant.sortsConnus.length > 0 && (
                    <div>
                      <Label>Sorts connus</Label>
                      <div className="mt-2 space-y-1">
                        {selectedCombatant.sortsConnus.map(sortId => {
                          const sort = sorts?.find(s => s.id === sortId) || { nom: 'Sort inconnu', niveau: '', tempsIncantation: '', concentration: false }
                          return (
                            <div
                              key={sortId}
                              className="text-sm bg-background p-2 rounded cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => openSortDialog(sortId)}
                            >
                              <div className="font-medium">{sort.nom}</div>
                              <div className="text-xs text-muted-foreground">
                                Niv {sort.niveau} | {sort.tempsIncantation} {sort.concentration && '| Concentration'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {selectedCombatant.type === 'monstre' && selectedCombatant.monstreTemplate?.sortsPrepares && selectedCombatant.monstreTemplate.sortsPrepares.length > 0 && (
                    <div>
                      <Label>Sorts préparés</Label>
                      <div className="mt-2 space-y-1">
                        {selectedCombatant.monstreTemplate.sortsPrepares.map(sortId => {
                          const sort = sorts?.find(s => s.id === sortId) || { nom: 'Sort inconnu', niveau: '', tempsIncantation: '', concentration: false }
                          return (
                            <div
                              key={sortId}
                              className="text-sm bg-background p-2 rounded cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => openSortDialog(sortId)}
                            >
                              <div className="font-medium">{sort.nom}</div>
                              <div className="text-xs text-muted-foreground">
                                Niv {sort.niveau} | {sort.tempsIncantation} {sort.concentration && '| Concentration'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-secondary rounded text-center text-muted-foreground">
                  Cliquez sur un combattant pour voir sa fiche
                </div>
              )}
            </div>
          </main>

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
                  <p className="whitespace-pre-wrap">{selectedSort.descriptif}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
