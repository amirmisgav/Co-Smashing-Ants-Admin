import React, {Component} from 'react';
import {Container, Label} from 'reactstrap';
import TeamBoard from '../TeamBoard';
import TeamBoardTime from '../TeamBoardTime';
import LeadersBoard from '../LeadersBoard';
import GameService from '../../services/gameService';

import './style.css';

class Admin extends Component {

	timeout = null;

	// constructor(props) {
	// 	super(props);
	// }

	componentDidMount() {
		// if (!localStorage.getItem('serverUrl')) {
		// 	this.toggleServerModal();
		// }

		// GameService.list().then(teams => {
		// 	console.log('loaded teams:', teams);

		// 	GameService.species().then(species => {
		// 		console.log('loaded species:', species);

		// 		this.setState({
		// 			teams: this.state.isPlaying ? teams.data : this.state.teams,
		// 			species: species.data,
		// 			selectedSpecie: species.data[0],
		// 			url: GameService.getServer()
		// 		});
		// 	});
		// });

		this.updateStatus();
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	updateStatus() {
		GameService.status()
			.then(res => {
				this.setState({
					isPlaying: res.data.state === 'STARTED' || res.data.state === 'PAUSED' || res.data.state === 'RESUMED',
					isPaused: res.data.state === 'PAUSED',
					canCreated: res.data.state === 'FINISHED' || res.data.state === 'STOPPED',
					// status: res.data.state
					data: res.data
				});

			})
			.catch(err => {
				this.setState({status: err.message});
			});

		this.timeout = setTimeout(this.updateStatus.bind(this), 1000);
	}


	render() {
		const {isPlaying = false, isPaused = true, data = {}} = this.state || {}
		const pause = !isPlaying || isPaused
		// console.log(pause)
		return (
			<div className="board dashboard" id="dashboard">
				<Container>
					<Label>Dashboard</Label>
					<div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}>
						<div style={{flex: 3}}>
							<TeamBoardTime pause={pause} minimal={true}/>
						</div>
						<div style={{flex: 2}}>
							<TeamBoard pause={pause} minimal={true}/>
							<LeadersBoard xSize={data.gameTime || 120} />
						</div>
					</div>
				</Container>

			</div>);
	}
}

export default Admin;