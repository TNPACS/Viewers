import { connect } from 'react-redux';
import { AnalyzeDialog } from '@ohif/ui';
import OHIF from '@ohif/core';
import csTools from 'cornerstone-tools';
import { commandsManager } from './../App.js';
// Our target output kills the `as` and "import" throws a keyword error
// import { import as toolImport, getToolState } from 'cornerstone-tools';
import cloneDeep from 'lodash.clonedeep';
import { utils } from '@ohif/core';

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

  const { studyMetadataManager } = utils;
  const studies = studyMetadataManager.all();

  // viewportSpecificData and activeViewportIndex are exposed in redux under `viewports`
  const {
    displaySetInstanceUID,
    StudyInstanceUID,
    SeriesInstanceUID,
  } = viewportSpecificData[activeViewportIndex];

  const study = studies.find(
    study => study.studyInstanceUID === StudyInstanceUID
  );

  // console.log('study', study);
  // console.log('studssy', studies);
  console.log("study connect analyze dialog", study)

  const series = study._series.find(
    e => e.seriesInstanceUID === SeriesInstanceUID
  );

  // New props we're creating?
  return {
    activeEnabledElement: dom,
    activeViewportCineData: analyzeData,
    activeViewportIndex: state.viewports.activeViewportIndex,
    StudyInstanceUID,
    series,
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
    StudyInstanceUID,
    series,
  } = propsFromState;

  return {
    StudyInstanceUID,
    series,
  };
};

const ConnectedAnalyzeDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(AnalyzeDialog);

export default ConnectedAnalyzeDialog;
