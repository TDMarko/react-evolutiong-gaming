/*
 * React
 */
import React, {Component} from 'react'

/*
 * Utils
 */
import _ from 'lodash'
import {cl} from '../../Helpers'

/*
 * Other
 */
import '../../styles/App.css'
import '../../styles/Reset.css'

class Header extends Component {
	render() {
		return (
			<div className="app-header"><img className="app-logo" src="/resources/logo.png" /></div>
		);
	}
}

export default Header;
