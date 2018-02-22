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
			population: 5,
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

		this.timeout = setInterval(() => { this.updateStatus() }, 1000);
		GameService.species()
		.then(species => console.log('species', species) || this.setState({species}));
		this.updateStatus();

		bindSliders({
			onSpeedChange: i => this.setState({speed: speedArray[i]}),
			onTimeChange: value => this.setState({time: value}),
			onPopulationChange: value => this.setState({population: value})
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
		this.setState({url: GameService.setServer(url)});
	}

	updateStatus() {
		return GameService.status()
		.then(({state: status}) => {
			const canCreate = status === 'STOPPED';
			const isPlaying = status === 'STARTED' || status === 'PAUSED' || status === 'RESUMED';
			const isPaused = status === 'PAUSED';
			if (canCreate) {
			  	this.setState({
					status,
					isPlaying,
					isPaused,
					canCreate,
					teamsPlayers: []
				});
				return;
			}

			GameService.teamsPlayers()
			.then(teamsPlayers => this.setState({
				status,
				isPlaying,
				isPaused,
				canCreate,
				teamsPlayers
			}));
		})
		.catch(err => {
			this.setState({status: err.message});
		});
	}

	addTeam(e) {
		e.preventDefault();

		this.setTeams([...this.state.teams, {
			antSpeciesId: this.state.selectedSpecie.id,
			name: this.state.name
		}])
	}

	removeTeam(index) {
		const teams = this.state.teams;
		teams.splice(index, 1);
		this.setTeams(teams);
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
			GameService.start(this.state.speed, this.state.population);
			// browserHistory.push('/dashboard')
		}
	}

	onsSpecieSelect(specie) {
		this.setState({selectedSpecie: specie});
	}

	createGame() {
		GameService.create(this.state.teams, this.state.time)
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

	renderDataValue(value) {
		return <span style={{color: 'blue', marginLeft: '0.5rem', marginRight: '0.5rem'}}>{value}</span>
	}

	render() {
		// console.log(this.state)
		return (
			<div className="board admin">
				<Container>
					<Label>Admin</Label>

					<Row>
						<div className="controls-panel">
							<Button onClick={this.togglePause.bind(this)} disabled={!this.state.isPlaying} title={`${this.state.isPaused ? 'Resume' : 'Pause'} game`}>
								<i className={`fa fa-${this.state.isPaused ? 'repeat' : 'pause'}`} aria-hidden="true"/>
							</Button>

							<Button onClick={this.togglePlay.bind(this)} disabled={this.state.canCreate} title={`${this.state.isPlaying ? 'Stop' : 'Play'} game`}>
								<i className={`fa fa-${this.state.isPlaying ? 'stop' : 'play'}`} aria-hidden="true"/>
							</Button>

							<Button onClick={this.createGame.bind(this)} disabled={!this.state.canCreate} title="Save & Create game">
								<i className="fa fa-save" aria-hidden="true"/>
							</Button>

							<Label className="game-status">Status: <span>{this.state.status}</span></Label>
						</div>
					</Row>

					<Row>
						<Col sm="8" className="server-url">
							<Form inline>
								<FormGroup>
									<Label for="url">Server URL</Label>
									<Input type="text" name="url" id="url" value={this.state.url} onChange={this.handleChange.bind(this)}/>
									<Button onClick={this.updateServerUrl.bind(this)} title="Updated server url">
										<i className="fa fa-save" aria-hidden="true"/>
									</Button>
									<Button onClick={this.updateServerUrl.bind(this, '')} title="Delete server url">
										<i className="fa fa-remove" aria-hidden="true"/>
									</Button>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="time">Game-Time {this.renderDataValue(this.state.time)} Minutes</Label>
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="time-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="5"
											data-slider-step="1"
											data-slider-value={this.state.time}
											// data-slider-enabled={!this.state.canCreate}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="speed-slider">Game speed X {this.renderDataValue(this.state.speed)}</Label>
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

					<Row>
						<Col sm="8" className="game-params">
							<Form inline>
								<FormGroup>
									<Label style={styles.label} for="population">Population - {this.renderDataValue(this.state.population)}</Label>
									{/* <Input type="number" min="0" max="10" name="population" id="population" className="population" defaultValue={this.state.population} onChange={this.handleChange.bind(this)}/> */}
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="population-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="9"
											data-slider-step="1"
											data-slider-value={this.state.population}
											// data-slider-enabled={!this.state.canCreate}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row>
						<Col sm="8" className="add-panel">
							<NewGame state={this.state} 
								updateTeam={this.updateTeam.bind(this)} 
								toggleSpeciesSelect={this.toggleSpeciesSelect.bind(this)}
							/>
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
						<Button onClick={() => { this.updateServerUrl(); this.toggleServerModal(); }}>
							<i className="fa fa-save" aria-hidden="true"/>
						</Button>
					</ModalFooter>
				</Modal>

			</div>);
	}
}

export default Admin;


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

const bindSliders = ({
	onSpeedChange,
	onTimeChange,
	onPopulationChange
 }) => {
	console.log('binding sliders');
	slider('#speed-slider', onSpeedChange);
	slider('#time-slider', onTimeChange);
	slider('#population-slider', onPopulationChange);
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