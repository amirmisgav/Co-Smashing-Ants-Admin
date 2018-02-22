import axios from 'axios';

class GameService {
	serverUrl = localStorage.getItem('serverUrl') || 'http://ants.fuze.tikal.io:8080';

	setServer(url = 'http://ants.fuze.tikal.io:8080') {
		url = url.replace(/\/$/, '');
		console.log('setServer', url)
		this.serverUrl = url;
		localStorage.setItem('serverUrl', this.serverUrl);
		return url
	}

	getServer() {
		return localStorage.getItem('serverUrl');
	}

	validateServer() {
		return this.serverUrl.length && this.serverUrl.length > 0;
	}

	create(data, time) {
		return axios.post(this.serverUrl + '/games?gameTime=' + time, data);
	}

	start(factor, population) {
		return axios.put(this.serverUrl + '/games/start?factor=' + factor + '&population=' + population);
	}

	stop() {
		return axios.put(this.serverUrl + '/games/stop');
	}

	pause() {
		return axios.put(this.serverUrl + '/games/pause');
	}

	resume() {
		return axios.put(this.serverUrl + '/games/resume');
	}

	speed(factor) {
		return axios.put(this.serverUrl + '/games/speed?factor=' + factor);
	}

	currentTeams() {
		// return new Promise(resolve => {
		// 	resolve([
		// 			{
		// 				"name":"teamA",
		// 				"antSpecies": 1
		// 			},
		// 			{
		// 				"name":"teamB",
		// 				"antSpecies": 2
		// 			},
		// 			{
		// 				"name":"teamC",
		// 				"antSpecies": 3
		// 			}
		// 		]);
		// });

		return axios.get(this.serverUrl + '/teams/current');
	}

	species() {
		// return new Promise(resolve => {
		// 	resolve({
		// 		data: [
		// 			{
		// 				"name":"Specie 1",
		// 				"id": 1
		// 			},
		// 			{
		// 				"name":"Specie 2",
		// 				"id": 2
		// 			},
		// 			{
		// 				"name":"Specie 3",
		// 				"id": 3
		// 			}
		// 		]
		// 	});
		// });

		return axios.get(this.serverUrl + '/antspecies');
	}

	status() {
		// return new Promise(resolve => {
		// 	resolve({
		// 		status: 'NOT_PLAYING'
		// 	});
		// });

		return axios.get(this.serverUrl + '/games/latest');
	}

	teams() {
		// return new Promise(resolve => {
		// 	resolve({
		// 		data: [
		// 			{
		// 				"id": 9,
		// 				"name": "teamB",
		// 				"antSpecies": {
		// 					"id": 2,
		// 					"name": "Lasius"
		// 				},
		// 				"score": Math.floor(Math.random() * 200) + 1
		// 			},
		// 			{
		// 				"id": 10,
		// 				"name": "teamA",
		// 				"antSpecies": {
		// 					"id": 3,
		// 					"name": "Mirmica"
		// 				},
		// 				"score": Math.floor(Math.random() * 200) + 1
		// 			},
		// 			{
		// 				"id": 11,
		// 				"name": "teamC",
		// 				"antSpecies": {
		// 					"id": 1,
		// 					"name": "Red_Fire"
		// 				},
		// 				"score": Math.floor(Math.random() * 200) + 1
		// 			}
		// 		]
		// 	})
		// });

		return axios.get(this.serverUrl + '/teams/latest');
	}

	leaders() {
		// return new Promise(resolve => {
		// 	resolve({
		// 		data: [
		// 			{
		// 				"id": 9,
		// 				"name": "Moshe",
		// 				"score": Math.floor(Math.random() * 200) + 1
		// 			},
		// 			{
		// 				"id": 10,
		// 				"name": "Moti",
		// 				"score": Math.floor(Math.random() * 200) + 1
		// 			},
		// 			{
		// 				"id": 11,
		// 				"name": "Yanai",
		// 				"score": -10
		// 			}
		// 		]
		// 	})
		// });

		return axios.get(this.serverUrl + '/players/leaders');
	}
}

export default new GameService();