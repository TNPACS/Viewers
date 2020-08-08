import { connect } from 'react-redux';
import { AnalyzeDialog } from '@ohif/ui';
import OHIF from '@ohif/core';
import csTools from 'cornerstone-tools';
import { commandsManager } from './../App.js';
// Our target output kills the `as` and "import" throws a keyword error
// import { import as toolImport, getToolState } from 'cornerstone-tools';
import cloneDeep from 'lodash.clonedeep';

const toolImport = csTools.import;
const scrollToIndex = toolImport('util/scrollToIndex');
const { setViewportSpecificData } = OHIF.redux.actions;

// Why do I need or care about any of this info?
// A dispatch action should be able to pull this at the time of an event?
// `isPlaying` and `analyzeFrameRate` might matte r, but I think we can prop pass for those.
const mapStateToProps = state => {
  // Get activeViewport's `analyze` and `stack`
  const { viewportSpecificData, activeViewportIndex } = state.viewports;
  const { analyze } = viewportSpecificData[activeViewportIndex] || {};
  const dom = commandsManager.runCommand('getActiveViewportEnabledElement');

  const analyzeData = analyze || {
    isPlaying: false,
    analyzeFrameRate: 24,
  };

  // New props we're creating?
  return {
    activeEnabledElement: dom,
    activeViewportCineData: analyzeData,
    activeViewportIndex: state.viewports.activeViewportIndex,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatchSetViewportSpecificData: (viewportIndex, data) => {
      dispatch(setViewportSpecificData(viewportIndex, data));
    },
  };
};

const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  const {
    activeEnabledElement,
    activeViewportCineData,
    activeViewportIndex,
  } = propsFromState;

  return {
    analyzeFrameRate: activeViewportCineData.analyzeFrameRate,
    isPlaying: activeViewportCineData.isPlaying,
    onPlayPauseChanged: isPlaying => {
      const analyze = cloneDeep(activeViewportCineData);
      analyze.isPlaying = !analyze.isPlaying;

      propsFromDispatch.dispatchSetViewportSpecificData(activeViewportIndex, {
        analyze,
      });
    },
    onFrameRateChanged: frameRate => {
      const analyze = cloneDeep(activeViewportCineData);
      analyze.analyzeFrameRate = frameRate;

      propsFromDispatch.dispatchSetViewportSpecificData(activeViewportIndex, {
        analyze,
      });
    },
    onClickNextButton: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const { currentImageIdIndex, imageIds } = stackData.data[0];
      if (currentImageIdIndex >= imageIds.length - 1) return;
      scrollToIndex(activeEnabledElement, currentImageIdIndex + 1);
    },
    onClickBackButton: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const { currentImageIdIndex } = stackData.data[0];
      if (currentImageIdIndex === 0) return;
      scrollToIndex(activeEnabledElement, currentImageIdIndex - 1);
    },
    onClickSkipToStart: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      scrollToIndex(activeEnabledElement, 0);
    },
    onClickSkipToEnd: () => {
      const stackData = csTools.getToolState(activeEnabledElement, 'stack');
      if (!stackData || !stackData.data || !stackData.data.length) return;
      const lastIndex = stackData.data[0].imageIds.length - 1;
      scrollToIndex(activeEnabledElement, lastIndex);
    },
  };
};

const ConnectedAnalyzeDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(AnalyzeDialog);

export default ConnectedAnalyzeDialog;
