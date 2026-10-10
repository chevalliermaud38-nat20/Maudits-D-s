import { useState, useEffect } from 'react'
import { Book, Skull, Users, Sword, Download, Upload, FileDown, FileUp } from 'lucide-react'
import { Button } from './components/ui/Button'
import { Sorts } from './components/Sorts'
import { Monstres } from './components/Monstres'
import { Personnages } from './components/Personnages'
import { Campagne } from './components/Campagne'
import { GitHubConfig } from './components/GitHubConfig'
import { initialData } from './lib/data'

function App() {
  const [activeTab, setActiveTab] = useState('campagne')
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('maudits-des-data')
    return saved ? JSON.parse(saved) : initialData
  })
  const [githubConfig, setGithubConfig] = useState(data.githubConfig || {})

  useEffect(() => {
    localStorage.setItem('maudits-des-data', JSON.stringify(data))
  }, [data])

  const handleAddSort = (sort) => {
    setData({ ...data, sorts: [...data.sorts, sort] })
  }

  const handleUpdateSort = (id, updatedSort) => {
    setData({ ...data, sorts: data.sorts.map(s => s.id === id ? updatedSort : s) })
  }

  const handleCopySort = (sort) => {
    setData({ ...data, sorts: [...data.sorts, sort] })
  }

  const handleDeleteSort = (id) => {
    setData({ ...data, sorts: data.sorts.filter(s => s.id !== id) })
  }

  const handleAddMonstre = (monstre) => {
    setData({ ...data, monstres: [...data.monstres, monstre] })
  }

  const handleUpdateMonstre = (id, updatedMonstre) => {
    setData({ ...data, monstres: data.monstres.map(m => m.id === id ? updatedMonstre : m) })
  }

  const handleCopyMonstre = (monstre) => {
    setData({ ...data, monstres: [...data.monstres, monstre] })
  }

  const handleDeleteMonstre = (id) => {
    setData({ ...data, monstres: data.monstres.filter(m => m.id !== id) })
  }

  const handleAddPersonnage = (personnage) => {
    setData({ ...data, personnages: [...data.personnages, personnage] })
  }

  const handleUpdatePersonnage = (id, updatedPerso) => {
    setData({ ...data, personnages: data.personnages.map(p => p.id === id ? updatedPerso : p) })
  }

  const handleCopyPersonnage = (personnage) => {
    setData({ ...data, personnages: [...data.personnages, personnage] })
  }

  const handleDeletePersonnage = (id) => {
    setData({ ...data, personnages: data.personnages.filter(p => p.id !== id) })
  }

  const handleAddCampagne = (campagne) => {
    setData({ ...data, campagnes: [...data.campagnes, campagne] })
  }

  const handleUpdateCampagne = (id, updatedCampagne) => {
    setData({ ...data, campagnes: data.campagnes.map(c => c.id === id ? updatedCampagne : c) })
  }

  const handleDeleteCampagne = (id) => {
    setData({ ...data, campagnes: data.campagnes.filter(c => c.id !== id) })
  }

  const handleImportSortsFromXML = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      
      // Nettoyer les commentaires HTML
      const cleanedContent = content.replace(/<!--[\s\S]*?-->/g, '')
      
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(cleanedContent, 'text/xml')
      
      // Vérifier les erreurs de parsing
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        alert('Erreur de parsing XML: ' + parseError.textContent)
        return
      }
      
      const sortElements = xmlDoc.getElementsByTagName('sort')
      console.log('Éléments sort trouvés:', sortElements.length)

      const importedSorts = []
      for (let i = 0; i < sortElements.length; i++) {
        const sortEl = sortElements[i]
        const composantes = []
        const verbale = sortEl.querySelector('verbale')
        const somatique = sortEl.querySelector('somatique')
        const materielle = sortEl.querySelector('materielle')

        if (verbale?.getAttribute('presente') === 'true') composantes.push('V')
        if (somatique?.getAttribute('presente') === 'true') composantes.push('S')
        if (materielle?.getAttribute('presente') === 'true') composantes.push('M')

        const sort = {
          id: sortEl.getAttribute('id') || `sort-${Date.now()}-${i}`,
          nom: sortEl.querySelector('nom')?.textContent || '',
          ecole: sortEl.querySelector('ecole')?.textContent || '',
          niveau: sortEl.querySelector('niveau')?.textContent || '',
          tempsIncantation: sortEl.querySelector('tempsIncantation')?.textContent || '',
          portee: sortEl.querySelector('portee')?.textContent || '',
          duree: sortEl.querySelector('duree')?.textContent || '',
          composantes,
          concentration: sortEl.querySelector('concentration')?.textContent === 'true',
          rituel: sortEl.querySelector('rituel')?.textContent === 'true',
          descriptif: sortEl.querySelector('descriptionResume')?.textContent || '',
          classes: Array.from(sortEl.querySelectorAll('classes > classe')).map(c => c.textContent).join(', ')
        }
        importedSorts.push(sort)
      }

      setData({ ...data, sorts: [...data.sorts, ...importedSorts] })
      alert(`${importedSorts.length} sorts importés avec succès !`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleImportMonstresFromXML = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      
      // Nettoyer les commentaires HTML
      const cleanedContent = content.replace(/<!--[\s\S]*?-->/g, '')
      
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(cleanedContent, 'text/xml')
      
      // Vérifier les erreurs de parsing
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        alert('Erreur de parsing XML: ' + parseError.textContent)
        return
      }
      
      const monsterElements = xmlDoc.getElementsByTagName('monster')
      console.log('Éléments monster trouvés:', monsterElements.length)

      const importedMonstres = []
      for (let i = 0; i < monsterElements.length; i++) {
        const monsterEl = monsterElements[i]
        
        const caracteristiques = {
          Force: monsterEl.querySelector('str')?.textContent || '10',
          Dextérité: monsterEl.querySelector('dex')?.textContent || '10',
          Constitution: monsterEl.querySelector('con')?.textContent || '10',
          Intelligence: monsterEl.querySelector('int')?.textContent || '10',
          Sagesse: monsterEl.querySelector('wis')?.textContent || '10',
          Charisme: monsterEl.querySelector('cha')?.textContent || '10'
        }

        // Extraire les traits
        const traits = Array.from(monsterEl.querySelectorAll('traits > trait')).map(t => {
          const name = t.querySelector('name')?.textContent || ''
          const text = t.querySelector('text')?.textContent || ''
          return `${name}: ${text}`
        }).join('\n')

        // Extraire les actions
        const actions = Array.from(monsterEl.querySelectorAll('actions > action')).map(a => {
          const name = a.querySelector('name')?.textContent || ''
          const text = a.querySelector('text')?.textContent || ''
          return `${name}: ${text}`
        }).join('\n')

        // Extraire les actions légendaires
        const legendaryActions = Array.from(monsterEl.querySelectorAll('legendary_actions > legendary_action')).map(a => {
          const name = a.querySelector('name')?.textContent || ''
          const text = a.querySelector('text')?.textContent || ''
          return `${name}: ${text}`
        }).join('\n')

        const monster = {
          id: `monster-${Date.now()}-${i}`,
          nom: monsterEl.querySelector('name')?.textContent || '',
          type: monsterEl.querySelector('type')?.textContent || '',
          taille: monsterEl.querySelector('size')?.textContent || '',
          ca: monsterEl.querySelector('ac')?.textContent || '',
          pv: monsterEl.querySelector('hp')?.textContent || '',
          alignement: monsterEl.querySelector('alignment')?.textContent || '',
          legendaire: monsterEl.querySelector('legendary_actions') !== null,
          fd: monsterEl.querySelector('cr')?.textContent || '',
          vitesse: monsterEl.querySelector('speed')?.textContent || '',
          bonusInitiative: 0,
          caracteristiques,
          competences: monsterEl.querySelector('skills')?.textContent || '',
          sens: monsterEl.querySelector('senses')?.textContent || '',
          langues: monsterEl.querySelector('languages')?.textContent || '',
          equipement: '',
          traits,
          actions,
          sortsPrepares: [],
          slotsSorts: {},
          actionsLegendaire: legendaryActions,
          reactions: ''
        }
        importedMonstres.push(monster)
      }

      setData({ ...data, monstres: [...data.monstres, ...importedMonstres] })
      alert(`${importedMonstres.length} monstres importés avec succès !`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleAddPersoToCampagne = (campagneId, persoId) => {
    const perso = data.personnages.find(p => p.id === persoId)
    if (!perso) return
    
    setData({
      ...data,
      campagnes: data.campagnes.map(c =>
        c.id === campagneId
          ? { ...c, personnages: [...c.personnages, perso] }
          : c
      )
    })
  }

  const handleAddRencontre = (campagneId, rencontre) => {
    setData({
      ...data,
      campagnes: data.campagnes.map(c =>
        c.id === campagneId
          ? { ...c, rencontres: [...c.rencontres, rencontre] }
          : c
      )
    })
  }

  const handleAddMonstreToRencontre = (campagneId, rencontreId, monstreData) => {
    setData({
      ...data,
      campagnes: data.campagnes.map(c => {
        if (c.id === campagneId) {
          return {
            ...c,
            rencontres: c.rencontres.map(r => {
              if (r.id === rencontreId) {
                return {
                  ...r,
                  monstres: [...r.monstres, monstreData]
                }
              }
              return r
            })
          }
        }
        return c
      })
    })
  }

  const handleDataLoad = (loadedData) => {
    setData(loadedData)
  }

  const handleExportLocal = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maudits-des-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportLocal = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        setData(importedData)
      } catch (error) {
        alert('Erreur lors de l\'import du fichier: fichier JSON invalide')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const tabs = [
    { id: 'campagne', label: 'Campagne', icon: Sword },
    { id: 'monstres', label: 'Monstres', icon: Skull },
    { id: 'sorts', label: 'Sorts', icon: Book },
    { id: 'personnages', label: 'Personnages', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Maudits Dés</h1>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportLocal}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="outline" as="span" className="cursor-pointer">
                  <FileUp className="w-4 h-4 mr-2" />
                  Importer
                </Button>
              </label>
              <Button variant="outline" onClick={handleExportLocal}>
                <FileDown className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <GitHubConfig
                config={githubConfig}
                onConfigChange={setGithubConfig}
                data={data}
                onDataLoad={handleDataLoad}
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'sorts' && (
          <Sorts
            sorts={data.sorts}
            onAdd={handleAddSort}
            onUpdate={handleUpdateSort}
            onCopy={handleCopySort}
            onDelete={handleDeleteSort}
            onImportXML={handleImportSortsFromXML}
          />
        )}

        {activeTab === 'monstres' && (
          <Monstres
            monstres={data.monstres}
            onAdd={handleAddMonstre}
            onUpdate={handleUpdateMonstre}
            onCopy={handleCopyMonstre}
            onDelete={handleDeleteMonstre}
            sorts={data.sorts}
            onImportXML={handleImportMonstresFromXML}
          />
        )}

        {activeTab === 'personnages' && (
          <Personnages
            personnages={data.personnages}
            onAdd={handleAddPersonnage}
            onUpdate={handleUpdatePersonnage}
            onCopy={handleCopyPersonnage}
            onDelete={handleDeletePersonnage}
            sorts={data.sorts}
          />
        )}

        {activeTab === 'campagne' && (
          <Campagne
            campagnes={data.campagnes}
            personnages={data.personnages}
            monstres={data.monstres}
            sorts={data.sorts}
            onAdd={handleAddCampagne}
            onUpdate={handleUpdateCampagne}
            onDelete={handleDeleteCampagne}
            onAddPersoToCampagne={handleAddPersoToCampagne}
            onAddRencontre={handleAddRencontre}
            onAddMonstreToRencontre={handleAddMonstreToRencontre}
          />
        )}
      </main>
    </div>
  )
}

export default App
