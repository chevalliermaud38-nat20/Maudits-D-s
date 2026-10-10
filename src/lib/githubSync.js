// Synchronisation avec GitHub via API

export async function loadFromGitHub(config) {
  if (!config.token || !config.owner || !config.repo || !config.filename) {
    throw new Error('Configuration GitHub incomplète')
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filename}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Fichier n'existe pas encore, retourner null
        return null
      }
      throw new Error(`Erreur GitHub: ${response.status}`)
    }

    const data = await response.json()
    const content = atob(data.content)
    return JSON.parse(content)
  } catch (error) {
    console.error('Erreur lors du chargement depuis GitHub:', error)
    throw error
  }
}

export async function saveToGitHub(config, data) {
  if (!config.token || !config.owner || !config.repo || !config.filename) {
    throw new Error('Configuration GitHub incomplète')
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filename}`
  const content = btoa(JSON.stringify(data, null, 2))
  
  try {
    // D'abord, essayer de récupérer le SHA du fichier existant
    let sha = null
    try {
      const existingResponse = await fetch(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      if (existingResponse.ok) {
        const existingData = await existingResponse.json()
        sha = existingData.sha
      }
    } catch (e) {
      // Fichier n'existe pas, c'est OK
    }

    const body = {
      message: `Mise à jour des données Maudits Dés - ${new Date().toISOString()}`,
      content: content
    }

    if (sha) {
      body.sha = sha
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erreur GitHub: ${error.message}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde vers GitHub:', error)
    throw error
  }
}

export function validateGitHubConfig(config) {
  return config.token && config.owner && config.repo && config.filename
}
