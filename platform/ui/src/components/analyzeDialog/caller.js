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

export const pollingJobStatus = (jobID, callback) => {
  const url = window.config.aiserver.url;
  const req = {
    method: 'get',
    url: `${url}/jobs/${jobID}`,
    // headers: { 'Content-Type': 'multipart/form-data' },
  };

  function poll(fn, timeout, interval) {
    const endTime = Number(new Date()) + timeout;
    const checkCondition = function(resolve, reject) {
      const ajax = fn();
      // dive into the ajax promise
      ajax.then(function(response) {
        // If the condition is met, we're done!
        if (response.data && response.data.status === 'completed') {
          resolve(response);
        }
        // If the condition isn't met but the timeout hasn't elapsed, go again
        else if (Number(new Date()) < endTime) {
          setTimeout(checkCondition, interval, resolve, reject);
        }
        // Didn't match and too much time, reject!
        else {
          reject(new Error('timed out for ' + fn));
        }
      });
    };

    return new Promise(checkCondition);
  }

  // Usage: get something via ajax
  return poll(
    function() {
      console.log('polling status...');
      return axios(req);
    },
    10000 * 60 * 60,
    1500
  )
    .then(res => {
      console.log('polling done');
      callback(res);
    })
    .catch(err => {
      console.log('polling timeout, ', err);
    });
};

export const checkJobStatus = (jobID, callback) => {
  const url = window.config.aiserver.url;
  // const url = 'http://192.168.0.107:4000';

  return axios({
    method: 'get',
    url: `${url}/jobs/${jobID}`,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then(res => callback(res))
    .catch(err => console.log(err));
};
// const poll = (fn, retries = Infinity, timeoutBetweenAttempts) => {
//   return Promise.resolve()
//     .then(fn)
//     .catch(function retry(err) {
//       while (true) {
//         return delay(timeoutBetweenAttempts)
//           .then(fn)
//           .catch(retry);
//       }
//
//       throw err;
//     });
// };
//
// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
//
// function validate(res){
//   if(!res.status || res.status !== 200)
//     throw res;
// }
//
// return poll(
//   () =>
//     axios(request).then(res => validate(res)),
//   15,
//   5000
// );
