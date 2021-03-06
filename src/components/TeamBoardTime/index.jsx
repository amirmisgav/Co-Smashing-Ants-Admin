import React, { Component } from 'react';
import {
	Container,
	Label
} from 'reactstrap';
import { ComposedChart, /*LineChart, */ CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line} from 'recharts';
import NewGameService from '../../services/newGameService';

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
		// if (!GameService.validateServer()) browserHistory.push('/admin');
		this.addInterval();
	}

	componentWillUnmount() {
		clearInterval(this.timeout);
	}

	requestData = () => this.service.getTeams().then(res => {
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
				color: colors[item.antSpeciesName],
				name:  item.antSpeciesName
			}))
			.concat([{color: 'white', name: ''}, {color: 'white', name: ''}, {color: 'white', name: ''}])
			.splice(0,3)
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

	getService() {
		this.service = NewGameService()
			.then(service => {
				this.service = service
				this.addInterval()
			})
	}

	addInterval() {
		if (!this.service) return this.getService()
		this.timeout = setInterval(
			() =>  this.props.pause
				? this.removeInterval()
				: this.requestData(),
			1000
		);
	}

	render() {
		const {teamsNames, data} = this.state
		const {xSize = 120, minimal = false, pause = false} = this.props
		const domain = [ data[0].time,  Math.max(120, data[119].time || 0) ]
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
						<XAxis dataKey="time" type="number" tickCount={10} domain={domain} />
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
