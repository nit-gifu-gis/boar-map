import fetch from "isomorphic-fetch";

export default (req, res) => {
  const service = req["query"]["service"];
  const endpoint = req["query"]["endpoint"];

  let getparam = "";
  for (let i = 0; i < Object.keys(req["query"]).length; i++) {
    const key = Object.keys(req["query"])[i];
    if (key.toLowerCase() != "service" && key.toLowerCase() != "endpoint") {
      if (getparam == "") {
        getparam = `?${key}=${req["query"][key]}`;
      } else {
        getparam += `&${key}=${req["query"][key]}`;
      }
    }
  }

  const headers = {};

  if (req.headers["x-map-api-access-token"] != undefined) {
    headers["X-Map-Api-Access-Token"] = req.headers["x-map-api-access-token"];
  }

  for (let i = 0; i < Object.keys(req.headers).length; i++) {
    const key = Object.keys(req.headers)[i];
    if (key.toLowerCase() != "host") {
      headers[key] = req.headers[key];
    }
  }

  let body = "";
  if (req["body"] != undefined && req["body"] != null && req["body"] != "") {
    if (typeof req["body"] == "string") {
      body = req["body"];
    } else {
      body = JSON.stringify(req["body"]);
    }
  }

  const DebugLog = endpoint != "GetFeaturesByExtent";
  console.log(DebugLog);
  if (DebugLog) {
    console.log(getparam);
    console.log(headers);
    console.log(
      `https://pascali.info-mapping.com/webservices/publicservice/${service}/${endpoint}${getparam}`
    );
    console.log(req["method"]);
    console.log(body);
  }

  fetch(
    `https://pascali.info-mapping.com/webservices/publicservice/${service}/${endpoint}${getparam}`,
    {
      method: req["method"],
      headers: headers,
      body: body
    }
  )
    .then(fres => {
      fres
        .text()
        .then(txt => {
          if (DebugLog) {
            console.log(txt);
          }
          res.status(200).end(txt);
        })
        .catch(e => {
          res.status(500).end(e.message);
        });
    })
    .catch(e => {
      console.log(e.message);
      res.status(500).end(e.message);
    });
};
