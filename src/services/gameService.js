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
		return localStorage.getItem('serverUrl') || '';
	}

	validateServer() {
		return this.serverUrl.length && this.serverUrl.length > 0;
	}

	/*
		time: in minutes
		data: [
			{"antSpecies": {"id": 1}, "name":"teamA"}
			{"antSpecies": {"id": 2}, "name":"teamB"}
			{"antSpecies": {"id": 3}, "name":"teamC"}
		]
	*/
	create(data, time, players) {
		const teams = data.map(
			({
				name, 
				antSpecies: {id: antSpecies}
			}) => 
			({
				name,
				antSpecies
			})
		);
		return axios.post(`${this.serverUrl}/games?gameTime=${time}&maxNumOfPlayers=${players}`, teams);
	}

	start(speed, ants, players) {
		return axios.put(`${this.serverUrl}/games/start?factor=${speed}&population=${ants}&maxNumOfPlayers=${players}`);
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

	species() {
		// return Promise.resolve([
		// 	 {
		//		"name":"Specie 1",
		//		"id": 1
		//	 },
		//	 {
		//		"name":"Specie 2",
		//		"id": 2
		//	 },
		//	 {
		//		"name":"Specie 3",
		//		"id": 3
		//	 }
		// ]);

		return axios.get(this.serverUrl + '/antspecies')
		.then(({data}) => data);
	}

	status() {
		// return Promise.resolve({
		// 		status: 'NOT_PLAYING'
		// });

		return axios.get(this.serverUrl + '/games/latest')
		.then(({data}) => data);
	}

	teams() {
		/*
		return Promise.resolve([
			{
				"id": 9,
				"name": "teamB",
				"antSpecies": { "id" : 2, "name" : "Lasius" },
				"score": Math.floor(Math.random() * 200) + 1
			},
			{
				"id": 10,
				"name": "teamA",
				"antSpecies": { "id" : 3, "name" : "Mirmica" },
				"score": Math.floor(Math.random() * 200) + 1
			},
			{
				"id": 11,
				"name": "teamC",
				"antSpecies": { "id" : 1, "name" : "Red_Fire" },
				"score": Math.floor(Math.random() * 200) + 1
			}
		]);
		*/

		return axios.get(this.serverUrl + '/teams/current')
		.then(({data}) => data)
	}

	teamsPlayers() {
		return axios.get(this.serverUrl + '/teams/current/players')
		.then(({data}) => data)
	}
	leaders() {
		return axios.get(this.serverUrl + '/players/leaders');
	}
}

export default new GameService();