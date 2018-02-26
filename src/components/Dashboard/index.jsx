import React, {Component} from 'react';
import {Container, Label} from 'reactstrap';
import TeamBoard from '../TeamBoard';
import TeamBoardTime from '../TeamBoardTime';
import LeadersBoard from '../LeadersBoard';
import GameService from '../../services/gameService';

import './style.css';

class Dashboard extends Component {

	timeout = null;

	// constructor(props) {
	// 	super(props);
	// }

	componentDidMount() {
		this.updateStatus();
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	updateStatus() {
		GameService.status()
			.then(data => {
				const state = data.state;
				this.setState({
					isPlaying: state === 'STARTED' || state === 'PAUSED' || state === 'RESUMED',
					isPaused: state === 'PAUSED',
					canCreated: state === 'FINISHED' || state === 'STOPPED',
					data
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

export default Dashboard;