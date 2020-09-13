import './AnalyzeDialog.styl';

import React, { PureComponent } from 'react';
import { withTranslation } from '../../contextProviders';
import { Icon } from './../../elements/Icon';
import {
  createJob,
  listPipelines,
  pollingJobStatus,
  sendImg,
  startAnalyze,
  checkJobStatus,
} from './caller';

const status = {
  ANALYZING: 'Analyzing ...',
  CREATING_JOB: 'Creating a new job ...',
  LOADING_IMAGES: 'Images are loading, please try again later ...',
  SENDING_IMAGES: 'Images are sending ...',
  JOB_DONE: 'Job done.',
  LOADING_MODELS: 'Loading models ...',
};

class AnalyzeDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      showDropdown: false,
      models: [],
      modelName: 'Select model ...',
      analyzePending: true,
      statusMessage: '',
    };
  }

  componentDidMount() {
    this.setState({ statusMessage: status.LOADING_MODELS });
    listPipelines(res => {
      console.log(res);
      this.setState({
        models: res.data,
        loading: false,
        analyzePending: false,
        statusMessage: '',
      });
    });
  }

  static propTypes = {};

  static defaultProps = {};

  toggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  selectModel = (name, id) => {
    this.setState({
      showDropdown: false,
      modelName: name || this.state.modelName,
      pipeline_id: id,
    });
  };

  sendSeries = () => {
    const url = window.config.aiserver.url;
    this.setState({ analyzePending: true });
    const { series, StudyInstanceUID } = this.props;
    const { pipeline_id } = this.state;
    if (pipeline_id === undefined) {
      alert('Please select model first!');
      return;
    }
    console.log('series component', series);
    let bodyFormData = new FormData();
    bodyFormData.append('studyInstanceUid', StudyInstanceUID);
    bodyFormData.append('seriesInstanceUid', series._data.SeriesInstanceUID);
    bodyFormData.append('pipelineId', pipeline_id);
    const sopInstanceUids = series._instances.map(
      (k, i) => k._data.metadata.SOPInstanceUID
    );

    sopInstanceUids.forEach((k, i) =>
      bodyFormData.append('sopInstanceUids', k)
    );

    const imageInstances = series._data.instances.map((k, i) => {
      const imgDataCache = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(
        k.wadouri
      );
      if (imgDataCache === undefined) {
        return undefined;
      } else {
        return {
          wadouri: k.wadouri,
          sopInstanceUid: k.metadata.SOPInstanceUID,
          byteArray: imgDataCache.byteArray,
        };
      }
    });
    if (imageInstances.includes(undefined)) {
      console.log(status.LOADING_IMAGES);
      this.setState({
        statusMessage: status.LOADING_IMAGES,
        analyzePending: false,
      });
      return;
    }
    this.setState({ statusMessage: status.CREATING_JOB });
    console.log('image', imageInstances);
    // console.log('req', bodyFormData.getAll());
    createJob(bodyFormData, res => {
      console.log('create job res', res);
      if (res.data._id) {
        const jobID = res.data._id;
        let promisesReqs = [];

        // check whether the job received is already running
        // if not, start a brand new job
        checkJobStatus(jobID, res => {
          if (res.data.status === 'completed') {
            this.setState({
              statusMessage: status.JOB_DONE,
              analyzePending: false,
            });
            console.log("job done ", res);
            res.data.outputs.forEach((k, i) => {
              window.open(`${url}/jobs/${jobID}/outputs/${k}`, '_blank');
            });
          } else if (res.data.status === 'in_progress') {
            pollingJobStatus(jobID, r => {
              console.log('polling stt res');
              this.setState({
                statusMessage: status.ANALYZING,
                analyzePending: false,
              });
            });
          } else if (
            res.data.status === 'pending' ||
            res.data.status === 'failed'
          ) {
            this.setState({ statusMessage: status.SENDING_IMAGES });
            // build information obj for each img in series
            imageInstances.forEach((img, i) => {
              let reqSendImg = new FormData();
              reqSendImg.append(
                img.sopInstanceUid,
                new Blob([
                  new Uint8Array(img.byteArray, 0, img.byteArray.length),
                ]),
                {
                  filename: `${img.sopInstanceUid}.dcm`,
                  contentType: 'image/dcm',
                  knownLength: img.byteArray.length,
                }
              );

              promisesReqs.push(sendImg(jobID, reqSendImg));
            });

            // send all images in series to server
            Promise.all(promisesReqs).then(() => {
              this.setState({ statusMessage: status.ANALYZING });
              console.log('All images in series have been uploaded OK');
              startAnalyze(jobID, response => {
                console.log('start job response');
                pollingJobStatus(jobID, r => {
                  this.setState({
                    statusMessage: status.JOB_DONE,
                    analyzePending: false,
                  });
                  console.log("job done ", r);
                  r.data.outputs.forEach((k, i) => {
                    window.open(`${url}/jobs/${jobID}/outputs/${k}`, '_blank');
                  });
                });
              });
            });
          }
        });
      }
    });
  };

  render() {
    const {
      showDropdown,
      modelName,
      models,
      analyzePending,
      statusMessage,
    } = this.state;
    return (
      <div className="AnalyzeDialog">
        <div className="noselect double-row-style">
          <div className="analyze-controls">
            <div className="btn-group">
              <button className="dropbtn" onClick={() => this.toggleDropdown()}>
                {modelName}
              </button>

              {showDropdown && (
                <div id="myDropdown" className="dropdown-content">
                  {models.map((k, i) => (
                    <a
                      key={i}
                      href="#"
                      onClick={() =>
                        this.selectModel(k.name, k.pipeline_id.value)
                      }
                    >
                      {k.name}
                    </a>
                  ))}
                </div>
              )}

              <button
                title={'Analyze this study'}
                className="btn"
                data-toggle="tooltip"
                disabled={analyzePending}
                onClick={() => this.sendSeries()}
              >
                <Icon name="analyze" />
              </button>
            </div>
          </div>
        </div>
        <br />
        <div className="ModalStatus" style={{ margin: 10 }}>
          {statusMessage}
        </div>
        <br />
      </div>
    );
  }
}

const connectedComponent = withTranslation('AnalyzeDialog')(AnalyzeDialog);
export { connectedComponent as AnalyzeDialog };
export default connectedComponent;
