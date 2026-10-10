import { useState } from 'react'
import { Download, Upload, Settings } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './ui/Dialog'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { loadFromGitHub, saveToGitHub, validateGitHubConfig } from '../lib/githubSync'

export function GitHubConfig({ config, onConfigChange, data, onDataLoad }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(config || {})

  const handleSave = async () => {
    if (!validateGitHubConfig(formData)) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    try {
      await saveToGitHub(formData, data)
      onConfigChange(formData)
      setDialogOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = async () => {
    if (!validateGitHubConfig(formData)) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    try {
      const loadedData = await loadFromGitHub(formData)
      if (loadedData) {
        onDataLoad(loadedData)
        onConfigChange(formData)
        setDialogOpen(false)
      } else {
        setError('Aucune donnée trouvée sur GitHub')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setDialogOpen(true)}>
        <Settings className="w-4 h-4 mr-2" />
        Configuration GitHub
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Configuration GitHub</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <Label>Token d'accès personnel</Label>
              <Input
                type="password"
                value={formData.token || ''}
                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Créez un token sur GitHub Settings &gt; Developer settings &gt; Personal access tokens
              </p>
            </div>
            <div>
              <Label>Nom d'utilisateur GitHub (owner)</Label>
              <Input
                value={formData.owner || ''}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="votre-username"
              />
            </div>
            <div>
              <Label>Nom du repository</Label>
              <Input
                value={formData.repo || ''}
                onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                placeholder="maudits-des"
              />
            </div>
            <div>
              <Label>Nom du fichier de données</Label>
              <Input
                value={formData.filename || ''}
                onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                placeholder="maudits-des-data.json"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Fermer
              </Button>
              <Button type="button" variant="secondary" onClick={handleLoad} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Charger depuis GitHub
              </Button>
              <Button type="button" onClick={handleSave} disabled={loading}>
                <Upload className="w-4 h-4 mr-2" />
                Sauvegarder sur GitHub
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
