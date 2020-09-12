const axios = require('axios');

export const listPipelines = callback => {
  const url = window.config.aiserver.url;
  // Make a request for a user with a given ID
  axios
    .get(`${url}/pipelines`)
    .then(function(response) {
      // handle success
      callback(response);
    })
    .catch(function(error) {
      // handle error
      console.log(error);
    })
    .then(function() {
      // always executed
    });
};

export const createJob = (req, callback) => {
  const url = window.config.aiserver.url;
  // Make a request for a user with a given ID
  axios({
    method: 'post',
    url: `${url}/jobs`,
    data: req,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(function(response) {
      // handle success
      callback(response);
    })
    .catch(function(error) {
      // handle error
      console.log(error);
    })
    .then(function() {
      // always executed
    });
};

export const sendImg = (jobID, req) => {
  const url = window.config.aiserver.url;
  // Make a request for a user with a given ID
  return axios({
    method: 'post',
    url: `${url}/jobs/${jobID}`,
    data: req,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const startAnalyze = (jobID, callback) => {
  const url = window.config.aiserver.url;
  // Make a request for a user with a given ID
  return axios({
    method: 'get',
    url: `${url}/jobs/${jobID}/start`,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(res => callback(res))
    .catch(err => console.log(err));
};
