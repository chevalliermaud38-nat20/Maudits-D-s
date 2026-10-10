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
import { ecolesMagie, niveauxSorts, composantesSorts, classesDD } from '../lib/data'

export function Sorts({ sorts, onAdd, onUpdate, onCopy, onDelete, onImportXML }) {
  const [search, setSearch] = useState('')
  const [filterEcole, setFilterEcole] = useState('')
  const [filterNiveau, setFilterNiveau] = useState('')
  const [sortBy, setSortBy] = useState('nom')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSort, setEditingSort] = useState(null)
  const [formData, setFormData] = useState({})
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

  const filteredSorts = sorts.filter(sort => {
    const matchSearch = sort.nom.toLowerCase().includes(search.toLowerCase())
    const matchEcole = !filterEcole || sort.ecole === filterEcole
    const matchNiveau = !filterNiveau || sort.niveau === filterNiveau
    return matchSearch && matchEcole && matchNiveau
  }).sort((a, b) => {
    if (sortBy === 'nom') {
      return a.nom.localeCompare(b.nom)
    } else if (sortBy === 'niveau') {
      const niveauOrder = niveauxSorts.indexOf(a.niveau) - niveauxSorts.indexOf(b.niveau)
      return niveauOrder !== 0 ? niveauOrder : a.nom.localeCompare(b.nom)
    }
    return 0
  })

  const openDialog = (sort = null) => {
    if (sort) {
      setEditingSort(sort)
      setFormData({ ...sort })
    } else {
      setEditingSort(null)
      setFormData({
        nom: '',
        ecole: '',
        niveau: '',
        tempsIncantation: '',
        portee: '',
        duree: '',
        composantes: [],
        concentration: false,
        rituel: false,
        descriptif: '',
        classes: []
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingSort) {
      onUpdate(editingSort.id, formData)
    } else {
      onAdd({ ...formData, id: Date.now().toString() })
    }
    setDialogOpen(false)
  }

  const handleCopy = (sort) => {
    const newSort = { ...sort, id: Date.now().toString(), nom: `${sort.nom} (copie)` }
    onCopy(newSort)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Sorts</h2>
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
            Nouveau sort
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un sort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterEcole} onChange={(e) => setFilterEcole(e.target.value)} className="w-full sm:w-auto">
          <option value="">Toutes les écoles</option>
          {ecolesMagie.map(ecole => (
            <SelectItem key={ecole} value={ecole}>{ecole}</SelectItem>
          ))}
        </Select>
        <Select value={filterNiveau} onChange={(e) => setFilterNiveau(e.target.value)} className="w-full sm:w-auto">
          <option value="">Tous les niveaux</option>
          {niveauxSorts.map(niveau => (
            <SelectItem key={niveau} value={niveau}>{niveau}</SelectItem>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full sm:w-auto">
          <option value="nom">Tri: Nom</option>
          <option value="niveau">Tri: Niveau</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSorts.map(sort => (
          <Card key={sort.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{sort.nom}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Niveau:</span>
                  <span>{sort.niveau}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">École:</span>
                  <span>{sort.ecole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temps:</span>
                  <span>{sort.tempsIncantation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portée:</span>
                  <span>{sort.portee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <span>{sort.duree}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Composantes:</span>
                  <span>{sort.composantes?.join(', ') || '-'}</span>
                </div>
                <div className="flex gap-4">
                  {sort.concentration && <span className="text-xs bg-blue-100 px-2 py-1 rounded">Concentration</span>}
                  {sort.rituel && <span className="text-xs bg-purple-100 px-2 py-1 rounded">Rituel</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => openDialog(sort)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCopy(sort)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(sort.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editingSort ? 'Modifier le sort' : 'Nouveau sort'}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>École</Label>
                <Select value={formData.ecole} onChange={(e) => setFormData({ ...formData, ecole: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {ecolesMagie.map(ecole => (
                    <SelectItem key={ecole} value={ecole}>{ecole}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Niveau</Label>
                <Select value={formData.niveau} onChange={(e) => setFormData({ ...formData, niveau: e.target.value })} required>
                  <option value="">Sélectionner</option>
                  {niveauxSorts.map(niveau => (
                    <SelectItem key={niveau} value={niveau}>{niveau}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Temps d'incantation</Label>
                <Input value={formData.tempsIncantation} onChange={(e) => setFormData({ ...formData, tempsIncantation: e.target.value })} required />
              </div>
              <div>
                <Label>Portée</Label>
                <Input value={formData.portee} onChange={(e) => setFormData({ ...formData, portee: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Durée</Label>
              <Input value={formData.duree} onChange={(e) => setFormData({ ...formData, duree: e.target.value })} required />
            </div>
            <div>
              <Label>Descriptif</Label>
              <RichTextarea
                value={formData.descriptif}
                onChange={(e) => setFormData({ ...formData, descriptif: e.target.value })}
                placeholder="Utilisez **gras**, *italique*, __souligné__"
                rows={5}
              />
            </div>
            <div>
              <Label>Composantes</Label>
              <div className="flex gap-4 mt-2">
                {composantesSorts.map(comp => (
                  <label key={comp} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.composantes?.includes(comp)}
                      onChange={(e) => {
                        const newComposantes = e.target.checked
                          ? [...(formData.composantes || []), comp]
                          : formData.composantes.filter(c => c !== comp)
                        setFormData({ ...formData, composantes: newComposantes })
                      }}
                    />
                    {comp}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.concentration}
                  onChange={(e) => setFormData({ ...formData, concentration: e.target.checked })}
                />
                Concentration
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.rituel}
                  onChange={(e) => setFormData({ ...formData, rituel: e.target.checked })}
                />
                Rituel
              </label>
            </div>
            <div>
              <Label>Descriptif</Label>
              <Textarea
                value={formData.descriptif}
                onChange={(e) => setFormData({ ...formData, descriptif: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Classes pouvant l'apprendre</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {classesDD.map(classe => (
                  <label key={classe} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.classes?.includes(classe)}
                      onChange={(e) => {
                        const newClasses = e.target.checked
                          ? [...(formData.classes || []), classe]
                          : formData.classes.filter(c => c !== classe)
                        setFormData({ ...formData, classes: newClasses })
                      }}
                    />
                    {classe}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingSort ? 'Modifier' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
