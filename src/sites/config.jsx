import { h, render, Component } from 'preact';
import { connect } from 'store';
import { JobItem } from 'components';
import arrayMove from 'array-move';
import { ConfigService } from 'services';

@connect()
export default class Config extends Component {
	state = {
		jobs: []
	}

	componentWillMount() {
		const actionsProm = ConfigService.fetchActions();
		const jobsProm = ConfigService.fetchJobs();

		// actions need to be in store otherwhise jobs are getting errors
		Promise.all([ actionsProm, jobsProm ]).then(values => {
			this.props.setActions(values[0]);
			this.setState({ jobs: values[1] });
		});
	}

	moveJob = (job, direction) => {
		const jobs = this.state.jobs;
		const idx = jobs.indexOf(job);

		if (idx != -1) {
			arrayMove.mut(jobs, idx, idx + direction);
		} else {
			console.error('couldn\'t locate job: ' + job);
		}

		this.setState({ jobs });

		// update all jobs since positioning changed
		ConfigService.updateJobs(jobs);
	}

	deleteJob = job => {
		const jobs = this.state.jobs;
		const idx = jobs.indexOf(job);

		if (idx == -1) {
			console.error('could not locate job!');
			return;
		}
		
		jobs.splice(idx, 1);

		this.setState({ jobs });
		ConfigService.deleteJob(job);
	}

	render(props, { jobs }) {
		const jobsPreview = jobs.map(job =>
			<JobItem
				key={ job.uuid }
				job={ job }
				moveJob={ this.moveJob }
				deleteJob={ this.deleteJob }
			/>
		);

		return (
			<div>
				{ jobsPreview }
			</div>
		);
	}
}