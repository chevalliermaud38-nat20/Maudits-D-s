import { useState } from 'react'
import { Search, Plus, Edit, Copy } from 'lucide-react'
import { Button, Input, Label, Select, SelectItem, Textarea, Dialog, DialogHeader, DialogTitle, DialogContent, Card, CardHeader, CardTitle, CardContent } from './ui'
import { classesDD, niveauxSorts, caracteristiques } from '../lib/data'

export function Personnages({ personnages, onAdd, onUpdate, onCopy, sorts }) {
  const [search, setSearch] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPerso, setEditingPerso] = useState(null)
  const [formData, setFormData] = useState({})
  const [selectedSort, setSelectedSort] = useState(null)

  const filteredPersos = personnages.filter(perso => {
    const matchSearch = perso.nom.toLowerCase().includes(search.toLowerCase())
    const matchClasse = !filterClasse || perso.classe === filterClasse
    return matchSearch && matchClasse
  })

  const openDialog = (perso = null) => {
    if (perso) {
      setEditingPerso(perso)
      setFormData({ ...perso })
    } else {
      setEditingPerso(null)
      setFormData({
        nom: '',
        classe: '',
        niveau: 1,
        race: '',
        background: '',
        alignement: '',
        ca: '',
        pvMax: '',
        pvActuels: '',
        vitesse: '',
        caracteristiques: { Force: 10, Dextérité: 10, Constitution: 10, Intelligence: 10, Sagesse: 10, Charisme: 10 },
        bonusMaitrise: 2,
        competences: '',
        sauvegardes: '',
        equipement: '',
        traits: '',
        sortsConnus: [],
        slotsSorts: {}
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingPerso) {
      onUpdate(editingPerso.id, formData)
    } else {
      onAdd({ ...formData, id: Date.now().toString(), pvActuels: formData.pvMax })
    }
    setDialogOpen(false)
  }

  const handleCopy = (perso) => {
    const newPerso = { ...perso, id: Date.now().toString(), nom: `${perso.nom} (copie)` }
    onCopy(newPerso)
  }

  const handleCaracChange = (carac, value) => {
    setFormData({
      ...formData,
      caracteristiques: {
        ...formData.caracteristiques,
        [carac]: parseInt(value) || 10
      }
    })
  }

  const getModifier = (score) => Math.floor((score - 10) / 2)

  const getSortById = (sortId) => sorts.find(s => s.id === sortId)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Personnages</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau personnage
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un personnage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterClasse} onChange={(e) => setFilterClasse(e.target.value)}>
          <option value="">Toutes les classes</option>
          {classesDD.map(classe => (
            <SelectItem key={classe} value={classe}>{classe}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPersos.map(perso => (
          <Card key={perso.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{perso.nom}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classe:</span>
                  <span>{perso.classe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Niveau:</span>
                  <span>{perso.niveau}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race:</span>
                  <span>{perso.race}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CA:</span>
                  <span>{perso.ca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PV:</span>
                  <span>{perso.pvActuels}/{perso.pvMax}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => openDialog(perso)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCopy(perso)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingPerso ? 'Modifier le personnage' : 'Nouveau personnage'}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Nom</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Classe</Label>
                <Select value={formData.classe} onChange={(e) => setFormData({ ...formData, classe: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {classesDD.map(classe => (
                    <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Niveau</Label>
                <Input type="number" value={formData.niveau} onChange={(e) => setFormData({ ...formData, niveau: parseInt(e.target.value) || 1 })} min="1" max="20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Race</Label>
                <Input value={formData.race} onChange={(e) => setFormData({ ...formData, race: e.target.value })} />
              </div>
              <div>
                <Label>Background</Label>
                <Input value={formData.background} onChange={(e) => setFormData({ ...formData, background: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Alignement</Label>
              <Input value={formData.alignement} onChange={(e) => setFormData({ ...formData, alignement: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Classe d'armure (CA)</Label>
                <Input value={formData.ca} onChange={(e) => setFormData({ ...formData, ca: e.target.value })} required />
              </div>
              <div>
                <Label>Points de vie max (PV)</Label>
                <Input value={formData.pvMax} onChange={(e) => setFormData({ ...formData, pvMax: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Vitesse (mètres)</Label>
              <Input value={formData.vitesse} onChange={(e) => setFormData({ ...formData, vitesse: e.target.value })} placeholder="ex: 9m" />
            </div>
            <div>
              <Label>Caractéristiques</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {caracteristiques.map(carac => (
                  <div key={carac}>
                    <Label className="text-xs">{carac}</Label>
                    <Input
                      type="number"
                      value={formData.caracteristiques?.[carac] || 10}
                      onChange={(e) => handleCaracChange(carac, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Bonus de maîtrise</Label>
              <Input type="number" value={formData.bonusMaitrise} onChange={(e) => setFormData({ ...formData, bonusMaitrise: parseInt(e.target.value) || 2 })} />
            </div>
            <div>
              <Label>Compétences</Label>
              <Textarea value={formData.competences} onChange={(e) => setFormData({ ...formData, competences: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Jets de sauvegarde</Label>
              <Textarea value={formData.sauvegardes} onChange={(e) => setFormData({ ...formData, sauvegardes: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Équipement</Label>
              <Textarea value={formData.equipement} onChange={(e) => setFormData({ ...formData, equipement: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Traits</Label>
              <Textarea value={formData.traits} onChange={(e) => setFormData({ ...formData, traits: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Sorts connus</Label>
              <Select multiple size={5} value={formData.sortsConnus || []} onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value)
                setFormData({ ...formData, sortsConnus: selected })
              }}>
                {sorts.map(sort => (
                  <option key={sort.id} value={sort.id}>{sort.nom} ({sort.niveau})</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Slots de sorts par niveau</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {niveauxSorts.slice(1).map(niveau => (
                  <div key={niveau}>
                    <Label className="text-xs">Niv {niveau}</Label>
                    <Input
                      type="number"
                      value={formData.slotsSorts?.[niveau] || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        slotsSorts: { ...formData.slotsSorts, [niveau]: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingPerso ? 'Modifier' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSort} onOpenChange={() => setSelectedSort(null)}>
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
  )
}
