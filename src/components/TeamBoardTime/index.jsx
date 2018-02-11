import React, { Component } from 'react';
import {
	Container,
	Label
} from 'reactstrap';
import { browserHistory } from 'react-router';
import { ComposedChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts';
import GameService from '../../services/gameService';

import './style.css';

class TeamBoardTime extends Component {

	timeout = null;

	constructor(props) {
		super(props);
		this.count = 0
		this.state = {
			teams: [],
			data: Array.from(Array(120)).map(x => ({})),
			teamsNames: []
		};
	}

	componentDidMount() {
		if (!GameService.validateServer()) browserHistory.push('/admin');
		this.updateScores();
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	updateScores() {
		const interval = () =>
			GameService.teams().then(res => {
				const resData = res.data || []
				const teamData = resData
				.reduce((acc, curr, index) => {
					acc[`team_${index}`] = curr.score
					return acc
				}, {})
				const data = this.state.data
				data.shift()
				data.push(Object.assign({
					time: this.count++
				}, teamData))
				this.setState({
					teams: resData,
					data,
					teamsNames: resData.map(item => item.name)
				});
			});
		this.timeout = setInterval(interval, 1000)
	}

	render() {
		const {teamsNames, data} = this.state
		console.log(data)
		console.log(teamsNames)
		// if (!data || !teamsNames || teamsNames.length === 0 || data.length === 0) return <div>Loading</div>
		return (
			<div className="board team">
				<Container>
					<Label>TimeBoard</Label>
					<ComposedChart width={600} height={300} data={data}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis label="Time" dataKey="time" type="number"/>
						<YAxis label="Score"/>
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="team_0" name={teamsNames[0]} stroke="blue" activeDot={{r: 2}} />
						<Line type="monotone" dataKey="team_1" name={teamsNames[1]} stroke="red" activeDot={{r: 2}} />
						<Line type="monotone" dataKey="team_2" name={teamsNames[2]} stroke="green" activeDot={{r: 2}} />
						{/* <Line type="monotone" dataKey="team_3" name={teamsNames[3]} stroke="yellow" activeDot={{r: 2}} /> */}
					</ComposedChart>
				</Container>
			</div>
		)
	}
}

export default TeamBoardTime;
