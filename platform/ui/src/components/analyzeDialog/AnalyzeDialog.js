import './AnalyzeDialog.styl';

import React, { PureComponent } from 'react';
import { withTranslation } from '../../contextProviders';
import { Icon } from './../../elements/Icon';

// import PropTypes from 'prop-types';

class AnalyzeDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showDropdown: false,
      modelName: 'Select model ...'
    };
  }

  static propTypes = {};

  static defaultProps = {};

  toggleDropdown = () => {
    console.log("show dropdown ")
    this.setState({showDropdown: !this.state.showDropdown})
  }
  selectModel = (name) => {
    this.setState({showDropdown: false, modelName: name || this.state.modelName})
  }

  render() {
    {
      // eslint-disable-next-line no-console
      console.log('press analyze');
    }
    const {showDropdown,modelName } = this.state;
    return (
      <div className="AnalyzeDialog">
        <div className="noselect double-row-style">
          <div className="analyze-controls">
            <div className="btn-group">
              <button className="dropbtn" onClick={() => this.toggleDropdown()}>{modelName}</button>

              {showDropdown && <div id="myDropdown" className="dropdown-content">
                <a href="#" onClick={() => this.selectModel('Model 1')}>Model 1</a>
                <a href="#" onClick={() => this.selectModel('Model 2')}>Model 2</a>
              </div>}

              <button
                title={'Analyze this study'}
                className="btn"
                data-toggle="tooltip"
                // onClick={this.onClickSkipToStart}
              >
                <Icon name="analyze"/>
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
