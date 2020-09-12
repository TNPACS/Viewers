import './AnalyzeDialog.styl';

import React, { PureComponent } from 'react';
import { withTranslation } from '../../contextProviders';
import { Icon } from './../../elements/Icon';
import { createJob, listPipelines, sendImg, startAnalyze } from './caller';

class AnalyzeDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      showDropdown: false,
      models: [],
      modelName: 'Select model ...',
    };
  }

  componentDidMount() {
    console.log('xxxxxxxxxxxxxxx', window.config.aiserver.url);
    listPipelines(res => {
      console.log(res);
      this.setState({ models: res.data, loading: false });
    });
  }

  static propTypes = {};

  static defaultProps = {};

  toggleDropdown = () => {
    console.log('show dropdown ');
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  selectModel = (name, id) => {
    console.log('name id', id);
    this.setState({
      showDropdown: false,
      modelName: name || this.state.modelName,
      pipeline_id: id,
    });
  };

  sendSeries = () => {
    const { series } = this.props;
    if (this.state.pipeline_id === undefined) {
      alert('Please select model first!');
      return;
    }
    // console.log('studyyy her', this.props.study);
    // console.log('studyyy her', this.props.SeriesInstanceUID);
    // console.log('studyyy her', this.props.activeViewportIndex);
    console.log('series component', series);
    let bodyFormData = new FormData();
    bodyFormData.append('studyInstanceUid', this.props.StudyInstanceUID);
    bodyFormData.append('seriesInstanceUid', series._data.SeriesInstanceUID);
    bodyFormData.append('pipelineId', this.state.pipeline_id);
    const sopInstanceUids = series._instances.map(
      (k, i) => k._data.metadata.SOPInstanceUID
    );

    sopInstanceUids.forEach((k, i) =>
      bodyFormData.append('sopInstanceUids', k)
    );

    const imageInstances = series._data.instances.map((k, i) => ({
      wadouri: k.wadouri,
      sopInstanceUid: k.metadata.SOPInstanceUID,
      byteArray: cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(
        k.wadouri
      ).byteArray,
    }));
    console.log('image', imageInstances);
    // console.log('req', bodyFormData.getAll());
    createJob(bodyFormData, res => {
      console.log(res);
      if (res.data._id) {
        const jobID = res.data._id;
        let promisesReqs = [];

        imageInstances.forEach((img, i) => {
          let reqSendImg = new FormData();

          reqSendImg.append(
            img.sopInstanceUid,
            new Blob([new Uint8Array(img.byteArray, 0, img.byteArray.length)]),
            {
              filename: `${img.sopInstanceUid}.dcm`,
              contentType: 'image/dcm',
              knownLength: img.byteArray.length,
            }
          );

          promisesReqs.push(sendImg(jobID, reqSendImg));
        });

        Promise.all(promisesReqs).then(() => {
          console.log('sent all OK');
          startAnalyze(jobID, response => {
            console.log('response', response);
          });
        });
      }
    });
  };

  render() {
    const { showDropdown, modelName, models } = this.state;
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
                onClick={() => this.sendSeries()}
              >
                <Icon name="analyze" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const connectedComponent = withTranslation('AnalyzeDialog')(AnalyzeDialog);
export { connectedComponent as AnalyzeDialog };
export default connectedComponent;
