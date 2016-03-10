"use strict";

import React, {
		Component,
		StyleSheet,
		Text,
		View,
		ListView,
		TouchableOpacity
		} from 'react-native';

const DS = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

import {
		map
		} from 'lodash'

import moment from 'moment';

class Chat extends Component {
	constructor(props) {
		super(props);

		this.state = {
			field: ''
		}
	}
	onPress() {
		this.setState({
			field: ''
		});
		this.props.onMessageSubmit(this.state.field);
	}

	renderMessage(m, xxx, index) {
		var i = parseInt(index),
				bgStyle = i % 2 === 0 ? $$('message-odd') : $$('message-even'),
				statusStyle = $$('message-status-' + m.status);

		return <View style={[$$('message'), bgStyle, statusStyle]} key={m.id}>
			<Text style={$$('message-text')}>{m.message}</Text>
			<Text style={$$('message-date')}>{moment((new Date(m.created_at))).fromNow(true)}</Text>
			<TouchableOpacity style={$$('message-delete')} onPress={() => this.props.onMessageDelete(m.id)}>
				<Text style={$$('message-delete-icon')}>{'x'}</Text>
			</TouchableOpacity>
		</View>
	}

	render() {
		const {style, messages} = this.props;
		const {field} = this.state;
		const dataSource = DS.cloneWithRows(messages);

		return (<View style={[$$('chat'), style]}>
			<ListView
					style={$$('list')}
					dataSource={dataSource}
					renderRow={this.renderMessage.bind(this)}
			/>
			<View style={$$('field')}>
				<TextInput style={$$('field-input')} value={field}
						onChangeText={(newField) => this.setState({field: newField})}
						multiline
				/>
				<TouchableOpacity style={$$('field-submit')}>
					<Text style={$$('field-submit-text')} onPress={this.onPress}>{'Send'}</Text>
				</TouchableOpacity>
			</View>
		</View>)
	}
}


const $$ = require('../style').create({
	'chat': {},
	'list': {},
	'message': {},
	'message-status-adding': {},
	'message-status-deleting': {},
	'message-status-saved': {},
	'message-status-error': {},

	'message-odd': {},
	'message-even': {},
	'message-text': {},
	'message-date': {},

	'field': {},
	'field-input': {},
	'field-submit': {},
	'field-submit-text': {},

	'message-delete': {},
	'message-delete-icon': {},
});

export default Chat;