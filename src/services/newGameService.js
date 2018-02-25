import axios from 'axios'
import GameService from './gameService'

const init = () => { 
  // return axios.get('https://fuze.tikal.io/hitTrials/games/latest')
  return GameService.status()
    .then(res => res.id)
    .then(gameId => ({
      getScores: () => axios.get(`https://fuze.tikal.io/scores/games/${gameId}/players`),
      getTeams: () => axios.get(`https://fuze.tikal.io/scores/games/${gameId}/teams`)
    }))
}

export default init