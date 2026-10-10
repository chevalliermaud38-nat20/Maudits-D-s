import { useState, useRef } from 'react'
import { Search, Plus, Edit, Copy, Trash2, Upload } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select, SelectItem } from './ui/Select'
import { Textarea } from './ui/Textarea'
import { RichTextarea } from './ui/RichTextarea'
import { Checkbox } from './ui/Checkbox'
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { typesMonstres, taillesCreature, alignements, caracteristiques, niveauxSorts } from '../lib/data'

export function Monstres({ monstres, onAdd, onUpdate, onCopy, onDelete, sorts, onImportXML }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('nom')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMonstre, setEditingMonstre] = useState(null)
  const [formData, setFormData] = useState({})
  const [sortSearch, setSortSearch] = useState('')
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onImportXML) {
      onImportXML(file)
    }
  }

  const filteredMonstres = monstres.filter(monstre => {
    const matchSearch = monstre.nom.toLowerCase().includes(search.toLowerCase())
    const matchType = !filterType || monstre.type === filterType
    return matchSearch && matchType
  }).sort((a, b) => {
    if (sortBy === 'nom') {
      return a.nom.localeCompare(b.nom)
    } else if (sortBy === 'fd') {
      const fdA = parseFloat(a.fd) || 0
      const fdB = parseFloat(b.fd) || 0
      return fdA - fdB
    }
    return 0
  })

  const openDialog = (monstre = null) => {
    if (monstre) {
      setEditingMonstre(monstre)
      setFormData({ ...monstre })
    } else {
      setEditingMonstre(null)
      setFormData({
        nom: '',
        type: '',
        taille: '',
        ca: '',
        pv: '',
        alignement: '',
        legendaire: false,
        fd: '',
        vitesse: '',
        bonusInitiative: 0,
        caracteristiques: { Force: 10, Dextérité: 10, Constitution: 10, Intelligence: 10, Sagesse: 10, Charisme: 10 },
        competences: '',
        sens: '',
        langues: '',
        equipement: '',
        traits: '',
        actions: '',
        sortsPrepares: [],
        slotsSorts: {},
        actionsLegendaire: '',
        reactions: ''
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingMonstre) {
      onUpdate(editingMonstre.id, formData)
    } else {
      onAdd({ ...formData, id: Date.now().toString() })
    }
    setDialogOpen(false)
  }

  const handleCopy = (monstre) => {
    const newMonstre = { ...monstre, id: Date.now().toString(), nom: `${monstre.nom} (copie)` }
    onCopy(newMonstre)
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Monstres</h2>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="w-4 h-4 mr-2" />
            Importer XML
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau monstre
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un monstre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full sm:w-auto">
          <option value="">Tous les types</option>
          {typesMonstres.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto">
          <option value="nom">Tri: Nom</option>
          <option value="fd">Tri: FD</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMonstres.map(monstre => (
          <Card key={monstre.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {monstre.nom}
                {monstre.legendaire && <span className="text-xs bg-yellow-100 px-2 py-1 rounded">Légendaire</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FD:</span>
                  <span>{monstre.fd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{monstre.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taille:</span>
                  <span>{monstre.taille}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CA:</span>
                  <span>{monstre.ca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PV:</span>
                  <span>{monstre.pv}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alignement:</span>
                  <span>{monstre.alignement}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => openDialog(monstre)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCopy(monstre)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(monstre.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingMonstre ? 'Modifier le monstre' : 'Nouveau monstre'}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Nom</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {typesMonstres.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Taille</Label>
                <Select value={formData.taille} onChange={(e) => setFormData({ ...formData, taille: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {taillesCreature.map(taille => (
                    <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Classe d'armure (CA)</Label>
                <Input value={formData.ca} onChange={(e) => setFormData({ ...formData, ca: e.target.value })} required />
              </div>
              <div>
                <Label>Points de vie (PV)</Label>
                <Input value={formData.pv} onChange={(e) => setFormData({ ...formData, pv: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alignement</Label>
                <Select value={formData.alignement} onChange={(e) => setFormData({ ...formData, alignement: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {alignements.map(align => (
                    <SelectItem key={align} value={align}>{align}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Facteur de difficulté (FD)</Label>
                <Input value={formData.fd} onChange={(e) => setFormData({ ...formData, fd: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Vitesse (mètres)</Label>
              <Input value={formData.vitesse} onChange={(e) => setFormData({ ...formData, vitesse: e.target.value })} placeholder="ex: 9m (18m vol)" />
            </div>
            <div>
              <Label>Bonus d'initiative</Label>
              <Input type="number" value={formData.bonusInitiative} onChange={(e) => setFormData({ ...formData, bonusInitiative: parseInt(e.target.value) || 0 })} />
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
              <Label>Compétences</Label>
              <Textarea value={formData.competences} onChange={(e) => setFormData({ ...formData, competences: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Sens</Label>
              <Textarea value={formData.sens} onChange={(e) => setFormData({ ...formData, sens: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Langues</Label>
              <Textarea value={formData.langues} onChange={(e) => setFormData({ ...formData, langues: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Équipement</Label>
              <Textarea value={formData.equipement} onChange={(e) => setFormData({ ...formData, equipement: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Traits</Label>
              <RichTextarea
                value={formData.traits}
                onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                placeholder="Utilisez **gras**, *italique*, __souligné__"
                rows={3}
              />
            </div>
            <div>
              <Label>Actions</Label>
              <RichTextarea
                value={formData.actions}
                onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                placeholder="Utilisez **gras**, *italique*, __souligné__"
                rows={3}
              />
            </div>
            <div>
              <Label>Sorts préparés</Label>
              <Input
                placeholder="Rechercher un sort..."
                value={sortSearch}
                onChange={(e) => setSortSearch(e.target.value)}
                className="mb-2"
              />
              <Select multiple size={5} value={formData.sortsPrepares || []} onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value)
                setFormData({ ...formData, sortsPrepares: selected })
              }}>
                {sorts.filter(s => s.nom.toLowerCase().includes(sortSearch.toLowerCase())).map(sort => (
                  <option key={sort.id} value={sort.id}>{sort.nom}</option>
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
            <div>
              <Label>Légendaire</Label>
              <Checkbox
                checked={formData.legendaire}
                onChange={(e) => setFormData({ ...formData, legendaire: e.target.checked })}
              />
            </div>
            <div>
              <Label>Actions légendaires</Label>
              <RichTextarea
                value={formData.actionsLegendaire}
                onChange={(e) => setFormData({ ...formData, actionsLegendaire: e.target.value })}
                placeholder="Utilisez **gras**, *italique*, __souligné__"
                rows={3}
              />
            </div>
            <div>
              <Label>Réactions</Label>
              <RichTextarea
                value={formData.reactions}
                onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
                placeholder="Utilisez **gras**, *italique*, __souligné__"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingMonstre ? 'Modifier' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
