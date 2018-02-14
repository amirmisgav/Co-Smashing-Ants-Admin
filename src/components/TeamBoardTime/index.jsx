import React, { Component } from 'react';
import {
	Container,
	Label
} from 'reactstrap';
import { browserHistory } from 'react-router';
import { ComposedChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts';
import GameService from '../../services/gameService';

import './style.css';

const colors = {
	'Red_Fire': 'red',
	'Lasius': 'green',
	'Mirmica': 'black'
}

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
		this.addInterval();
	}

	componentWillUnmount() {
		clearInterval(this.timeout);
	}

	requestData = () => GameService.teams().then(res => {
		const resData = res.data.sort((a,b) => a.id - b.id) || []
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
		const teamsNames = resData
			.map(item => ({
				color: colors[item.antSpecies.name],
				name: item.name
			}))
		this.setState({
			teams: resData,
			data,
			teamsNames
		});
	});

	removeInterval() {
		this.requestData()
		clearInterval(this.timeout)
		this.timeout = null
	}

	addInterval() {
		const interval = () =>
			this.props.pause
			? this.removeInterval()
			: this.requestData()
		this.timeout = setInterval(interval, 1000)
	}

	render() {
		const {teamsNames, data} = this.state
		const {xSize = 120, minimal = false, pause = false} = this.props
		if (!this.timeout && !pause) this.addInterval()
		// console.log(data)
		// console.log(teamsNames)
		if (!data || !teamsNames || teamsNames.length === 0 || data.length === 0) return <div>Loading</div>
		return (
			<div className="board team">
				<Container>
					{minimal ? null :<Label>TimeBoard</Label>}
					<ComposedChart width={800} height={500} data={data}
						margin={{ top: 10, right: 0, left: 20, bottom: 10 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="time" type="number" tickCount={10} domain={[0, xSize]} />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="team_0" name={teamsNames[0].name} stroke={teamsNames[0].color} activeDot={{r: 2}} />
						<Line type="monotone" dataKey="team_1" name={teamsNames[1].name} stroke={teamsNames[1].color} activeDot={{r: 2}} />
						<Line type="monotone" dataKey="team_2" name={teamsNames[2].name} stroke={teamsNames[2].color} activeDot={{r: 2}} />
						{/* <Line type="monotone" dataKey="team_3" name={teamsNames[3]} stroke="yellow" activeDot={{r: 2}} /> */}
					</ComposedChart>
				</Container>
			</div>
		)
	}
}

export default TeamBoardTime;
