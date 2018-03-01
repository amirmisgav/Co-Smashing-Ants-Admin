import React, {Component} from 'react';
import * as Promise from 'bluebird';
import {
	Container,
	Row,
	Col,
	Button,
	Label,
	Table,
	Form,
	FormGroup,
	Input,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter
} from 'reactstrap';
import GameService from '../../services/gameService';
//import {browserHistory} from 'react-router'

import './style.css';

const speedArray = [0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5]

const styles = {
	label: {
		width: '13rem'
	}
}

class Admin extends Component {

	timeout = null;

	constructor(props) {
		super(props);

		this.state = {
			url: GameService.getServer(),
			species: [],
			status: '',
			teams: sanitizeTeams(JSON.parse(localStorage.getItem('teams') || '[]')),
			teamsPlayers: [],
			time: 1,
			speed: 1,
			antsPerTeam: 5,
			maxPlayers: 10,
			speciesDroppedForTeam: null,
			isPlaying: false,
			isPaused: false,
			canCreate: true,
			urlModal: false
		};
	}

	componentDidMount() {
		if (!this.state.url) {
			this.toggleServerModal();
			return
		}

		GameService
		.species()
		.then(species => this.setState({species}));

		this.timeout = setInterval(() => { this.pollState() }, 1000);
		this.pollState();

		bindSliders({
			onSpeedChange: i => this.setState({speed: speedArray[i]}),
			onTimeChange: time => this.setState({time}),
			onAntsPerTeamChange: antsPerTeam => this.setState({antsPerTeam}),
			onMaxPlayersChange: maxPlayers => this.setState({maxPlayers})
		})
	}

	componentWillUnmount() {
		clearInterval(this.timeout);
	}

	toggleServerModal() {
		this.setState({urlModal: !this.state.urlModal});
	}

	updateServerUrl(url) {
		if (!url) return;
		GameService.setServer(url);
	}

	pollState() {
		return GameService.status()
		.then(({state: status}) => {
			(	status === 'STOPPED'
				? Promise.resolve([])
				: GameService.teamsPlayers()
			)
			.then(teamsPlayers => {
				const mergeTeams = (team) => {
					const { 
						players = [],
						score = 0
					} = teamsPlayers.find(({name: tp}) => team.name === tp) || {}
					return { 
						...team, 
						players,
						score
				   }
				}
				this.acceptState({
					 status, 
					 teams: this.state.teams.map( team => mergeTeams(team))
				})
			})
		})
		.catch(err => {
			this.setState({status: err.message});
		});
	}

	acceptState({status, teams}) {
		const canCreate = status === 'STOPPED';
		const isPlaying = status === 'STARTED' || status === 'PAUSED' || status === 'RESUMED';
		const isPaused = status === 'PAUSED';
		this.setState({
			status,
			isPlaying,
			isPaused,
			canCreate,
			teams
		});
	}

	setTeams(teams) {
		localStorage.setItem('teams', JSON.stringify(teams));
		this.setState({teams});
	}

	handleChange(e) {
		this.setState({[e.target.id]: e.target.value});
	}

	togglePause(e) {
		e.preventDefault();

		if (this.state.isPaused) {
			GameService.resume();
		} else {
			GameService.pause();
		}

		this.setState({isPaused: !this.state.isPaused});
	}

	togglePlay(e) {
		e.preventDefault();

		if (this.state.isPlaying) {
			GameService.stop();
		} else {
			const {speed, antsPerTeam, maxPlayers} = this.state;
			GameService.start(
				speed,
				antsPerTeam,
				maxPlayers
			);
			// browserHistory.push('/dashboard')
		}
	}

	onsSpecieSelect(specie) {
		this.setState({selectedSpecie: specie});
	}

	createGame() {
		const {teams, time, maxPlayers} = this.state;
		GameService.create(teams, time, maxPlayers)
			.then(res => {
				console.log('games created');
				this.setState({canCreate: false});
			})
			.catch(e => {
				console.log('games creation failed');
				this.setState({canCreate: true});
			});
	}

	updateSpeed(speed) {
		GameService.speed(this.state.speed);
	}

	toggleSpeciesSelect(speciesDroppedForTeam) {
		//are we closing, or opening droplist of another team?
		if (this.state.speciesDroppedForTeam && speciesDroppedForTeam.id === this.state.speciesDroppedForTeam.id)
			speciesDroppedForTeam = null;
		this.setState({ speciesDroppedForTeam });
	}

	updateTeam(updated) {
		const {teams} = this.state;
		//TRICKY: Make sure no two teams can have same specie
		const before = teams.find( old => old.id === updated.id);
		this.setTeams(this.state.teams.map(
			itr => itr.id === updated.id
				? updated
				: itr.antSpecies.id === updated.antSpecies.id
					? {...itr, antSpecies: before.antSpecies}
					: itr
		));
	}

	render() {
		const {
			url,
			isPlaying, isPaused, canCreate,
			status,
			time,
			speed,
			antsPerTeam,
			maxPlayers,
			teams
		} = this.state;
		
		// console.log(this.state)
		return (
			<div className="board admin">
				<Container>
					<Label>Admin</Label>

					<Row alt='game controls'>
						<div className="controls-panel">
							<Button onClick={this.togglePause.bind(this)} disabled={!isPlaying} title={`${isPaused ? 'Resume' : 'Pause'} game`}>
								<i className={`fa fa-${isPaused ? 'repeat' : 'pause'}`} aria-hidden="true"/>
							</Button>
							<Button onClick={this.togglePlay.bind(this)} disabled={canCreate} title={`${isPlaying ? 'Stop' : 'Play'} game`}>
								<i className={`fa fa-${isPlaying ? 'stop' : 'play'}`} aria-hidden="true"/>
							</Button>
							<Button onClick={this.createGame.bind(this)} disabled={!canCreate} title="Save & Create game">
								<i className="fa fa-save" aria-hidden="true"/>
							</Button>

							<Label className="game-status">Status: <span>{status}</span></Label>
						</div>
					</Row>

					<Row alt='server url'>
						<Col sm="8" className="server-url">
							<Form inline>
								<FormGroup>
									<Label for="url">Server URL</Label>
									<Input type="text" name="url" id="url" value={url} onChange={this.handleChange.bind(this)}/>
									<Button onClick={() => this.updateServerUrl(this.state.url)} title="Updated server url">
										<i className="fa fa-save" aria-hidden="true"/>
									</Button>
									<Button onClick={() => this.updateServerUrl('')} title="Delete server url">
										<i className="fa fa-remove" aria-hidden="true"/>
									</Button>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row alt='time slider'>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="time">Game-Time <DataValue value={time} /> Minutes</Label>
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="time-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="5"
											data-slider-step="1"
											data-slider-value={time}
											// data-slider-enabled={!this.state.canCreate}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row alt='speed slider'>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="speed-slider">Game speed X <DataValue value={speed} /></Label>
									<div style={{marginLeft: '1.5rem', marginRight: '1rem'}}>
										<Input
											type="text"
											id="speed-slider"
											data-slider-id="speed-slider-inner"
											// data-provide="slider"
											// data-slider-ticks="[1, 2, 3, 4, 5]"
											// data-slider-ticks-labels='["0.2X", "0.5X", "1", "2X", "5X"]'
											// ticks_positions="[1, 2, 3, 4, 5]"
											data-slider-min="0"
											data-slider-max={speedArray.length - 1}
											data-slider-step="1"
											data-slider-value={speedArray.indexOf(this.state.speed)}
											// data-slider-handle="triangle"
											/>
										</div>
									{
										// !this.state.canCreate && 
										<Button onClick={this.updateSpeed.bind(this)} title="Updated game speed">
											<i className="fa fa-clock-o" aria-hidden="true"/>
										</Button>
									}
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row alt='antsPerTeam slider'>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="antsPerTeam">Ants per Team<DataValue value={antsPerTeam} /></Label>
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="antsPerTeam-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="9"
											data-slider-step="1"
											data-slider-value={this.state.antsPerTeam}
											// data-slider-enabled={!this.state.canCreate}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row alt='maxPlayers slider'>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="maxPlayers"><nobr>Max Players in Team</nobr> <DataValue value={maxPlayers} /></Label>
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="maxPlayers-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="30"
											data-slider-step="1"
											data-slider-value={this.state.maxPlayers}
											// data-slider-enabled={!this.state.canCreate}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row alt='game teams/game setup'>
						<Col sm="8" className="add-panel">
							{ canCreate
							  ?	<NewGame state={this.state} 
									updateTeam={this.updateTeam.bind(this)} 
									toggleSpeciesSelect={this.toggleSpeciesSelect.bind(this)}
								/>
							  : <RunningGame teams={teams} isPlaying={isPlaying}/>
							}
						</Col>
					</Row>
				</Container>

				<Modal fade={false} backdrop="static" isOpen={this.state.urlModal} toggle={this.toggleServerModal.bind(this)} className="url-modal">
					<ModalHeader>Server base URL</ModalHeader>
					<ModalBody>
						<Form onSubmit={() => { this.updateServerUrl(this.state.url || ''); return false }}>
							<FormGroup>
								<Label for="url">Please enter your server URL</Label>
								<Input type="text" name="url" id="url" placeholder="Server URL" onChange={this.handleChange.bind(this)}/>
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button onClick={() => { this.updateServerUrl(this.state.url || ''); this.toggleServerModal(); }}>
							<i className="fa fa-save" aria-hidden="true"/>
						</Button>
					</ModalFooter>
				</Modal>

			</div>);
	}
}

export default Admin;

const RunningGame = ({
	teams, isPlaying
 }) => (
    <Table>
		<thead>
			<tr>{ teams.map(({id, name:team, antSpecies:{name:ant}, score = 0}) => 
				<th key={id}>
					{team}<br />
					<AntCard name={ant}/> 
					{isPlaying ? <b className="score"><br/>score: <DataValue value={score} /></b> : ''} 
				</th>)
			}</tr>
		</thead>
		<tbody>
			<tr>{ teams.map(({id, players = []}) => 
				<td key={id}>
					{ players.length 
					  ? <ol>
							{ players.map( ({id, name}) => <li key={id}>{name}</li>) }
						</ol>
					  : <i>emtpy</i>
					}
				</td>
			)}</tr>
		</tbody>
	</Table>
 );


const NewGame = ({
	state:{isPlaying, teams, speciesDroppedForTeam, species},
	updateTeam,
	toggleSpeciesSelect
}) => (
	<Table>
		<thead>
		<tr>
			<th>Team</th>
			<th>Ant Species</th>
		</tr>
		</thead>
		<tbody>
		{
			teams.map(
				isPlaying
				? team => <StaticTeamRow key={team.id} team={team} />
				: team => <EditableTeamRow key={team.id} 
					team={team} state={{speciesDroppedForTeam, species}} 
					updateTeam={updateTeam}
					toggleSpeciesSelect={toggleSpeciesSelect}
				  />
			)
		}
		</tbody>
	</Table>
);


const EditableTeamRow = ({
	team,
	state: {
		speciesDroppedForTeam,
		species
	},
	updateTeam,
	toggleSpeciesSelect
 }) => (
	<tr key={team.id}>
		<td><input onChange={(e) => updateTeam({...team, name: e.target.value})} value={team.name}/></td>
		<td>
			<Dropdown 
				isOpen={speciesDroppedForTeam ? speciesDroppedForTeam.id === team.id : false}
				toggle={() => toggleSpeciesSelect(team)}
				className="selected">
				<DropdownToggle caret>
					<AntCard name={team.antSpecies.name} />
				</DropdownToggle>
				<DropdownMenu>
					{species.map(specie => specie &&
						<DropdownItem
							key={specie.id} value={specie.id}
							onClick={() => updateTeam({...team, antSpecies: specie})}
						>
							<AntCard name={specie.name} />
						</DropdownItem>
					)}
				</DropdownMenu>
			</Dropdown>
		</td>
	</tr>
);

const StaticTeamRow = ({
	team:{id, name, antSpecies}
 }) => (
	<tr key={id}>
		<td>{name}</td>
		<td><AntCard name={antSpecies.name} /></td>
	</tr>
);

const AntCard = ({name}) => (
	<div className="antcard"><span className={`icon ${name}`}></span>{name}</div>
);

const DataValue = ({value}) => (
	<span className="dataValue">{value}</span>
);


const bindSliders = ({
	onSpeedChange,
	onTimeChange,
	onAntsPerTeamChange,
	onMaxPlayersChange
 }) => {
	slider('#speed-slider', onSpeedChange);
	slider('#time-slider', onTimeChange);
	slider('#antsPerTeam-slider', onAntsPerTeamChange);
	slider('#maxPlayers-slider', onMaxPlayersChange);
}

const slider = (id, onChange) => new window.Slider(id, {})
	.on('slide', onChange)
	.on('slideStart', onChange);


const defaultTeams =  [{"id":1,"name":"Ops","antSpecies":{"name":"Red_Fire","id":1}},{"id":2,"name":"JS","antSpecies":{"name":"Lasius","id":2}},{"id":3,"name":"Data","antSpecies":{"name":"Mirmica","id":3}}];
const sanitizeTeams = (teams) => {
	if (!Array.isArray(teams)) return defaultTeams;
	return teams.filter(teamIsOk).concat(defaultTeams).slice(0,3)
}

const teamIsOk = ({id, name, antSpeciesId}) => id && name && antSpeciesId;