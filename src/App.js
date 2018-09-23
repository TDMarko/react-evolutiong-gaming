/*
 * React
 */
import React, {Component} from 'react'
import Table from './components/Table'
import Header from './components/Header'

/*
 * Utils
 */
import _ from 'lodash'
import {cl} from './Helpers'

/*
 * Other
 */
import './styles/App.css'
import './styles/Reset.css'

class App extends Component {
	constructor(props){
		super(props);
		this.state = {
			notification: ""
		}
	}

	render() {
		return (
			<div className="app-wrapper">
				<Header/>
				<Table/>
			</div>
		);
	}
}

export default App;
