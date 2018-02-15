import React, {Component} from 'react';
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
import {browserHistory} from 'react-router'

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
			teams: JSON.parse(localStorage.getItem('teams')) || [],
			species: [],
			time: 1,
			speed: 1,
			population: 5,
			speciesOpen: false,
			selectedSpecie: {},
			name: '',
			url: GameService.getServer(),
			isPlaying: false,
			isPaused: false,
			canCreated: true,
			urlModal: false,
			status: ''
		};
	}

	componentDidMount() {
		if (!localStorage.getItem('serverUrl')) {
			this.toggleServerModal();
		}

		GameService.list().then(teams => {
			console.log('loaded teams:', teams);

			GameService.species().then(species => {
				console.log('loaded species:', species);

				this.setState({
					teams: this.state.isPlaying ? teams.data : this.state.teams,
					species: species.data,
					selectedSpecie: species.data[0],
					url: GameService.getServer()
				});
			});
		});

		this.updateStatus();
		new window.Slider('#speed-slider', {})
			.on('slide', i => this.setState({speed: speedArray[i]}))
			.on('slideStart', i => this.setState({speed: speedArray[i]}))
		new window.Slider('#time-slider', {})
			.on('slide',  value => this.setState({time: value}))
			.on('slideStart',  value => this.setState({time: value}))
		new window.Slider('#population-slider', {})
			.on('slide', value => this.setState({population: value}))
			.on('slideStart', value => this.setState({population: value}))
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	toggleServerModal() {
		this.setState({urlModal: !this.state.urlModal});
	}

	updateServerUrl(url = this.state.url) {
		// if (this.state.url.length > 0) {
		GameService.setServer(url);
		// } else {
		this.setState({url: GameService.getServer()});
		// }
	}

	updateStatus() {
		GameService.status()
			.then(res => {
				this.setState({
					isPlaying: res.data.state === 'STARTED' || res.data.state === 'PAUSED' || res.data.state === 'RESUMED',
					isPaused: res.data.state === 'PAUSED',
					canCreated: res.data.state === 'FINISHED' || res.data.state === 'STOPPED',
					status: res.data.state
				});

			})
			.catch(err => {
				this.setState({status: err.message});
			});

		this.timeout = setTimeout(this.updateStatus.bind(this), 1000);
	}

	addTeam(e) {
		e.preventDefault();

		let teams = [...this.state.teams, {
			antSpeciesId: this.state.selectedSpecie.id,
			name: this.state.name
		}];

		localStorage.setItem('teams', JSON.stringify(teams));

		this.setState({teams: teams});
	}

	removeTeam(index) {
		let teams = this.state.teams;
		teams.splice(index, 1);

		this.setState({teams: teams});
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

	toggleSpecies() {
		this.setState({speciesOpen: !this.state.speciesOpen});
	}

	onsSpecieSelect(specie) {
		this.setState({selectedSpecie: specie});
	}

	createGame() {
		GameService.create(this.state.teams, this.state.time)
			.then(res => {
				console.log('games created');
				this.setState({canCreated: false});
			})
			.catch(e => {
				console.log('games creation failed');
				this.setState({canCreated: true});
			});
	}

	updateSpeed(speed) {
		GameService.speed(this.state.speed);
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

							<Button onClick={this.togglePlay.bind(this)} disabled={this.state.canCreated} title={`${this.state.isPlaying ? 'Stop' : 'Play'} game`}>
								<i className={`fa fa-${this.state.isPlaying ? 'stop' : 'play'}`} aria-hidden="true"/>
							</Button>

							<Button onClick={this.createGame.bind(this)} disabled={!this.state.canCreated} title="Save & Create game">
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
									<Label style={styles.label} for="time">Game Time {this.renderDataValue(this.state.time)} Minutes</Label>
									<div style={{marginLeft: '1.5rem'}}>
										<Input
											type="text"
											id="time-slider"
											data-slider-id="speed-slider-inner"
											data-slider-min="1"
											data-slider-max="5"
											data-slider-step="1"
											data-slider-value={this.state.time}
											// data-slider-enabled={!this.state.canCreated}
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
										// !this.state.canCreated && 
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
											// data-slider-enabled={!this.state.canCreated}
											/>
									</div>
								</FormGroup>
							</Form>
						</Col>
					</Row>

					<Row>
						<Col sm="8" className="add-panel">
							{!this.state.isPlaying && <Form inline onSubmit={this.addTeam.bind(this)}>
								<FormGroup>
									<Label for="name">Add Team Name</Label>
									<Input type="text" name="name" id="name" placeholder="Team name" onChange={this.handleChange.bind(this)}/>
								</FormGroup>

								<FormGroup>
									<Label for="antSpecies">Ant Species</Label>
									<Dropdown isOpen={this.state.speciesOpen} toggle={this.toggleSpecies.bind(this)} className="selected">
										<DropdownToggle caret>
											{this.state.selectedSpecie.name}
										</DropdownToggle>
										<DropdownMenu>
											{this.state.species.map(specie => {
												return specie &&
													<DropdownItem
														key={specie.id}
														value={specie.id}
														onClick={() => this.onsSpecieSelect(specie)}
													>
														{specie.name}
													</DropdownItem>;
											})}
										</DropdownMenu>
									</Dropdown>
								</FormGroup>

								<Button type="submit"  title="Add team">
									<i className="fa fa-plus" aria-hidden="true"/>
								</Button>
							</Form>}

							{
								this.state.teams.length > 0 && <Table>
									<thead>
									<tr>
										<th>Team</th>
										<th>Ant Species</th>
										{!this.state.isPlaying && <th>Remove</th> }
									</tr>
									</thead>
									<tbody>
									{
										this.state.teams.map((team, index) => {
											return <tr key={index}>
												<td>{team.name}</td>
												<td>{team.antSpeciesId}</td>
												{!this.state.isPlaying && <td>
													<Button onClick={this.removeTeam.bind(this, index)}>
														<i className="fa fa-remove" aria-hidden="true"/>
													</Button>
												</td>}
											</tr>
										})
									}
									</tbody>
								</Table>
							}
						</Col>
					</Row>
				</Container>

				<Modal fade={false} backdrop="static" isOpen={this.state.urlModal} toggle={this.toggleServerModal.bind(this)} className="url-modal">
					<ModalHeader>Server base URL</ModalHeader>
					<ModalBody>
						<Form>
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