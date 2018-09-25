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
			isAdmin: false,
			tablesData: [],
			tablesOutput: [],
			tablesRowWidth: 0,
			tablesParticipants: []
		}
		
		this.deleteTable = this.deleteTable.bind(this)
		this.webSocket = new WebSocket(APP.SOCKET.HOST)
	}

	componentDidMount() {
		let webSocket = this.webSocket
		
		webSocket.onopen = event => {
			webSocket.send(JSON.stringify({
				$type: APP.SOCKET.TYPE.LOGIN,
				username: APP.SOCKET.LOGIN,
				password: APP.SOCKET.PASSWORD
			}))

			webSocket.onmessage = message => {
				let response = JSON.parse(message.data)

				if (response.$type === APP.SOCKET.RESPONSE.LOGIN_SUCCESS) {
					this.setState({
						isAdmin: response.user_type === "admin"
					})

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
			tablesParticipants = [],
			isAdmin = this.state.isAdmin

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

			//TODO: &nbsp is ugly solution, fix it
			tablesOutput.push(
				<div key={item.id} className="table">
					<div className="table-name">{item.name}</div>
					<div className="table-participants" >{tablesParticipants}</div>
					{ isAdmin ?
						<div className="table-actions">
							<div className="button-update" onClick={() => alert("TODO: call update table with id - " + item.id)}>Update</div>
							&nbsp;
							<div className="button-delete" onClick={() => this.deleteTable(item.id)}>Delete</div>
						</div>
					: ""}
				</div>
			)
		}, this)

		this.setState({
			tablesData: tablesData,
			tablesOutput: tablesOutput,
			tablesRowWidth: tablesRowWidth,
			tablesParticipants: tablesParticipants
		})
	}

	deleteTable(id) {
		let webSocket = this.webSocket,
			tablesData = this.state.tablesData

		tablesData.forEach(function(item, index) {
			if (item.id === id) {
				cl("TRIGGER ADMIN REMOVE: id " + id)
				cl("MANUALY DELETED TABLE: " + tablesData[index].name + " (id: " + tablesData[index].id + ")")
				delete(tablesData[index])
			}
		})

		this.renderTables(tablesData)

		webSocket.onmessage = message => {
			let response = JSON.parse(message.data)
				cl(response)

			//TODO: strange behaivour from websocket here, sometime fires back wrong ID
			if (response.$type !== "removal_failed") {
				webSocket.send(JSON.stringify({
					$type: APP.SOCKET.TYPE.REMOVE_TABLE,
					id: id
				}))
			}
			else {
				//TODO: sometime server returns that $type:table_removed and after sometime sends $type:removal_failed
				cl("removal_failed")
				cl(tablesData.length)
				//TODO: add logic to rollback changes
				//this.renderTables(tablesDataOrginal)
			}
		}
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
