/*
 * React
 */
import React, {Component} from 'react'
import {APP} from '../../Constants'

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

class Table extends Component {
	constructor(props){
		super(props);
		this.state = {
			tablesData: [],
			tablesOutput: [],
			tablesRowWidth: 0,
			tablesParticipants: []
		}
	}

	componentDidMount() {
		var webSocket = new WebSocket('wss://js-assignment.evolutiongaming.com/ws_api')

		webSocket.onopen = event => {
			webSocket.send(JSON.stringify({
				$type: APP.SOCKET.TYPE.LOGIN,
				username: APP.SOCKET.LOGIN,
				password: APP.SOCKET.PASSWORD
			}))

			webSocket.onmessage = message => {
				let response = JSON.parse(message.data)

				if (response.$type === APP.SOCKET.RESPONSE.LOGIN_SUCCESS) {
					webSocket.send(JSON.stringify({
						$type: APP.SOCKET.TYPE.SUBSCRIBE_TABLES
					}))

					webSocket.onmessage = tables => {
						let messageData = JSON.parse(tables.data),
							tablesData = this.state.tablesData;

						if (messageData.$type === APP.SOCKET.TYPE.TABLE_LIST) {
							this.renderTables(messageData.tables)
						}
						else if (messageData.$type === APP.SOCKET.TYPE.TABLE_ADDED)  {
							let addAtIndex = 0

							tablesData.forEach(function(item, index) {
								if (item.id === messageData.after_id) {
									addAtIndex = index
								}
							})

							cl("ADDED TABLE: " + messageData.table.name + " (id: " + messageData.table.id + ")")
							tablesData.splice(addAtIndex, 0, messageData.table)

							this.renderTables(tablesData)
						}
						else if (messageData.$type === APP.SOCKET.TYPE.TABLE_REMOVED) {
							tablesData.forEach(function(item, index) {
								if (item.id === messageData.id) {
									cl("DELETED TABLE: " + tablesData[index].name + " (id: " + tablesData[index].id + ")")
									delete(tablesData[index])
								}
							})

							this.renderTables(tablesData)
						}
					}
				}
				else {
					alert('Login failed! This should be some good looking error from Bootstrap, AntDesign or custom design, but I havent got time :(');
				}
			}
		}
	}

	renderTables(tables) {
		let tablesData = [],
			tablesOutput = [],
			tablesRowWidth = 0,
			tablesParticipants = []

		tables.map(function(item, index) {
			tablesRowWidth = 214 * (index + 1)
			tablesParticipants = []

			tablesData.push({
				id: item.id,
				name: item.name,
				participants: item.participants
			})

			for(let i = 0; i < 12; i++) {
				var spaceFreeOrTaken = i < item.participants ? "player-taken" : "player-free"
					
				tablesParticipants.push(<div className={spaceFreeOrTaken} key={i}></div>)
			}

			tablesOutput.push(
				<div key={item.id} className="table">
					<div className="table-name">{item.name}</div>
					<div className="table-participants">{tablesParticipants}</div>
				</div>
			)
		})

		this.setState({
			tablesData: tablesData,
			tablesOutput: tablesOutput,
			tablesRowWidth: tablesRowWidth,
			tablesParticipants: tablesParticipants
		})
	}

	render() {
		return (
			<div className="table-container">
				<div className="table-row" style={{width: this.state.tablesRowWidth}}>
					{this.state.tablesOutput}
				</div>
			</div>
		);
	}
}

export default Table;
