import './AnalyzeDialog.styl';

import React, { PureComponent } from 'react';
import { withTranslation } from '../../contextProviders';
import { Icon } from './../../elements/Icon';
import { listPipelines } from './caller';

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
  selectModel = name => {
    this.setState({
      showDropdown: false,
      modelName: name || this.state.modelName,
    });
  };

  render() {
    {
      // eslint-disable-next-line no-console
      console.log('press analyze');
    }
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
                      onClick={() => this.selectModel(k.name)}
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
                // onClick={this.onClickSkipToStart}
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
