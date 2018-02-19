import axios from 'axios'

const init = () => {
  return axios.get('https://fuze.tikal.io/hitTrials/games/latest')
    .then(res => res.data)
    .then(gameId => ({
      getScores: () => axios.get(`https://fuze.tikal.io/scores/games/${gameId}/players`),
      getTeams: () => axios.get(`https://fuze.tikal.io/scores/games/${gameId}/teams`)
    }))
}

export default init