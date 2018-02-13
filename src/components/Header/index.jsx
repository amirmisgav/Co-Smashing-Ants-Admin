import React  from 'react';
import {
	Navbar,
	NavbarBrand,
	Collapse,
	Nav,
	NavItem
} from 'reactstrap';
import { Link } from 'react-router';
import createReactClass from 'create-react-class';

import './style.css';

const Header = createReactClass({
	render() {
		return (
			<Navbar className="navbar-expand-sm" toggleable>
				<NavbarBrand><span>Co-Ant Smashing</span></NavbarBrand>
				<Collapse navbar>
					<Nav className="ml-auto" tabs>
						<NavItem>
							<Link to="/dashboard">Dashboard</Link>
						</NavItem>
						{/* <NavItem>
							<Link to="/team">Team board</Link>
						</NavItem>
						<NavItem>
							<Link to="/team-time">Time board</Link>
						</NavItem>
						<NavItem>
							<Link to="/leaders">Leaders board</Link>
						</NavItem> */}
						<NavItem>
							<Link to="/admin">Admin</Link>
						</NavItem>
					</Nav>
				</Collapse>
			</Navbar>
		)
	}
});

export default Header;
