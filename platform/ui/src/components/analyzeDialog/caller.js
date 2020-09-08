const axios = require('axios');

export const listPipelines = callback => {
  const url = window.config.aiserver.url;
  console.log(url);
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
