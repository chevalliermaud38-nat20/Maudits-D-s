import { useState, useEffect } from 'react'
import { Book, Skull, Users, Sword, CloudDownload, CloudUpload } from 'lucide-react'
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

  const handleAddMonstre = (monstre) => {
    setData({ ...data, monstres: [...data.monstres, monstre] })
  }

  const handleUpdateMonstre = (id, updatedMonstre) => {
    setData({ ...data, monstres: data.monstres.map(m => m.id === id ? updatedMonstre : m) })
  }

  const handleCopyMonstre = (monstre) => {
    setData({ ...data, monstres: [...data.monstres, monstre] })
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

  const handleAddCampagne = (campagne) => {
    setData({ ...data, campagnes: [...data.campagnes, campagne] })
  }

  const handleUpdateCampagne = (id, updatedCampagne) => {
    setData({ ...data, campagnes: data.campagnes.map(c => c.id === id ? updatedCampagne : c) })
  }

  const handleDeleteCampagne = (id) => {
    setData({ ...data, campagnes: data.campagnes.filter(c => c.id !== id) })
  }

  const handleAddPersoToCampagne = (campagneId, persoId) => {
    const perso = data.personnages.find(p => p.id === persoId)
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
            <GitHubConfig
              config={githubConfig}
              onConfigChange={setGithubConfig}
              data={data}
              onDataLoad={handleDataLoad}
            />
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
          />
        )}

        {activeTab === 'monstres' && (
          <Monstres
            monstres={data.monstres}
            onAdd={handleAddMonstre}
            onUpdate={handleUpdateMonstre}
            onCopy={handleCopyMonstre}
            sorts={data.sorts}
          />
        )}

        {activeTab === 'personnages' && (
          <Personnages
            personnages={data.personnages}
            onAdd={handleAddPersonnage}
            onUpdate={handleUpdatePersonnage}
            onCopy={handleCopyPersonnage}
            sorts={data.sorts}
          />
        )}

        {activeTab === 'campagne' && (
          <Campagne
            campagnes={data.campagnes}
            personnages={data.personnages}
            monstres={data.monstres}
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
