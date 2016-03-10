"use strict";

import React, {
		AppRegistry,
		Component,
		StyleSheet,
		Text,
		View,
		StatusBarIOS
		} from 'react-native';

import Viewer from './src/view/components/viewer';
import Chat from './src/view/components/chat';
import moment from 'moment';
moment.locale('ru', require('moment/locale/ru'));

import ErrorView from './src/view/components/error';
import {$$} from './view/style'
import {
		pick, assign, map, uniqId, reject
		} from 'lodash'
import API from './core/api';


StatusBarIOS.setStyle(1);

const richMessages = (m) => assign({}, m, {status: 'saved'}); // adding, deleting, saved

class Root extends Component {
	/* todo: move logic to redux */
	constructor(props) {
		super(props);

		this.state = initialState;

		this.downloadMessages();
		// dirty: refresh messages
		setInterval(() => {
			if (!this.state.messages.inProcess) this.downloadMessages()
		}, 5000);
	}

	/** ACTIONS */
	downloadMessages() {
		console.log('root::downloadMessages', arguments);

		this.setState({
			messages: assign({}, this.state.messages, {
				inProcess: true
			})
		});

		API.get('/get-list')
				.then((res) => this.setState({
					messages: assign({}, this.state.messages, {
						inProcess: false,
						list: map(res, richMessages)
					})
				}));
		//.catch(() => )
	}

	addMessage(text) {
		console.log('root::addMessage', arguments);

		const _randomId = uniqId('message_');
		const newMessage = {
			id: _randomId,
			message: text,
			date: moment(new Date()).toString(),
			status: 'adding'
		};

		this.setState({
			messages: assign({}, messages, {
				inProcess: true,
				list: this.state.messages.list.concat(newMessage)
			})
		});

		API.post('/save', {message: newMessage.message})
				.then((res) => {
					const list = map(this.state.messages.list, (m) => {
						if (m.id === _randomId) {
							return assign({}, m, {
								status: res.status === 'success' ? 'saved' : 'error'
							})
						}
						return m;
					});

					this.setState({
						messages: assign({}, this.state.messages, {
							inProcess: false,
							list
						})
					})
				});
	}

	removeMessage(removeId) {
		console.log('root::removeMessage', arguments);

		this.setState({
			messages: assign({}, messages, {
				inProcess: true,
				list: this.state.messages.list.map((m) => {
					if (m.id === removeId) {
						return assign({}, m, {
							status: 'deleting'
						})
					}
					return m;
				})
			})
		});

		API.post('/delete', {id: removeId})
				.then((res) => {
					const list = (() => {
						if (res.status === 'success') {
							return reject(this.state.messages.list, (m) => m.id === removeId);
						} else {
							return map(this.state.messages.list, (m) => {
								if (m.id === removeId) {
									return assign({}, m, {
										status: 'error'
									})
								}
								return m;
							});
						}
					})();

					this.setState({
						messages: assign({}, this.state.messages, {
							inProcess: false,
							list
						})
					})
				});
	}

	/** END: ACTIONS */

	render() {
		const {messages, stream, appError} = this.state;

		return (
				<View style={$$('container')}>
					<ErrorView message={appError} />
					<Viewer {...stream} />
					<Chat messages={messages.list} onMessageSubmit={this.addMessage} onMessageDelete={this.removeMessage} />
				</View>
		);
	}
}


const initialState = {
	stream: {
		uri: 'http://vevoplaylist-live.hls.adaptive.level3.net/vevo/ch1/appleman.m3u8',
		streaming: false,
		message: 'Stream starting...',
	},
	appError: null,
	messages: {
		inProcess: false,
		list: [],
	},
};

export default Root