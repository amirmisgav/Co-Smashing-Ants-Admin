import React, { Component } from 'react';
import {
	Container,
	Label
} from 'reactstrap';
//import { browserHistory } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine} from 'recharts';
// import GameService from '../../services/gameService';
import NewGameService from '../../services/newGameService';

import './style.css';

const colors = {
	'Red_Fire': 'red',
	'Lasius': 'green',
	'Mirmica': 'black'
}

class TeamBoard extends Component {

	timeout = null;

	constructor(props) {
		super(props);

		this.state = {
			teams: [],
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
			acc.push({
				[`team_${index}`]: curr.score,
				name: curr.teamName
			})
			return acc
		}, [])
		// const data = this.state.data
		// data.shift()
		// data.push(Object.assign({
		// 	time: this.count++
		// }, teamData))
		const teamsNames = resData
			.map(item => ({
				color: colors[item.antSpeciesName],
				name: item.antSpeciesName
			}))
			.concat([{color: 'white', name: ''}, {color: 'white', name: ''}, {color: 'white', name: ''}])
			.splice(0,3)
		
		this.setState({
			teams: resData,
			data: teamData,
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
		const interval = () =>
			// this.props.pause
			// ? this.removeInterval()
			// : 
			this.requestData()
		this.timeout = setInterval(interval, 1000)
	}

	render() {
		const {teamsNames, data} = this.state
		const {minimal = false, pause = false} = this.props
		if (!data || !teamsNames || teamsNames.length === 0 || data.length === 0) return <div>Loading</div>
		// console.log(this.state)
		if (!this.timeout && !pause) this.addInterval()
		return (
			<div className="board team">
				<Container>
				{minimal ? null : <Label>TeamBoard</Label>}

					<BarChart
						width={300}
						height={150}
						data={data}
						barSize={20}
						margin={{ top: 10, right: 0, left: 10, bottom: 10 }}>
						<pattern
							id="pattern-stripe"
							width="8"
							height="8"
							patternUnits="userSpaceOnUse"
							patternTransform="rotate(45)"
						>
							<rect width="4" height="8" transform="translate(0,0)" fill="white" />
						</pattern>
						<mask id="mask-stripe">
							<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
						</mask>

						<ReferenceLine y={0} />
						<Tooltip />
						<XAxis dataKey="name" axisLine={false} tickLine={false}/>
						<YAxis />
						{/* {
							teamsNames
								.map((team, i) => <Bar type="monotone" dataKey={`team_${i}`} name={teamsNames[0].name} fill={teamsNames[0].color} />)
						} */}
						{/* <Bar dataKey="score" fill="#f00" label={{ fontSize: 18 }} shape={<CandyBar />} /> */}
						<Bar type="monotone" dataKey="team_0" name={teamsNames[0].name} fill={teamsNames[0].color} />
						<Bar type="monotone" dataKey="team_1" name={teamsNames[1].name} fill={teamsNames[1].color} />
						<Bar type="monotone" dataKey="team_2" name={teamsNames[2].name} fill={teamsNames[2].color} />
					</BarChart>
				</Container>
			</div>
		);
	}
}

export default TeamBoard;

// eslint-disable-next-line
const CandyBar = (props) => {
	const {
		x: oX,
		y: oY,
		width: oWidth,
		height: oHeight,
		fill
	} = props;

	let x = oX;
	let y = oHeight < 0 ? oY + oHeight : oY;
	let width = oWidth;
	let height = Math.abs(oHeight);

	return (
		<rect fill={fill}
					mask='url(#mask-stripe)'
					x={x}
					y={y}
					width={width}
					height={height} />
	);
};