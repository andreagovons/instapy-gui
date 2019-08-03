import { h, render, Component } from 'preact';
import { raiseError } from 'core';
import { AddCard } from '../components';
import { withRouter } from 'react-router-dom';
import { AddItemModal } from 'modals';
import { ConfigService } from 'services';
import SettingCard from './setting';

class Settings extends Component {
	state = {
		settings: []
	}

	componentWillMount() {
		this.refreshSettings();
	}

	refreshSettings = async () => {
		const settings = await ConfigService.getSettings();
		this.setState({ settings });
	}

	addSettings = async setting => {
		// await here, so the setting will be registered once we change the route
		setting = await ConfigService.updateSetting({
			action: 'add',
			data: setting
		});

		if (setting.error) raiseError(setting.error);

		const { settings } = this.state;
		setting.params = [];
		settings.push(setting);
		this.setState({ settings });
	}

	deleteSetting = async setting => {
		if (!confirm('Do you really want to delete this setting ?')) return;

		const res = await ConfigService.updateSetting({
			action: 'delete',
			data: setting
		});

		if (res.error) raiseError(res.error);

		const { settings } = this.state;
		const idx = settings.findIndex(x => x.ident == setting.ident);

		if (idx == -1) raiseError('Could not locate setting!');

		settings.splice(idx, 1);
		this.setState({ settings });
	}

	updateSetting = async setting => {
		setting = await ConfigService.updateSetting({
			action: 'update',
			data: setting
		});

		if (setting.error) {
			this.refreshSettings();
			raiseError(setting.error);
		}
	}

	editSetting = async setting => {
		const res = await ConfigService.updateSetting({
			action: 'edit',
			data: setting
		});

		if (res.error) raiseError(res.error);

		// update setting
		const { settings } = this.state;
		const set = settings.find(x => x.ident == setting.oldIdent);
		set.ident = setting.ident;
		set.name = setting.name;
		set.description = setting.description;
		this.setState({ settings: [...settings] });
	}

	render(props, { settings }) {
		const settingsComps = settings.map(set =>
			<SettingCard
				key={ set.ident }
				setting={ set }
				deleteSetting={ this.deleteSetting }
				updateSetting={ this.updateSetting }
				modal={ this.modal }
			/>
		);

		return (
			<div>
				{ settingsComps }
				<AddCard target='#add-settings-modal' />
				<AddItemModal
					ident='settings'
					items={ settings }
					add={ this.addSettings }
					edit={ this.editSetting }
					ref={ modal => this.modal = modal }
				/>
			</div>
		);
	}
}

export default withRouter(Settings);
