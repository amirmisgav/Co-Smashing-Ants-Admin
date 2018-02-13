import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';

import App from './App';
import TeamBoard from './components/TeamBoard';
import TeamBoardTime from './components/TeamBoardTime';
import LeadersBoard from './components/LeadersBoard';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';

const Routes = (props) => (
	<Router {...props}>
		<Route path="/" component={App}>
			<IndexRoute component={Admin}/>

			{/* <Route path="team" component={TeamBoard} />
			<Route path="leaders" component={LeadersBoard} />
			<Route path="team-time" component={TeamBoardTime} /> */}
			<Route path="admin" component={Admin} />
			<Route path="dashboard" component={Dashboard} />
		</Route>
	</Router>
);

export default Routes;