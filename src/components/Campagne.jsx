import { useState } from 'react'
import { Plus, Edit, Play, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { Button, Input, Label, Select, SelectItem, Textarea, Dialog, DialogHeader, DialogTitle, DialogContent, Card, CardHeader, CardTitle, CardContent, Checkbox } from './ui'
import { personnages } from '../lib/data'

export function Campagne({ campagnes, personnages, monstres, onAdd, onUpdate, onDelete, onAddPersoToCampagne, onAddRencontre, onAddMonstreToRencontre }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCampagne, setSelectedCampagne] = useState(null)
  const [dialogMode, setDialogMode] = useState('campagne') // 'campagne', 'rencontre', 'combat'
  const [formData, setFormData] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})
  const [combatData, setCombatData] = useState(null)

  const openCampagneDialog = () => {
    setDialogMode('campagne')
    setFormData({ nom: '', description: '' })
    setDialogOpen(true)
  }

  const openRencontreDialog = (campagne) => {
    setSelectedCampagne(campagne)
    setDialogMode('rencontre')
    setFormData({ categorie: '', nom: '', description: '' })
    setDialogOpen(true)
  }

  const openCombatDialog = (campagne, rencontre) => {
    setSelectedCampagne(campagne)
    setDialogMode('combat')
    const combatInit = {
      rencontre,
      joueursParticipants: campagne.personnages.map(p => ({ ...p, initiative: 0, pvActuels: p.pvActuels, slotsUtilises: {} })),
      monstresCombat: rencontre.monstres.map(m => {
        const monstreTemplate = monstres.find(mon => mon.id === m.monstreId)
        return {
          ...m,
          monstreTemplate,
          instances: Array.from({ length: m.quantite }).map((_, i) => ({
            id: `${m.monstreId}-${i}`,
            initiative: 0,
            pvActuels: monstreTemplate?.pv || 0,
            commentaire: '',
            slotsUtilises: {}
          }))
        }
      }),
      tourActuel: 0
    }
    setCombatData(combatInit)
    setDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (dialogMode === 'campagne') {
      onAdd({ ...formData, id: Date.now().toString(), personnages: [], rencontres: [] })
    } else if (dialogMode === 'rencontre') {
      onAddRencontre(selectedCampagne.id, { ...formData, id: Date.now().toString(), monstres: [] })
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

  const updatePV = (combatant, delta) => {
    if (combatant.type === 'joueur') {
      const newJoueurs = combatData.joueursParticipants.map(j => 
        j.id === combatant.id ? { ...j, pvActuels: Math.max(0, j.pvActuels + delta) } : j
      )
      setCombatData({ ...combatData, joueursParticipants: newJoueurs })
    } else {
      const newMonstres = combatData.monstresCombat.map(mc => ({
        ...mc,
        instances: mc.instances.map(inst => 
          inst.id === combatant.id ? { ...inst, pvActuels: Math.max(0, inst.pvActuels + delta) } : inst
        )
      }))
      setCombatData({ ...combatData, monstresCombat: newMonstres })
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

  const [selectedCombatant, setSelectedCombatant] = useState(null)
  const [sortDialogOpen, setSortDialogOpen] = useState(false)

  const openSortDialog = (combatant) => {
    setSelectedCombatant(combatant)
    setSortDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Campagnes</h2>
        <Button onClick={openCampagneDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      <div className="space-y-4">
        {campagnes.map(campagne => (
          <Card key={campagne.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{campagne.nom}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedCampagne(campagne)
                    setDialogMode('addPerso')
                    setFormData({ persoId: '' })
                    setDialogOpen(true)
                  }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter PJ
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openRencontreDialog(campagne)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nouvelle rencontre
                  </Button>
                </div>
              </div>
              {campagne.description && <p className="text-sm text-muted-foreground">{campagne.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h className="font-semibold mb-2">Personnages ({campagne.personnages.length})</h>
                <div className="flex flex-wrap gap-2">
                  {campagne.personnages.map(perso => (
                    <span key={perso.id} className="text-sm bg-secondary px-2 py-1 rounded">
                      {perso.nom} ({perso.classe} {perso.niveau})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h className="font-semibold mb-2">Rencontres</h>
                {campagne.rencontres.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune rencontre</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(
                      campagne.rencontres.reduce((acc, r) => {
                        if (!acc[r.categorie]) acc[r.categorie] = []
                        acc[r.categorie].push(r)
                        return acc
                      }, {})
                    ).map(([categorie, rencontres]) => (
                      <div key={categorie}>
                        <button
                          onClick={() => toggleCategory(campagne.id, categorie)}
                          className="flex items-center gap-2 font-semibold text-sm"
                        >
                          {expandedCategories[`${campagne.id}-${categorie}`] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {categorie} ({rencontres.length})
                        </button>
                        {expandedCategories[`${campagne.id}-${categorie}`] && (
                          <div className="ml-4 space-y-2 mt-2">
                            {rencontres.map(rencontre => (
                              <div key={rencontre.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                                <div>
                                  <div className="font-medium">{rencontre.nom}</div>
                                  <div className="text-xs text-muted-foreground">{rencontre.monstres.length} monstres</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setSelectedCampagne(campagne)
                                    setDialogMode('addMonstre')
                                    onAddRencontre(campagne.id, rencontre)
                                    setFormData({ monstreId: '', quantite: 1 })
                                    setDialogOpen(true)
                                  }}>
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" onClick={() => openCombatDialog(campagne, rencontre)}>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {dialogMode === 'campagne' ? 'Nouvelle campagne' :
             dialogMode === 'rencontre' ? 'Nouvelle rencontre' :
             dialogMode === 'addPerso' ? 'Ajouter un personnage' :
             dialogMode === 'addMonstre' ? 'Ajouter des monstres' : 'Combat'}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Catégorie</Label>
                <Input value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} placeholder="ex: Donjon, Ville, Forêt" required />
              </div>
              <div>
                <Label>Nom de la rencontre</Label>
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

          {dialogMode === 'addPerso' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              onAddPersoToCampagne(selectedCampagne.id, formData.persoId)
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
              onAddMonstreToRencontre(selectedCampagne.id, selectedCampagne.rencontres[selectedCampagne.rencontres.length - 1].id, {
                monstreId: formData.monstreId,
                quantite: parseInt(formData.quantite)
              })
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

          {dialogMode === 'combat' && combatData && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-2">
                <Button onClick={lancerInitiativeMonstres}>Lancer initiative monstres</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Ordre d'initiative</h3>
                  <div className="space-y-2">
                    {getOrdreInitiative().map((combatant, idx) => (
                      <div
                        key={combatant.id}
                        className={`p-2 rounded cursor-pointer ${combatant.type === 'monstre' ? 'bg-red-50' : 'bg-blue-50'} hover:opacity-80`}
                        onClick={() => openSortDialog(combatant)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {combatant.type === 'joueur' ? combatant.nom : `${combatant.nomMonstre} #${combatant.id.split('-')[1] + 1}`}
                          </span>
                          <span className="font-bold">{combatant.initiative}</span>
                        </div>
                        {combatant.type === 'monstre' && (
                          <Input
                            className="mt-1 text-xs"
                            placeholder="Commentaire (couleur figurine...)"
                            value={combatant.commentaire}
                            onChange={(e) => updateCommentaireMonstre(combatant.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCombatant && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      {selectedCombatant.type === 'joueur' ? selectedCombatant.nom : `${selectedCombatant.nomMonstre}`}
                    </h3>
                    <div className="space-y-3 p-4 bg-secondary rounded">
                      <div>
                        <Label>PV: {selectedCombatant.pvActuels}</Label>
                        <div className="flex gap-2 mt-1">
                          <Button size="sm" onClick={() => updatePV(selectedCombatant, -1)}>-1</Button>
                          <Button size="sm" onClick={() => updatePV(selectedCombatant, -5)}>-5</Button>
                          <Button size="sm" onClick={() => updatePV(selectedCombatant, 1)}>+1</Button>
                          <Button size="sm" onClick={() => updatePV(selectedCombatant, 5)}>+5</Button>
                        </div>
                      </div>

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

                      {selectedCombatant.sortsConnus && selectedCombatant.sortsConnus.length > 0 && (
                        <div>
                          <Label>Sorts connus</Label>
                          <div className="mt-2 space-y-1">
                            {selectedCombatant.sortsConnus.map(sortId => {
                              const sort = monstres.find(m => m.id === sortId) || { nom: 'Sort inconnu' }
                              return (
                                <div key={sortId} className="text-sm bg-background p-2 rounded">
                                  {sort.nom}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
